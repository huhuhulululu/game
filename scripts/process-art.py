#!/usr/bin/env python3
"""Key magenta, feather edges, and shrink sheets. Prefer soft HD over tiny pixel stamps."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "public" / "art"
MAX_SPRITE = 640
MAX_TEX = 768


def _numpy_key(im: Image.Image) -> Image.Image:
    import numpy as np

    arr = np.array(im.convert("RGBA"), dtype=np.uint8)
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)
    a = arr[:, :, 3].astype(np.int16)
    mag = (r + b) * 0.5
    # How much this pixel is background magenta vs painted ink.
    strength = np.clip((mag - g - 24) / 88.0, 0.0, 1.0)
    likely = (mag > 132) & (g < 168) & (r > g + 16) & (b > g + 8)
    hard = (r > 198) & (b > 176) & (g < 92)
    strength = np.where(likely, strength, 0.0)
    strength = np.where(hard, 1.0, strength)
    na = (a * (1.0 - strength)).astype(np.uint8)
    na = np.where(strength > 0.9, 0, na)
    arr[:, :, 3] = na
    return Image.fromarray(arr, "RGBA")


def _pil_key(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    pix = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                continue
            mag = (r + b) * 0.5
            if mag > 132 and g < 168 and r > g + 16 and b > g + 8:
                strength = min(1.0, max(0.0, (mag - g - 24) / 88.0))
                if r > 198 and b > 176 and g < 92:
                    strength = 1.0
                if strength > 0.9:
                    pix[x, y] = (0, 0, 0, 0)
                else:
                    pix[x, y] = (r, g, b, int(a * (1.0 - strength)))
    return im


def key_magenta(im: Image.Image) -> Image.Image:
    try:
        return _numpy_key(im)
    except Exception:
        return _pil_key(im)


def feather_alpha(im: Image.Image) -> Image.Image:
    r, g, b, a = im.split()
    soft = a.filter(ImageFilter.GaussianBlur(radius=1.15))
    mixed = Image.blend(a, soft, 0.58)
    keep = a.point(lambda p: 255 if p > 10 else 0)
    mixed = ImageChops.multiply(mixed, keep)
    return Image.merge("RGBA", (r, g, b, mixed))


def crop_sprite(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    pad = 6
    x0, y0, x1, y1 = bbox
    w, h = im.size
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))


def shrink(im: Image.Image, max_size: int) -> Image.Image:
    if max(im.size) <= max_size:
        return im
    out = im.copy()
    out.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    return out


def square_tex(im: Image.Image) -> Image.Image:
    w, h = im.size
    side = min(w, h)
    x = (w - side) // 2
    y = (h - side) // 2
    return im.crop((x, y, x + side, y + side))


def soften_tex(im: Image.Image) -> Image.Image:
    """Keep the painting, knock off only the hardest generation grain."""
    return im.convert("RGB").filter(ImageFilter.GaussianBlur(radius=0.28))


def process(path: Path) -> None:
    name = path.name
    im = Image.open(path)
    before = path.stat().st_size
    src = im.size
    if name.startswith("tex-"):
        out = shrink(soften_tex(square_tex(im.convert("RGB"))), MAX_TEX)
        out.save(path, "PNG", optimize=True)
    else:
        # Shrink a little first so chroma-key is not a multi-second pixel walk.
        work = shrink(im, max(MAX_SPRITE * 2, 960))
        out = shrink(crop_sprite(feather_alpha(key_magenta(work))), MAX_SPRITE)
        out.save(path, "PNG", optimize=True)
    after = path.stat().st_size
    print(f"{name:28} {src} -> {out.size}  {before // 1024}k -> {after // 1024}k")


def main() -> None:
    for path in sorted(ROOT.glob("*.png")):
        process(path)


if __name__ == "__main__":
    main()
