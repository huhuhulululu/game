#!/usr/bin/env python3
"""One dusk. Play roofs are the cover buildings. Does not touch the cover."""

from __future__ import annotations

import importlib.util
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"

# Cover boxes. Read only. Does not write cover-valley.png.
HUT_BOX = (60, 310, 260, 550)
LODGE_BOX = (840, 190, 1180, 510)
# Trees, lamp, shore. Same painting. No second brush.
WILLOW_BOX = (0, 168, 90, 338)
# Same left cover tree, taller, so the enter frame is not a smeared stamp.
WILLOW_TALL = (0, 140, 100, 308)
RIDGE_BOX = (1195, 105, 1280, 190)
LAMP_BOX = (918, 298, 972, 372)
SHORE_BOX = (1008, 548, 1148, 668)
VERGE_BOX = (210, 535, 345, 665)


def quiet_scrub(im: Image.Image) -> Image.Image:
    # Kept so an old English inn can be scrubbed. Cover roofs do not need it.
    return im.convert("RGBA")


def _look() -> object:
    spec = importlib.util.spec_from_file_location("paint_look", ROOT / "tools" / "paint_look.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def eat_corners(im: Image.Image, tol: float = 34.0) -> Image.Image:
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w = rgb.shape[:2]
    vis = np.zeros((h, w), dtype=bool)
    seeds = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3), (w // 2, 2)]
    for sx, sy in seeds:
        seed = rgb[sy, sx]
        q = deque([(sx, sy)])
        while q:
            x, y = q.popleft()
            if x < 0 or y < 0 or x >= w or y >= h or vis[y, x]:
                continue
            if float(np.linalg.norm(rgb[y, x] - seed)) > tol:
                continue
            vis[y, x] = True
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    alpha = np.where(vis, 0, 255).astype(np.uint8)
    out = Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]), "RGBA")
    return out


def eat_sky(im: Image.Image, tol: float = 28.0) -> Image.Image:
    # Only seed the top. Bottom foliage is not a seed.
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w = rgb.shape[:2]
    vis = np.zeros((h, w), dtype=bool)
    seeds = [(2, 2), (w - 3, 2), (w // 2, 2), (w // 4, 2), (3 * w // 4, 2)]
    for sx, sy in seeds:
        seed = rgb[sy, sx]
        q = deque([(sx, sy)])
        while q:
            x, y = q.popleft()
            if x < 0 or y < 0 or x >= w or y >= h or vis[y, x]:
                continue
            if float(np.linalg.norm(rgb[y, x] - seed)) > tol:
                continue
            vis[y, x] = True
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    alpha = np.where(vis, 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]), "RGBA")


def eat_gold_sky(im: Image.Image, lum_min: float = 118.0) -> Image.Image:
    # Cover dusk sky stays in the leaf gaps and reads as a box. Windows are not trees.
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32)
    r, g, b, a = buf[:, :, 0], buf[:, :, 1], buf[:, :, 2], buf[:, :, 3]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    sky = (lum > lum_min) & (r > 132.0) & (r + 12.0 >= g) & (r > b + 6.0)
    buf[:, :, 3] = np.where(sky, 0.0, a)
    return Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8), "RGBA")


def fade_edges(im: Image.Image, pad: float = 0.14) -> Image.Image:
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32)
    h, w = buf.shape[:2]
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    fx = np.clip(np.minimum(xx / pad, (1.0 - xx) / pad), 0.0, 1.0)
    fy = np.clip(np.minimum(yy / (pad * 0.85), (1.0 - yy) / pad), 0.0, 1.0)
    t = np.minimum(fx, fy)
    fall = t * t * (3.0 - 2.0 * t)
    buf[:, :, 3] *= fall
    return Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8), "RGBA")


def fade_bank(im: Image.Image, pad: float = 0.26) -> Image.Image:
    # Land lip. Eat the gold water sheet so the bank is not an oval stamp.
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32)
    h, w = buf.shape[:2]
    r, g, b = buf[:, :, 0], buf[:, :, 1], buf[:, :, 2]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    yy = np.arange(h, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    pad_lum = np.pad(lum, 2, mode="edge")
    contrast = np.zeros_like(lum)
    for dy in (-2, 0, 2):
        for dx in (-2, 0, 2):
            contrast = np.maximum(contrast, np.abs(pad_lum[2 + dy : 2 + dy + h, 2 + dx : 2 + dx + w] - lum))
    rock = (yy < h * 0.64) & ((contrast > 10) | ((lum < 80) & (yy < h * 0.50)))
    lip = (yy >= h * 0.50) & (yy < h * 0.74) & (contrast > 9) & (lum < 100)
    keep = rock | lip
    yyn = yy / max(1.0, h - 1)
    edge = np.clip(np.minimum(xx / max(0.12, pad * 0.55), (1.0 - xx) / max(0.12, pad * 0.55)), 0.0, 1.0)
    edge = np.minimum(edge, np.clip(np.minimum(yyn / 0.14, (1.0 - yyn) / 0.22), 0.0, 1.0))
    buf[:, :, 3] = np.where(keep, 255.0, 0.0) * (edge * edge * (3.0 - 2.0 * edge))
    return Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8), "RGBA")


