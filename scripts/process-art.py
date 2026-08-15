#!/usr/bin/env python3
"""Key magenta, crop empty padding, and shrink sheets for phones."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "art"
MAX_SPRITE = 384
MAX_TEX = 512


def is_magenta(r: int, g: int, b: int) -> bool:
    return r > 160 and b > 150 and g < 130 and (r + b) > g * 2.2 and abs(r - b) < 90


def key_and_crop(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    pix = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                continue
            if is_magenta(r, g, b):
                pix[x, y] = (0, 0, 0, 0)
                continue
            # Soft fringe: knock down leftover pink glow around the ink.
            if r > 140 and b > 130 and g < 150 and abs(r - b) < 50 and r + b > g * 1.8:
                pix[x, y] = (r, g, b, 0)
    bbox = im.getbbox()
    if bbox:
        pad = 4
        x0, y0, x1, y1 = bbox
        im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))
    return im


def shrink(im: Image.Image, max_size: int) -> Image.Image:
    if max(im.size) <= max_size:
        return im
    im = im.copy()
    im.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    return im


def process(path: Path) -> None:
    name = path.name
    im = Image.open(path)
    before = path.stat().st_size
    if name.startswith("tex-"):
        im = im.convert("RGB")
        out = shrink(im, MAX_TEX)
        out.save(path, "PNG", optimize=True)
    else:
        out = shrink(key_and_crop(im), MAX_SPRITE)
        out.save(path, "PNG", optimize=True)
    after = path.stat().st_size
    print(f"{name:22} {im.size} -> {out.size}  {before//1024}k -> {after//1024}k")


def main() -> None:
    for path in sorted(ROOT.glob("*.png")):
        process(path)


if __name__ == "__main__":
    main()
