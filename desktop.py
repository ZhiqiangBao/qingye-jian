#!/usr/bin/env python3
"""青叶笺桌面客户端 —— 不依赖外部浏览器。

复用同目录下的 server.py 提供 HTTP API 与静态资源，
用 pywebview（Windows 上为 Edge WebView2）打开原生窗口承载界面。

关闭流程（确保无后台残留）：
  1. 窗口 closing → STOP_EVENT.set()，阻断后续后台任务
  2. 窗口 closed → _shutdown_cleanup() 有序清理：
       - server.shutdown() 结束 HTTP 主循环
       - server.server_close() 释放监听 socket（避免端口被占用）
       - 遍历本 Python 进程创建的子进程（Edge 无头打印等），terminate+kill
       - 置空 window 引用避免回调链引用
  3. webview.start() 返回后：如果主线程之外仍有线程存活（WebView2 COM
     线程、pythonnet 终结器线程等），用 os._exit(0) 强退，保证不残留。
"""

from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

# 以本文件所在目录为应用根目录，确保 server.py 的 APP_ROOT 指向这里
# PyInstaller onefile 模式：静态资源在 _MEIPASS（临时目录），用户数据在 exe 所在目录
# PyInstaller onedir  模式：静态资源在 _MEIPASS（其实是 exe\_internal），首次启动拷到 APP_DIR
if getattr(sys, "frozen", False):
    _MEIPASS = Path(sys._MEIPASS)
    APP_DIR = Path(sys.executable).resolve().parent
    import shutil

    def _ensure_resource(src: Path, dst: Path, *, overwrite: bool = False) -> None:
        """把 _MEIPASS 里的资源拷到 APP_DIR。

        overwrite=False：仅补缺失（用户文档/皮肤等）。
        overwrite=True：始终用内置副本覆盖（程序代码，保证升级后生效）。
        """
        if not src.exists():
            return
        if src.is_dir():
            if not dst.exists():
                shutil.copytree(src, dst)
                return
            for item in src.iterdir():
                _ensure_resource(item, dst / item.name, overwrite=overwrite)
        else:
            if overwrite or not dst.exists():
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)

    # onedir 下 _MEIPASS 是 <exe>\_internal；程序文件覆盖拷贝，用户内容只补缺失
    for _name in [
        "index.html", "styles.css", "app.js",
        "marked.min.js", "html2canvas.min.js", "jspdf.umd.min.js",
        "server.py",
    ]:
        _ensure_resource(_MEIPASS / _name, APP_DIR / _name, overwrite=True)
    for _name in ["skins", "templates", "fonts", "sounds", "document", "help"]:
        _ensure_resource(_MEIPASS / _name, APP_DIR / _name, overwrite=False)
else:
    APP_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(APP_DIR))

import server as qy  # noqa: E402  复用现有 server.py


def _clear_mark_of_the_web(*roots: Path) -> int:
    """清除 Windows「来自互联网」区域标记（Zone.Identifier ADS）。

    从 GitHub / 浏览器下载的 zip 解压后，.dll 会带 Zone.Identifier。
    .NET 默认拒绝加载被标记的程序集，表现为：
      Failed to resolve Python.Runtime.Loader.Initialize from ...\\Python.Runtime.dll
    启动时主动删除该 ADS，用户无需右键「解除锁定」。
    """
    if os.name != "nt":
        return 0
    cleared = 0
    try:
        import ctypes

        delete_file_w = ctypes.windll.kernel32.DeleteFileW
    except Exception:
        return 0

    suffixes = {".dll", ".exe", ".pyd"}
    for root in roots:
        if not root or not root.exists():
            continue
        try:
            paths = [root] if root.is_file() else list(root.rglob("*"))
        except Exception:
            continue
        for path in paths:
            if not path.is_file() or path.suffix.lower() not in suffixes:
                continue
            try:
                if delete_file_w(str(path) + ":Zone.Identifier"):
                    cleared += 1
            except Exception:
                pass
    return cleared