def keep_lamp(im: Image.Image) -> Image.Image:
    # Lamp and bloom only. The lodge wall is a box.
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32)
    h, w = buf.shape[:2]
    r, g, b = buf[:, :, 0], buf[:, :, 1], buf[:, :, 2]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    glow = (lum > 88) & (r > 130) & (r > b + 14)
    if not glow.any():
        glow = lum > np.quantile(lum, 0.88)
    ys, xs = np.where(glow)
    cy, cx = float(ys.mean()), float(xs.mean())
    yy, xx = np.ogrid[:h, :w]
    dist = np.sqrt(((xx - cx) / max(5.0, w * 0.22)) ** 2 + ((yy - cy) / max(5.0, h * 0.26)) ** 2)
    keep = ((dist < 0.92) | glow) & ~((lum < 62) & (dist > 0.55))
    buf[:, :, 3] = np.where(keep, 255.0, 0.0)
    return Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8), "RGBA")


def trim_alpha(im: Image.Image, t: int = 10) -> Image.Image:
    a = np.asarray(im.split()[-1])
    ys, xs = np.where(a > t)
    if len(xs) == 0:
        return im.convert("RGBA")
    return im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))


def kill_haze(im: Image.Image, t: float = 52.0) -> Image.Image:
    # Weak dusk wash on a sprite reads as a box on the play floor.
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32)
    r, g, b, a = buf[:, :, 0], buf[:, :, 1], buf[:, :, 2], buf[:, :, 3]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    glow = (r > 150.0) & (r > g + 16.0) & (lum > 88.0)
    buf[:, :, 3] = np.where((a < t) & (~glow), 0.0, a)
    return Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8), "RGBA")


def _dilate(mask: np.ndarray, k: int = 3) -> np.ndarray:
    k = k if k % 2 == 1 else k + 1
    im = Image.fromarray((mask.astype(np.uint8) * 255), "L")
    return np.asarray(im.filter(ImageFilter.MaxFilter(k))) > 127


def _erode(mask: np.ndarray, k: int = 3) -> np.ndarray:
    k = k if k % 2 == 1 else k + 1
    im = Image.fromarray((mask.astype(np.uint8) * 255), "L")
    return np.asarray(im.filter(ImageFilter.MinFilter(k))) > 127


def _flood(seeds, h: int, w: int, can_enter: np.ndarray) -> np.ndarray:
    vis = np.zeros((h, w), dtype=bool)
    q = deque(seeds)
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or vis[y, x]:
            continue
        if not can_enter[y, x]:
            continue
        vis[y, x] = True
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return vis


def _keep_big(mask: np.ndarray, min_px: int) -> np.ndarray:
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    out = np.zeros_like(mask, dtype=bool)
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or seen[y, x]:
                continue
            q = deque([(x, y)])
            seen[y, x] = True
            comp = []
            while q:
                cx, cy = q.popleft()
                comp.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((nx, ny))
            if len(comp) >= min_px:
                for cx, cy in comp:
                    out[cy, cx] = True
    return out


