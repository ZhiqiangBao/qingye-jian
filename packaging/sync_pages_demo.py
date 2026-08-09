"""Sync a static GitHub Pages demo into docs/."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"

FILES = (
    "app.js",
    "styles.css",
    "marked.min.js",
    "html2canvas.min.js",
    "jspdf.umd.min.js",
)
DIRS = (
    "skins",
    "help",
    "document",
    "templates",
)


def patch_index(src: Path, dest: Path) -> None:
    html = src.read_text(encoding="utf-8")
    html = html.replace("<html lang=\"zh-CN\">", '<html lang="zh-CN" data-demo="1" data-asset-base="./">', 1)
    html = html.replace(
        "<title>青叶笺 · 学习计划</title>",
        "<title>青叶笺 · 在线 Demo</title>",
        1,
    )
    if "demo-banner" not in html:
        html = html.replace(
            '<body data-theme="qingye">',
            '<body data-theme="qingye">\n'
            '  <div class="demo-banner" id="demoBanner" hidden>\n'
            "    正在打开在线 Demo…\n"
            "  </div>",
            1,
        )
    dest.write_text(html, encoding="utf-8")


def main() -> None:
    if DOCS.exists():
        shutil.rmtree(DOCS)
    DOCS.mkdir(parents=True)

    patch_index(ROOT / "index.html", DOCS / "index.html")
    for name in FILES:
        shutil.copy2(ROOT / name, DOCS / name)
    for name in DIRS:
        shutil.copytree(ROOT / name, DOCS / name)

    # Drop private-looking extras; keep demo sample + templates
    for p in (DOCS / "document").glob("*.md"):
        if p.name != "示例学习计划.md":
            p.unlink()

    readme = DOCS / "README.md"
    readme.write_text(
        "# 青叶笺 · GitHub Pages Demo\n\n"
        "本目录由 `python packaging/sync_pages_demo.py` 生成。\n"
        "在仓库 Settings → Pages 中选择 Deploy from branch，文件夹选 `/docs`。\n",
        encoding="utf-8",
    )

    # Ensure skins manifest exists in docs copy
    manifest = DOCS / "skins" / "manifest.json"
    if not manifest.is_file():
        raise SystemExit("skins/manifest.json missing")

    print(f"Synced Pages demo → {DOCS}")
    print(json.dumps({"files": sorted(p.name for p in DOCS.iterdir())}, ensure_ascii=False))


if __name__ == "__main__":
    main()