# ---------------------------------------------------------------------------
# 打包模式：先清 MotW，再加载 pythonnet（系统自带 .NET Framework / netfx）。
# 根因不是缺 .NET 8，而是下载解压后的 Zone.Identifier 阻止加载 Python.Runtime.dll。
# ---------------------------------------------------------------------------
if getattr(sys, "frozen", False):
    import ctypes

    _meipass = Path(sys._MEIPASS)
    _pynet_runtime = _meipass / "pythonnet" / "runtime"
    _cleared = _clear_mark_of_the_web(APP_DIR, _meipass, _pynet_runtime)
    try:
        qy.log_line(f"Cleared Mark-of-the-Web streams: {_cleared}")
    except Exception:
        pass

    if _pynet_runtime.exists():
        os.environ["PATH"] = str(_pynet_runtime) + os.pathsep + os.environ.get("PATH", "")
        try:
            os.add_dll_directory(str(_pynet_runtime))
        except Exception:
            pass

    # 明确走 netfx（Windows 自带），避免误用需单独安装的 coreclr
    os.environ.pop("PYTHONNET_CORECLR_RUNTIME_CONFIG", None)
    os.environ["PYTHONNET_RUNTIME"] = "netfx"

    try:
        import pythonnet

        pythonnet.set_runtime_from_env()
        pythonnet.load()
    except Exception as _e:
        _msg = str(_e)
        try:
            qy.log_line(f"pythonnet load failed: {_msg}")
        except Exception:
            pass
        ctypes.windll.user32.MessageBoxW(
            0,
            "青叶笺启动失败：无法加载桌面窗口组件（pythonnet）。\n\n"
            "若刚从网上下载解压，请再试一次；仍失败可把本目录下的\n"
            "qingye-jian.log 发给开发者。\n\n"
            f"错误信息：{_msg}",
            "青叶笺 — 启动失败",
            0x10,  # MB_ICONERROR
        )
        sys.exit(1)

import webview  # noqa: E402

# 打包模式下让 server.py 的 APP_ROOT 指向 exe 所在目录（含用户数据）
if getattr(sys, "frozen", False):
    qy.APP_ROOT = APP_DIR

HOST = qy.HOST  # "127.0.0.1"
PORT = qy.PORT  # 8765（首选端口，被占用时自动递增）

# 全局停止信号：窗口关闭即置位，所有后台任务/请求处理应尽快自愿结束
STOP_EVENT = threading.Event()


# ---------------------------------------------------------------------------
# 原生文件夹选择器：覆盖 server.py 的 tkinter 实现。
# tkinter 在非主线程（服务线程）里创建 Tk 存在风险，改用 .NET FolderBrowserDialog
# 跑在独立 STA 线程上，更稳；.NET 不可用时回退到原 tkinter 实现。
# ---------------------------------------------------------------------------
_DOTNET_PICKER = False
try:
    import clr  # noqa: F401
    clr.AddReference("System.Windows.Forms")
    from System.Threading import Thread as _NetThread, ThreadStart, ApartmentState  # noqa: F401
    from System.Windows.Forms import FolderBrowserDialog, DialogResult  # noqa: F401
    _DOTNET_PICKER = True
except Exception:
    _DOTNET_PICKER = False

# 保存原始 tkinter 选择器，作为回退
_tk_pick_workspace_folder = qy.pick_workspace_folder


def _pick_folder_dotnet(initial: str) -> Path | None:
    """在独立 STA 线程上弹出 .NET 原生文件夹选择框。"""
    box: dict = {"path": None}

    def _run() -> None:
        try:
            dlg = FolderBrowserDialog()
            dlg.Description = "选择 Markdown 工作区文件夹"
            dlg.ShowNewFolderButton = True
            if initial and Path(initial).is_dir():
                dlg.SelectedPath = str(Path(initial).resolve())
            if dlg.ShowDialog() == DialogResult.OK:
                box["path"] = str(dlg.SelectedPath)
        except Exception:
            box["path"] = None

    t = _NetThread(ThreadStart(_run))
    t.SetApartmentState(ApartmentState.STA)
    t.Start()
    t.Join()
    p = box.get("path")
    return Path(p).resolve() if p else None


def _patched_pick_workspace_folder(initial: str | None = None) -> Path | None:
    start = initial or str(qy.workspace_root())
    if _DOTNET_PICKER:
        return _pick_folder_dotnet(start)
    return _tk_pick_workspace_folder(start)


# 用更稳的方案替换 server 模块里的选择器（Handler 调用时取的是模块全局，故生效）
qy.pick_workspace_folder = _patched_pick_workspace_folder


