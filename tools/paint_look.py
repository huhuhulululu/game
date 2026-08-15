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


def _remap(tex: np.ndarray, u: np.ndarray, v: np.ndarray) -> np.ndarray:
    h, w = tex.shape[:2]
    u = np.mod(u, w)
    v = np.mod(v, h)
    u0 = np.floor(u).astype(np.int32)
    v0 = np.floor(v).astype(np.int32)
    u1 = (u0 + 1) % w
    v1 = (v0 + 1) % h
    fu = (u - u0)[..., None]
    fv = (v - v0)[..., None]
    c00 = tex[v0, u0]
    c10 = tex[v0, u1]
    c01 = tex[v1, u0]
    c11 = tex[v1, u1]
    return c00 * (1 - fu) * (1 - fv) + c10 * fu * (1 - fv) + c01 * (1 - fu) * fv + c11 * fu * fv


def cut_prop(im: Image.Image, tol: float = 36.0) -> Image.Image:
    """Key olive-gray (or any flat corner) and keep a dusk-soft silhouette. No ink ring."""
    src = im.convert("RGB")
    seed = np.asarray(src, dtype=np.float32)[2, 2]
    cut = flood_cut(im, tol)
    arr = np.asarray(cut.convert("RGBA"), dtype=np.float32)
    dist = np.linalg.norm(arr[:, :, :3] - seed, axis=2)
    arr[:, :, 3] = np.where(dist < tol + 8.0, 0, arr[:, :, 3])
    # leftover fringe is still close to the key; push it out before the dusk grade
    lum = arr[:, :, :3] @ np.array([0.3, 0.5, 0.2], dtype=np.float32)
    near = (dist < tol + 18.0) & (arr[:, :, 3] < 140)
    arr[:, :, 3] = np.where(near, arr[:, :, 3] * 0.15, arr[:, :, 3])
    # ink rings from the old sheet: dark and already thinning
    ink = (lum < 22.0) & (arr[:, :, 3] < 200)
    arr[ink, 3] = 0
    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    bbox = out.getchannel("A").getbbox()
    if not bbox:
        return out
    pad = 18
    x0, y0, x1, y1 = bbox
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(out.size[0], x1 + pad), min(out.size[1], y1 + pad)
    spr = out.crop((x0, y0, x1, y1))
    if spr.size[0] > 640:
        nh = max(8, int(spr.size[1] * 640 / spr.size[0]))
        spr = spr.resize((640, nh), Image.Resampling.LANCZOS)
    a = spr.getchannel("A").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(2.2))
    spr.putalpha(a)
    return spr


def trim_empty_feet(im: Image.Image, keep: int = 14) -> Image.Image:
    """Drop transparent pad under the feet so sit fade and contact hit wood."""
    buf = np.asarray(im.convert("RGBA"))
    row = buf[:, :, 3].max(axis=1)
    ys = np.where(row > 10)[0]
    if len(ys) == 0:
        return im.convert("RGBA")
    y1 = min(im.size[1], int(ys.max()) + keep)
    return Image.fromarray(buf[:y1], "RGBA")


def soften_sit(im: Image.Image, fade: float = 0.30) -> Image.Image:
    """Fade the feet and kill ink rings. Do not grade dusk again."""
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32) / 255.0
    h, _w = buf.shape[:2]
    a = buf[:, :, 3]
    ys = np.where(a > 0.08)[0]
    if len(ys) == 0:
        return im.convert("RGBA")
    y0, y1 = int(ys.min()), int(ys.max())
    span = max(1, y1 - y0)
    fade_from = y1 - int(span * fade)
    yy = np.arange(h)[:, None]
    t = np.clip((y1 - yy) / max(10.0, span * fade), 0, 1)
    fall = np.where(yy > fade_from, t * t, 1.0)
    g, r, b = buf[:, :, 1], buf[:, :, 0], buf[:, :, 2]
    grass = (g > r + 0.03) & (g > b) & (yy > y0 + span * 0.52)
    waterish = (b > r + 0.04) & (b > g * 0.9) & (yy > y0 + span * 0.50)
    fall = np.where(grass | waterish, fall * 0.12, fall)
    buf[:, :, 3] *= fall
    lum = buf[:, :, :3] @ np.array([0.3, 0.5, 0.2], dtype=np.float32)
    buf[(lum < 0.04) & (buf[:, :, 3] < 0.75), 3] = 0
    out = Image.fromarray(np.clip(buf * 255, 0, 255).astype(np.uint8), "RGBA")
    a = out.getchannel("A").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(2.0))
    out.putalpha(a)
    return out


def finish_sit_props() -> None:
    for name, _fade in (
        ("prop-cabin.png", 0.28),
        ("prop-stall.png", 0.26),
        ("prop-dock.png", 0.34),
        ("prop-dock-b.png", 0.34),
        ("prop-anvil.png", 0.22),
        ("prop-altar.png", 0.22),
    ):
        p = ART / name
        if p.exists():
            save(trim_empty_feet(Image.open(p), 14), name)


def finish_anvil_altar() -> None:
    for dest, src, fade in (
        ("prop-anvil.png", "anvil-ref.png", 0.14),
        ("prop-altar.png", "altar-ref.png", 0.14),
    ):
        ref = REFS / src
        if not ref.exists():
            print("skip", dest, "missing", ref)
            continue
        save(process_prop(cut_prop(Image.open(ref)), fade), dest)


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


def _load_meadows() -> list[np.ndarray]:
    names = ("meadow-a.png", "meadow-b.png", "ground-ref.png")
    texs = []
    for name in names:
        p = REFS / name
        if p.exists():
            texs.append(np.asarray(Image.open(p).convert("RGB"), dtype=np.float32) / 255.0)
    if not texs:
        raise FileNotFoundError("no meadow refs in %s" % REFS)
    while len(texs) < 3:
        texs.append(texs[0])
    return texs


