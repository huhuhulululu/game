#!/usr/bin/env python3
"""Paint Path A play bed from the cover. Does not write cover-valley.png."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
COVER = ROOT / "godot/assets/art/cover-valley.png"
FILL = ROOT / "tools/ref/valley-path-fill.png"
OUT = ROOT / "godot/assets/art/bed-valley.png"

# World size (TILE 36 × 34×17).
W, H = 1224, 612
# Below 并肩山谷 and 「两部 iPhone · 同一座山」. Lodge roof stays in frame.
CROP_Y0 = 302
# Same-row dirt / grass used to grade the corridor. Never a resized plate.
PATH_LO, PATH_HI = 220, 360
BANK_LO, BANK_HI = 824, 940
# One landscape hole. Not two people ellipses. Left of the coats, right of the bag.
CORRIDOR_X0, CORRIDOR_X1 = 340, 868
CORRIDOR_Y0 = 344


def _smoothstep(t: np.ndarray) -> np.ndarray:
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def lift_cover(rgb: np.ndarray, fill: np.ndarray) -> np.ndarray:
    """Hard-replace the pair with dusk path/grass. Feather only into real land."""
    out = rgb.astype(np.float32)
    src = fill.astype(np.float32)
    h, w = rgb.shape[:2]
    x0, x1 = CORRIDOR_X0, CORRIDOR_X1
    y0, y1 = CORRIDOR_Y0, h
    roi = src[y0:y1, x0:x1]
    ring = np.concatenate(
        [
            rgb[y0:y1, PATH_LO:PATH_HI].reshape(-1, 3),
            rgb[y0:y1, BANK_LO:BANK_HI].reshape(-1, 3),
            rgb[max(0, y0 - 16) : y0, x0:x1].reshape(-1, 3),
        ],
        axis=0,
    )
    edge = np.concatenate(
        [
            roi[:, :16].reshape(-1, 3),
            roi[:, -16:].reshape(-1, 3),
            roi[:12].reshape(-1, 3),
        ],
        axis=0,
    )
    roi = np.clip(roi + (np.median(ring, axis=0) - np.median(edge, axis=0)), 0, 255)
    placed = out.copy()
    placed[y0:y1, x0:x1] = roi
    yy, xx = np.ogrid[y0:y1, x0:x1]
    alpha = np.ones((y1 - y0, x1 - x0), np.float32)
    alpha *= _smoothstep((xx - x0) / 18.0)
    alpha *= _smoothstep((x1 - 1 - xx) / 18.0)
    alpha *= _smoothstep((yy - y0) / 22.0)
    alpha = alpha[..., None]
    out[y0:y1, x0:x1] = placed[y0:y1, x0:x1] * alpha + rgb[y0:y1, x0:x1] * (1.0 - alpha)
    return np.clip(out, 0, 255).astype(np.uint8)


def compose(clean: np.ndarray) -> Image.Image:
    """One continuous scale. Crop title sky so play has valley, not 字."""
    band = clean[CROP_Y0:720, 0:1280]
    bed = Image.fromarray(band, "RGB").resize((W, H), Image.Resampling.LANCZOS)
    return bed


def main() -> None:
    cover = Image.open(COVER)
    if cover.size != (1280, 720):
        raise SystemExit(f"cover must stay 1280x720, got {cover.size}")
    fill = Image.open(FILL)
    if fill.size != (1280, 720) or fill.mode != "RGB":
        raise SystemExit(f"path fill must be 1280x720 RGB, got {fill.size} {fill.mode}")
    rgb = np.asarray(cover.convert("RGB"))
    plate = np.asarray(fill.convert("RGB"))
    bed = compose(lift_cover(rgb, plate))
    if bed.size != (W, H) or bed.mode != "RGB":
        raise SystemExit(f"bed must be {W}x{H} RGB, got {bed.size} {bed.mode}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    bed.save(OUT, "PNG")
    print(f"wrote {OUT.relative_to(ROOT)} {bed.size} {bed.mode}")
    print("Does not touch the cover")


if __name__ == "__main__":
    main()