# ---------------------------------------------------------------------------
# JS 桥：让界面里的「退出」按钮（调 window.close()）能真正关闭原生窗口。
# ---------------------------------------------------------------------------
class JsApi:
    def __init__(self) -> None:
        self._window = None
        self._min_w = 320
        self._min_h = 240
        self._title = "青叶笺 · 学习计划"

    def _bind(self, window) -> None:
        self._window = window

    def _hwnd(self) -> int:
        """拿底层 Win32 窗口句柄（frameless 窗口仍有标题，FindWindow 可找）。"""
        try:
            import ctypes
            return ctypes.windll.user32.FindWindowW(None, self._title) or 0
        except Exception:
            return 0

    def close_window(self) -> bool:
        """由注入的 JS 调用：关闭原生窗口（同时触发 closed 事件停服务）。"""
        if self._window is not None:
            try:
                self._window.destroy()
            except Exception:
                pass
        return True

    def minimize_window(self) -> bool:
        """最小化窗口。"""
        try:
            import ctypes
            hwnd = self._hwnd()
            if hwnd:
                ctypes.windll.user32.ShowWindow(hwnd, 6)  # SW_MINIMIZE
        except Exception:
            pass
        return True

    def toggle_maximize(self) -> bool:
        """最大化/还原切换（pywebview 无原生 maximize，用 Win32 API）。"""
        try:
            import ctypes
            hwnd = self._hwnd()
            if hwnd:
                if ctypes.windll.user32.IsZoomed(hwnd):
                    ctypes.windll.user32.ShowWindow(hwnd, 9)  # SW_RESTORE
                else:
                    ctypes.windll.user32.ShowWindow(hwnd, 3)  # SW_MAXIMIZE
        except Exception:
            pass
        return True

    def resize_window(self, delta_w: int = 0, delta_h: int = 0) -> bool:
        """Ctrl+滚轮调用：按增量调整窗口尺寸，限制最小值与屏幕工作区。"""
        try:
            import ctypes
            from ctypes import wintypes
            hwnd = self._hwnd()
            if not hwnd:
                return False
            user32 = ctypes.windll.user32
            rect = wintypes.RECT()
            user32.GetWindowRect(hwnd, ctypes.byref(rect))
            w = max(self._min_w, (rect.right - rect.left) + int(delta_w))
            h = max(self._min_h, (rect.bottom - rect.top) + int(delta_h))
            # 限制不超过屏幕工作区
            work = wintypes.RECT()
            user32.SystemParametersInfoW(0x0030, 0, ctypes.byref(work), 0)  # SPI_GETWORKAREA
            w = min(w, work.right - work.left)
            h = min(h, work.bottom - work.top)
            SWP_NOZORDER = 0x0004
            SWP_NOMOVE = 0x0002
            user32.SetWindowPos(hwnd, 0, 0, 0, w, h, SWP_NOZORDER | SWP_NOMOVE)
        except Exception as e:
            try:
                qy.log_line(f"resize err: {e}")
            except Exception:
                pass
        return True

    # ---------- 导出 / 下载 桥 ----------
    # WebView2 默认不处理 <a download>.click() 下载，也不支持 File System Access API
    # (window.showSaveFilePicker)，更不会响应 window.open 打开新标签页。
    # app.js 在桌面模式下直接调用以下方法，不依赖浏览器 API polyfill：
    #   1. save_pdf_vector(html, filename) → 无头矢量生成 PDF + 原生保存对话框
    #   2. save_blob(b64_data, filename) → 解码 base64 + 原生保存对话框（位图 PDF / 其他文件）
    #   3. open_html_in_browser(b64_html) → 写临时 HTML 到服务目录，用系统浏览器打开
    def log_line(self, msg: str) -> bool:
        """让 JS 端往日志文件里写一行，方便诊断。"""
        try:
            qy.log_line(str(msg))
        except Exception:
            pass
        return True

    def _save_dialog(self, suggested_name: str) -> str:
        """弹原生保存对话框，返回用户选择的完整路径；取消返回空字符串。"""
        if _DOTNET_PICKER:
            return self._save_dialog_dotnet(suggested_name) or ""
        return self._save_dialog_tk(suggested_name) or ""

    def _save_dialog_dotnet(self, suggested_name: str) -> str | None:
        box: dict = {"path": None}

        def _run() -> None:
            try:
                from System.Windows.Forms import SaveFileDialog, DialogResult  # noqa: E402
                dlg = SaveFileDialog()
                dlg.FileName = suggested_name
                ext = Path(suggested_name).suffix.lstrip(".")
                if ext:
                    dlg.Filter = f"{ext.upper()} 文件 (*.{ext})|*.{ext}|所有文件 (*.*)|*.*"
                else:
                    dlg.Filter = "所有文件 (*.*)|*.*"
                if dlg.ShowDialog() == DialogResult.OK:
                    box["path"] = str(dlg.FileName)
            except Exception:
                box["path"] = None

        t = _NetThread(ThreadStart(_run))
        t.SetApartmentState(ApartmentState.STA)
        t.Start()
        t.Join()
        return box["path"]

    def _save_dialog_tk(self, suggested_name: str) -> str | None:
        try:
            import tkinter as tk
            from tkinter import filedialog
            root = tk.Tk()
            root.withdraw()
            path = filedialog.asksaveasfilename(
                initialfile=suggested_name,
                defaultextension=Path(suggested_name).suffix or ".pdf",
            )
            root.destroy()
            return path or None
        except Exception:
            return None

    def save_pdf_vector(self, html: str, filename: str) -> str:
        """矢量 PDF：调 server 无头打印生成 PDF → 原生保存对话框 → 写文件。
        返回: 成功=保存路径, 取消="", 失败="ERROR: ..."。"""
        import base64, uuid
        try:
            qy.log_line(f"save_pdf_vector: html len={len(html)}, filename={filename}")
            pdf_bytes = qy.render_html_to_pdf(html)
            qy.log_line(f"save_pdf_vector: PDF generated, {len(pdf_bytes)} bytes")
            path = self._save_dialog(filename)
            if not path:
                qy.log_line("save_pdf_vector: user cancelled save dialog")
                return ""
            with open(path, "wb") as f:
                f.write(pdf_bytes)
            qy.log_line(f"save_pdf_vector: saved to {path}")
            return path
        except Exception as e:
            qy.log_line(f"save_pdf_vector err: {e}")
            return f"ERROR: {e}"

    def save_blob(self, b64_data: str, filename: str) -> str:
        """位图 PDF / 任意文件：解码 base64 → 原生保存对话框 → 写文件。
        返回: 成功=保存路径, 取消="", 失败="ERROR: ..."。"""
        import base64
        try:
            data = base64.b64decode(b64_data)
            qy.log_line(f"save_blob: {len(data)} bytes, filename={filename}")
            path = self._save_dialog(filename)
            if not path:
                qy.log_line("save_blob: user cancelled save dialog")
                return ""
            with open(path, "wb") as f:
                f.write(data)
            qy.log_line(f"save_blob: saved to {path}")
            return path
        except Exception as e:
            qy.log_line(f"save_blob err: {e}")
            return f"ERROR: {e}"

    def open_html_in_browser(self, b64_html: str) -> str:
        """导出页：解码 HTML → 写到服务目录 → 用系统默认浏览器打开。
        系统浏览器支持 window.print() 和 <a download>，完美适配打印和下载。
        返回: 成功=打开的 URL, 失败="ERROR: ..."。"""
        import base64, uuid, webbrowser
        try:
            html = base64.b64decode(b64_html).decode("utf-8")
            qy.log_line(f"open_html_in_browser: html len={len(html)}")
            token = uuid.uuid4().hex[:12]
            html_name = f"__export_preview_{token}.html"
            html_path = qy.APP_ROOT / html_name
            html_path.write_text(html, encoding="utf-8")
            url = f"http://{HOST}:{qy.PORT}/{html_name}"
            qy.log_line(f"open_html_in_browser: opening {url}")
            webbrowser.open(url)
            # 5 分钟后清理临时文件（给用户足够时间打印/下载）
            def _cleanup():
                time.sleep(300)
                try:
                    html_path.unlink(missing_ok=True)
                except Exception:
                    pass
            threading.Thread(target=_cleanup, daemon=True).start()
            return url
        except Exception as e:
            qy.log_line(f"open_html_in_browser err: {e}")
            return f"ERROR: {e}"


