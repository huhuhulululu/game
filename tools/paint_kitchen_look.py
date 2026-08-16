#!/usr/bin/env python3
"""Kitchen dusk bed and stations. Does not touch the cover. Magenta-key props, real a=0."""

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


# Right-hand cabin planks only. Do not stretch the door or lantern into a picture.
SAFE = (280, 300, 420, 420)


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


def paint_kitchen_bed(one: object) -> Image.Image:
    """One painted kitchen. Delegates to one-paint. Does not write the cover."""
    spec = importlib.util.spec_from_file_location("paint_one_paint", ROOT / "tools" / "paint_one_paint.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.paint_kitchen_bed()


def paint_chop(one: object) -> Image.Image:
    W, H = 220, 180
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    board = plank_box(one, (168, 88), True)
    im.alpha_composite(board, (26, 62))
    blade = Image.new("RGBA", (90, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(blade)
    d.ellipse((0, 2, 88, 14), fill=(168, 150, 120, 230))
    blade.putalpha(blade.getchannel("A").filter(ImageFilter.GaussianBlur(0.8)))
    im.alpha_composite(blade.rotate(-18, expand=True, resample=Image.Resampling.BICUBIC), (48, 78))
    return im


def paint_hearth(one: object) -> Image.Image:
    W, H = 260, 260
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.alpha_composite(one._stone((W, H), 110, 210, 46, 18, 0.68, 4))
    im.alpha_composite(one._stone((W, H), 160, 212, 40, 16, 0.72, 6))
    im.alpha_composite(one._stone((W, H), 80, 214, 34, 14, 0.70, 8))
    pot = Image.new("RGBA", (140, 100), (0, 0, 0, 0))
    d = ImageDraw.Draw(pot)
    d.ellipse((8, 18, 132, 92), fill=(72, 48, 32, 240))
    d.ellipse((28, 28, 112, 78), fill=(96, 64, 42, 230))
    pot.putalpha(pot.getchannel("A").filter(ImageFilter.GaussianBlur(1.4)))
    im.alpha_composite(pot, (60, 88))
    lid = plank_box(one, (96, 20), True)
    im.alpha_composite(lid, (82, 86))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse((100, 168, 160, 208), fill=(252, 176, 72, 100))
    glow.putalpha(glow.getchannel("A").filter(ImageFilter.GaussianBlur(7)))
    im.alpha_composite(glow)
    return im


def paint_oven(one: object) -> Image.Image:
    W, H = 220, 240
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    body = plank_box(one, (140, 150), False)
    ba = np.asarray(body, dtype=np.float32)
    ba[:, :, :3] *= np.array([1.12, 0.78, 0.58], dtype=np.float32)
    body = Image.fromarray(np.clip(ba, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(body, (40, 52))
    top = plank_box(one, (148, 22), True)
    im.alpha_composite(top, (36, 48))
    door = Image.new("RGBA", (70, 70), (0, 0, 0, 0))
    d = ImageDraw.Draw(door)
    d.ellipse((6, 8, 64, 64), fill=(252, 168, 70, 200))
    d.ellipse((20, 22, 50, 50), fill=(255, 220, 140, 220))
    door.putalpha(door.getchannel("A").filter(ImageFilter.GaussianBlur(2)))
    im.alpha_composite(door, (74, 96))
    return im


def paint_serve(one: object) -> Image.Image:
    W, H = 240, 240
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    post = plank_box(one, (22, 160), False)
    im.alpha_composite(post, (48, 50))
    im.alpha_composite(post, (170, 50))
    beam = plank_box(one, (160, 20), True)
    im.alpha_composite(beam, (40, 48))
    counter = plank_box(one, (170, 28), True)
    im.alpha_composite(counter, (36, 168))
    paper = one.paper_sheet((88, 36), ochre=True).convert("RGBA")
    paper.putalpha(one.round_mask((88, 36), 6, 1.0))
    im.alpha_composite(paper, (76, 150))
    return im


def paint_cool(one: object) -> Image.Image:
    W, H = 200, 240
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    body = plank_box(one, (120, 170), False)
    im.alpha_composite(body, (40, 40))
    panel = one.paper_sheet((78, 96)).convert("RGBA")
    pa = np.asarray(panel, dtype=np.float32)
    pa[:, :, :3] = pa[:, :, :3] * np.array([0.86, 0.92, 1.02]) + np.array([8.0, 12.0, 18.0])
    panel = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")
    panel.putalpha(one.round_mask((78, 96), 8, 1.2))
    im.alpha_composite(panel, (60, 68))
    return im


def paint_bin(one: object) -> Image.Image:
    W, H = 160, 160
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    box = plank_box(one, (88, 70), True)
    im.alpha_composite(box, (36, 62))
    rim = plank_box(one, (96, 16), True)
    im.alpha_composite(rim, (32, 54))
    return im


def paint_shelf(one: object) -> Image.Image:
    W, H = 200, 240
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    back = plank_box(one, (130, 170), False)
    im.alpha_composite(back, (34, 36))
    for y in (70, 128):
        slat = plank_box(one, (120, 14), True)
        im.alpha_composite(slat, (40, y))
    jar = one.paper_sheet((28, 36), ochre=True).convert("RGBA")
    jar.putalpha(one.round_mask((28, 36), 8, 1.0))
    im.alpha_composite(jar, (56, 86))
    im.alpha_composite(jar, (96, 86))
    im.alpha_composite(jar, (76, 144))
    return im


def paint_way(one: object) -> Image.Image:
    W, H = 220, 260
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    post = plank_box(one, (24, 190), False)
    im.alpha_composite(post, (48, 40))
    im.alpha_composite(post, (148, 40))
    beam = plank_box(one, (140, 22), True)
    im.alpha_composite(beam, (40, 36))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse((78, 90, 142, 190), fill=(252, 186, 86, 120))
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
    save_bed(paint_kitchen_bed(one), "bed-kitchen.png")
    save_prop(paint_chop(one), "prop-chop.png", 0.14)
    save_prop(paint_hearth(one), "prop-hearth.png", 0.16)
    save_prop(paint_oven(one), "prop-oven.png", 0.16)
    save_prop(paint_serve(one), "prop-serve.png", 0.16)
    save_prop(paint_cool(one), "prop-cool.png", 0.14)
    save_prop(paint_bin(one), "prop-bin.png", 0.14)
    save_prop(paint_shelf(one), "prop-shelf.png", 0.16)
    save_prop(paint_way(one), "prop-way.png", 0.16)
    print("kitchen look painted")


if __name__ == "__main__":
    main()
