#!/usr/bin/env python3
"""Wild lantern-stick. Does not touch the cover. Magenta-key prop, real a=0."""

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


def paint_lamp_stick(one: object) -> Image.Image:
    W, H = 140, 240
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    post = plank_box(one, (18, 168), False)
    pa = np.asarray(post, dtype=np.float32)
    xx = np.linspace(-1, 1, 18, dtype=np.float32)
    pa[:, :, 3] = np.clip((1.0 - np.abs(xx) ** 1.8)[None, :] * 255.0, 0, 255)
    pa[:, :, :3] = pa[:, :, :3] * np.array([0.90, 0.74, 0.52]) + np.array([18.0, 8.0, 0.0])
    post = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(post, (61, 58))
    paper = one.paper_sheet((68, 76), ochre=True).convert("RGBA")
    sa = np.asarray(paper, dtype=np.float32)
    sa[:, :, :3] = sa[:, :, :3] * np.array([1.12, 0.76, 0.40]) + np.array([30.0, 10.0, 0.0])
    paper = Image.fromarray(np.clip(sa, 0, 255).astype(np.uint8), "RGBA")
    paper.putalpha(one.ellipse_mask((68, 76), ry=0.70, blur=1.8).point(lambda v: min(255, int(v * 1.18))))
    im.alpha_composite(paper, (36, 20))
    rim = plank_box(one, (72, 14), True)
    ra = np.asarray(rim, dtype=np.float32)
    ra[:, :, :3] = ra[:, :, :3] * np.array([0.58, 0.44, 0.30]) + np.array([22.0, 12.0, 4.0])
    rim = Image.fromarray(np.clip(ra, 0, 255).astype(np.uint8), "RGBA")
    rim.putalpha(one.ellipse_mask((72, 14), ry=0.52, blur=1.2))
    im.alpha_composite(rim, (34, 18))
    im.alpha_composite(rim, (34, 86))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse((46, 28, 94, 82), fill=(255, 214, 118, 150))
    d.ellipse((54, 36, 86, 72), fill=(255, 236, 176, 190))
    glow.putalpha(glow.getchannel("A").filter(ImageFilter.GaussianBlur(5)))
    im.alpha_composite(glow)
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
    save_prop(paint_lamp_stick(one), "prop-torch.png", 0.14)


if __name__ == "__main__":
    main()
