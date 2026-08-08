#!/usr/bin/env python3
"""青叶笺 local editor server.

App files live in APP_ROOT (this folder).
Markdown documents can be browsed anywhere under a configurable workspace root
(default: parent of this folder, usually D:\\document).
"""

from __future__ import annotations

import json
import mimetypes
import re
import shutil
import sys
import webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


def is_frozen() -> bool:
    return bool(getattr(sys, "frozen", False))


def resolve_app_root() -> Path:
    """Writable app directory: next to the .exe when packaged, else this repo folder."""
    if is_frozen():
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def bundled_root() -> Path | None:
    """PyInstaller extract dir for read-only seeded assets (first-run copy)."""
    meipass = getattr(sys, "_MEIPASS", None)
    if meipass:
        return Path(meipass)
    return None


APP_ROOT = resolve_app_root()
TEMPLATES_DIR = APP_ROOT / "templates"
SKINS_DIR = APP_ROOT / "skins"
HELP_DIR = APP_ROOT / "help"
CONFIG_PATH = APP_ROOT / "workspace.json"
DEFAULT_HELP_DOC = "编辑技巧.md"
HOST = "127.0.0.1"
PORT = 8765
SEED_DIRS = ("templates", "skins", "help", "document")
SEED_FILES = ("index.html", "app.js", "styles.css", "marked.min.js")

SAFE_FILE = re.compile(r"^[^\\/:*?\"<>|\r\n]+$", re.IGNORECASE)
SAFE_SKIN_ID = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$")
TEMPLATE_META = re.compile(
    r"<!--\s*journal-template\s*(.*?)\s*-->",
    re.IGNORECASE | re.DOTALL,
)
COLOR_KEY_MAP = {
    "ink": "--ink",
    "inkSoft": "--ink-soft",
    "paper": "--paper",
    "sage": "--sage",
    "sageDeep": "--sage-deep",
    "blush": "--blush",
    "sky": "--sky",
    "lemon": "--lemon",
}

_workspace_root: Path | None = None


def default_workspace() -> Path:
    """User content lives in APP_ROOT/document so browsing won't show app source files."""
    docs = APP_ROOT / "document"
    docs.mkdir(parents=True, exist_ok=True)
    return docs.resolve()


def load_workspace_root() -> Path:
    global _workspace_root
    if _workspace_root is not None:
        return _workspace_root
    root = default_workspace()
    if CONFIG_PATH.is_file():
        try:
            data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
            raw = str(data.get("root") or "").strip()
            if raw:
                candidate = Path(raw).expanduser().resolve()
                if candidate.is_dir():
                    root = candidate
        except Exception:
            pass
    # Ensure default content folder always exists even when overridden later.
    (APP_ROOT / "document").mkdir(parents=True, exist_ok=True)
    _workspace_root = root
    return root


def save_workspace_root(path: Path) -> Path:
    global _workspace_root
    path = path.expanduser().resolve()
    if not path.is_dir():
        raise ValueError("workspace root must be an existing directory")
    payload = {
        "root": str(path),
        "comment": "Markdown 可读/可写范围。默认是程序目录下的 document/。改完后点工作区或重新启动程序。",
    }
    CONFIG_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    _workspace_root = path
    return path


def workspace_root() -> Path:
    return load_workspace_root()