def _fill_holes(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    seeds = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
    seeds += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    exterior = _flood(seeds, h, w, ~mask)
    return mask | (~mask & ~exterior)


def cut_house(im: Image.Image, tol: float = 38.0, sit: float = 0.36) -> Image.Image:
    # Cut to the roof. Eat cover sky, mountain, and the dusk field under the crop.
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w = rgb.shape[:2]
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    yy = np.arange(h, dtype=np.float32)[:, None]
    warm = r - b
    sat = warm / np.maximum(lum, 1.0)
    gold = (lum > 108) & (r > 128) & (r + 10 >= g) & (r > b + 5)
    glow = (r > 148) & (r > g + 12) & (lum > 88) & (r > b + 16)
    wood = ((lum < 76) & (sat > 0.90) & (warm > 38)) | ((lum < 50) & (r >= b - 2))
    mountain = (lum > 74) & (lum < 118) & (sat < 0.88) & ~glow
    top_gold = _flood(
        [(x, 0) for x in range(w)] + [(0, y) for y in range(min(12, h))] + [(w - 1, y) for y in range(min(12, h))],
        h,
        w,
        gold | ((yy < h * 0.18) & (lum > 92)),
    )
    windows = glow & ~top_gold & (yy > h * 0.14) & ~mountain
    can = (wood | windows | glow) & ~top_gold & ~mountain
    house = (wood & (yy < h * 0.68) & (yy > h * 0.06)) | windows
    house = house & ~top_gold & ~mountain
    for _ in range(6):
        house = _dilate(house, 3) & can & (yy < h * 0.74)
    house = _fill_holes(_erode(_dilate(house | windows, 3), 3) | windows)
    house = (house | windows) & ~mountain & ~top_gold & (~gold | windows)
    house = _keep_big(house, min_px=max(60, (h * w) // 90))
    # Leftover cover tree on the lodge crop is a second box. Keep the timber mass.
    main = _keep_big(house & (np.arange(w)[None, :] > w * 0.10), min_px=max(80, (h * w) // 70))
    if main.any():
        house = main | (windows & house)
    pad = np.pad(lum, 2, mode="edge")
    contrast = np.zeros_like(lum)
    for dy in (-2, 0, 2):
        for dx in (-2, 0, 2):
            contrast = np.maximum(contrast, np.abs(pad[2 + dy : 2 + dy + h, 2 + dx : 2 + dx + w] - lum))
    foot_can = ((wood & (yy > h * 0.55)) | ((contrast > 11) & (sat > 0.62) & (lum < 110) & (yy > h * 0.58))) & ~top_gold
    feet = house.copy()
    for _ in range(5):
        feet = _dilate(feet, 3) & (foot_can | house)
    keep = house | (feet & (yy > h * 0.55)) | windows
    alpha = np.where(keep, 255.0, 0.0)
    foot_y = h * (1.0 - sit)
    t = np.clip((h - yy) / max(8.0, h * sit), 0.0, 1.0)
    alpha = np.where((yy > foot_y) & ~windows, alpha * (t * t), alpha)
    alpha = np.where((alpha < 62) & ~windows, 0.0, alpha)
    out = Image.fromarray(np.dstack([rgb.astype(np.uint8), np.clip(alpha, 0, 255).astype(np.uint8)]), "RGBA")
    return trim_alpha(kill_haze(out, 56.0))


def sit_cover_houses() -> None:
    # Read the cover. Does not touch the cover.
    cover = Image.open(ART / "cover-valley.png").convert("RGBA")
    hut = cut_house(cover.crop(HUT_BOX), 36.0, 0.36)
    hut.save(ART / "prop-hut.png")
    print("wrote prop-hut.png from cover hut", hut.size)
    lodge = cut_house(cover.crop(LODGE_BOX), 38.0, 0.38)
    lodge.save(ART / "prop-lodge.png")
    print("wrote prop-lodge.png from cover lodge", lodge.size)
    raw = (ART / "prop-lodge.png").read_bytes()
    if b"Wanderer" in raw or b"WANDERER" in raw or b"Good Ale" in raw:
        raise SystemExit("English inn sign still on the play lodge")


def sit_cover_grove() -> None:
    # Trees, lamp, shore from the same cover. Does not touch the cover.
    cover = Image.open(ART / "cover-valley.png").convert("RGBA")
    look = _look()
    raw = eat_sky(cover.crop(WILLOW_TALL), 16.0)
    buf = np.asarray(raw.convert("RGBA"), dtype=np.float32)
    r, g, b, a = buf[:, :, 0], buf[:, :, 1], buf[:, :, 2], buf[:, :, 3]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    gold = (lum > 100) & (r > 132) & (r + 12 >= g) & (r > b + 6)
    h, w = lum.shape
    sky = _flood(
        [(x, 0) for x in range(w)] + [(0, 0), (w - 1, 0)],
        h,
        w,
        gold | ((np.arange(h)[:, None] < 10) & (lum > 90)),
    )
    dark_leaf = (a > 8) & (lum < 108) & ~sky
    # Keep dusk catching the leaves. Eat only the sky hung from the top.
    rim = gold & _dilate(dark_leaf, 3) & ~sky
    buf[:, :, 3] = np.where(dark_leaf | rim, 255.0, 0.0)
    willow = trim_alpha(kill_haze(Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8), "RGBA"), 40.0))
    willow.save(ART / "prop-cover-tree.png")
    print("wrote prop-cover-tree.png from cover willow", willow.size)
    # Ridge canopy is gold-lit. Do not flood-eat the sky or the crown goes with it.
    ridge = trim_alpha(look.soften_sit(fade_edges(cover.crop(RIDGE_BOX), 0.12), 0.14))
    ridge.save(ART / "prop-cover-tree-b.png")
    print("wrote prop-cover-tree-b.png from cover ridge", ridge.size)
    lamp = trim_alpha(kill_haze(keep_lamp(cover.crop(LAMP_BOX)), 40.0))
    lamp.save(ART / "prop-cover-lamp.png")
    print("wrote prop-cover-lamp.png from cover lamp", lamp.size)
    shore = trim_alpha(kill_haze(fade_bank(cover.crop(SHORE_BOX), 0.26), 52.0))
    shore.save(ART / "prop-cover-shore.png")
    print("wrote prop-cover-shore.png from cover shore", shore.size)
    verge = trim_alpha(kill_haze(fade_bank(cover.crop(VERGE_BOX), 0.28), 52.0))
    verge.save(ART / "prop-cover-verge.png")
    print("wrote prop-cover-verge.png from cover verge", verge.size)


def main() -> None:
    sit_cover_houses()
    sit_cover_grove()


if __name__ == "__main__":
    main()