def _meadow_stack(W: int, H: int) -> np.ndarray:
    a, b, c = _load_meadows()
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # gentle warp only — keep the meadow looking like grass, not a smeared wave
    w1 = 16.0 * np.sin(xx * 0.0055 + yy * 0.0038) + 10.0 * np.cos(xx * 0.0028 - yy * 0.0064)
    w2 = 12.0 * np.sin(xx * 0.0078 - yy * 0.0046)
    pa = _remap(a, xx * (a.shape[1] / W) * 0.92 + w1 + 40, yy * (a.shape[0] / H) * 0.88 + w2 + 28)
    pb = _remap(b, xx * (b.shape[1] / W) * 0.78 + 70 + w2, yy * (b.shape[0] / H) * 0.74 + 36 + w1)
    pc = _remap(c, xx * (c.shape[1] / W) * 0.55 + 24 + w1 * 0.4, yy * (c.shape[0] / H) * 0.50 + 18)
    mix = 0.5 + 0.5 * np.sin(xx * 0.0032 + yy * 0.0024)
    mix = np.clip(mix, 0.28, 0.72)[..., None]
    grass = pa * (1.0 - mix) + pb * mix
    grass = grass * 0.84 + pc * 0.16
    lum = grass @ np.array([0.3, 0.5, 0.2], dtype=np.float32)
    hi = np.clip((lum - 0.58) / 0.36, 0, 1)[..., None]
    mid = np.median(grass.reshape(-1, 3), axis=0)
    grass = grass * (1.0 - hi * 0.28) + mid * (hi * 0.28)
    # pull down the same flower/clump landmarks that read as a tile up close
    blur = np.asarray(
        Image.fromarray((np.clip(grass, 0, 1) * 255).astype(np.uint8), "RGB").filter(ImageFilter.GaussianBlur(2.2)),
        dtype=np.float32,
    ) / 255.0
    grass = np.clip(blur + (grass - blur) * 0.58, 0, 1)
    shade = 0.96 + 0.05 * np.sin(xx * 0.0022 + yy * 0.0030)
    return np.clip(grass * shade[..., None], 0, 1)


def _soft_field(kind: np.ndarray, scale: int) -> np.ndarray:
    """One more stop of blur than the last sheet. Path still has a core."""
    th, tw = kind.shape
    res = 12
    rng = np.random.default_rng(4)
    fh, fw = th * res, tw * res
    ys = np.arange(fh)[:, None]
    xs = np.arange(fw)[None, :]
    ox = rng.normal(0, 0.30, (fh, fw))
    oy = rng.normal(0, 0.22, (fh, fw))
    ix = np.clip(np.rint(xs / res + ox), 0, tw - 1).astype(np.int32)
    iy = np.clip(np.rint(ys / res + oy), 0, th - 1).astype(np.int32)
    k = kind[iy, ix]
    raw = np.zeros((fh, fw, 3), dtype=np.float32)
    raw[:, :, 0] = k == 0
    raw[:, :, 1] = k == 1
    raw[:, :, 2] = k == 2
    rgb = Image.fromarray((raw * 255).astype(np.uint8), "RGB")
    # last pass used 5.5; one more stop, not a wash
    field = np.asarray(rgb.filter(ImageFilter.GaussianBlur(7.2)), dtype=np.float32) / 255.0
    HW, HH = tw * 36 * scale, th * 36 * scale
    field = np.asarray(
        Image.fromarray((np.clip(field, 0, 1) * 255).astype(np.uint8), "RGB").resize((HW, HH), Image.Resampling.LANCZOS),
        dtype=np.float32,
    ) / 255.0
    field = field / np.maximum(field.sum(axis=2, keepdims=True), 1e-5)
    return field


def paint_ground() -> Image.Image:
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
    scale = 2
    HW, HH = W * scale, H * scale
    field = _soft_field(kind, scale)
    grass = _meadow_stack(HW, HH)
    dirt = np.clip(grass * np.array([1.10, 0.80, 0.54]) * 0.82 + np.array([0.24, 0.14, 0.07]), 0, 1)
    wet = np.asarray(Image.fromarray((grass * 255).astype(np.uint8), "RGB").filter(ImageFilter.GaussianBlur(1.4)), dtype=np.float32) / 255.0
    water = np.clip(wet * np.array([0.42, 0.46, 0.38]) + np.array([0.20, 0.18, 0.13]), 0, 1)
    shore = np.clip(field[:, :, 2:3] * (1.0 - field[:, :, 2:3]) * 3.2, 0, 1)
    mud = np.clip(dirt * 0.62 + np.array([0.26, 0.16, 0.08]), 0, 1)
    col = grass * field[:, :, 0:1] + dirt * field[:, :, 1:2] + water * field[:, :, 2:3]
    col = col * (1.0 - shore * 0.48) + mud * shore * 0.48
    yy = np.linspace(0, 1, HH)[:, None, None]
    col = np.clip(col * DUSK, 0, 1)
    col = col * (1.0 - (1.0 - yy) * 0.12) + FOG * (1.0 - yy) * 0.12
    col = col * (1.0 - yy * 0.04) + np.array([0.80, 0.54, 0.32]) * yy * 0.04
    col = np.clip(col + np.random.default_rng(1).normal(0, 0.008, col.shape), 0, 1)
    hi = Image.fromarray((col * 255).astype(np.uint8), "RGB")
    return hi.resize((W, H), Image.Resampling.LANCZOS)


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
    ]:
        p = ART / name
        if p.exists():
            save(process_prop(Image.open(p), fade), name)
    finish_anvil_altar()
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
