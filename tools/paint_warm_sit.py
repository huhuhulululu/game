#!/usr/bin/env python3
"""Paint a warm sit from the idle tan coat.
Same face, same coat, same dusk. Magenta then cut to a=0.
Does not write cover-valley.png, bed-valley.png, or any pine sheet.
A blob, smear, or standing squash keeps the current painted sit — do not ship it.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
IDLE_NAME = "char-warm.png"
SIT_NAME = "char-warm-sit.png"
PINE_SIT = "char-pine-sit.png"
VALLEY = ART / "bed-valley.png"
COVER = ART / "cover-valley.png"

HEAD = (124, 48, 196, 128)
HEAD_SHIFT = 108
CX = 160.0
FOOT = 471


def _arr(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert("RGBA"), dtype=np.uint8).copy()


def _smooth(t: np.ndarray) -> np.ndarray:
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def _sample(arr: np.ndarray, y: np.ndarray, x: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    x0 = np.floor(x).astype(np.int32)
    y0 = np.floor(y).astype(np.int32)
    x1 = np.clip(x0 + 1, 0, w - 1)
    y1 = np.clip(y0 + 1, 0, h - 1)
    x0 = np.clip(x0, 0, w - 1)
    y0 = np.clip(y0, 0, h - 1)
    fx = (x - x0.astype(np.float32))[..., None]
    fy = (y - y0.astype(np.float32))[..., None]
    src = arr.astype(np.float32)
    a00 = src[y0, x0]
    a01 = src[y0, x1]
    a10 = src[y1, x0]
    a11 = src[y1, x1]
    return a00 * (1.0 - fx) * (1.0 - fy) + a01 * fx * (1.0 - fy) + a10 * (1.0 - fx) * fy + a11 * fx * fy


def _key_magenta(arr: np.ndarray) -> np.ndarray:
    out = arr.copy()
    r, g, b, a = out[:, :, 0], out[:, :, 1], out[:, :, 2], out[:, :, 3]
    mag = (r > 200) & (g < 80) & (b > 200)
    out[mag | (a < 12)] = 0
    leftover = np.any(out[:, :, :3] > 0, axis=2) & (out[:, :, 3] == 0)
    out[leftover] = 0
    return out


def _piecewise_y(ys: np.ndarray, dest: list[float], src: list[float]) -> np.ndarray:
    out = np.full_like(ys, src[-1])
    for i in range(len(dest) - 1):
        d0, d1 = dest[i], dest[i + 1]
        s0, s1 = src[i], src[i + 1]
        t = (ys - d0) / max(1e-6, d1 - d0)
        seg = s0 + _smooth(t) * (s1 - s0)
        out = np.where((ys >= d0) & (ys <= d1), seg, out)
    return out


def paint_sit(idle: np.ndarray) -> np.ndarray:
    """Fold the idle coat toward a sit. Head is a 1:1 copy. No hard center split."""
    h, w = idle.shape[:2]
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    # One continuous vertical remap. No second paste. No hole-fill.
    # X stays idle — a lap widen smeared the coat.
    src_y = _piecewise_y(ys, [150.0, 236.0, 380.0, 471.0], [42.0, 128.0, 340.0, 471.0])
    src_y = np.where(ys < 150.0, -8.0, src_y)
    src_x = xs.copy()
    out = _sample(idle, src_y, src_x)
    x0, y0, x1, y1 = HEAD
    dy = HEAD_SHIFT
    out[y0 + dy : y1 + dy, x0:x1] = idle[y0:y1, x0:x1].astype(np.float32)
    empty = (out[:, :, 3] < 10.0) | (ys < 140.0)
    out[empty] = np.array([255.0, 0.0, 255.0, 255.0], dtype=np.float32)
    cut = _key_magenta(np.clip(out, 0, 255).astype(np.uint8))
    cut[472:] = 0
    return cut


def _span(a: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.where(a > 12)
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def _width(arr: np.ndarray, y: int) -> int:
    cols = np.where(arr[y] > 12)[0]
    return int(cols.max() - cols.min() + 1) if len(cols) else 0


def _head_delta(idle: np.ndarray, sit: np.ndarray) -> float:
    x0, y0, x1, y1 = HEAD
    ia = idle[y0:y1, x0:x1]
    sa = sit[y0 + HEAD_SHIFT : y1 + HEAD_SHIFT, x0:x1]
    keep = (ia[:, :, 3] > 40) & (sa[:, :, 3] > 40)
    if int(keep.sum()) < 80:
        return 99.0
    d = np.abs(ia[:, :, :3].astype(np.int16) - sa[:, :, :3].astype(np.int16))
    return float(d[keep].mean())


def _is_blob(idle: np.ndarray, sit: np.ndarray) -> bool:
    ia = idle[:, :, 3]
    sa = sit[:, :, 3]
    if int((sa > 12).sum()) > 1.35 * max(1, int((ia > 12).sum())):
        return True
    ix0, _, ix1, _ = _span(ia)
    x0, y0, x1, y1 = _span(sa)
    if (x1 - x0) > 1.22 * max(1, ix1 - ix0):
        return True
    if (y1 - y0) < 180:
        return True
    a = sa > 12
    lefts: list[int] = []
    for y in range(260, 400):
        cols = np.where(a[y])[0]
        if len(cols) >= 8:
            lefts.append(int(cols.min()))
    if len(lefts) >= 12:
        diffs = np.abs(np.diff(np.array(lefts, dtype=np.int32)))
        if int(diffs.max()) >= 14:
            return True
    return False


def _width_profile(alpha: np.ndarray, n: int = 64) -> np.ndarray:
    x0, y0, x1, y1 = _span(alpha)
    prof = []
    for y in range(y0, y1 + 1):
        prof.append(float(_width(alpha, y)))
    src = np.array(prof, dtype=np.float64)
    t = np.linspace(0.0, 1.0, len(src))
    return np.interp(np.linspace(0.0, 1.0, n), t, src)


def _profile_corr(a: np.ndarray, b: np.ndarray) -> float:
    aa = (a - a.mean()) / (a.std() + 1e-6)
    bb = (b - b.mean()) / (b.std() + 1e-6)
    return float((aa * bb).mean())


def _is_standing_squash(idle: np.ndarray, sit: np.ndarray) -> bool:
    """A vertical squash of idle still has the standing width profile."""
    return _profile_corr(_width_profile(idle[:, :, 3]), _width_profile(sit[:, :, 3])) > 0.80


def _is_sit(idle: np.ndarray, sit: np.ndarray) -> bool:
    """A real sit: same face, head lower, lap is a seat. Not a standing squash."""
    if np.array_equal(idle, sit):
        return False
    _, iy0, _, _ = _span(idle[:, :, 3])
    _x0, sy0, _x1, sy1 = _span(sit[:, :, 3])
    if sy0 < iy0 + 70:
        return False
    if _head_delta(idle, sit) > 3.5:
        return False
    if _is_standing_squash(idle, sit):
        return False
    fig_h = max(1, sy1 - sy0)
    w_coat = _width(sit[:, :, 3], sy0 + int(fig_h * 0.35))
    w_lap = _width(sit[:, :, 3], sy0 + int(fig_h * 0.70))
    w_ankle = _width(sit[:, :, 3], min(470, sy1 - 8))
    if w_lap < 100 or w_lap < w_ankle + 24:
        return False
    if w_lap < w_coat * 0.92:
        return False
    return True


def _assert_coat(arr: np.ndarray, name: str) -> None:
    if arr[2, 2, 3] > 8 or arr[2, -3, 3] > 8:
        raise SystemExit(f"{name} still has a plate in the corner")
    leftover = np.any(arr[:, :, :3] > 0, axis=2) & (arr[:, :, 3] == 0)
    if leftover.any():
        raise SystemExit(f"{name} has dusk RGB in a=0 pixels")
    mag = (arr[:, :, 0] > 200) & (arr[:, :, 1] < 80) & (arr[:, :, 2] > 200) & (arr[:, :, 3] > 0)
    if mag.any():
        raise SystemExit(f"{name} still has magenta sit pixels")


def save_or_keep(sit: np.ndarray, idle: np.ndarray, old: np.ndarray, name: str) -> bool:
    if _head_delta(idle, sit) > 3.5:
        print(f"different face {name} — keep current sit")
        Image.fromarray(old, "RGBA").save(ART / name, "PNG")
        return False
    if _is_blob(idle, sit):
        print(f"blob {name} — keep current sit")
        Image.fromarray(old, "RGBA").save(ART / name, "PNG")
        return False
    if not _is_sit(idle, sit):
        print(f"standing stamp {name} — keep current sit")
        Image.fromarray(old, "RGBA").save(ART / name, "PNG")
        return False
    _assert_coat(sit, name)
    Image.fromarray(sit, "RGBA").save(ART / name, "PNG")
    print(f"wrote {name} sit head_d={_head_delta(idle, sit):.2f}")
    return True


def main() -> None:
    if not COVER.exists() or not VALLEY.exists():
        raise SystemExit("cover / valley missing; read-only lock")
    before = VALLEY.stat().st_size
    pine_before = (ART / PINE_SIT).stat().st_size
    idle = _arr(Image.open(ART / IDLE_NAME))
    old = _arr(Image.open(ART / SIT_NAME))
    painted = paint_sit(idle)
    ok = save_or_keep(painted, idle, old, SIT_NAME)
    if (ART / PINE_SIT).stat().st_size != pine_before:
        raise SystemExit("pine sit was touched")
    if VALLEY.stat().st_size != before:
        raise SystemExit("bed-valley.png was touched")
    if not ok:
        print("kept current sit")
        return
    print("warm sit")


if __name__ == "__main__":
    main()
