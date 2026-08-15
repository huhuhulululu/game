#!/usr/bin/env python3
"""Paint Path A play bed from the cover. Does not write cover-valley.png."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
COVER = ROOT / "godot/assets/art/cover-valley.png"
OUT = ROOT / "godot/assets/art/bed-valley.png"

# World size (TILE 36 × 34×17).
W, H = 1224, 612


def _people_mask(h: int, w: int) -> np.ndarray:
    yy, xx = np.ogrid[:h, :w]
    warm = ((xx - 528) / 95.0) ** 2 + ((yy - 530) / 200.0) ** 2 <= 1.0
    pine = ((xx - 668) / 100.0) ** 2 + ((yy - 530) / 210.0) ** 2 <= 1.0
    pair = (xx >= 460) & (xx <= 770) & (yy >= 370) & (yy <= 718)
    return warm | pine | pair


def lift_cover(rgb: np.ndarray) -> np.ndarray:
    """One dirt plate over baked 暖/松 and 点灯进谷. Do not tile scraps."""
    out = rgb.copy()
    mask = _people_mask(*rgb.shape[:2])
    ys, xs = np.where(mask)
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    dirt = Image.fromarray(rgb[500:720, 190:450], "RGB").resize((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
    plate = np.asarray(dirt)
    local = mask[y0:y1, x0:x1]
    hole = out[y0:y1, x0:x1]
    hole[local] = plate[local]
    out[y0:y1, x0:x1] = hole
    ring = Image.fromarray((mask.astype(np.uint8) * 255), "L").filter(ImageFilter.GaussianBlur(8))
    alpha = np.asarray(ring).astype(np.float32) / 255.0
    edge = (alpha > 0.05) & (alpha < 0.88)
    blur = np.asarray(Image.fromarray(out).filter(ImageFilter.GaussianBlur(3)))
    t = np.clip((alpha - 0.05) / 0.83, 0, 1)[:, :, None]
    mixed = (out.astype(np.float32) * (1.0 - t) + blur.astype(np.float32) * t).astype(np.uint8)
    out = np.where(edge[:, :, None], mixed, out)
    return out


def compose(clean: np.ndarray) -> Image.Image:
    """One continuous scale. Crop the title sky so play has valley, not 字."""
    band = clean[218:720, 0:1280]
    bed = Image.fromarray(band, "RGB").resize((W, H), Image.Resampling.LANCZOS)
    return bed


def main() -> None:
    cover = Image.open(COVER)
    if cover.size != (1280, 720):
        raise SystemExit(f"cover must stay 1280x720, got {cover.size}")
    rgb = np.asarray(cover.convert("RGB"))
    bed = compose(lift_cover(rgb))
    if bed.size != (W, H) or bed.mode != "RGB":
        raise SystemExit(f"bed must be {W}x{H} RGB, got {bed.size} {bed.mode}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    bed.save(OUT, "PNG")
    print(f"wrote {OUT.relative_to(ROOT)} {bed.size} {bed.mode}")
    print("Does not touch the cover")


if __name__ == "__main__":
    main()