# 无边框窗口注入：自定义标题栏 + 拖动区域标记 + Ctrl+滚轮缩放 + window.close 转发
_FRAMELESS_JS = r"""(function(){
if(window.__qyFramelessPatched)return;
window.__qyFramelessPatched=true;

// ---- 样式 ----
var style=document.createElement('style');
style.textContent=[
'.qj-titlebar{position:fixed;top:0;right:0;display:flex;z-index:999999;height:32px;opacity:0;transition:opacity .25s;}',
'.qj-titlebar:hover{opacity:1;}',
'.qj-tb-btn{width:42px;height:32px;border:none;background:transparent;color:#666;font-size:13px;font-family:system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;color:#555;}',
'.qj-tb-btn:hover{background:rgba(0,0,0,.12);}',
'.qj-tb-close:hover{background:#e81123;color:#fff;}',
/* 顶栏拖动条：仅此区域可拖窗口。勿开 easy_drag，否则全局 mousedown 会抢走成品页勾选 */
'.qj-drag-strip{position:fixed;top:0;left:0;right:120px;height:28px;z-index:999990;cursor:grab;}',
'.qj-drag-hint{position:fixed;top:7px;left:50%;transform:translateX(-50%);z-index:999998;font-size:11px;color:rgba(85,85,85,.5);pointer-events:none;user-select:none;white-space:nowrap;}',
'.topbar{padding-right:132px;box-sizing:border-box;}',
'::-webkit-scrollbar{width:6px;height:6px;}',
'::-webkit-scrollbar-thumb{background:rgba(0,0,0,.18);border-radius:3px;}',
'::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.3);}',
'::-webkit-scrollbar-track{background:transparent;}',
'/* 迷你模式：窗口缩小时只显示此刻这一页+成品页 */',
'@media (max-width:680px),(max-height:520px){',
'.desk,.spiral,.skin-decor-layer,.topbar,.theme-rail,.font-rail,.sticker-rail,.files,.editor-pane,.status,.page-nav{display:none!important;}',
'.notebook{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;height:100vh!important;width:100vw!important;padding:2px!important;margin:0!important;border:none!important;box-shadow:none!important;overflow:hidden!important;gap:2px!important;}',
'.nowbar{flex:1 1 160px!important;padding:4px 8px!important;margin:0!important;min-height:0!important;overflow:auto!important;}',
'.layout{flex:2 1 200px!important;display:flex!important;padding:0!important;margin:0!important;min-height:0!important;overflow:hidden!important;}',
'.workspace{flex:1 1 auto!important;display:flex!important;flex-direction:column!important;padding:0!important;margin:0!important;min-height:0!important;}',
'.preview-pane{flex:1 1 auto!important;overflow:auto!important;padding:2px!important;margin:0!important;min-height:0!important;}',
'.page-stage{height:100%!important;}',
'.qj-titlebar{height:24px!important;}',
'.qj-tb-btn{width:32px!important;height:24px!important;font-size:11px!important;}',
'.qj-drag-hint{display:none!important;}',
'}'
].join('');
(document.head||document.documentElement).appendChild(style);

// ---- 标题栏 ----
var bar=document.createElement('div');
bar.className='qj-titlebar';
bar.innerHTML=
 '<button class="qj-tb-btn qj-tb-min" title="最小化">&#8212;</button>'+
 '<button class="qj-tb-btn qj-tb-max" title="最大化/还原">&#9633;</button>'+
 '<button class="qj-tb-btn qj-tb-close" title="关闭">&#10005;</button>';

function mount(){
 if(!document.body){setTimeout(mount,50);return;}
 var strip=document.createElement('div');
 strip.className='qj-drag-strip pywebview-drag-region';
 strip.title='拖动此处移动窗口';
 document.body.appendChild(strip);
 document.body.appendChild(bar);
 var hint=document.createElement('div');
 hint.className='qj-drag-hint';
 hint.textContent='顶部空白条拖动 · Ctrl+滚轮缩放窗口';
 document.body.appendChild(hint);
 markNoDrag();
}
mount();

bar.querySelector('.qj-tb-close').addEventListener('click',function(){
 try{window.pywebview.api.close_window();}catch(e){}
});
bar.querySelector('.qj-tb-min').addEventListener('click',function(){
 try{window.pywebview.api.minimize_window();}catch(e){}
});
bar.querySelector('.qj-tb-max').addEventListener('click',function(){
 try{window.pywebview.api.toggle_maximize();}catch(e){}
});
// 标题栏按钮不触发拖动
bar.querySelectorAll('.qj-tb-btn').forEach(function(b){b.setAttribute('data-no-drag','');});

// ---- window.close 转发 ----
window.close=function(){try{window.pywebview.api.close_window();}catch(e){}};

// ---- 给交互元素打 data-no-drag，避免点按钮/输入时触发窗口拖动 ----
function markNoDrag(){
 var sels='button,input,textarea,a,select,[contenteditable],label,.list-item,.task-item,.markdown-body,.preview,#preview,.page-stage,.modal,.modal-content,.stickers-palette,.progress-wrap,.editor-area,.file-tree,.toolbar,.petal,.spiral,.qj-tb-btn';
 try{document.querySelectorAll(sels).forEach(function(el){
  el.setAttribute('data-no-drag','');
 });}catch(e){}
}
markNoDrag();
try{
 var mo=new MutationObserver(function(){markNoDrag();});
 mo.observe(document.documentElement,{childList:true,subtree:true});
}catch(e){}

// ---- 滚轮/触控板 → 缩放窗口 ----
// 1) 标题栏区域：滚轮直接缩放（不需要 Ctrl）
// 2) 内容区域：Ctrl+滚轮缩放（避免与页面滚动冲突）
function doResize(e){
 var delta=e.deltaY<0?48:-48;
 try{window.pywebview.api.resize_window(delta,delta);}catch(err){}
}
bar.addEventListener('wheel',function(e){
 e.preventDefault();
 doResize(e);
},{passive:false});
document.addEventListener('wheel',function(e){
 if(!e.ctrlKey)return;
 e.preventDefault();
 doResize(e);
},{passive:false});

// ---- 导出 / 下载：app.js 在桌面模式下直接调 pywebview.api，无需 polyfill ----
})();"""


