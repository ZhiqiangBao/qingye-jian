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
    webview.start()

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
