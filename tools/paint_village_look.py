#!/usr/bin/env python3
"""Village / wild dusk sits. Does not touch the cover. Magenta-key props, real a=0."""

from __future__ import annotations

import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
COVER = ART / "cover-valley.png"
BED = ART / "bed-valley.png"


def _one() -> object:
    spec = importlib.util.spec_from_file_location("paint_one_language", ROOT / "tools" / "paint_one_language.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def key_magenta(im: Image.Image) -> Image.Image:
    """Magenta and near-clear become a=0 with RGB 0. Despill pink edges."""
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


def post(one: object, w: int, h: int) -> Image.Image:
    p = one.wood_plank((w, h), horizontal=False).convert("RGBA")
    pa = np.asarray(p, dtype=np.float32)
    xx = np.linspace(-1, 1, w, dtype=np.float32)
    pa[:, :, 3] = np.clip((1.0 - np.abs(xx) ** 2.2)[None, :] * 255.0, 0, 255)
    return Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")


def paint_sprout(one: object) -> Image.Image:
    W, H = 150, 130
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    stem = post(one, 8, 54)
    im.alpha_composite(stem, (62, 58))
    im.alpha_composite(stem.rotate(10, expand=True, resample=Image.Resampling.BICUBIC), (78, 64))
    tree = one.kill_black(Image.open(ART / "prop-tree.png"))
    im.alpha_composite(one.clump(tree, (100, 50, 220, 150), (54, 40), 4), (36, 28))
    im.alpha_composite(one.clump(tree, (320, 70, 440, 170), (46, 34), 4), (72, 36))
    earth = one.wood_plank((48, 14), (80, 300, 240, 350), horizontal=True).convert("RGBA")
    earth.putalpha(one.ellipse_mask((48, 14), cy=0.55, ry=0.38, blur=2))
    im.alpha_composite(earth, (50, 108))
    return one.lift_canopy(im)


def paint_ripe(one: object) -> Image.Image:
    W, H = 176, 156
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    stem = post(one, 9, 64)
    im.alpha_composite(stem, (72, 62))
    im.alpha_composite(stem.rotate(-8, expand=True, resample=Image.Resampling.BICUBIC), (52, 70))
    im.alpha_composite(stem.rotate(12, expand=True, resample=Image.Resampling.BICUBIC), (92, 68))
    tree = one.kill_black(Image.open(ART / "prop-tree.png"))
    im.alpha_composite(one.clump(tree, (70, 30, 240, 180), (78, 56), 5), (22, 18))
    im.alpha_composite(one.clump(tree, (220, 20, 400, 160), (70, 50), 4), (70, 30))
    fruit = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(fruit)
    for cx, cy, r in ((70, 72, 6), (108, 84, 5), (88, 98, 5)):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(168, 74, 40, 235))
    fruit.putalpha(fruit.getchannel("A").filter(ImageFilter.GaussianBlur(0.8)))
    im.alpha_composite(fruit)
    earth = one.wood_plank((58, 15), (80, 300, 240, 350), horizontal=True).convert("RGBA")
    earth.putalpha(one.ellipse_mask((58, 15), cy=0.55, ry=0.38, blur=2))
    im.alpha_composite(earth, (58, 132))
    return one.lift_canopy(im)


def paint_fortune(one: object) -> Image.Image:
    W, H = 260, 300
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p = post(one, 20, 210)
    im.alpha_composite(p, (52, 62))
    im.alpha_composite(p, (186, 62))
    roof = one.wood_plank((188, 24), horizontal=True).convert("RGBA")
    im.alpha_composite(roof, (36, 56))
    slat = one.wood_plank((176, 14), horizontal=True).convert("RGBA")
    im.alpha_composite(slat, (42, 78))
    paper = one.paper_sheet((68, 90), ochre=True).convert("RGBA")
    paper.putalpha(one.round_mask((68, 90), 6, 1.0))
    im.alpha_composite(paper, (96, 108))
    slip = one.paper_sheet((32, 64)).convert("RGBA")
    slip.putalpha(one.round_mask((32, 64), 4, 0.8))
    im.alpha_composite(slip, (174, 122))
    return im


