#!/usr/bin/env python3
"""One dusk language: real coat alpha, painted place beds.
Does not write cover-valley.png or bed-valley.png.
Does not recrop FAIL stickers. Does not hang torn-off props.
"""

from __future__ import annotations

import importlib.util
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
COVER = ART / "cover-valley.png"
VALLEY = ART / "bed-valley.png"

# Wilson / DST scratch. Do not open.
BAN = {
    "char-warm-walk-raw.png",
    "char-warm-walk2-raw.png",
    "char-pine-walk-raw.png",
    "char-warm-chop-raw.png",
    "char-pine-chop-raw.png",
    "char-warm-sit-raw.png",
    "char-pine-sit-raw.png",
}

IDLE = {
    "char-warm.png": "char-warm.png",
    "char-warm-walk.png": "char-warm.png",
    "char-warm-walk2.png": "char-warm.png",
    "char-warm-sit.png": "char-warm-sit.png",
    "char-warm-side.png": "char-warm-side.png",
    "char-warm-side-walk.png": "char-warm-side.png",
    "char-warm-side-walk2.png": "char-warm-side.png",
    "char-warm-back.png": "char-warm-back.png",
    "char-warm-back-walk.png": "char-warm-back.png",
    "char-warm-back-walk2.png": "char-warm-back.png",
    "char-warm-chop.png": "char-warm.png",
    "char-warm-fish.png": "char-warm.png",
    "char-warm-forge.png": "char-warm.png",
    "char-pine.png": "char-pine.png",
    "char-pine-walk.png": "char-pine.png",
    "char-pine-walk2.png": "char-pine.png",
    "char-pine-sit.png": "char-pine-sit.png",
    "char-pine-side.png": "char-pine-side.png",
    "char-pine-side-walk.png": "char-pine-side.png",
    "char-pine-side-walk2.png": "char-pine-side.png",
    "char-pine-back.png": "char-pine-back.png",
    "char-pine-back-walk.png": "char-pine-back.png",
    "char-pine-back-walk2.png": "char-pine-back.png",
    "char-pine-chop.png": "char-pine.png",
    "char-pine-fish.png": "char-pine.png",
    "char-pine-forge.png": "char-pine.png",
}


def _arr(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert("RGBA"), dtype=np.uint8).copy()


def _span(a: np.ndarray, thr: int = 12) -> tuple[int, int, int, int]:
    ys, xs = np.where(a > thr)
    if len(xs) == 0:
        return 0, 0, a.shape[1] - 1, a.shape[0] - 1
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def _opaque(a: np.ndarray, thr: int = 12) -> int:
    return int((a > thr).sum())


def cut_dusk_slab(arr: np.ndarray) -> np.ndarray:
    """Cut a flat dusk / black plate sitting beside the figure."""
    a = arr[:, :, 3]
    rgb = arr[:, :, :3].astype(np.float32)
    h, w = a.shape
    out = arr.copy()
    for x in range(w):
        mask = a[:, x] > 12
        n = int(mask.sum())
        if n < 80:
            continue
        pix = rgb[mask, x]
        std = float(pix.std())
        lum = float((pix @ np.array([0.3, 0.5, 0.2], dtype=np.float32)).mean())
        # A full-canvas flat dusk column is leftover geom. A painted coat is never this solid.
        if n > 0.88 * h and std < 20.0 and lum < 110.0:
            out[:, x, :] = 0
    return out


def flood_plate(arr: np.ndarray, tol: float = 22.0) -> np.ndarray:
    """Flood from the edges through black / dusk plate pixels."""
    # Corners already a=0: no black plate. Do not walk into a dark olive jacket.
    if arr[2, 2, 3] <= 8 and arr[2, -3, 3] <= 8 and arr[-3, 2, 3] <= 8 and arr[-3, -3, 3] <= 8:
        return arr
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.float32)
    lum = rgb @ np.array([0.3, 0.5, 0.2], dtype=np.float32)
    seed = rgb[2, 2]
    vis = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(0, w, 4):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(0, h, 4):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or vis[y, x]:
            continue
        d = float(np.linalg.norm(rgb[y, x] - seed))
        # Only the black plate. Dark olive coats must stay.
        plate = lum[y, x] < 14.0 and d < min(tol, 16.0)
        if not plate:
            continue
        vis[y, x] = True
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    out = arr.copy()
    out[vis] = 0
    return out