def workspace_suggestions() -> list[dict]:
    """Common folders the user can click without typing a path."""
    home = Path.home()
    content_dir = APP_ROOT / "document"
    content_dir.mkdir(parents=True, exist_ok=True)
    candidates: list[tuple[str, Path]] = [
        ("默认内容库 document/", content_dir),
        ("当前工作区", workspace_root()),
        ("本程序所在文件夹", APP_ROOT),
        ("本程序上一级", APP_ROOT.parent),
        ("用户主目录", home),
        ("桌面", home / "Desktop"),
        ("文档", home / "Documents"),
        ("下载", home / "Downloads"),
    ]
    # Windows extras / Chinese localized folder names
    for label, rel in (
        ("桌面", "Desktop"),
        ("桌面", "桌面"),
        ("文档", "Documents"),
        ("文档", "文档"),
        ("下载", "Downloads"),
        ("下载", "下载"),
    ):
        candidates.append((label, home / rel))

    for drive in "CDEFGHIJKLMNOPQRSTUVWXYZ":
        root = Path(f"{drive}:/")
        if root.exists():
            candidates.append((f"{drive}: 盘", root))
            doc = root / "document"
            if doc.is_dir():
                candidates.append((f"{drive}:\\document", doc))

    seen: set[str] = set()
    out: list[dict] = []
    for label, path in candidates:
        try:
            if not path.exists() or not path.is_dir():
                continue
            resolved = str(path.resolve())
            key = resolved.lower()
            if key in seen:
                continue
            seen.add(key)
            out.append({"label": label, "path": resolved})
        except Exception:
            continue
    return out


def pick_workspace_folder(initial: str | None = None) -> Path | None:
    """Open a native OS folder picker (local machine)."""
    import tkinter as tk
    from tkinter import filedialog

    start = Path(initial).expanduser() if initial else workspace_root()
    if not start.exists():
        start = Path.home()

    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    try:
        chosen = filedialog.askdirectory(
            parent=root,
            initialdir=str(start),
            title="选择 Markdown 工作区文件夹",
            mustexist=True,
        )
    finally:
        try:
            root.destroy()
        except Exception:
            pass
    if not chosen:
        return None
    return Path(chosen).expanduser().resolve()


def resolve_under(base: Path, rel: str, *, must_exist: bool | None = None) -> Path:
    """Resolve rel path under base; reject escapes."""
    rel = unquote((rel or "").strip()).replace("\\", "/")
    if rel in {"", "."}:
        path = base.resolve()
    else:
        parts = [p for p in Path(rel).parts if p not in {"", "."}]
        if any(p == ".." for p in parts):
            raise ValueError("path traversal is not allowed")
        for p in parts:
            if not SAFE_FILE.match(p):
                raise ValueError(f"invalid path segment: {p}")
        path = (base.joinpath(*parts)).resolve()
    try:
        path.relative_to(base.resolve())
    except ValueError as exc:
        raise ValueError("path escapes workspace") from exc
    if must_exist is True and not path.exists():
        raise FileNotFoundError("not found")
    if must_exist is False and path.exists():
        raise FileExistsError("already exists")
    return path


def resolve_md(rel: str) -> Path:
    path = resolve_under(workspace_root(), rel)
    if path.suffix.lower() != ".md":
        raise ValueError("only .md files are allowed")
    return path


def safe_template_path(name: str) -> Path:
    name = unquote((name or "").strip())
    if not name.lower().endswith(".md"):
        raise ValueError("invalid template filename")
    if "/" in name or "\\" in name or name.startswith("."):
        raise ValueError("invalid template filename")
    if not SAFE_FILE.match(name):
        raise ValueError("invalid template filename")
    TEMPLATES_DIR.mkdir(exist_ok=True)
    path = (TEMPLATES_DIR / name).resolve()
    if path.parent != TEMPLATES_DIR.resolve():
        raise ValueError("path escapes templates folder")
    return path


def parse_template_meta(text: str) -> tuple[dict, str]:
    meta: dict[str, str] = {}
    match = TEMPLATE_META.search(text)
    body = text
    if match:
        for line in match.group(1).splitlines():
            line = line.strip()
            if not line or ":" not in line:
                continue
            key, value = line.split(":", 1)
            meta[key.strip().lower()] = value.strip()
        body = (text[: match.start()] + text[match.end() :]).lstrip("\n")
    return meta, body