def paint_dawn(one: object) -> Image.Image:
    # Same timber/paper language as the existing board, new file so the valley can sit it.
    return one.paint_board().resize((240, 280), Image.Resampling.LANCZOS)


def _soft_paste(dst: np.ndarray, src: Image.Image, xy: tuple[int, int], mask: np.ndarray) -> None:
    piece = np.asarray(src.convert("RGB"), dtype=np.float32)
    x, y = xy
    h, w = mask.shape
    roi = dst[y : y + h, x : x + w]
    m = mask[: roi.shape[0], : roi.shape[1], None]
    src_p = piece[: roi.shape[0], : roi.shape[1]]
    dst[y : y + h, x : x + w] = roi * (1.0 - m) + src_p * m


def paint_wild_bed() -> Image.Image:
    """One opaque dusk wilderness plate. Reads valley bed + cover; writes neither."""
    if not COVER.exists():
        raise SystemExit("cover-valley.png missing; read-only lock")
    bed = Image.open(BED).convert("RGB")
    w, h = 864, 576
    meadow = bed.crop((340, 200, 900, 560)).resize((w, h), Image.Resampling.LANCZOS)
    arr = np.asarray(meadow, dtype=np.float32)
    trees = bed.crop((0, 0, 360, 220)).resize((320, 220), Image.Resampling.LANCZOS)
    far = bed.crop((400, 0, 900, 180)).resize((w, 200), Image.Resampling.LANCZOS)
    path = bed.crop((420, 240, 780, 520)).resize((160, 420), Image.Resampling.LANCZOS)
    water = bed.crop((180, 400, 620, 580)).resize((w, 140), Image.Resampling.LANCZOS)
    yy = np.linspace(0, 1, 200, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    ridge = np.clip(1.0 - yy / 0.85, 0, 1) * (0.55 + 0.45 * np.exp(-((xx - 0.5) ** 2) / 0.40))
    _soft_paste(arr, far, (0, 0), ridge)
    th, tw = 220, 320
    ty = np.linspace(0, 1, th, dtype=np.float32)[:, None]
    tx = np.linspace(0, 1, tw, dtype=np.float32)[None, :]
    left = (1.0 - tx) * (1.0 - 0.25 * ty)
    right = tx * (1.0 - 0.25 * ty)
    _soft_paste(arr, trees, (0, 40), left * 0.85)
    _soft_paste(arr, trees.transpose(Image.FLIP_LEFT_RIGHT), (w - tw, 50), right * 0.80)
    ph, pw = 420, 160
    py = np.linspace(0, 1, ph, dtype=np.float32)[:, None]
    px = np.linspace(-1, 1, pw, dtype=np.float32)[None, :]
    pmask = np.clip(1.0 - np.abs(px) ** 1.6, 0, 1) * np.clip(1.0 - (py - 0.82) / 0.18, 0, 1)
    _soft_paste(arr, path, ((w - pw) // 2, 120), pmask * 0.70)
    wh, ww = 140, w
    wy = np.linspace(0, 1, wh, dtype=np.float32)[:, None]
    wx = np.linspace(0, 1, ww, dtype=np.float32)[None, :]
    wmask = np.clip(wy / 0.55, 0, 1) * (0.40 + 0.60 * (1.0 - np.exp(-((wx - 0.50) ** 2) / 0.22)))
    _soft_paste(arr, water, (0, h - wh), wmask * 0.75)
    west = np.linspace(1.06, 0.88, w, dtype=np.float32)[None, :, None]
    arr = np.clip(arr * west * np.array([1.03, 0.96, 0.80], dtype=np.float32), 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGB")


def save_prop(im: Image.Image, name: str, fade: float) -> None:
    one = _one()
    out = key_magenta(one.finish(im, fade))
    out = key_magenta(out)
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
    save_prop(paint_sprout(one), "prop-sprout.png", 0.20)
    save_prop(paint_ripe(one), "prop-ripe.png", 0.18)
    save_prop(paint_fortune(one), "prop-fortune.png", 0.16)
    save_prop(paint_dawn(one), "prop-dawn.png", 0.16)
    save_bed(paint_wild_bed(), "bed-wild.png")
    print("village look painted")


if __name__ == "__main__":
    main()
