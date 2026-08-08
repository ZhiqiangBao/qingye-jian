"""Build a windowed (no console) release folder for 青叶笺."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parent.parent
PACK = Path(__file__).resolve().parent
DIST = APP_ROOT / "dist"
RELEASE = APP_ROOT / "release" / "qingye-jian"
EXE_NAME = "QingyeJian"
ICON = PACK / "qingye-jian.ico"

ASSET_FILES = ("index.html", "app.js", "styles.css", "marked.min.js")
ASSET_DIRS = ("templates", "skins", "help", "document")


def run(cmd: list[str]) -> None:
    print(">", " ".join(cmd))
    subprocess.check_call(cmd, cwd=APP_ROOT)


def pick_python() -> str:
    """Prefer a real install with pip; avoid broken venv shims on PATH."""
    candidates = [
        Path(r"D:\python\python.exe"),
        Path(sys.executable),
    ]
    for cand in candidates:
        if not cand.is_file():
            continue
        try:
            subprocess.check_call(
                [str(cand), "-c", "import pip"],
                cwd=APP_ROOT,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return str(cand)
        except Exception:
            continue
    return sys.executable


def main() -> None:
    py = pick_python()
    sys.path.insert(0, str(PACK))
    subprocess.check_call([py, str(PACK / "make_icon.py")], cwd=APP_ROOT)
    if not ICON.is_file():
        raise SystemExit("icon missing")

    try:
        subprocess.check_call(
            [py, "-c", "import PyInstaller"],
            cwd=APP_ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        run([py, "-m", "pip", "install", "pyinstaller"])

    # Clean previous build of this app
    for path in (DIST / EXE_NAME, APP_ROOT / "build" / EXE_NAME, RELEASE):
        if path.exists():
            shutil.rmtree(path)

    datas: list[str] = []
    for name in ASSET_FILES:
        datas += ["--add-data", f"{APP_ROOT / name};."]
    for name in ASSET_DIRS:
        datas += ["--add-data", f"{APP_ROOT / name};{name}"]

    run(
        [
            py,
            "-m",
            "PyInstaller",
            "--noconfirm",
            "--clean",
            "--windowed",
            "--onedir",
            "--name",
            EXE_NAME,
            "--icon",
            str(ICON),
            *datas,
            str(APP_ROOT / "server.py"),
        ]
    )

    built = DIST / EXE_NAME
    if not (built / f"{EXE_NAME}.exe").is_file():
        raise SystemExit(f"build missing: {built}")

    RELEASE.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(built, RELEASE)

    # Also place assets beside the exe for immediate first run / easy editing
    for name in ASSET_FILES:
        shutil.copy2(APP_ROOT / name, RELEASE / name)
    for name in ASSET_DIRS:
        dest = RELEASE / name
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(APP_ROOT / name, dest)

    # Ship a single Chinese-named launcher (PyInstaller still builds as EXE_NAME).
    built_exe = RELEASE / f"{EXE_NAME}.exe"
    friendly = RELEASE / "青叶笺.exe"
    if friendly.exists():
        friendly.unlink()
    built_exe.replace(friendly)

    readme = RELEASE / "使用说明.txt"
    readme.write_text(
        "青叶笺\n"
        "======\n\n"
        "双击「青叶笺.exe」即可启动（无黑色终端窗口）。\n"
        "浏览器会自动打开编辑器；关闭浏览器标签页不会退出后台。\n"
        "用完请点界面顶部「退出」，关闭本地服务。\n\n"
        "文件夹说明：\n"
        "- document/   默认笔记内容\n"
        "- templates/  计划模板\n"
        "- skins/      手账皮肤\n"
        "- help/       编辑技巧（界面内「帮助」也可打开）\n",
        encoding="utf-8",
    )

    print()
    print(f"Release ready: {RELEASE}")
    print(f"Launch: {friendly}")


if __name__ == "__main__":
    main()