def apply_placeholders(text: str) -> str:
    today = datetime.now()
    mapping = {
        "{{date}}": f"{today.year}年{today.month}月{today.day}日",
        "{{date_iso}}": today.strftime("%Y-%m-%d"),
        "{{weekday}}": "一二三四五六日"[today.weekday()],
    }
    for key, value in mapping.items():
        text = text.replace(key, value)
    return text


def list_templates() -> list[dict]:
    TEMPLATES_DIR.mkdir(exist_ok=True)
    items = []
    for path in sorted(TEMPLATES_DIR.iterdir(), key=lambda p: p.name.lower()):
        if not path.is_file() or path.suffix.lower() != ".md":
            continue
        raw = path.read_text(encoding="utf-8")
        meta, _ = parse_template_meta(raw)
        items.append(
            {
                "name": path.name,
                "title": meta.get("title") or path.stem,
                "desc": meta.get("desc") or "",
                "size": path.stat().st_size,
                "mtime": int(path.stat().st_mtime),
            }
        )
    return items


def safe_skin_path(name: str) -> Path:
    name = unquote((name or "").strip())
    if not name.lower().endswith(".json"):
        name += ".json"
    if "/" in name or "\\" in name or name.startswith("."):
        raise ValueError("invalid skin filename")
    if not SAFE_FILE.match(name):
        raise ValueError("invalid skin filename")
    SKINS_DIR.mkdir(exist_ok=True)
    path = (SKINS_DIR / name).resolve()
    if path.parent != SKINS_DIR.resolve():
        raise ValueError("path escapes skins folder")
    return path


def _as_dict(value: object) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: object) -> list:
    return value if isinstance(value, list) else []


def normalize_paper(paper_in: object) -> dict:
    paper = _as_dict(paper_in)
    lines = _as_dict(paper.get("lines"))
    margin = _as_dict(paper.get("marginLine") or paper.get("margin"))
    size = str(paper.get("size") or "full").strip().lower()
    if size not in {"full", "a4", "a5", "b6", "square", "wide"}:
        size = "full"
    line_style = str(lines.get("style") or "solid").strip().lower()
    if line_style not in {"solid", "dashed", "dotted", "grid", "none"}:
        line_style = "solid"
    return {
        "size": size,
        "maxWidth": str(paper.get("maxWidth") or "").strip(),
        "minHeight": str(paper.get("minHeight") or "62vh").strip() or "62vh",
        "radius": str(paper.get("radius") or "22px").strip() or "22px",
        "shadow": str(paper.get("shadow") or "").strip(),
        "background": str(paper.get("background") or "").strip(),
        "lines": {
            "enabled": bool(lines.get("enabled", True)) and line_style != "none",
            "style": line_style if line_style != "none" else "solid",
            "gap": str(lines.get("gap") or "1.7rem").strip() or "1.7rem",
            "color": str(lines.get("color") or "").strip(),
            "offsetTop": str(lines.get("offsetTop") or "2.6rem").strip() or "2.6rem",
        },
        "marginLine": {
            "enabled": bool(margin.get("enabled", True)),
            "left": str(margin.get("left") or "2.1rem").strip() or "2.1rem",
            "color": str(margin.get("color") or "").strip(),
        },
    }


def normalize_layout(layout_in: object) -> dict:
    layout = _as_dict(layout_in)
    return {
        "sidebarWidth": str(layout.get("sidebarWidth") or "15.2rem").strip() or "15.2rem",
        "notebookMaxWidth": str(layout.get("notebookMaxWidth") or "1240px").strip()
        or "1240px",
        "showSpiral": bool(layout.get("showSpiral", True)),
        "showTape": bool(layout.get("showTape", True)),
        "showPetals": bool(layout.get("showPetals", True)),
        "contentGap": str(layout.get("contentGap") or "0.9rem").strip() or "0.9rem",
    }


