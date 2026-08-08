"""Generate a soft leaf-notebook app icon (ICO + PNG)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
OUT_ICO = ROOT / "qingye-jian.ico"
OUT_PNG = ROOT / "qingye-jian.png"


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = size / 256

    # Soft paper circle
    pad = int(10 * m)
    d.ellipse((pad, pad, size - pad, size - pad), fill=(248, 250, 247, 255))

    # Notebook body
    left, top = int(58 * m), int(48 * m)
    right, bottom = int(198 * m), int(210 * m)
    d.rounded_rectangle(
        (left, top, right, bottom),
        radius=int(22 * m),
        fill=(255, 255, 255, 255),
        outline=(127, 175, 160, 255),
        width=max(2, int(4 * m)),
    )

    # Margin line
    mx = int(88 * m)
    d.line((mx, int(70 * m), mx, int(190 * m)), fill=(231, 168, 178, 200), width=max(2, int(3 * m)))

    # Ruled lines
    for y in (90, 118, 146, 174):
        yy = int(y * m)
        d.line((int(100 * m), yy, int(178 * m), yy), fill=(127, 175, 160, 110), width=max(1, int(2 * m)))

    # Leaf accent
    leaf = [
        (int(168 * m), int(62 * m)),
        (int(210 * m), int(78 * m)),
        (int(196 * m), int(118 * m)),
        (int(156 * m), int(96 * m)),
    ]
    d.polygon(leaf, fill=(90, 143, 127, 255))
    d.line(
        (int(168 * m), int(62 * m), int(196 * m), int(118 * m)),
        fill=(248, 250, 247, 220),
        width=max(1, int(2 * m)),
    )
    return img


def main() -> None:
    base = draw_icon(256)
    base.save(OUT_PNG)
    icons = [draw_icon(s) for s in (16, 32, 48, 64, 128, 256)]
    icons[-1].save(OUT_ICO, format="ICO", sizes=[(im.width, im.height) for im in icons])
    print(f"Wrote {OUT_ICO}")
    print(f"Wrote {OUT_PNG}")


if __name__ == "__main__":
    main()
