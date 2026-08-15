#!/usr/bin/env python3
"""Paint Path A play bed from the cover. Does not write cover-valley.png."""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
COVER = ROOT / "godot/assets/art/cover-valley.png"
OUT = ROOT / "godot/assets/art/bed-valley.png"

# World size (TILE 36 × 34×17).
W, H = 1224, 612
# Below 并肩山谷 and 「两部 iPhone · 同一座山」. Lodge roof stays in frame.
CROP_Y0 = 302
# Same-row dirt path, left of the pair. Never a resized plate.
PATH_LO, PATH_HI = 220, 448


def _people_mask(h: int, w: int) -> np.ndarray:
    """Tight 暖 / 松 / 点灯进谷. Leave a path gap between the coats."""
    yy, xx = np.ogrid[:h, :w]
    warm = ((xx - 516) / 66.0) ** 2 + ((yy - 548) / 162.0) ** 2 <= 1.0
    pine = ((xx - 672) / 68.0) ** 2 + ((yy - 550) / 164.0) ** 2 <= 1.0
    bag = ((xx - 482) / 24.0) ** 2 + ((yy - 556) / 46.0) ** 2 <= 1.0
    cta = ((xx - 640) / 96.0) ** 2 + ((yy - 692) / 13.0) ** 2 <= 1.0
    return warm | pine | bag | cta


def _dilate(mask: np.ndarray, radius: int = 2) -> np.ndarray:
    img = Image.fromarray((mask.astype(np.uint8) * 255), "L")
    img = img.filter(ImageFilter.MaxFilter(radius * 2 + 1))
    return np.asarray(img) > 127


def _safe_path(mask_row: np.ndarray, w: int) -> np.ndarray:
    cols = [x for x in range(PATH_LO, min(PATH_HI, w)) if not mask_row[x]]
    if len(cols) < 8:
        cols = [x for x in range(180, min(PATH_HI, w)) if not mask_row[x]]
    return np.asarray(cols, dtype=np.int32)


def _runs(xs: np.ndarray) -> list[tuple[int, int]]:
    out: list[tuple[int, int]] = []
    start = int(xs[0])
    prev = start
    for raw in xs[1:]:
        x = int(raw)
        if x == prev + 1:
            prev = x
            continue
        out.append((start, prev + 1))
        start = x
        prev = x
    out.append((start, prev + 1))
    return out


def lift_cover(rgb: np.ndarray) -> np.ndarray:
    """Same-y path seed, then NS inpaint. No resized plate, no Telea smear."""
    h, w = rgb.shape[:2]
    core = _dilate(_people_mask(h, w), 2)
    seeded = rgb.copy()
    for y in range(h):
        bad = np.flatnonzero(core[y])
        if bad.size == 0:
            continue
        safe = _safe_path(core[y], w)
        for x0, x1 in _runs(bad):
            width = x1 - x0
            src0 = x0 - width
            src1 = x0
            if src0 >= 0 and not np.any(core[y, src0:src1]):
                chunk = rgb[y, src0:src1].astype(np.float32)
            elif safe.size >= width:
                chunk = rgb[y, safe[-width:]].astype(np.float32)
            elif safe.size:
                t = np.linspace(0, safe.size - 1, width)
                chunk = rgb[y, safe[np.round(t).astype(np.int32)]].astype(np.float32)
            else:
                continue
            edge0 = max(0, x0 - 10)
            border = rgb[y, edge0:x0].astype(np.float32)
            if border.size:
                chunk = chunk - chunk.mean(axis=0) + border.mean(axis=0)
            seeded[y, x0:x1] = np.clip(chunk, 0, 255).astype(np.uint8)
    hole = (core.astype(np.uint8) * 255)
    out = cv2.inpaint(seeded, hole, 7, cv2.INPAINT_NS)
    return out


def compose(clean: np.ndarray) -> Image.Image:
    """One continuous scale. Crop title sky so play has valley, not 字."""
    band = clean[CROP_Y0:720, 0:1280]
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