def keep_largest(arr: np.ndarray) -> np.ndarray:
    a = arr[:, :, 3] > 12
    try:
        from scipy import ndimage  # type: ignore

        labels, n = ndimage.label(a)
        if n <= 0:
            return np.zeros_like(arr)
        counts = np.bincount(labels.ravel())
        counts[0] = 0
        keep = labels == int(counts.argmax())
        out = np.zeros_like(arr)
        out[keep] = arr[keep]
        return out
    except Exception:
        pass
    h, w = a.shape
    seen = np.zeros((h, w), dtype=bool)
    best_mask = None
    best_n = 0
    ys, xs = np.where(a)
    for x, y in zip(xs.tolist(), ys.tolist(), strict=False):
        if seen[y, x]:
            continue
        q = deque([(x, y)])
        seen[y, x] = True
        cells: list[tuple[int, int]] = []
        while q:
            cx, cy = q.popleft()
            cells.append((cx, cy))
            for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                if nx < 0 or ny < 0 or nx >= w or ny >= h or seen[ny, nx] or not a[ny, nx]:
                    continue
                seen[ny, nx] = True
                q.append((nx, ny))
        if len(cells) > best_n:
            best_n = len(cells)
            best_mask = cells
    out = np.zeros_like(arr)
    if not best_mask:
        return out
    for x, y in best_mask:
        out[y, x] = arr[y, x]
    return out


def clean_rgb(arr: np.ndarray) -> np.ndarray:
    """a=0 is RGB 0. Soft edge keeps the coat color, not a black fringe."""
    out = arr.astype(np.float32)
    a = out[:, :, 3]
    out[a < 10] = 0.0
    soft = (a >= 10) & (a < 40)
    if soft.any():
        # pull color from nearby opaque coat pixels
        opa = a > 80
        if opa.any():
            ys, xs = np.where(opa)
            sy, sx = np.where(soft)
            # nearest opaque by a coarse downsample
            for y, x in zip(sy, sx, strict=False):
                d = (ys - y) ** 2 + (xs - x) ** 2
                i = int(d.argmin())
                out[y, x, :3] = arr[ys[i], xs[i], :3]
    a_img = Image.fromarray(np.clip(out[:, :, 3], 0, 255).astype(np.uint8), "L")
    a_img = a_img.filter(ImageFilter.GaussianBlur(0.6))
    out[:, :, 3] = np.asarray(a_img, dtype=np.float32)
    out[out[:, :, 3] < 8] = 0.0
    return np.clip(out, 0, 255).astype(np.uint8)


def _has_seam(im: Image.Image) -> bool:
    """Planted-step leftover: a hard, persistent horizontal jump. Not a side-coat fold."""
    arr = np.asarray(im.convert("RGBA"))
    a = arr[:, :, 3] > 12
    ys, _xs = np.where(a)
    if len(ys) == 0:
        return False
    y0, y1 = int(ys.min()), int(ys.max())
    mid0 = y0 + int(0.35 * (y1 - y0))
    mid1 = y0 + int(0.70 * (y1 - y0))
    lefts: list[int] = []
    for y in range(mid0, mid1):
        cols = np.where(a[y])[0]
        if len(cols) >= 8:
            lefts.append(int(cols.min()))
    if len(lefts) < 12:
        return False
    diffs = np.abs(np.diff(np.array(lefts, dtype=np.int32)))
    for i, d in enumerate(diffs.tolist()):
        if d < 16:
            continue
        before = lefts[max(0, i - 4) : i + 1]
        after = lefts[i + 1 : i + 6]
        if len(before) < 3 or len(after) < 3:
            continue
        if float(np.std(before)) < 2.5 and float(np.std(after)) < 2.5:
            return True
    return False


