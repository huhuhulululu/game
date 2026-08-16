#!/usr/bin/env python3
"""Wild dusk well. Does not touch the cover. Magenta-key prop, real a=0."""

from __future__ import annotations

import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
COVER = ART / "cover-valley.png"


def _one() -> object:
    spec = importlib.util.spec_from_file_location("paint_one_language", ROOT / "tools" / "paint_one_language.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def key_magenta(im: Image.Image) -> Image.Image:
    arr = np.asarray(im.convert("RGBA"), dtype=np.float32)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    mag = (r > 150) & (b > 150) & (g < 120) & ((r + b) > (2.05 * g + 30))
    arr[mag | (a < 12)] = 0.0
    extra = np.clip(np.minimum(arr[:, :, 0], arr[:, :, 2]) - arr[:, :, 1] - 16.0, 0, None)
    arr[:, :, 0] = np.clip(arr[:, :, 0] - extra, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] - extra, 0, 255)
    arr[arr[:, :, 3] < 12] = 0.0
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def assert_clean(im: Image.Image, name: str) -> None:
    arr = np.asarray(im.convert("RGBA"), dtype=np.uint8)
    leftover = np.any(arr[:, :, :3] > 0, axis=2) & (arr[:, :, 3] == 0)
    if leftover.any():
        raise SystemExit(f"{name} has dusk RGB in a=0 pixels")
    mag = (arr[:, :, 0] > 200) & (arr[:, :, 1] < 80) & (arr[:, :, 2] > 200) & (arr[:, :, 3] > 0)
    if mag.any():
        raise SystemExit(f"{name} still has magenta sit pixels {int(mag.sum())}")
    if (arr[:, :, 3] == 0).sum() < 80:
        raise SystemExit(f"{name} needs real a=0 (magenta-key miss)")


def soft_alpha(im: Image.Image, one: object, fade: float) -> Image.Image:
    out = key_magenta(one.finish(im, fade))
    return key_magenta(out)


SAFE = (280, 300, 420, 420)


def plank_box(one: object, size: tuple[int, int], horizontal: bool = True) -> Image.Image:
    chip_w, chip_h = (96, 32) if horizontal else (32, 96)
    chip = one.wood_plank((chip_w, chip_h), SAFE, horizontal=horizontal)
    out = Image.new("RGB", size)
    for y in range(0, size[1], chip_h):
        for x in range(0, size[0], chip_w):
            out.paste(chip, (x, y))
    p = out.convert("RGBA")
    pa = np.asarray(p, dtype=np.float32)
    fall = one.rect_falloff(size, 8.0)
    pa[:, :, 3] = np.clip(fall * 255.0, 0, 255)
    return Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")


def paint_earth_mouth(one: object) -> Image.Image:
    W, H = 220, 160
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bank = one._stone((W, H), 110, 96, 96, 46, 0.92, 13)
    im.alpha_composite(bank)
    im.alpha_composite(one._stone((W, H), 64, 108, 42, 24, 0.98, 17))
    im.alpha_composite(one._stone((W, H), 158, 110, 40, 22, 0.96, 19))
    bowl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(bowl)
    d.ellipse((52, 62, 168, 128), fill=(108, 68, 40, 220))
    d.ellipse((70, 74, 150, 118), fill=(86, 52, 32, 210))
    bowl.putalpha(bowl.getchannel("A").filter(ImageFilter.GaussianBlur(3)))
    im.alpha_composite(bowl)
    rim = plank_box(one, (132, 22), True)
    ra = np.asarray(rim, dtype=np.float32)
    ra[:, :, :3] = ra[:, :, :3] * np.array([0.62, 0.46, 0.30]) + np.array([20.0, 10.0, 4.0])
    rim = Image.fromarray(np.clip(ra, 0, 255).astype(np.uint8), "RGBA")
    rim.putalpha(one.ellipse_mask((132, 22), ry=0.48, blur=1.4))
    im.alpha_composite(rim, (44, 68))
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    sd.ellipse((78, 80, 142, 112), fill=(64, 40, 24, 90))
    shade.putalpha(shade.getchannel("A").filter(ImageFilter.GaussianBlur(4)))
    im.alpha_composite(shade)
    return im


def save_prop(im: Image.Image, name: str, fade: float) -> None:
    one = _one()
    out = soft_alpha(im, one, fade)
    assert_clean(out, name)
    dest = ART / name
    out.save(dest, "PNG")
    print(f"wrote {dest.name} {out.size} {out.mode}")


def main() -> None:
    if not COVER.exists():
        raise SystemExit("cover-valley.png missing; read-only lock")
    one = _one()
    save_prop(paint_earth_mouth(one), "prop-hole.png", 0.16)


if __name__ == "__main__":
    main()