def normalize_stickers(stickers_in: object) -> list[dict]:
    out = []
    for item in _as_list(stickers_in)[:24]:
        if not isinstance(item, dict):
            continue
        text = str(item.get("emoji") or item.get("text") or "").strip()
        if not text:
            continue
        out.append(
            {
                "emoji": text[:8],
                "top": str(item.get("top") or "").strip(),
                "left": str(item.get("left") or "").strip(),
                "right": str(item.get("right") or "").strip(),
                "bottom": str(item.get("bottom") or "").strip(),
                "rotate": str(item.get("rotate") or "0").strip() or "0",
                "size": str(item.get("size") or "1.35rem").strip() or "1.35rem",
                "opacity": str(item.get("opacity") or "0.92").strip() or "0.92",
                "z": str(item.get("z") or "3").strip() or "3",
            }
        )
    return out


def normalize_skin(data: dict, *, filename: str = "") -> dict:
    if not isinstance(data, dict):
        raise ValueError("skin must be a JSON object")
    skin_id = str(data.get("id") or Path(filename).stem or "").strip()
    if not SAFE_SKIN_ID.match(skin_id):
        raise ValueError("skin id must be letters/numbers/_/- (e.g. my-skin)")
    name = str(data.get("name") or skin_id).strip() or skin_id
    colors_in = data.get("colors") or {}
    if not isinstance(colors_in, dict) or not colors_in:
        raise ValueError("skin.colors is required")
    colors = {}
    css_vars = {}
    for key, css_name in COLOR_KEY_MAP.items():
        val = colors_in.get(key)
        if val is None:
            continue
        val = str(val).strip()
        if not val:
            continue
        colors[key] = val
        css_vars[css_name] = val
    if "sage" not in colors and "sageDeep" not in colors:
        raise ValueError("colors.sage or colors.sageDeep is required")
    desk_wash = str(data.get("deskWash") or data.get("desk_wash") or "").strip()
    paper = normalize_paper(data.get("paper"))
    layout = normalize_layout(data.get("layout"))
    stickers = normalize_stickers(data.get("stickers"))
    return {
        "id": skin_id,
        "name": name,
        "stamp": str(data.get("stamp") or "自订").strip() or "自订",
        "desc": str(data.get("desc") or "").strip(),
        "preset": bool(data.get("preset", False)),
        "file": f"{skin_id}.json",
        "colors": colors,
        "cssVars": css_vars,
        "deskWash": desk_wash,
        "paper": paper,
        "layout": layout,
        "stickers": stickers,
    }


def list_skins() -> list[dict]:
    SKINS_DIR.mkdir(exist_ok=True)
    items = []
    for path in sorted(SKINS_DIR.iterdir(), key=lambda p: p.name.lower()):
        if not path.is_file() or path.suffix.lower() != ".json":
            continue
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
            skin = normalize_skin(raw, filename=path.name)
            skin["mtime"] = int(path.stat().st_mtime)
            items.append(skin)
        except Exception as exc:
            items.append(
                {
                    "id": path.stem,
                    "name": path.stem,
                    "stamp": "!",
                    "desc": f"无效皮肤：{exc}",
                    "preset": False,
                    "file": path.name,
                    "colors": {},
                    "cssVars": {},
                    "deskWash": "",
                    "error": str(exc),
                }
            )
    # presets first, then custom, by name
    items.sort(key=lambda s: (0 if s.get("preset") else 1, s.get("name") or s.get("id") or ""))
    return items


def save_skin_payload(payload: dict, *, overwrite: bool = False) -> dict:
    skin = normalize_skin(payload, filename=str(payload.get("id") or ""))
    path = safe_skin_path(f"{skin['id']}.json")
    if path.exists():
        existing = json.loads(path.read_text(encoding="utf-8"))
        if bool(existing.get("preset")) and not bool(payload.get("forcePreset")):
            raise ValueError("不能覆盖内置预设皮肤，请换一个 id")
        if not overwrite:
            raise ValueError("同名皮肤已存在，请更换 id 或选择覆盖")
    out = {
        "id": skin["id"],
        "name": skin["name"],
        "stamp": skin["stamp"],
        "desc": skin["desc"],
        "preset": bool(payload.get("forcePreset")) and bool(payload.get("preset")),
        "colors": skin["colors"],
        "deskWash": skin["deskWash"],
        "paper": skin["paper"],
        "layout": skin["layout"],
        "stickers": skin["stickers"],
    }
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return normalize_skin(out, filename=path.name)