# ---------------------------------------------------------------------------
# HTTP 服务：在后台守护线程启动。
# Windows 上 SO_REUSEADDR 会让 bind 在端口被占用时也“成功”（双绑），导致请求
# 被路由到已在运行的旧实例。这里用 allow_reuse_address=False 的子类，并从首选
# 端口起递增寻找真正空闲的端口；同步更新 qy.PORT，使 PDF 导出等用对端口。
# ---------------------------------------------------------------------------
class _ExclusiveHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = False
    daemon_threads = True
    request_queue_size = 32

    def shutdown(self) -> None:
        """避免 server.py 里 /api/shutdown 与窗口关闭重复调用时死锁。"""
        if STOP_EVENT.is_set():
            return
        try:
            super().shutdown()
        except Exception:
            pass

    def serve_forever(self, poll_interval: float = 0.5) -> None:
        """closing/shutdown 期间 selector.select 可能抛 WSAENOTSOCK 10038，吞掉即可。"""
        try:
            super().serve_forever(poll_interval=poll_interval)
        except OSError as exc:
            # 10038 = WSAENOTSOCK  (Windows: closing 先 server_close 关 socket 打断 select)
            # 9    = EBADF         (Unix: 同上)
            if getattr(exc, "winerror", None) == 10038 or exc.errno == 9:
                return
            raise


