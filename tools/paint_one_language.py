#!/usr/bin/env python3
"""One dusk language for valley props. Our timber and canopy. Does not touch the cover."""

from __future__ import annotations

import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"


def _look() -> object:
    spec = importlib.util.spec_from_file_location("paint_look", ROOT / "tools" / "paint_look.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def kill_black(im: Image.Image, thr: float = 16.0) -> Image.Image:
    arr = np.asarray(im.convert("RGBA"), dtype=np.float32)
    lum = arr[:, :, :3] @ np.array([0.3, 0.5, 0.2], dtype=np.float32)
    arr[:, :, 3] = np.where(lum < thr, 0.0, arr[:, :, 3])
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def west_light(arr: np.ndarray, lo: float = 1.10, hi: float = 0.80) -> np.ndarray:
    # Sun sits west / left. Do not add a second outline.
    _h, w = arr.shape[:2]
    t = np.linspace(lo, hi, w, dtype=np.float32)[None, :, None]
    warm = np.array([1.06, 0.93, 0.76], dtype=np.float32)
    arr[:, :, :3] = np.clip(arr[:, :, :3] * t * warm, 0, 255)
    return arr


def round_mask(size: tuple[int, int], radius: int, blur: float = 1.6) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((1, 1, size[0] - 2, size[1] - 2), radius, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(blur))


def rect_falloff(size: tuple[int, int], edge: float = 8.0) -> np.ndarray:
    w, h = size
    fx = np.clip(np.minimum(np.arange(w), w - 1 - np.arange(w)) / edge, 0, 1)
    fy = np.clip(np.minimum(np.arange(h), h - 1 - np.arange(h)) / edge, 0, 1)
    return (fx[None, :] * fy[:, None]).astype(np.float32)


def ellipse_mask(size: tuple[int, int], cx=0.50, cy=0.52, rx=0.46, ry=0.44, blur: float = 10.0) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse(
        (int((cx - rx) * w), int((cy - ry) * h), int((cx + rx) * w), int((cy + ry) * h)),
        fill=255,
    )
    return mask.filter(ImageFilter.GaussianBlur(blur))


def clump(src: Image.Image, box: tuple[int, int, int, int], size: tuple[int, int], blur: float = 12.0) -> Image.Image:
    piece = src.crop(box).resize(size, Image.Resampling.LANCZOS)
    a = ImageChops.multiply(piece.getchannel("A"), ellipse_mask(size, blur=blur))
    piece.putalpha(a)
    return piece


def wood_plank(size: tuple[int, int], box: tuple[int, int, int, int] = (40, 220, 320, 380), horizontal: bool = False) -> Image.Image:
    src = Image.open(ART / "prop-cabin.png").convert("RGB")
    crop = src.crop(box)
    if horizontal:
        crop = crop.rotate(90, expand=True)
    plank = crop.resize(size, Image.Resampling.LANCZOS)
    arr = np.asarray(plank, dtype=np.float32)
    mean = arr.reshape(-1, 3).mean(axis=0)
    arr = arr - mean + np.array([96.0, 64.0, 40.0], dtype=np.float32)
    arr = west_light(np.dstack([arr, np.full(arr.shape[:2], 255.0)]), 1.08, 0.84)
    return Image.fromarray(np.clip(arr[:, :, :3], 0, 255).astype(np.uint8), "RGB")


def paper_sheet(size: tuple[int, int], ochre: bool = False) -> Image.Image:
    src = Image.open(ART / "tex-paper.png").convert("RGB")
    sheet = Image.new("RGB", size)
    sw, sh = src.size
    for y in range(0, size[1], sh):
        for x in range(0, size[0], sw):
            sheet.paste(src, (x, y))
    arr = np.asarray(sheet, dtype=np.float32)
    if ochre:
        arr = arr * np.array([1.08, 0.86, 0.62]) + np.array([18.0, 8.0, 0.0])
    else:
        arr = arr * np.array([1.02, 0.99, 0.93]) + np.array([4.0, 3.0, 1.0])
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def paste_soft(dst: Image.Image, src: Image.Image, xy: tuple[int, int], radius: int = 6) -> None:
    if src.mode != "RGBA":
        src = src.convert("RGBA")
        src.putalpha(255)
    a = src.getchannel("A").filter(ImageFilter.GaussianBlur(1.2))
    src = src.copy()
    src.putalpha(a)
    dst.alpha_composite(src, xy)


def paint_bush() -> Image.Image:
    # Same canopy as the north ridge. One pen for tree and shrub.
    tree = kill_black(Image.open(ART / "prop-tree.png"))
    wide = kill_black(Image.open(ART / "prop-tree-wide.png"))
    canvas = Image.new("RGBA", (360, 300), (0, 0, 0, 0))
    paste_soft(canvas, clump(tree, (70, 18, 310, 230), (250, 210), 14), (8, 20))
    paste_soft(canvas, clump(wide, (200, 8, 430, 190), (220, 170), 12), (90, 55))
    paste_soft(canvas, clump(tree, (300, 36, 540, 240), (200, 170), 12), (140, 70))
    return canvas


def paint_tuft() -> Image.Image:
    tree = kill_black(Image.open(ART / "prop-tree.png"))
    canvas = Image.new("RGBA", (220, 200), (0, 0, 0, 0))
    paste_soft(canvas, clump(tree, (90, 40, 260, 200), (150, 130), 10), (8, 40))
    paste_soft(canvas, clump(tree, (340, 80, 500, 220), (120, 100), 9), (70, 62))
    # A little warm earth so the tuft sits, not a floating sticker.
    earth = wood_plank((90, 28), (80, 300, 260, 360), horizontal=True).convert("RGBA")
    earth.putalpha(ellipse_mask((90, 28), cy=0.55, ry=0.42, blur=5))
    canvas.alpha_composite(earth, (64, 158))
    return canvas


def _dirt_color() -> np.ndarray:
    floor = np.asarray(Image.open(ART / "floor-valley.png").convert("RGB"), dtype=np.float32)
    return floor[380:400, 600:660].reshape(-1, 3).mean(axis=0)


def _stone(canvas_size: tuple[int, int], cx: int, cy: int, rw: int, rh: int, dark: float, seed: int) -> Image.Image:
    w, h = canvas_size
    dirt = _dirt_color()
    rng = np.random.default_rng(seed)
    yy, xx = np.ogrid[:h, :w]
    d = ((xx - cx) / rw) ** 2 + ((yy - cy) / rh) ** 2
    m = np.clip(1.0 - d, 0, 1)
    m = np.where(m > 0, np.power(m, 0.65), 0.0)
    hx = np.clip(1.18 - 0.50 * ((xx - cx) / max(rw, 1) + 1.0) * 0.5, 0.68, 1.22)
    col = dirt * dark * np.array([1.22, 1.02, 0.82], dtype=np.float32) + np.array([18.0, 12.0, 6.0], dtype=np.float32)
    noise = rng.normal(0, 7.0, (h, w, 3))
    arr = np.zeros((h, w, 4), dtype=np.float32)
    arr[:, :, :3] = np.clip(col + noise, 0, 255) * hx[:, :, None]
    arr[:, :, 3] = m * 255.0
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def paint_rock() -> Image.Image:
    # Soft river stones. Same dirt as the path. No ink, no cropped landscape.
    canvas = Image.new("RGBA", (280, 210), (0, 0, 0, 0))
    canvas.alpha_composite(_stone((280, 210), 150, 108, 88, 50, 0.86, 3))
    canvas.alpha_composite(_stone((280, 210), 86, 132, 54, 34, 0.94, 5))
    canvas.alpha_composite(_stone((280, 210), 204, 140, 46, 30, 0.90, 7))
    return canvas


def paint_board() -> Image.Image:
    W, H = 360, 420
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    post = wood_plank((28, 360), horizontal=False).convert("RGBA")
    post.putalpha(ellipse_mask((28, 360), rx=0.62, ry=0.48, blur=2).point(lambda v: min(255, int(v * 1.4))))
    # Keep posts as rectangles with soft side falloff, not a fat oval.
    pa = np.asarray(post, dtype=np.float32)
    xx = np.linspace(-1, 1, 28, dtype=np.float32)
    side = np.clip(1.0 - np.abs(xx) ** 2.4, 0, 1)
    pa[:, :, 3] *= side[None, :] * 255.0 / np.maximum(pa[:, :, 3].max(), 1.0)
    pa[:, :, 3] = np.clip(pa[:, :, 3] * 1.8, 0, 255)
    post = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(post, (78, 36))
    im.alpha_composite(post, (254, 36))
    plank = wood_plank((220, 54), horizontal=True).convert("RGBA")
    for i, y in enumerate((70, 128, 186)):
        p = plank.copy()
        arr = np.asarray(p, dtype=np.float32)
        arr[:, :, :3] *= 0.92 + 0.04 * i
        p = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
        p.putalpha(ellipse_mask((220, 54), ry=0.46, blur=3).point(lambda v: min(255, int(v * 1.35))))
        im.alpha_composite(p, (70, y))
    paper = paper_sheet((168, 118)).convert("RGBA")
    paper.putalpha(round_mask((168, 118), 8, 1.4))
    im.alpha_composite(paper, (96, 92))
    return im


def paint_stall() -> Image.Image:
    # Quiet booth from cabin timber. One ochre cloth, not a red-green market pack.
    W, H = 420, 400
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    post = wood_plank((26, 300), horizontal=False).convert("RGBA")
    pa = np.asarray(post, dtype=np.float32)
    xx = np.linspace(-1, 1, 26, dtype=np.float32)
    pa[:, :, 3] = np.clip((1.0 - np.abs(xx) ** 2.2)[None, :] * 255.0, 0, 255)
    post = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(post, (64, 70))
    im.alpha_composite(post, (330, 70))
    beam = wood_plank((300, 22), horizontal=True).convert("RGBA")
    im.alpha_composite(beam, (60, 78))
    cloth = paper_sheet((304, 78), ochre=True).convert("RGBA")
    ca = np.asarray(cloth, dtype=np.float32)
    yy = np.linspace(0, 1, 78, dtype=np.float32)[:, None]
    # Soft scallop, no ink fringe.
    scallop = 0.85 + 0.15 * np.sin(np.linspace(0, 6 * np.pi, 304, dtype=np.float32))[None, :]
    ca[:, :, 3] = np.clip((1.0 - yy * 0.08) * scallop * 255.0, 0, 255)
    cloth = Image.fromarray(np.clip(ca, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(cloth, (58, 88))
    # Right-hand cabin planks only. Do not crop the door or lantern into a picture frame.
    back = wood_plank((250, 140), (260, 280, 400, 400), horizontal=False).convert("RGBA")
    ba = np.asarray(back, dtype=np.float32)
    ba[:, :, 3] = rect_falloff((250, 140), 10.0) * 255.0
    back = Image.fromarray(np.clip(ba, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(back, (85, 168))
    counter = wood_plank((310, 40), horizontal=True).convert("RGBA")
    im.alpha_composite(counter, (54, 300))
    return im


def paint_fire() -> Image.Image:
    # Soft dusk fire. Cabin logs, floor stones, a warm glow. No ink ring.
    W, H = 320, 320
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.alpha_composite(_stone((W, H), 110, 248, 42, 22, 0.60, 11))
    im.alpha_composite(_stone((W, H), 168, 252, 38, 20, 0.64, 13))
    im.alpha_composite(_stone((W, H), 220, 250, 34, 18, 0.62, 17))
    im.alpha_composite(_stone((W, H), 70, 252, 30, 16, 0.66, 19))
    log = wood_plank((150, 28), (50, 250, 280, 330), horizontal=True).convert("RGBA")
    log.putalpha(ellipse_mask((150, 28), ry=0.40, blur=3).point(lambda v: min(255, int(v * 1.4))))
    im.alpha_composite(log.rotate(18, expand=True, resample=Image.Resampling.BICUBIC), (70, 188))
    im.alpha_composite(log.rotate(-16, expand=True, resample=Image.Resampling.BICUBIC), (96, 200))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    for r, col, a in (
        (70, (252, 176, 72), 70),
        (46, (255, 210, 110), 110),
        (26, (255, 236, 180), 150),
    ):
        d.ellipse((160 - r, 150 - r, 160 + r, 168 + r), fill=(*col, a))
    glow.putalpha(glow.getchannel("A").filter(ImageFilter.GaussianBlur(8)))
    im.alpha_composite(glow)
    return im


def paint_gate() -> Image.Image:
    W, H = 400, 420
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    post = wood_plank((34, 340), horizontal=False).convert("RGBA")
    pa = np.asarray(post, dtype=np.float32)
    xx = np.linspace(-1, 1, 34, dtype=np.float32)
    pa[:, :, 3] = np.clip((1.0 - np.abs(xx) ** 2.1)[None, :] * 255.0, 0, 255)
    post = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8), "RGBA")
    im.alpha_composite(post, (70, 50))
    im.alpha_composite(post, (296, 50))
    beam = wood_plank((280, 36), horizontal=True).convert("RGBA")
    im.alpha_composite(beam, (60, 58))
    # West lantern. Same warm window as the cover houses.
    lantern = Image.new("RGBA", (48, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(lantern)
    d.ellipse((6, 10, 42, 56), fill=(252, 186, 86, 230))
    d.ellipse((14, 18, 34, 44), fill=(255, 228, 150, 240))
    lantern.putalpha(lantern.getchannel("A").filter(ImageFilter.GaussianBlur(2)))
    im.alpha_composite(lantern, (86, 120))
    return im


def finish(im: Image.Image, fade: float, ink_thr: float = 10.0) -> Image.Image:
    look = _look()
    out = look.soften_sit(kill_black(im, ink_thr), fade)
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(1.1))
    out.putalpha(a)
    return out


def save(im: Image.Image, name: str) -> Path:
    dest = ART / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest)
    print(f"wrote {dest} {im.size}")
    return dest


def main() -> None:
    save(finish(paint_bush(), 0.26), "prop-bush.png")
    save(finish(paint_tuft(), 0.30), "prop-tuft.png")
    save(finish(paint_rock(), 0.12, 2.0), "prop-rock.png")
    save(finish(paint_board(), 0.16), "prop-board.png")
    save(finish(paint_stall(), 0.18), "prop-stall.png")
    save(finish(paint_fire(), 0.20), "prop-fire.png")
    save(finish(paint_gate(), 0.16), "prop-gate.png")


if __name__ == "__main__":
    main()