def browse(rel: str = "") -> dict:
    root = workspace_root()
    folder = resolve_under(root, rel)
    if not folder.is_dir():
        raise ValueError("not a directory")

    rel_posix = "." if folder == root else folder.relative_to(root).as_posix()
    dirs = []
    files = []
    for entry in sorted(folder.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
        if entry.name.startswith("."):
            continue
        if entry.is_dir():
            # skip heavy/system-ish names
            if entry.name.lower() in {"node_modules", "__pycache__", ".git"}:
                continue
            dirs.append(
                {
                    "name": entry.name,
                    "path": entry.relative_to(root).as_posix(),
                }
            )
        elif entry.is_file() and entry.suffix.lower() == ".md":
            files.append(
                {
                    "name": entry.name,
                    "path": entry.relative_to(root).as_posix(),
                    "size": entry.stat().st_size,
                    "mtime": int(entry.stat().st_mtime),
                }
            )

    crumbs = [{"name": "工作区", "path": ""}]
    if rel_posix not in {"", "."}:
        acc = []
        for part in Path(rel_posix).parts:
            acc.append(part)
            crumbs.append({"name": part, "path": "/".join(acc)})

    parent = ""
    if rel_posix not in {"", "."}:
        parent_path = folder.parent
        parent = (
            ""
            if parent_path == root
            else parent_path.relative_to(root).as_posix()
        )

    return {
        "workspace": str(root),
        "path": "" if rel_posix in {"", "."} else rel_posix,
        "parent": parent,
        "breadcrumbs": crumbs,
        "dirs": dirs,
        "files": files,
    }


def unique_md_path(rel_dir: str, filename: str) -> Path:
    if not filename.lower().endswith(".md"):
        filename += ".md"
    if "/" in filename or "\\" in filename:
        raise ValueError("filename must not contain path separators")
    if not SAFE_FILE.match(filename):
        raise ValueError("invalid filename")
    folder = resolve_under(workspace_root(), rel_dir)
    if not folder.is_dir():
        raise ValueError("target folder does not exist")
    candidate = folder / filename
    if not candidate.exists():
        return resolve_md(candidate.relative_to(workspace_root()).as_posix())
    stem = Path(filename).stem
    for i in range(2, 100):
        name = f"{stem}-{i}.md"
        path = folder / name
        if not path.exists():
            return resolve_md(path.relative_to(workspace_root()).as_posix())
    raise ValueError("too many name collisions")


class Handler(BaseHTTPRequestHandler):
    server_version = "StudyPlanEditor/2.0"

    def log_message(self, fmt: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def _send(self, code: int, body: bytes, content_type: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, code: int, payload: object) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self._send(code, data, "application/json; charset=utf-8")

    def _read_body(self) -> bytes:
        length = int(self.headers.get("Content-Length") or 0)
        return self.rfile.read(length) if length > 0 else b""

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == "/api/workspace":
            root = workspace_root()
            self._send_json(
                200,
                {
                    "workspace": str(root),
                    "app": str(APP_ROOT),
                    "templates": str(TEMPLATES_DIR),
                    "skins": str(SKINS_DIR),
                    "suggestions": workspace_suggestions(),
                },
            )
            return

        if path == "/api/workspace/suggestions":
            self._send_json(
                200,
                {
                    "workspace": str(workspace_root()),
                    "suggestions": workspace_suggestions(),
                },
            )
            return

        if path == "/api/skins":
            self._send_json(
                200,
                {
                    "folder": str(SKINS_DIR),
                    "hint": "把皮肤 .json 放进 skins 文件夹，或在界面导入",
                    "skins": list_skins(),
                },
            )
            return

        if path == "/api/skin":
            name = (qs.get("name") or qs.get("id") or [""])[0]
            try:
                target = safe_skin_path(name if name.endswith(".json") else f"{name}.json")
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
                return
            if not target.is_file():
                self._send_json(404, {"error": "skin not found"})
                return
            try:
                raw = json.loads(target.read_text(encoding="utf-8"))
                self._send_json(200, normalize_skin(raw, filename=target.name))
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if path == "/api/browse":
            rel = (qs.get("path") or [""])[0]
            try:
                self._send_json(200, browse(rel))
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if path == "/api/files":
            # backward-compatible: list md in a folder (default workspace root)
            rel = (qs.get("path") or [""])[0]
            try:
                data = browse(rel)
                self._send_json(
                    200,
                    {
                        "folder": data["workspace"],
                        "path": data["path"],
                        "files": data["files"],
                        "dirs": data["dirs"],
                        "breadcrumbs": data["breadcrumbs"],
                        "parent": data["parent"],
                    },
                )
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if path == "/api/file":
            rel = (qs.get("path") or qs.get("name") or [""])[0]
            try:
                target = resolve_md(rel)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
                return
            if not target.is_file():
                self._send_json(404, {"error": "file not found"})
                return
            self._send_json(
                200,
                {
                    "name": target.name,
                    "path": target.relative_to(workspace_root()).as_posix(),
                    "content": target.read_text(encoding="utf-8"),
                },
            )
            return

        if path == "/api/templates":
            self._send_json(
                200,
                {
                    "folder": str(TEMPLATES_DIR),
                    "hint": "把 .md 放进 templates 即可",
                    "templates": list_templates(),
                },
            )
            return

        if path == "/api/template":
            name = (qs.get("name") or [""])[0]
            try:
                target = safe_template_path(name)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
                return
            if not target.is_file():
                self._send_json(404, {"error": "template not found"})
                return
            raw = target.read_text(encoding="utf-8")
            meta, body = parse_template_meta(raw)
            self._send_json(
                200,
                {
                    "name": target.name,
                    "title": meta.get("title") or target.stem,
                    "desc": meta.get("desc") or "",
                    "content": body,
                },
            )
            return

        if path == "/api/help":
            HELP_DIR.mkdir(parents=True, exist_ok=True)
            name = (qs.get("name") or [DEFAULT_HELP_DOC])[0].strip() or DEFAULT_HELP_DOC
            if not SAFE_FILE.match(name) or not name.lower().endswith(".md"):
                self._send_json(400, {"error": "invalid help name"})
                return
            target = (HELP_DIR / name).resolve()
            if target.parent != HELP_DIR.resolve() or not target.is_file():
                self._send_json(404, {"error": "help not found"})
                return
            docs = sorted(
                p.name for p in HELP_DIR.glob("*.md") if p.is_file()
            )
            self._send_json(
                200,
                {
                    "folder": str(HELP_DIR),
                    "name": target.name,
                    "title": target.stem,
                    "docs": docs,
                    "content": target.read_text(encoding="utf-8"),
                },
            )
            return

        # Static assets from APP_ROOT only (not workspace docs)
        rel = unquote(path.lstrip("/")) or "index.html"
        if ".." in rel.replace("\\", "/").split("/"):
            self._send_json(400, {"error": "invalid path"})
            return
        static_path = (APP_ROOT / rel).resolve()
        if static_path.parent != APP_ROOT and static_path != APP_ROOT:
            self._send_json(403, {"error": "nested app static is limited"})
            return
        if static_path.is_dir():
            static_path = APP_ROOT / "index.html"
        if not static_path.is_file() or static_path.resolve().parent != APP_ROOT:
            self._send_json(404, {"error": "not found"})
            return
        ctype = {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".txt": "text/plain; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".ico": "image/x-icon",
        }.get(static_path.suffix.lower()) or (
            mimetypes.guess_type(str(static_path))[0] or "application/octet-stream"
        )
        self._send(200, static_path.read_bytes(), ctype)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        try:
            payload = json.loads(self._read_body().decode("utf-8") or "{}")
        except Exception:
            self._send_json(400, {"error": "invalid json body"})
            return

        if parsed.path == "/api/workspace":
            raw = str(payload.get("root") or "").strip()
            try:
                root = save_workspace_root(Path(raw))
                self._send_json(200, {"ok": True, "workspace": str(root)})
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if parsed.path == "/api/workspace/pick":
            initial = str(payload.get("initial") or "").strip() or None
            try:
                chosen = pick_workspace_folder(initial)
            except Exception as exc:
                self._send_json(400, {"error": f"无法打开文件夹选择器：{exc}"})
                return
            if chosen is None:
                self._send_json(200, {"ok": False, "cancelled": True})
                return
            try:
                root = save_workspace_root(chosen)
                self._send_json(
                    200,
                    {"ok": True, "workspace": str(root), "cancelled": False},
                )
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if parsed.path == "/api/templates/import":
            template_name = str(payload.get("template") or "").strip()
            as_name = str(payload.get("as") or "").strip()
            dest_dir = str(payload.get("dir") or "").strip()
            try:
                source = safe_template_path(template_name)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
                return
            if not source.is_file():
                self._send_json(404, {"error": "template not found"})
                return
            raw = source.read_text(encoding="utf-8")
            _meta, body = parse_template_meta(raw)
            body = apply_placeholders(body)
            if not as_name:
                today = datetime.now().strftime("%Y-%m-%d")
                as_name = f"{source.stem}-{today}.md"
            try:
                target = unique_md_path(dest_dir, as_name)
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
                return
            target.write_text(body, encoding="utf-8", newline="\n")
            self._send_json(
                200,
                {
                    "ok": True,
                    "name": target.name,
                    "path": target.relative_to(workspace_root()).as_posix(),
                    "from": source.name,
                },
            )
            return

        if parsed.path == "/api/shutdown":
            self._send_json(200, {"ok": True, "bye": True})

            def _stop() -> None:
                try:
                    self.server.shutdown()
                except Exception:
                    pass

            import threading

            threading.Thread(target=_stop, daemon=True).start()
            return

        if parsed.path == "/api/skins/import":
            overwrite = bool(payload.get("overwrite"))
            skin_data = payload.get("skin")
            if skin_data is None and isinstance(payload.get("json"), str):
                try:
                    skin_data = json.loads(payload["json"])
                except Exception:
                    self._send_json(400, {"error": "json 字段不是合法 JSON"})
                    return
            if skin_data is None:
                # allow posting the skin object at top-level
                skin_data = {
                    k: payload.get(k)
                    for k in (
                        "id",
                        "name",
                        "stamp",
                        "desc",
                        "preset",
                        "colors",
                        "deskWash",
                        "desk_wash",
                        "paper",
                        "layout",
                        "stickers",
                    )
                    if k in payload
                }
            try:
                saved = save_skin_payload(skin_data, overwrite=overwrite)
                self._send_json(200, {"ok": True, "skin": saved, "folder": str(SKINS_DIR)})
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        self._send_json(404, {"error": "not found"})

    def do_PUT(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/file":
            self._send_json(404, {"error": "not found"})
            return
        qs = parse_qs(parsed.query)
        rel = (qs.get("path") or qs.get("name") or [""])[0]
        try:
            target = resolve_md(rel)
        except Exception as exc:
            self._send_json(400, {"error": str(exc)})
            return
        # allow creating new file in existing parent dir
        if not target.parent.is_dir():
            self._send_json(400, {"error": "parent folder does not exist"})
            return
        raw = self._read_body()
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            self._send_json(400, {"error": "body must be utf-8 text"})
            return
        target.write_text(text, encoding="utf-8", newline="\n")
        self._send_json(
            200,
            {
                "ok": True,
                "name": target.name,
                "path": target.relative_to(workspace_root()).as_posix(),
                "bytes": len(raw),
            },
        )

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Allow", "GET, PUT, POST, OPTIONS")
        self.end_headers()


def notify_user(message: str, title: str = "青叶笺", error: bool = False) -> None:
    """Show a Windows message box when packaged (no console). Dev mode still prints."""
    if not is_frozen():
        print(message)
        return
    if sys.platform != "win32":
        return
    try:
        import ctypes

        flags = 0x10 if error else 0x40  # MB_ICONERROR / MB_ICONINFORMATION
        ctypes.windll.user32.MessageBoxW(0, str(message), title, flags)
    except Exception:
        pass


def log_line(message: str) -> None:
    if is_frozen():
        try:
            log_path = APP_ROOT / "qingye-jian.log"
            with log_path.open("a", encoding="utf-8") as fh:
                fh.write(f"{datetime.now().isoformat(timespec='seconds')} {message}\n")
        except Exception:
            pass
        return
    print(message)


def seed_runtime_files() -> None:
    """Ensure UI + default assets exist beside the executable."""
    source = bundled_root()
    if source is None:
        TEMPLATES_DIR.mkdir(exist_ok=True)
        SKINS_DIR.mkdir(exist_ok=True)
        HELP_DIR.mkdir(exist_ok=True)
        (APP_ROOT / "document").mkdir(exist_ok=True)
        return

    for name in SEED_FILES:
        dest = APP_ROOT / name
        src = source / name
        if src.is_file() and not dest.is_file():
            shutil.copy2(src, dest)

    for dirname in SEED_DIRS:
        src_dir = source / dirname
        dest_dir = APP_ROOT / dirname
        if not src_dir.is_dir():
            dest_dir.mkdir(exist_ok=True)
            continue
        if not dest_dir.exists():
            shutil.copytree(src_dir, dest_dir)
        else:
            # Fill missing files only; never overwrite user edits.
            for src_file in src_dir.rglob("*"):
                if not src_file.is_file():
                    continue
                rel = src_file.relative_to(src_dir)
                dest_file = dest_dir / rel
                if not dest_file.exists():
                    dest_file.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src_file, dest_file)


def main(argv: list[str] | None = None) -> None:
    args = list(sys.argv[1:] if argv is None else argv)
    # Packaged app always opens the browser; use --no-open to suppress.
    open_browser = ("--open" in args) or is_frozen()
    if "--no-open" in args:
        open_browser = False

    seed_runtime_files()
    TEMPLATES_DIR.mkdir(exist_ok=True)
    SKINS_DIR.mkdir(exist_ok=True)
    HELP_DIR.mkdir(exist_ok=True)
    root = load_workspace_root()
    url = f"http://{HOST}:{PORT}/"

    try:
        server = ThreadingHTTPServer((HOST, PORT), Handler)
    except OSError as exc:
        log_line(f"Port {PORT} unavailable: {exc}")
        # Already running → just reopen the page, no scary error dialog.
        if open_browser:
            try:
                webbrowser.open_new(url)
            except Exception:
                pass
            raise SystemExit(0) from exc
        notify_user(
            f"无法启动服务（端口 {PORT} 不可用）。\n若程序已在运行，请直接打开浏览器访问：\n{url}",
            error=True,
        )
        raise SystemExit(1) from exc

    log_line(f"App folder: {APP_ROOT}")
    log_line(f"Workspace: {root}")
    log_line(f"Open: {url}")

    if open_browser:
        try:
            webbrowser.open_new(url)
        except Exception as exc:
            notify_user(f"服务已启动，但未能自动打开浏览器。\n请手动访问：\n{url}\n\n{exc}", error=True)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log_line("Stopped.")


if __name__ == "__main__":
    main()

