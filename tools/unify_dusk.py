#!/usr/bin/env python3
"""One dusk. Play roofs are the cover buildings. Does not touch the cover."""

from __future__ import annotations

import importlib.util
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"

# Cover boxes. Read only. Does not write cover-valley.png.
HUT_BOX = (60, 310, 260, 550)
LODGE_BOX = (840, 190, 1180, 510)
# Trees, lamp, shore. Same painting. No second brush.
WILLOW_BOX = (0, 168, 90, 338)
WILLOW_TALL = (0, 140, 100, 308)
# Native cover trees. Sit at this size. Do not stretch an 80px scrap.
TREE_WILLOW = (0, 48, 150, 328)
TREE_GROVE = (705, 255, 885, 465)
# Same large left willow, denser lower sprays. Grove box has title + hill haze.
TREE_DENSE = (0, 140, 140, 340)
RIDGE_BOX = (1195, 105, 1280, 190)
LAMP_BOX = (918, 298, 972, 372)
SHORE_BOX = (1008, 548, 1148, 668)
VERGE_BOX = (210, 535, 345, 665)
# Local crop polygons. Cut to timber, not the cover field around it.
HUT_POLY = (
    (22, 72),
    (38, 55),
    (85, 48),
    (120, 50),
    (155, 62),
    (168, 80),
    (172, 140),
    (168, 192),
    (150, 200),
    (45, 200),
    (24, 188),
    (18, 140),
)
LODGE_POLY = (
    (95, 85),
    (120, 40),
    (160, 18),
    (210, 10),
    (270, 16),
    (320, 32),
    (338, 50),
    (338, 265),
    (290, 295),
    (180, 305),
    (110, 298),
    (92, 240),
    (88, 160),
    (90, 110),
)


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
    # Stone lip only. Eat the gold water sheet. No oval falloff — that is a stamp.
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w = rgb.shape[:2]
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    contrast = _local_contrast(lum)
    yy = np.arange(h, dtype=np.float32)[:, None]
    gold_water = (yy > h * 0.40) & (lum > 80.0) & (r > 140.0) & (r > b + 8.0)
    wet = (yy > h * 0.52) & ((b + 8.0 >= r) | ((lum > 58.0) & (contrast < 16.0)))
    rock = (lum < 72.0) & (contrast > 12.0) & (yy < h * 0.62)
    stop = rock & (yy < h * 0.58)
    seeds = [(x, h - 1) for x in range(w)] + [(x, h - 2) for x in range(w) if h > 1]
    water = _walk(rgb, seeds, stop, 34.0, 20.0) | gold_water | wet
    water = water & ~stop
    lip = water & _dilate(rock, 5) & (yy < h * 0.84)
    keep = (rock & ~water) | lip
    keep = _keep_big(keep, min_px=max(18, (h * w) // 90))
    alpha = np.where(keep, 255.0, 0.0)
    # Fade the wet lip and the crop lip. Do not oval-stamp the whole bank.
    t = np.clip((h * 0.78 - yy) / max(6.0, h * 0.18), 0.0, 1.0)
    alpha = np.where((lip | (yy > h * 0.62)), alpha * (t * t), alpha)
    _ = pad
    out = Image.fromarray(np.dstack([rgb.astype(np.uint8), np.clip(alpha, 0, 255).astype(np.uint8)]), "RGBA")
    return out


def keep_lamp(im: Image.Image) -> Image.Image:
    # Lamp and bloom only. The lodge wall is a box.
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32)
    h, w = buf.shape[:2]
    r, g, b = buf[:, :, 0], buf[:, :, 1], buf[:, :, 2]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    core = (lum > 150.0) & (r > 190.0) & (r > b + 16.0)
    if core.sum() < 6:
        core = (lum > 120.0) & (r > 170.0) & (r > b + 12.0)
    if not core.any():
        core = lum >= np.quantile(lum, 0.96)
    ys, xs = np.where(core)
    cy, cx = float(ys.mean()), float(xs.mean())
    yy, xx = np.ogrid[:h, :w]
    dist = np.sqrt(((xx - cx) / max(6.0, w * 0.24)) ** 2 + ((yy - cy) / max(6.0, h * 0.28)) ** 2)
    lamp = (dist < 1.05) | core
    arm = (yy < cy) & (np.abs(xx - cx) < max(4.0, w * 0.16)) & (lum < 84.0) & (yy > cy - h * 0.40)
    wall = xx > min(w - 1.0, cx + w * 0.34)
    beam = (yy < cy - h * 0.36) & (np.abs(xx - cx) > w * 0.18)
    keep = (lamp | arm | core) & ~wall & ~beam
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


def _local_contrast(lum: np.ndarray) -> np.ndarray:
    h, w = lum.shape
    pad = np.pad(lum, 2, mode="edge")
    contrast = np.zeros_like(lum)
    for dy in (-2, 0, 2):
        for dx in (-2, 0, 2):
            contrast = np.maximum(contrast, np.abs(pad[2 + dy : 2 + dy + h, 2 + dx : 2 + dx + w] - lum))
    return contrast


def _walk(rgb: np.ndarray, seeds, stop: np.ndarray, tol_bright: float, tol_dark: float) -> np.ndarray:
    # Walk a dusk gradient. Stop on timber / leaf contrast so the crop is not a box.
    h, w = stop.shape
    vis = np.zeros((h, w), dtype=bool)
    lum = 0.30 * rgb[:, :, 0] + 0.50 * rgb[:, :, 1] + 0.20 * rgb[:, :, 2]
    q = deque()
    for x, y in seeds:
        if x < 0 or y < 0 or x >= w or y >= h or stop[y, x] or vis[y, x]:
            continue
        vis[y, x] = True
        q.append((x, y))
    while q:
        x, y = q.popleft()
        tol = tol_bright if lum[y, x] > 88.0 else tol_dark
        base = rgb[y, x]
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < 0 or ny < 0 or nx >= w or ny >= h or vis[ny, nx] or stop[ny, nx]:
                continue
            if float(np.linalg.norm(rgb[ny, nx] - base)) <= tol:
                vis[ny, nx] = True
                q.append((nx, ny))
    return vis


def _border_seeds(h: int, w: int) -> list[tuple[int, int]]:
    seeds = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
    seeds += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    return seeds


def _fill_small_holes(mask: np.ndarray, max_hole: int) -> np.ndarray:
    # Close knotholes. Do not fill a leftover sky field into a rectangle.
    h, w = mask.shape
    hole = ~mask
    seen = np.zeros_like(mask, dtype=bool)
    out = mask.copy()
    for y in range(h):
        for x in range(w):
            if not hole[y, x] or seen[y, x]:
                continue
            q = deque([(x, y)])
            seen[y, x] = True
            comp = []
            touch = False
            while q:
                cx, cy = q.popleft()
                comp.append((cx, cy))
                if cx == 0 or cy == 0 or cx == w - 1 or cy == h - 1:
                    touch = True
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and hole[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((nx, ny))
            if (not touch) and len(comp) <= max_hole:
                for cx, cy in comp:
                    out[cy, cx] = True
    return out


def _assert_not_box(im: Image.Image, name: str) -> None:
    a = np.asarray(im.split()[-1]) > 8
    if a.size == 0 or a.mean() < 0.02:
        raise SystemExit(f"{name} empty after cut")
    edges = (float(a[0].mean()), float(a[-1].mean()), float(a[:, 0].mean()), float(a[:, -1].mean()))
    # A sticker keeps three or four sides of the crop. Trim makes the subject touch the box.
    if sum(e > 0.72 for e in edges) >= 3:
        raise SystemExit(f"{name} still a rectangle {tuple(round(e, 2) for e in edges)}")


def _poly_mask(size: tuple[int, int], poly: tuple[tuple[int, int], ...]) -> np.ndarray:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).polygon(list(poly), fill=255)
    return np.asarray(mask) > 127


def cut_tree(im: Image.Image) -> Image.Image:
    # Cut to the leaves. Eat cover sky and dusk ground. Do not stretch later.
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w = rgb.shape[:2]
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = (mx - mn) / (mx + 1.0)
    contrast = _local_contrast(lum)
    yy = np.arange(h, dtype=np.float32)[:, None]
    gold = (lum > 100.0) & (r > 128.0) & (r + 10.0 >= g) & (r > b + 5.0)
    # Dark sprays and high-contrast leaf clumps. Bright gold field is sky.
    leaf = ((lum < 88.0) & (contrast > 10.0)) | ((lum < 125.0) & (contrast > 26.0) & (g + 8.0 >= b) & (sat > 0.42))
    haze = (sat < 0.46) & (lum > 68.0) & (lum < 130.0) & (contrast < 18.0)
    stop = leaf & ~haze
    sky = _walk(rgb, _border_seeds(h, w), stop, 40.0, 16.0)
    sky = sky | ((yy < h * 0.16) & gold) | haze
    enclosed_gold = gold & ~sky & ~leaf
    big_gold = _keep_big(enclosed_gold, min_px=max(48, (h * w) // 80))
    rim = enclosed_gold & _dilate(leaf, 3) & ~big_gold
    ground = (yy > h * 0.80) & (contrast < 10.0) & (lum > 48.0) & (r > b)
    keep = (leaf | rim) & ~sky & ~ground & ~haze & ~big_gold
    keep = _keep_big(keep, min_px=max(16, (h * w) // 180))
    alpha = np.where(keep, 255.0, 0.0)
    # Sit the sprays into the floor. A hard crop lip is a box.
    t = np.clip((h - yy) / max(6.0, h * 0.10), 0.0, 1.0)
    alpha = np.where(yy > h * 0.90, alpha * (t * t), alpha)
    alpha = np.where(alpha < 48.0, 0.0, alpha)
    out = Image.fromarray(np.dstack([rgb.astype(np.uint8), np.clip(alpha, 0, 255).astype(np.uint8)]), "RGBA")
    out = trim_alpha(kill_haze(out, 48.0))
    _assert_not_box(out, "tree")
    return out


def cut_house(im: Image.Image, tol: float = 38.0, sit: float = 0.36, poly: tuple | None = None) -> Image.Image:
    # Cut to timber and windows. Eat cover sky, mountain, and the dusk field.
    # Do not erode: that punches holes in the wood.
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w = rgb.shape[:2]
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.30 * r + 0.50 * g + 0.20 * b
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = (mx - mn) / (mx + 1.0)
    contrast = _local_contrast(lum)
    yy = np.arange(h, dtype=np.float32)[:, None]
    gold = (lum > 115.0) & (r > 140.0) & (r + 8.0 >= g) & (r > b + 8.0)
    glow = (r > 175.0) & (lum > 120.0) & (r > b + 20.0) & (yy > h * 0.14) & (yy < h * 0.86)
    mountain = (lum > 72.0) & (lum < 130.0) & (sat < 0.52) & (contrast < 18.0) & ~glow
    if poly is None:
        poly = HUT_POLY if w < 260 else LODGE_POLY
    body = _dilate(_poly_mask((w, h), poly), 3)
    # The poly is a search region. Keep timber and glass, not the dusk field inside it.
    sky = (gold & (yy < h * 0.42)) | ((yy < h * 0.12) & (lum > 90.0))
    wood = (lum < 80.0) & (sat > 0.42) & (r > b + 8.0) & (contrast > 8.0)
    roof = (yy < h * 0.48) & (lum < 118.0) & (sat > 0.30) & (r > b + 4.0) & ~((lum > 132.0) & (r > 180.0))
    keep = body & (wood | roof | glow) & ~sky & ~mountain
    woodish = (lum < 90.0) & (sat > 0.38) & (r > b + 6.0) & ~gold
    for _ in range(4):
        keep = keep | (_dilate(keep, 3) & woodish & body & ~sky & ~mountain)
    keep = keep | (glow & body)
    keep = np.where((yy < h * 0.22) & ~glow, keep & (lum < 112.0) & ~mountain, keep)
    keep = _fill_small_holes(keep, max_hole=max(36, (h * w) // 120))
    foot = (yy > h * 0.74) & (contrast > 12.0) & _dilate(keep, 5) & ~gold & (lum < 95.0)
    keep = keep | (foot & body)
    alpha = np.where(keep, 255.0, 0.0)
    foot_y = h * (1.0 - sit)
    t = np.clip((h - yy) / max(8.0, h * sit), 0.0, 1.0)
    alpha = np.where((yy > foot_y) & ~glow, alpha * (t * t), alpha)
    alpha = np.where((alpha < 58.0) & ~glow, 0.0, alpha)
    _ = tol
    out = Image.fromarray(np.dstack([rgb.astype(np.uint8), np.clip(alpha, 0, 255).astype(np.uint8)]), "RGBA")
    out = trim_alpha(kill_haze(out, 56.0))
    _assert_not_box(out, "house")
    return out


def sit_cover_houses() -> None:
    # Read the cover. Does not touch the cover.
    cover = Image.open(ART / "cover-valley.png").convert("RGBA")
    hut = cut_house(cover.crop(HUT_BOX), 36.0, 0.36, HUT_POLY)
    hut.save(ART / "prop-hut.png")
    print("wrote prop-hut.png from cover hut", hut.size)
    lodge = cut_house(cover.crop(LODGE_BOX), 38.0, 0.38, LODGE_POLY)
    lodge.save(ART / "prop-lodge.png")
    print("wrote prop-lodge.png from cover lodge", lodge.size)
    raw = (ART / "prop-lodge.png").read_bytes()
    if b"Wanderer" in raw or b"WANDERER" in raw or b"Good Ale" in raw:
        raise SystemExit("English inn sign still on the play lodge")


def sit_cover_grove() -> None:
    # Trees, lamp, shore from the same cover. Does not touch the cover.
    cover = Image.open(ART / "cover-valley.png").convert("RGBA")
    willow = cut_tree(cover.crop(TREE_WILLOW))
    willow.save(ART / "prop-cover-tree.png")
    print("wrote prop-cover-tree.png from cover willow", willow.size)
    # Native large willow sprays. Do not sit the titled grove haze as a tree.
    grove = cut_tree(cover.crop(TREE_DENSE))
    grove.save(ART / "prop-cover-tree-b.png")
    print("wrote prop-cover-tree-b.png from cover dense willow", grove.size)
    lamp = trim_alpha(kill_haze(keep_lamp(cover.crop(LAMP_BOX)), 40.0))
    _assert_not_box(lamp, "lamp")
    lamp.save(ART / "prop-cover-lamp.png")
    print("wrote prop-cover-lamp.png from cover lamp", lamp.size)
    shore = trim_alpha(kill_haze(fade_bank(cover.crop(SHORE_BOX), 0.26), 52.0))
    _assert_not_box(shore, "shore")
    shore.save(ART / "prop-cover-shore.png")
    print("wrote prop-cover-shore.png from cover shore", shore.size)
    verge = trim_alpha(kill_haze(fade_bank(cover.crop(VERGE_BOX), 0.28), 52.0))
    _assert_not_box(verge, "verge")
    verge.save(ART / "prop-cover-verge.png")
    print("wrote prop-cover-verge.png from cover verge", verge.size)


def main() -> None:
    sit_cover_houses()
    sit_cover_grove()


if __name__ == "__main__":
    main()