def start_server() -> tuple[ThreadingHTTPServer, int] | None:
    qy.seed_runtime_files()
    qy.TEMPLATES_DIR.mkdir(exist_ok=True)
    qy.SKINS_DIR.mkdir(exist_ok=True)
    qy.HELP_DIR.mkdir(exist_ok=True)
    qy.load_workspace_root()

    httpd = None
    chosen_port = PORT
    for offset in range(40):
        candidate = PORT + offset
        try:
            httpd = _ExclusiveHTTPServer((HOST, candidate), qy.Handler)
            chosen_port = candidate
            break
        except OSError:
            continue
    if httpd is None:
        qy.log_line(f"从端口 {PORT} 起连续 40 个端口均不可用")
        return None

    qy.PORT = chosen_port  # server.render_html_to_pdf 等据此拼 URL
    threading.Thread(
        target=httpd.serve_forever, name="qingye-http", daemon=True
    ).start()
    qy.log_line(f"App folder: {qy.APP_ROOT}")
    qy.log_line(f"Workspace: {qy.workspace_root()}")
    qy.log_line(f"Open: http://{HOST}:{chosen_port}/  (port={chosen_port})")
    return httpd, chosen_port


def _wait_for_server(base_url: str, timeout: float = 8.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline and not STOP_EVENT.is_set():
        try:
            urllib.request.urlopen(base_url, timeout=0.5)
            return True
        except Exception:
            time.sleep(0.1)
    return False


def _alert(message: str, title: str = "青叶笺", error: bool = True) -> None:
    try:
        import ctypes
        flags = 0x10 if error else 0x40  # MB_ICONERROR / MB_ICONINFORMATION
        ctypes.windll.user32.MessageBoxW(0, message, title, flags)
    except Exception:
        print(message)


# ---------------------------------------------------------------------------
# 清理：关 HTTP server + 释放 socket + 杀掉本 Python 派生的子进程
# ---------------------------------------------------------------------------
_HAS_KILLED_CHILDREN = False
_KILL_LOCK = threading.Lock()


def _kill_my_children(timeout_s: float = 2.5) -> None:
    """终止本进程派生的所有子进程（主要是 PDF 导出用的 Edge/Chrome 无头进程）。"""
    global _HAS_KILLED_CHILDREN
    with _KILL_LOCK:
        if _HAS_KILLED_CHILDREN:
            return
        _HAS_KILLED_CHILDREN = True

    try:
        my_pid = os.getpid()
    except Exception:
        return

    # 在 Windows 上用 wmic 拿父子进程关系；仅对我们可能启动的浏览器名发送 terminate
    browser_names = ("msedge.exe", "chrome.exe")
    children: list[int] = []
    try:
        output = subprocess.check_output(
            ["wmic", "process", "get", "ProcessId,ParentProcessId,Name", "/format:list"],
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
            timeout=6,
            stderr=subprocess.DEVNULL,
        ).decode("utf-8", "replace")
        name = ""
        pid = None
        ppid = None
        for line in output.splitlines():
            line = line.strip()
            if not line:
                if (
                    pid is not None
                    and ppid == my_pid
                    and name.lower() in browser_names
                ):
                    children.append(pid)
                name = ""
                pid = None
                ppid = None
                continue
            if line.startswith("Name="):
                name = line.split("=", 1)[1]
            elif line.startswith("ProcessId="):
                try:
                    pid = int(line.split("=", 1)[1])
                except ValueError:
                    pid = None
            elif line.startswith("ParentProcessId="):
                try:
                    ppid = int(line.split("=", 1)[1])
                except ValueError:
                    ppid = None
        # flush last item
        if (
            pid is not None
            and ppid == my_pid
            and name.lower() in browser_names
        ):
            children.append(pid)
    except Exception:
        children = []

    if not children:
        return
    for cpid in children:
        try:
            subprocess.run(
                ["taskkill", "/PID", str(cpid), "/T", "/F"],
                check=False,
                timeout=timeout_s,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception:
            pass


def _shutdown_cleanup(httpd: ThreadingHTTPServer | None, api: JsApi) -> None:
    """有序清理：电源开关 → 停HTTP → 关socket → 杀子进程 → 断引用。"""
    if STOP_EVENT.is_set():
        return  # 保证只跑一次
    STOP_EVENT.set()

    # 1. 停止 HTTP 主循环（用户点界面「退出」时 server.py 自己的 _stop 已跑过，允许重复）
    # shutdown 通过内部 Event 让 serve_forever 干净退出，不会打断正在处理的请求。
    if httpd is not None:
        try:
            httpd.shutdown()
        except Exception:
            pass
        # 2. 释放监听 socket，让下次启动一定能立刻拿到端口。
        # 先确认 serve_forever 已退出再关（避免 WSAENOTSOCK 10038）。
        try:
            httpd.server_close()
        except Exception:
            pass

    # 3. 杀本进程派生出的 Edge/Chrome 无头子进程
    _kill_my_children()

    # 4. 打断对 window 的相互引用，帮助 GC 释放 WebView2 资源
    try:
        if api._window is not None:
            api._window = None
    except Exception:
        pass


def _force_exit_after_deadline(deadline_s: float) -> None:
    """后台线程：主线程退出清理仍卡住 → 强制退出。"""
    start = time.monotonic()
    while time.monotonic() - start < deadline_s:
        time.sleep(0.1)
        if STOP_EVENT.is_set():
            return  # 正常路径已接手
    # 仍未置位说明 main 端卡住，强退
    os._exit(0)


def _launch_open_md() -> Path | None:
    """从命令行 /「打开方式」解析要打开的 .md 文件。"""
    for raw in sys.argv[1:]:
        if not raw or raw.startswith("-"):
            continue
        try:
            path = Path(raw).expanduser().resolve()
        except Exception:
            continue
        if path.is_file() and path.suffix.lower() == ".md":
            return path
    return None


def main() -> None:
    # Ctrl+C：直接触发 stop+强退（bat 脚本里 ctrl+c 时生效）
    def _sigint(_signum, _frame):
        STOP_EVENT.set()
        _kill_my_children()
        os._exit(0)

    try:
        signal.signal(signal.SIGINT, _sigint)
        signal.signal(signal.SIGTERM, _sigint)
    except Exception:
        pass

    open_md = _launch_open_md()

    started = start_server()
    if started is None:
        _alert(
            f"无法启动青叶笺：从端口 {PORT} 起连续多个端口均被占用。\n"
            "程序可能已在运行，请勿重复启动；或先关闭占用这些端口的程序。",
        )
        sys.exit(1)
    httpd, chosen_port = started
    base_url = f"http://{HOST}:{chosen_port}/"
    open_rel = ""
    if open_md is not None:
        try:
            qy.save_workspace_root(open_md.parent)
            open_rel = open_md.name
            base_url = (
                f"http://{HOST}:{chosen_port}/"
                f"?open={urllib.parse.quote(open_rel)}"
            )
            qy.log_line(f"Launch open: {open_md} (workspace={open_md.parent})")
        except Exception as exc:
            qy.log_line(f"Launch open failed: {exc}")

    if not _wait_for_server(f"http://{HOST}:{chosen_port}/"):
        _alert("本地服务启动超时，请重试。")
        try:
            httpd.shutdown()
        except Exception:
            pass
        try:
            httpd.server_close()
        except Exception:
            pass
        sys.exit(1)

    api = JsApi()
    window = webview.create_window(
        title="青叶笺 · 学习计划",
        url=base_url,
        width=1280,
        height=860,
        min_size=(320, 240),
        text_select=True,
        js_api=api,
        frameless=True,
        # 默认 easy_drag 会在任意 mousedown 上拖窗口，成品页 checkbox 点不到
        easy_drag=False,
    )
    api._bind(window)

    def _on_loaded() -> None:
        try:
            window.evaluate_js(_FRAMELESS_JS)
            qy.log_line("frameless JS injected")
        except Exception as e:
            qy.log_line(f"frameless JS inject err: {e}")

    def _on_closing() -> None:
        """用户点窗口右上角×：先置 STOP_EVENT，再由 closed 做详细清理。
        returning False 不会阻止关闭，只是趁机拉电源闸。"""
        _shutdown_cleanup(httpd, api)

    def _on_closed() -> None:
        """兜底：如果 closing 没被触发或中间某步未执行完，再来一次。"""
        _shutdown_cleanup(httpd, api)

    window.events.loaded += _on_loaded
    window.events.closing += _on_closing
    window.events.closed += _on_closed

    # webview.start() 占用主线程直到所有窗口关闭
    # 正式打包关闭 DevTools；开发时设环境变量 QINGYE_DEBUG=1 或直接跑源码可开
    _debug = (not getattr(sys, "frozen", False)) or (
        os.environ.get("QINGYE_DEBUG", "").strip() in ("1", "true", "TRUE", "yes")
    )
    webview.start(debug=_debug)

    # 保险：窗口关闭后再次确保清理
    _shutdown_cleanup(httpd, api)

    # 如果有非 daemon 线程仍活着（WebView2 终结器/COM 线程等），最后兜底强退，
    # 保证用户点击关闭后一定不残留 python.exe。
    remaining = [
        t for t in threading.enumerate() if not t.daemon and t is not threading.main_thread()
    ]
    if remaining:
        try:
            qy.log_line(
                f"等待 {len(remaining)} 个剩余线程退出: "
                + ", ".join(t.name or "<anon>" for t in remaining)
            )
        except Exception:
            pass
        # 给最多 2.5s 让它们自己收敛（Windows 上某些 COM 线程退出很磨蹭）
        deadline = time.monotonic() + 2.5
        while threading.enumerate() != [threading.main_thread()]:
            if time.monotonic() > deadline:
                break
            time.sleep(0.08)
    os._exit(0)


if __name__ == "__main__":
    main()