def cut_coat(im: Image.Image, idle: Image.Image | None) -> Image.Image:
    arr = _arr(im)
    arr = cut_dusk_slab(arr)
    before_a = int((arr[:, :, 3] == 0).sum())
    arr = flood_plate(arr)
    if int((arr[:, :, 3] == 0).sum()) > before_a + 80:
        arr = keep_largest(arr)
    if idle is not None:
        ia = np.asarray(idle.convert("RGBA"))[:, :, 3]
        oa = arr[:, :, 3]
        if _opaque(oa) > 1.55 * max(1, _opaque(ia)):
            return idle.convert("RGBA")
        ix0, _, ix1, _ = _span(ia)
        x0, _, x1, _ = _span(oa)
        if (x1 - x0) > 1.70 * max(1, ix1 - ix0):
            return idle.convert("RGBA")
    return Image.fromarray(clean_rgb(arr), "RGBA")


def assert_coat(im: Image.Image, name: str) -> None:
    arr = np.asarray(im.convert("RGBA"), dtype=np.uint8)
    if arr[2, 2, 3] > 8 or arr[2, -3, 3] > 8:
        raise SystemExit(f"{name} still has a plate in the corner")
    leftover = np.any(arr[:, :, :3] > 0, axis=2) & (arr[:, :, 3] == 0)
    if leftover.any():
        raise SystemExit(f"{name} has dusk RGB in a=0 pixels")
    if (arr[:, :, 3] == 0).sum() < 80:
        raise SystemExit(f"{name} needs real a=0")
    mag = (arr[:, :, 0] > 200) & (arr[:, :, 1] < 80) & (arr[:, :, 2] > 200) & (arr[:, :, 3] > 0)
    if mag.any():
        raise SystemExit(f"{name} still has magenta sit pixels")


def _soft_paste(dst: np.ndarray, src: Image.Image, xy: tuple[int, int], mask: np.ndarray) -> None:
    piece = np.asarray(src.convert("RGB"), dtype=np.float32)
    x, y = xy
    h, w = mask.shape
    roi = dst[y : y + h, x : x + w]
    mh = min(roi.shape[0], piece.shape[0], h)
    mw = min(roi.shape[1], piece.shape[1], w)
    m = mask[:mh, :mw, None]
    dst[y : y + mh, x : x + mw] = roi[:mh, :mw] * (1.0 - m) + piece[:mh, :mw] * m


def _west(arr: np.ndarray, lo: float = 1.08, hi: float = 0.84) -> np.ndarray:
    _h, w = arr.shape[:2]
    t = np.linspace(lo, hi, w, dtype=np.float32)[None, :, None]
    warm = np.array([1.05, 0.94, 0.78], dtype=np.float32)
    return np.clip(arr * t * warm, 0, 255)


def _plank(size: tuple[int, int], box: tuple[int, int, int, int], horizontal: bool = True) -> Image.Image:
    cabin = Image.open(ART / "prop-cabin.png").convert("RGB")
    crop = cabin.crop(box)
    if horizontal:
        crop = crop.rotate(90, expand=True)
    return crop.resize(size, Image.Resampling.LANCZOS)


