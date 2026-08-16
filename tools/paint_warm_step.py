#!/usr/bin/env python3
"""Paint a four-beat warm walk from the idle tan coat.
Same face, same coat, same dusk. Magenta then cut to a=0.
Does not write cover-valley.png, bed-valley.png, or any pine sheet.
A blob or a different face falls back to idle — do not ship it.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
IDLE_NAME = "char-warm.png"
WALK_NAME = "char-warm-walk.png"
WALK2_NAME = "char-warm-walk2.png"
PINE_WALK = "char-pine-walk.png"
VALLEY = ART / "bed-valley.png"
COVER = ART / "cover-valley.png"

HEAD = (124, 48, 196, 128)
HIP = 348
FADE0 = 248
FOOT = 471
CX = 160.0


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


def paint_step(idle: np.ndarray, left_forward: bool) -> np.ndarray:
    """Move each foot with a soft mask. No hard center split. Head stays idle."""
    h, w = idle.shape[:2]
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    rise = _smooth((ys - FADE0) / float(FOOT - FADE0))
    rise = np.where(ys < FADE0, 0.0, rise)
    # Foot centers from the idle gap (y=456+).
    lx, ly = 134.0, 464.0
    rx, ry = 176.0, 464.0
    wl = np.exp(-(((xs - lx) / 22.0) ** 2 + ((ys - ly) / 36.0) ** 2))
    wr = np.exp(-(((xs - rx) / 22.0) ** 2 + ((ys - ry) / 36.0) ** 2))
    wl *= rise
    wr *= rise
    if left_forward:
        dx = wl * (-18.0) + wr * (4.0)
        dy = wl * (0.0) + wr * (-8.0)
        sway = -1.6 * rise
    else:
        dx = wr * (18.0) + wl * (-4.0)
        dy = wr * (0.0) + wl * (-8.0)
        sway = 1.6 * rise
    src_x = xs - dx - sway
    src_y = ys - dy
    out = _sample(idle, src_y, src_x)
    # Coat and hip stay the idle paint if the warp punched a hole.
    need = (out[:, :, 3] < 16.0) & (idle[:, :, 3] > 80) & (ys < float(HIP + 12))
    out[need] = idle[need].astype(np.float32)
    x0, y0, x1, y1 = HEAD
    out[y0:y1, x0:x1] = idle[y0:y1, x0:x1].astype(np.float32)
    empty = out[:, :, 3] < 10.0
    out[empty] = np.array([255.0, 0.0, 255.0, 255.0], dtype=np.float32)
    return _key_magenta(np.clip(out, 0, 255).astype(np.uint8))


def _span(a: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.where(a > 12)
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def _head_delta(idle: np.ndarray, walk: np.ndarray) -> float:
    x0, y0, x1, y1 = HEAD
    ia = idle[y0:y1, x0:x1]
    wa = walk[y0:y1, x0:x1]
    keep = (ia[:, :, 3] > 40) & (wa[:, :, 3] > 40)
    if int(keep.sum()) < 80:
        return 99.0
    d = np.abs(ia[:, :, :3].astype(np.int16) - wa[:, :, :3].astype(np.int16))
    return float(d[keep].mean())


def _is_blob(idle: np.ndarray, walk: np.ndarray) -> bool:
    ia = idle[:, :, 3]
    wa = walk[:, :, 3]
    if int((wa > 12).sum()) > 1.45 * max(1, int((ia > 12).sum())):
        return True
    ix0, _, ix1, _ = _span(ia)
    x0, _, x1, _ = _span(wa)
    if (x1 - x0) > 1.50 * max(1, ix1 - ix0):
        return True
    # Hard horizontal jump in the mid coat = planted seam.
    a = wa > 12
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


def _is_step(idle: np.ndarray, walk: np.ndarray) -> bool:
    if np.array_equal(idle, walk):
        return False
    foot = (slice(420, 472), slice(80, 250))
    d = np.abs(idle[foot][:, :, 3].astype(np.int16) - walk[foot][:, :, 3].astype(np.int16))
    return int((d > 18).sum()) >= 40


def _assert_coat(arr: np.ndarray, name: str) -> None:
    if arr[2, 2, 3] > 8 or arr[2, -3, 3] > 8:
        raise SystemExit(f"{name} still has a plate in the corner")
    leftover = np.any(arr[:, :, :3] > 0, axis=2) & (arr[:, :, 3] == 0)
    if leftover.any():
        raise SystemExit(f"{name} has dusk RGB in a=0 pixels")
    mag = (arr[:, :, 0] > 200) & (arr[:, :, 1] < 80) & (arr[:, :, 2] > 200) & (arr[:, :, 3] > 0)
    if mag.any():
        raise SystemExit(f"{name} still has magenta sit pixels")


def save_or_idle(walk: np.ndarray, idle: np.ndarray, name: str) -> bool:
    if _head_delta(idle, walk) > 3.5:
        print(f"different face {name} — keep idle")
        Image.fromarray(idle, "RGBA").save(ART / name, "PNG")
        return False
    if _is_blob(idle, walk):
        print(f"blob {name} — keep idle")
        Image.fromarray(idle, "RGBA").save(ART / name, "PNG")
        return False
    if not _is_step(idle, walk):
        print(f"sliding stamp {name} — keep idle")
        Image.fromarray(idle, "RGBA").save(ART / name, "PNG")
        return False
    _assert_coat(walk, name)
    Image.fromarray(walk, "RGBA").save(ART / name, "PNG")
    print(f"wrote {name} step head_d={_head_delta(idle, walk):.2f}")
    return True


def main() -> None:
    if not COVER.exists() or not VALLEY.exists():
        raise SystemExit("cover / valley missing; read-only lock")
    before = VALLEY.stat().st_size
    pine_before = (ART / PINE_WALK).stat().st_size
    idle = _arr(Image.open(ART / IDLE_NAME))
    a = paint_step(idle, True)
    b = paint_step(idle, False)
    ok_a = save_or_idle(a, idle, WALK_NAME)
    ok_b = save_or_idle(b, idle, WALK2_NAME)
    if (ART / PINE_WALK).stat().st_size != pine_before:
        raise SystemExit("pine walk was touched")
    if VALLEY.stat().st_size != before:
        raise SystemExit("bed-valley.png was touched")
    if not (ok_a and ok_b):
        raise SystemExit("warm step did not match the idle — not shipped")
    print("warm step")


if __name__ == "__main__":
    main()
