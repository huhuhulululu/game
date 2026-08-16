#!/usr/bin/env python3
"""Forge and stall dusk sits. Does not touch the cover. Magenta-key props, real a=0."""

from __future__ import annotations

import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
COVER = ART / "cover-valley.png"

# Right-hand cabin planks only. Do not stretch the door or lantern into a picture.
SAFE = (280, 300, 420, 420)


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


def grain(one: object, size: tuple[int, int], horizontal: bool = True) -> Image.Image:
    chip_w, chip_h = (96, 32) if horizontal else (32, 96)
    chip = one.wood_plank((chip_w, chip_h), SAFE, horizontal=horizontal)
    out = Image.new("RGB", size)
    for y in range(0, size[1], chip_h):
        for x in range(0, size[0], chip_w):
            out.paste(chip, (x, y))
    return out


def plank_box(one: object, size: tuple[int, int], horizontal: bool = True) -> Image.Image:
    p = grain(one, size, horizontal=horizontal).convert("RGBA")
    pa = np.asarray(p, dtype=np.float32)
    fall = one.rect_falloff(size, 6.0)
    pa[:, :, 3] = np.clip(fall * 255.0, 0, 255)
    return Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")


def paint_smith(one: object) -> Image.Image:
    """Quiet dusk work stone. Not a Don't Starve anvil silhouette."""
    W, H = 240, 200
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.alpha_composite(one._stone((W, H), 118, 168, 70, 28, 0.92, 61))
    im.alpha_composite(one._stone((W, H), 78, 172, 36, 18, 1.00, 63))
    im.alpha_composite(one._stone((W, H), 160, 170, 34, 16, 0.96, 65))
    stump = plank_box(one, (72, 70), False)
    sa = np.asarray(stump, dtype=np.float32)
    sa[:, :, :3] *= np.array([1.06, 0.92, 0.70], dtype=np.float32)
    stump = Image.fromarray(np.clip(sa, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(stump, (84, 88))
    slab = plank_box(one, (96, 28), True)
    ba = np.asarray(slab, dtype=np.float32)
    ba[:, :, :3] *= np.array([0.62, 0.52, 0.42], dtype=np.float32)
    ba[:, :, :3] += np.array([18.0, 10.0, 4.0], dtype=np.float32)
    slab = Image.fromarray(np.clip(ba, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(slab, (72, 78))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse((96, 70, 144, 96), fill=(252, 176, 72, 70))
    glow.putalpha(glow.getchannel("A").filter(ImageFilter.GaussianBlur(5)))
    im.alpha_composite(glow)
    return im


def paint_booth(one: object) -> Image.Image:
    """Quiet timber booth. One ochre cloth, not a market pack."""
    W, H = 280, 300
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    post = plank_box(one, (22, 200), False)
    im.alpha_composite(post, (52, 56))
    im.alpha_composite(post, (206, 56))
    beam = plank_box(one, (190, 20), True)
    im.alpha_composite(beam, (46, 52))
    cloth = one.paper_sheet((176, 56), ochre=True).convert("RGBA")
    ca = np.asarray(cloth, dtype=np.float32)
    yy = np.linspace(0, 1, 56, dtype=np.float32)[:, None]
    scallop = 0.88 + 0.12 * np.sin(np.linspace(0, 5 * np.pi, 176, dtype=np.float32))[None, :]
    ca[:, :, 3] = np.clip((1.0 - yy * 0.10) * scallop * 255.0, 0, 255)
    cloth = Image.fromarray(np.clip(ca, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(cloth, (52, 68))
    back = plank_box(one, (150, 90), False)
    im.alpha_composite(back, (66, 118))
    counter = plank_box(one, (188, 28), True)
    im.alpha_composite(counter, (46, 214))
    jar = one.paper_sheet((26, 32), ochre=True).convert("RGBA")
    jar.putalpha(one.round_mask((26, 32), 8, 1.0))
    im.alpha_composite(jar, (88, 186))
    im.alpha_composite(jar, (128, 188))
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
    save_prop(paint_smith(one), "prop-smith.png", 0.14)
    save_prop(paint_booth(one), "prop-booth.png", 0.16)
    print("forge look painted")


if __name__ == "__main__":
    main()
