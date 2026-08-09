#!/usr/bin/env python3
"""青叶笺桌面客户端 —— 不依赖外部浏览器。

复用同目录下的 server.py 提供 HTTP API 与静态资源，
用 pywebview（Windows 上为 Edge WebView2）打开原生窗口承载界面。
"""

from __future__ import annotations

import sys
import threading
import time
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

# 以本文件所在目录为应用根目录，确保 server.py 的 APP_ROOT 指向这里
APP_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(APP_DIR))

import server as qy  # noqa: E402  复用现有 server.py
import webview  # noqa: E402

HOST = qy.HOST  # "127.0.0.1"
PORT = qy.PORT  # 8765（首选端口，被占用时自动递增）


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

    def _bind(self, window) -> None:
        self._window = window

    def close_window(self) -> bool:
        """由注入的 JS 调用：关闭原生窗口（同时触发 closed 事件停服务）。"""
        if self._window is not None:
            try:
                self._window.destroy()
            except Exception:
                pass
        return True


# 覆盖 window.close，使其转调 pywebview 桥
_CLOSE_JS = (
    "(function(){"
    "if(window.__qyClosePatched)return;"
    "window.__qyClosePatched=true;"
    "window.close=function(){"
    "try{window.pywebview.api.close_window();}catch(e){}"
    "};"
    "})();"
)


# ---------------------------------------------------------------------------
# HTTP 服务：在后台守护线程启动。
# Windows 上 SO_REUSEADDR 会让 bind 在端口被占用时也“成功”（双绑），导致请求
# 被路由到已在运行的旧实例。这里用 allow_reuse_address=False 的子类，并从首选
# 端口起递增寻找真正空闲的端口；同步更新 qy.PORT，使 PDF 导出等用对端口。
# ---------------------------------------------------------------------------
class _ExclusiveHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = False
    daemon_threads = True


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
    while time.time() < deadline:
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


def main() -> None:
    started = start_server()
    if started is None:
        _alert(
            f"无法启动青叶笺：从端口 {PORT} 起连续多个端口均被占用。\n"
            "程序可能已在运行，请勿重复启动；或先关闭占用这些端口的程序。",
        )
        sys.exit(1)
    httpd, chosen_port = started
    base_url = f"http://{HOST}:{chosen_port}/"

    if not _wait_for_server(base_url):
        _alert("本地服务启动超时，请重试。")
        try:
            httpd.shutdown()
        except Exception:
            pass
        sys.exit(1)

    api = JsApi()
    window = webview.create_window(
        title="青叶笺 · 学习计划",
        url=base_url,
        width=1280,
        height=860,
        min_size=(960, 600),
        text_select=True,
        js_api=api,
    )
    api._bind(window)

    def _on_loaded() -> None:
        try:
            window.evaluate_js(_CLOSE_JS)
        except Exception:
            pass

    def _on_closed() -> None:
        try:
            httpd.shutdown()
        except Exception:
            pass

    window.events.loaded += _on_loaded
    window.events.closed += _on_closed

    # webview.start() 占用主线程直到所有窗口关闭
    webview.start()

    # 保险：窗口关闭后再次确保服务停止
    try:
        httpd.shutdown()
    except Exception:
        pass


if __name__ == "__main__":
    main()
