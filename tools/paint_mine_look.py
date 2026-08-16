#!/usr/bin/env python3
"""Mine dusk bed and veins. Does not touch the cover. Magenta-key props, real a=0."""

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


def stone_tile(size: tuple[int, int]) -> Image.Image:
    src = Image.open(ART / "tex-stone.png").convert("RGB")
    out = Image.new("RGB", size)
    sw, sh = src.size
    for y in range(0, size[1], sh):
        for x in range(0, size[0], sw):
            out.paste(src, (x, y))
    return out


def paint_mine_bed(one: object) -> Image.Image:
    """One painted mine. Delegates to one-paint. Does not write the cover."""
    spec = importlib.util.spec_from_file_location("paint_one_paint", ROOT / "tools" / "paint_one_paint.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.paint_mine_bed()


def paint_vein(one: object) -> Image.Image:
    W, H = 220, 180
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.alpha_composite(one._stone((W, H), 118, 108, 78, 48, 1.02, 21))
    im.alpha_composite(one._stone((W, H), 72, 128, 46, 28, 1.10, 23))
    im.alpha_composite(one._stone((W, H), 160, 122, 40, 26, 1.06, 25))
    im.alpha_composite(one._stone((W, H), 108, 136, 28, 16, 1.14, 27))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse((102, 96, 128, 116), fill=(252, 186, 86, 90))
    glow.putalpha(glow.getchannel("A").filter(ImageFilter.GaussianBlur(3)))
    im.alpha_composite(glow)
    return im


def paint_steps(one: object) -> Image.Image:
    W, H = 220, 240
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hole = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hole)
    hd.ellipse((70, 78, 150, 188), fill=(28, 16, 8, 210))
    hole.putalpha(hole.getchannel("A").filter(ImageFilter.GaussianBlur(3)))
    im.alpha_composite(hole)
    im.alpha_composite(one._stone((W, H), 70, 208, 38, 16, 0.88, 31))
    im.alpha_composite(one._stone((W, H), 152, 210, 36, 14, 0.90, 33))
    post = plank_box(one, (22, 150), False)
    im.alpha_composite(post, (48, 48))
    im.alpha_composite(post, (150, 48))
    beam = plank_box(one, (140, 20), True)
    im.alpha_composite(beam, (40, 44))
    for i, y in enumerate((86, 108, 130, 152)):
        step = plank_box(one, (104 - i * 10, 18), True)
        sa = np.asarray(step, dtype=np.float32)
        sa[:, :, :3] *= (1.02 - 0.10 * i) * np.array([1.08, 0.94, 0.74], dtype=np.float32)
        sa[:, :, 3] = np.clip(sa[:, :, 3] * 1.15, 0, 255)
        step = Image.fromarray(np.clip(sa, 0, 255).astype(np.uint8), "RGBA")
        im.alpha_composite(step, (58 + i * 5, y))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse((88, 70, 132, 100), fill=(252, 186, 86, 70))
    glow.putalpha(glow.getchannel("A").filter(ImageFilter.GaussianBlur(5)))
    im.alpha_composite(glow)
    return im


def paint_cache(one: object) -> Image.Image:
    W, H = 180, 160
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.alpha_composite(one._stone((W, H), 52, 132, 28, 12, 0.74, 41))
    im.alpha_composite(one._stone((W, H), 128, 134, 26, 12, 0.76, 43))
    box = plank_box(one, (108, 62), True)
    ba = np.asarray(box, dtype=np.float32)
    ba[:, :, :3] *= np.array([1.08, 0.96, 0.78], dtype=np.float32)
    box = Image.fromarray(np.clip(ba, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(box, (36, 70))
    lid = plank_box(one, (116, 20), True)
    im.alpha_composite(lid, (32, 58))
    paper = one.paper_sheet((28, 20), ochre=True).convert("RGBA")
    paper.putalpha(one.round_mask((28, 20), 4, 0.8))
    im.alpha_composite(paper, (76, 84))
    return im


def paint_mouth(one: object) -> Image.Image:
    W, H = 220, 260
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.alpha_composite(one._stone((W, H), 60, 230, 40, 16, 0.70, 51))
    im.alpha_composite(one._stone((W, H), 160, 232, 38, 14, 0.72, 53))
    post = plank_box(one, (24, 190), False)
    pa = np.asarray(post, dtype=np.float32)
    pa[:, :, :3] *= np.array([0.92, 0.86, 0.72], dtype=np.float32)
    post = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(post, (48, 40))
    im.alpha_composite(post, (148, 40))
    beam = plank_box(one, (140, 22), True)
    im.alpha_composite(beam, (40, 36))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse((78, 90, 142, 190), fill=(252, 186, 86, 100))
    glow.putalpha(glow.getchannel("A").filter(ImageFilter.GaussianBlur(8)))
    im.alpha_composite(glow)
    return im


def save_prop(im: Image.Image, name: str, fade: float) -> None:
    one = _one()
    out = soft_alpha(im, one, fade)
    assert_clean(out, name)
    dest = ART / name
    out.save(dest, "PNG")
    print(f"wrote {dest.name} {out.size} {out.mode}")


def save_bed(im: Image.Image, name: str) -> None:
    dest = ART / name
    rgb = im.convert("RGB")
    rgb.save(dest, "PNG")
    print(f"wrote {dest.name} {rgb.size} RGB")


def main() -> None:
    if not COVER.exists():
        raise SystemExit("cover-valley.png missing; read-only lock")
    one = _one()
    save_bed(paint_mine_bed(one), "bed-mine.png")
    save_prop(paint_vein(one), "prop-vein.png", 0.14)
    save_prop(paint_steps(one), "prop-steps.png", 0.16)
    save_prop(paint_cache(one), "prop-cache.png", 0.14)
    save_prop(paint_mouth(one), "prop-mouth.png", 0.16)
    print("mine look painted")


if __name__ == "__main__":
    main()
