#!/usr/bin/env python3
"""Finish the dusk valley look from painted refs. No DST faces, no English inn."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
FONT = ROOT / "godot" / "fonts" / "kai.ttf"
REFS = Path("/opt/cursor/artifacts/assets")

DUSK = np.array([1.04, 0.92, 0.78], dtype=np.float32)
FOG = np.array([0.74, 0.56, 0.40], dtype=np.float32)
INK = (56, 34, 22)

VALLEY = [
    "##################################",
    "#TTTT..........TTTTTTTT..........#",
    "#TTTT...EE.....TTFFTTTT..........#",
    "#.......EE........FF.............#",
    "#................................#",
    "#....CCCC..........NNNN..........#",
    "#....C..C...PPPP...N..N..........#",
    "#....C..A...PPPP...N..I..........#",
    "#...........PPPP.................#",
    "#....,,,,,,,,,,,,,,,,,,,,,.......#",
    "#~~~~D~~~~~~D~~~~~~~~~~~~~~~~~~~~#",
    "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
    "#................................#",
    "#......SS....GG....BB....YY......#",
    "#......S.................Y.....O.#",
    "#..............................V.#",
    "##################################",
]


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT), size)


def save(im: Image.Image, name: str) -> None:
    path = ART / name
    im.save(path, "PNG")
    print("wrote", path.name, im.size, im.mode)


def flood_cut(im: Image.Image, tol: float = 32.0) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.float32)
    seed = rgb[2, 2]
    vis = np.zeros((h, w), dtype=bool)
    q = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
    for x in range(0, w, 8):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(0, h, 8):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or vis[y, x]:
            continue
        if np.linalg.norm(rgb[y, x] - seed) > tol and np.linalg.norm(rgb[y, x] - rgb[max(0, y - 1), x]) > tol + 8:
            continue
        if np.linalg.norm(rgb[y, x] - seed) > tol:
            continue
        vis[y, x] = True
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    alpha = np.where(vis, 0, 255).astype(np.uint8)
    # keep interior
    a = Image.fromarray(alpha, "L").filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.fromarray(arr, "RGBA")
    out.putalpha(a)
    return out


def fit_sprite(im: Image.Image, w=320, h=480) -> Image.Image:
    cut = flood_cut(im)
    bbox = cut.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (w, h), (0, 0, 0, 0))
    spr = cut.crop(bbox)
    scale = 430.0 / spr.size[1]
    nw, nh = max(8, int(spr.size[0] * scale)), max(8, int(spr.size[1] * scale))
    spr = spr.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.paste(spr, ((w - nw) // 2, h - nh - 8), spr)
    # soft outer edge only
    a = canvas.getchannel("A").filter(ImageFilter.GaussianBlur(0.8))
    canvas.putalpha(a)
    return canvas


def nudge(im: Image.Image, dx: int, dy: int) -> Image.Image:
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (dx, dy), im)
    return out


def process_prop(im: Image.Image, fade=0.22) -> Image.Image:
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32) / 255.0
    h, w = buf.shape[:2]
    a = buf[:, :, 3]
    ys = np.where(a > 0.08)[0]
    if len(ys) == 0:
        return im.convert("RGBA")
    y0, y1 = int(ys.min()), int(ys.max())
    span = max(1, y1 - y0)
    fade_from = y1 - int(span * fade)
    yy = np.arange(h)[:, None]
    fall = np.ones((h, 1), dtype=np.float32)
    t = np.clip((y1 - yy) / max(10.0, span * fade), 0, 1)
    fall = np.where(yy > fade_from, t * t, 1.0)
    g, r, b = buf[:, :, 1], buf[:, :, 0], buf[:, :, 2]
    grass = (g > r + 0.03) & (g > b) & (yy > y0 + span * 0.58)
    waterish = (b > r + 0.04) & (b > g * 0.9) & (yy > y0 + span * 0.55)
    fall = np.where(grass | waterish, fall * 0.2, fall)
    buf[:, :, 3] *= fall
    lum = buf[:, :, :3] @ np.array([0.3, 0.5, 0.2], dtype=np.float32)
    buf[(lum < 0.035) & (buf[:, :, 3] < 0.7), 3] = 0
    buf[:, :, :3] = np.clip(buf[:, :, :3] * DUSK, 0, 1)
    out = Image.fromarray(np.clip(buf * 255, 0, 255).astype(np.uint8), "RGBA")
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(1.4))
    out.putalpha(a)
    return out


def _ink_on_wood(im: Image.Image, box, text: str, size: int, oval: bool) -> None:
    x0, y0, x1, y1 = box
    arr = np.asarray(im.convert("RGBA"), dtype=np.float32)
    region = arr[y0:y1, x0:x1]
    rgb = region[:, :, :3]
    lum = rgb @ np.array([0.3, 0.5, 0.2], dtype=np.float32)
    # cream English lettering -> local wood
    wood = np.array([78, 50, 32], dtype=np.float32)
    letter = lum > 140
    region[:, :, :3] = np.where(letter[:, :, None], wood, rgb)
    arr[y0:y1, x0:x1] = region
    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    im.paste(out)
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    if oval:
        d.ellipse((x0, y0, x1, y1), fill=(70, 44, 28, 230))
        d.ellipse((x0 + 6, y0 + 7, x1 - 6, y1 - 7), fill=(168, 124, 78, 235))
    else:
        d.rectangle((x0, y0, x1, y1), fill=(86, 56, 34, 220))
        d.rectangle((x0 + 8, y0 + 8, x1 - 8, y1 - 8), fill=(176, 132, 86, 230))
    f = font(size)
    tw, th = d.textbbox((0, 0), text, font=f)[2:]
    d.text(((x0 + x1 - tw) / 2, (y0 + y1 - th) / 2 - 2), text, font=f, fill=(244, 228, 200))
    im.alpha_composite(overlay)


def scrub_inn(im: Image.Image) -> Image.Image:
    out = im.convert("RGBA")
    _ink_on_wood(out, (8, 148, 168, 310), "客栈", 28, True)
    _ink_on_wood(out, (236, 318, 404, 478), "灯还亮着", 16, False)
    return out


def paint_ground() -> Image.Image:
    meadow = Image.open(REFS / "ground-ref.png").convert("RGB")
    src = np.asarray(meadow, dtype=np.float32) / 255.0
    rows = VALLEY
    tw, th = len(rows[0]), len(rows)
    tile = 36
    W, H = tw * tile, th * tile
    kind = np.zeros((th, tw), dtype=np.int32)
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch in "~D":
                kind[y, x] = 2
            elif ch in ",P":
                kind[y, x] = 1
    res = 8
    field = np.zeros((th * res, tw * res, 3), dtype=np.float32)
    rng = np.random.default_rng(4)
    fh, fw = field.shape[:2]
    for y in range(fh):
        for x in range(fw):
            ox, oy = rng.normal(0, 0.32), rng.normal(0, 0.24)
            ix = int(np.clip(round(x / res + ox), 0, tw - 1))
            iy = int(np.clip(round(y / res + oy), 0, th - 1))
            field[y, x, kind[iy, ix]] = 1.0
    field = np.asarray(
        Image.fromarray((field * 255).astype(np.uint8), "RGB").filter(ImageFilter.GaussianBlur(5.5)).resize((W, H), Image.Resampling.LANCZOS),
        dtype=np.float32,
    ) / 255.0
    field = field / np.maximum(field.sum(axis=2, keepdims=True), 1e-5)
    big = np.asarray(meadow.resize((W + 280, H + 220), Image.Resampling.LANCZOS), dtype=np.float32) / 255.0
    grass = big[50 : 50 + H, 90 : 90 + W]
    dirt = np.clip(grass * np.array([1.08, 0.82, 0.58]) * 0.9 + np.array([0.18, 0.12, 0.07]), 0, 1)
    # dusk water shares the meadow's warmth — not a teal sticker strip
    water = np.clip(grass * np.array([0.42, 0.48, 0.40]) + np.array([0.22, 0.20, 0.14]), 0, 1)
    shore = np.clip(field[:, :, 2:3] * (1.0 - field[:, :, 2:3]) * 4.0, 0, 1)
    mud = np.clip(dirt * 0.7 + np.array([0.28, 0.18, 0.10]), 0, 1)
    col = grass * field[:, :, 0:1] + dirt * field[:, :, 1:2] + water * field[:, :, 2:3]
    col = col * (1.0 - shore * 0.55) + mud * shore * 0.55
    yy = np.linspace(0, 1, H)[:, None, None]
    col = np.clip(col * DUSK, 0, 1)
    col = col * (1.0 - (1.0 - yy) * 0.14) + FOG * (1.0 - yy) * 0.14
    col = col * (1.0 - yy * 0.05) + np.array([0.80, 0.54, 0.32]) * yy * 0.05
    col = np.clip(col + np.random.default_rng(1).normal(0, 0.01, col.shape), 0, 1)
    return Image.fromarray((col * 255).astype(np.uint8), "RGB")


def paint_paper() -> Image.Image:
    arr = np.full((256, 256, 3), (236, 218, 188), dtype=np.float32)
    arr += np.random.default_rng(3).normal(0, 6, arr.shape)
    yy = np.linspace(0, 1, 256)[:, None, None]
    arr *= (1.0 - yy * 0.07) * np.array([1.02, 0.96, 0.86])
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def paint_plaque() -> Image.Image:
    im = Image.new("RGBA", (360, 180), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((4, 4, 356, 176), 12, fill=(78, 50, 30, 255), outline=(44, 28, 16, 255), width=3)
    d.rounded_rectangle((14, 14, 346, 166), 8, fill=(236, 218, 186, 255), outline=(132, 90, 52, 255), width=2)
    arr = np.asarray(im, dtype=np.float32)
    arr[:, :, :3] += np.random.default_rng(6).normal(0, 4, arr[:, :, :3].shape)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")


def finish_cover() -> Image.Image:
    cover = Image.open(REFS / "cover-ref.png").convert("RGBA").resize((1280, 720), Image.Resampling.LANCZOS)
    d = ImageDraw.Draw(cover)
    hint = "点灯进谷"
    f = font(22)
    tw = d.textbbox((0, 0), hint, font=f)[2]
    d.text(((1280 - tw) / 2 + 1, 676), hint, font=f, fill=(40, 24, 14, 160))
    d.text(((1280 - tw) / 2, 674), hint, font=f, fill=(252, 236, 208, 230))
    return cover.convert("RGB")


def chars() -> None:
    mapping = {
        "char-warm.png": "char-warm-ref.png",
        "char-pine.png": "char-pine-ref.png",
        "char-warm-walk.png": "char-warm-walk-ref.png",
        "char-pine-walk.png": "char-pine-walk-ref.png",
        "char-warm-side.png": "char-warm-side-ref.png",
        "char-pine-side.png": "char-pine-side-ref.png",
        "char-warm-back.png": "char-warm-back-ref.png",
        "char-pine-back.png": "char-pine-back-ref.png",
    }
    made = {}
    for dest, src in mapping.items():
        made[dest] = fit_sprite(Image.open(REFS / src))
        save(made[dest], dest)
    # aligned second walk / side-walk from the same sheet, not a new face
    save(nudge(made["char-warm-walk.png"], 0, 3), "char-warm-walk2.png")
    save(nudge(made["char-pine-walk.png"], 0, 3), "char-pine-walk2.png")
    save(nudge(made["char-warm-side.png"], 2, 2), "char-warm-side-walk.png")
    save(nudge(made["char-warm-side.png"], -2, 3), "char-warm-side-walk2.png")
    save(nudge(made["char-pine-side.png"], 2, 2), "char-pine-side-walk.png")
    save(nudge(made["char-pine-side.png"], -2, 3), "char-pine-side-walk2.png")
    save(nudge(made["char-warm-back.png"], 0, 3), "char-warm-back-walk.png")
    save(nudge(made["char-warm-back.png"], 0, -2), "char-warm-back-walk2.png")
    save(nudge(made["char-pine-back.png"], 0, 3), "char-pine-back-walk.png")
    save(nudge(made["char-pine-back.png"], 0, -2), "char-pine-back-walk2.png")
    for who in ("warm", "pine"):
        idle = made[f"char-{who}.png"]
        save(idle.copy(), f"char-{who}-fish.png")
        save(idle.copy(), f"char-{who}-chop.png")
        save(idle.copy(), f"char-{who}-forge.png")
        save(nudge(idle, 0, 18), f"char-{who}-sit.png")


def main() -> None:
    ART.mkdir(parents=True, exist_ok=True)
    inn = process_prop(scrub_inn(Image.open(ART / "prop-inn.png")), 0.16)
    save(inn, "prop-inn.png")
    for name, fade in [
        ("prop-cabin.png", 0.20),
        ("prop-tree.png", 0.26),
        ("prop-tree-wide.png", 0.26),
        ("prop-tree-tall.png", 0.24),
        ("prop-pine.png", 0.22),
        ("prop-tree-gold.png", 0.22),
        ("prop-stall.png", 0.18),
        ("prop-bush.png", 0.22),
        ("prop-mine.png", 0.18),
        ("prop-dock.png", 0.32),
        ("prop-dock-b.png", 0.32),
        ("prop-gate.png", 0.16),
        ("prop-board.png", 0.16),
        ("prop-anvil.png", 0.16),
        ("prop-altar.png", 0.16),
    ]:
        p = ART / name
        if p.exists():
            save(process_prop(Image.open(p), fade), name)
    save(paint_paper(), "tex-paper.png")
    save(paint_plaque(), "tex-plaque.png")
    save(paint_ground(), "ground-valley.png")
    save(finish_cover(), "cover-valley.png")
    chars()
    raw = (ART / "prop-inn.png").read_bytes()
    if b"Wanderer" in raw or b"WANDERER" in raw or b"Good Ale" in raw:
        raise SystemExit("English inn sign still embedded")
    print("look painted")


if __name__ == "__main__":
    main()