def paint_kitchen_bed() -> Image.Image:
    """One painted kitchen from valley dirt + cabin timber. Never reads the cover."""
    if not VALLEY.exists():
        raise SystemExit("bed-valley.png missing; read-only lock")
    w, h = 576, 324
    valley = Image.open(VALLEY).convert("RGB")
    dirt = valley.crop((420, 280, 860, 580)).resize((w, h), Image.Resampling.LANCZOS)
    arr = np.asarray(dirt, dtype=np.float32)
    # Cabin wall boards only. Do not sit the whole cabin as a sticker house.
    wall = _plank((w, 200), (280, 300, 420, 420), True)
    yy = np.linspace(0, 1, 200, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    wall_m = np.clip(1.0 - (yy - 0.70) / 0.30, 0, 1) * (0.50 + 0.50 * np.clip(np.minimum(xx, 1.0 - xx) / 0.08, 0, 1))
    _soft_paste(arr, wall, (0, 0), wall_m * 0.82)
    glow = valley.crop((90, 200, 170, 270)).resize((88, 64), Image.Resampling.LANCZOS)
    gy = np.linspace(0, 1, 64, dtype=np.float32)[:, None]
    gx = np.linspace(0, 1, 88, dtype=np.float32)[None, :]
    gm = np.clip(1.0 - ((gx - 0.5) ** 2 / 0.20 + (gy - 0.5) ** 2 / 0.24), 0, 1)
    _soft_paste(arr, glow, (72, 48), gm * 0.62)
    _soft_paste(arr, glow, (390, 54), gm * 0.48)
    hearth = _plank((160, 100), (280, 300, 420, 420), True)
    hy = np.linspace(0, 1, 100, dtype=np.float32)[:, None]
    hx = np.linspace(0, 1, 160, dtype=np.float32)[None, :]
    hm = np.clip(1.0 - ((hx - 0.5) ** 2 / 0.30 + (hy - 0.60) ** 2 / 0.24), 0, 1)
    _soft_paste(arr, hearth, (44, 176), hm * 0.78)
    _soft_paste(arr, glow.resize((64, 48), Image.Resampling.LANCZOS), (90, 196), gm[:48, :64] * 0.55)
    arr = _west(arr, 1.10, 0.84)
    return Image.fromarray(arr.astype(np.uint8), "RGB")


def paint_mine_bed() -> Image.Image:
    """One painted mine from valley dusk rock + timber lip. Never reads the cover."""
    if not VALLEY.exists():
        raise SystemExit("bed-valley.png missing; read-only lock")
    w, h = 576, 324
    valley = Image.open(VALLEY).convert("RGB")
    # Far ridge and dirt. Not the title plate. Not the two houses.
    rock = valley.crop((360, 0, 980, 220)).resize((w, h), Image.Resampling.LANCZOS)
    arr = np.asarray(rock, dtype=np.float32) * np.array([0.72, 0.64, 0.48], dtype=np.float32)
    dirt = valley.crop((420, 300, 820, 560)).resize((w, 170), Image.Resampling.LANCZOS)
    fy = np.linspace(0, 1, 170, dtype=np.float32)[:, None]
    fx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    fm = np.clip(fy / 0.32, 0, 1) * (0.68 + 0.32 * np.clip(np.minimum(fx, 1.0 - fx) / 0.10, 0, 1))
    _soft_paste(arr, dirt, (0, h - 170), fm * 0.88)
    post = _plank((34, 250), (280, 300, 360, 420), False)
    py = np.linspace(0, 1, 250, dtype=np.float32)[:, None]
    px = np.linspace(0, 1, 34, dtype=np.float32)[None, :]
    pm = np.clip(1.0 - np.abs(px - 0.5) * 2.1, 0, 1) * np.clip(1.0 - (py - 0.88) / 0.12, 0, 1)
    _soft_paste(arr, post, (26, 36), pm * 0.72)
    _soft_paste(arr, post, (516, 40), pm * 0.68)
    beam = _plank((w - 48, 26), (280, 300, 420, 360), True)
    by = np.linspace(0, 1, 26, dtype=np.float32)[:, None]
    bx = np.linspace(0, 1, w - 48, dtype=np.float32)[None, :]
    bm = np.clip(1.0 - np.abs(by - 0.5) * 2.0, 0, 1) * np.clip(np.minimum(bx, 1.0 - bx) / 0.06, 0, 1)
    _soft_paste(arr, beam, (24, 30), bm * 0.66)
    glow = valley.crop((90, 200, 170, 270)).resize((72, 56), Image.Resampling.LANCZOS)
    ly = np.linspace(0, 1, 56, dtype=np.float32)[:, None]
    lx = np.linspace(0, 1, 72, dtype=np.float32)[None, :]
    lm = np.clip(1.0 - ((lx - 0.5) ** 2 + (ly - 0.5) ** 2) / 0.30, 0, 1)
    _soft_paste(arr, glow, (68, 148), lm * 0.50)
    arr = _west(arr, 1.10, 0.76)
    arr *= np.array([1.04, 0.90, 0.68], dtype=np.float32)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def paint_wild_bed() -> Image.Image:
    """One meadow crop from the valley bed. Not a five-piece collage. Does not write the valley."""
    if not VALLEY.exists():
        raise SystemExit("bed-valley.png missing; read-only lock")
    valley = Image.open(VALLEY).convert("RGB")
    # Path and grass between the two houses. Leave the houses on the valley bed.
    meadow = valley.crop((400, 220, 800, 580)).resize((864, 576), Image.Resampling.LANCZOS)
    arr = np.asarray(meadow, dtype=np.float32)
    arr = _west(arr, 1.06, 0.88)
    return Image.fromarray(arr.astype(np.uint8), "RGB")


def _assert_not_title(im: Image.Image, name: str) -> None:
    cover = Image.open(COVER).convert("RGB").resize(im.size, Image.Resampling.LANCZOS)
    d = float(np.abs(np.asarray(im.convert("RGB")).astype(np.int16) - np.asarray(cover).astype(np.int16)).mean())
    if d < 32.0:
        raise SystemExit(f"{name} looks like the title plate ({d:.1f})")


def save_bed(im: Image.Image, name: str) -> None:
    if name in {"cover-valley.png", "bed-valley.png"}:
        raise SystemExit(f"refuses to write {name}")
    _assert_not_title(im, name)
    dest = ART / name
    rgb = im.convert("RGB")
    rgb.save(dest, "PNG")
    print(f"wrote {dest.name} {rgb.size} RGB")


def save_coat(im: Image.Image, name: str) -> None:
    dest = ART / name
    im.save(dest, "PNG")
    print(f"wrote {dest.name} {im.size} {im.mode}")


def _is_blob(im: Image.Image, idle: Image.Image) -> bool:
    arr = np.asarray(im.convert("RGBA"))
    a = arr[:, :, 3]
    ia = np.asarray(idle.convert("RGBA"))[:, :, 3]
    if _opaque(a) > 1.45 * max(1, _opaque(ia)):
        return True
    x0, _, x1, _ = _span(a)
    ix0, _, ix1, _ = _span(ia)
    if (x1 - x0) > 1.58 * max(1, ix1 - ix0):
        return True
    if _has_seam(im):
        return True
    # A leftover dusk plate sits on the canvas edge, not inside the olive jacket.
    rgb = arr[:, :, :3].astype(np.float32)
    h, w = a.shape
    for x in list(range(0, 18)) + list(range(w - 18, w)):
        mask = a[:, x] > 12
        n = int(mask.sum())
        if n < 180:
            continue
        std = float(rgb[mask, x].std())
        lum = float((rgb[mask, x] @ np.array([0.3, 0.5, 0.2], dtype=np.float32)).mean())
        if n > 0.80 * h and std < 16.0 and lum < 100.0:
            return True
    return False


def paint_coats() -> None:
    idle_names = sorted({src for src in IDLE.values()})
    rest = sorted(name for name in IDLE if name not in idle_names)
    idle_cache: dict[str, Image.Image] = {}
    for name in idle_names + rest:
        if name in BAN:
            raise SystemExit(f"banned Wilson sheet {name}")
        src = ART / name
        if not src.exists():
            continue
        idle_name = IDLE[name]
        if name == idle_name:
            out = cut_coat(Image.open(src), None)
            assert_coat(out, name)
            idle_cache[name] = out
            save_coat(out, name)
            continue
        src_im = Image.open(src)
        idle_im = idle_cache[idle_name]
        # A dusk-slab / seamed walk is a blob. Do not plant a step. Copy idle.
        if _is_blob(src_im, idle_im):
            out = idle_im.copy()
            print(f"blob {name} -> {idle_name}")
        else:
            out = cut_coat(src_im, idle_im)
            if _is_blob(out, idle_im):
                out = idle_im.copy()
                print(f"blob {name} -> {idle_name}")
        assert_coat(out, name)
        save_coat(out, name)


def main() -> None:
    if not COVER.exists():
        raise SystemExit("cover-valley.png missing; read-only lock")
    if not VALLEY.exists():
        raise SystemExit("bed-valley.png missing; read-only lock")
    before = VALLEY.stat().st_size
    paint_coats()
    save_bed(paint_kitchen_bed(), "bed-kitchen.png")
    save_bed(paint_mine_bed(), "bed-mine.png")
    save_bed(paint_wild_bed(), "bed-wild.png")
    if VALLEY.stat().st_size != before:
        raise SystemExit("bed-valley.png was touched")
    print("one paint")


if __name__ == "__main__":
    main()
