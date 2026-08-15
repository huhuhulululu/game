#!/usr/bin/env python3
"""Lock walk / chop / sit to the same head, collar and feet. Do not touch idle, fish or forge."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "art"
FOOT_Y = 634
BOX_H = 640


def alpha(im: Image.Image) -> np.ndarray:
    return np.array(im.convert("RGBA").split()[-1])


def body_rows(mask: np.ndarray) -> tuple[int, int]:
    h, w = mask.shape
    c0, c1 = int(w * 0.30), int(w * 0.70)
    col = mask[:, c0:c1]
    rows = np.where(col.sum(axis=1) > 6)[0]
    if len(rows) < 6:
        rows = np.where(mask.sum(axis=1) > 3)[0]
    return int(rows[0]), int(rows[-1])


def head_cx(a: np.ndarray, y0: int, y1: int) -> float:
    h, w = a.shape
    band0 = y0
    band1 = max(band0 + 4, y0 + int((y1 - y0) * 0.18))
    weights = a[band0:band1].sum(axis=0).astype(np.float64)
    xs = np.arange(w, dtype=np.float64)
    if weights.sum() < 8:
        return w / 2
    return float((xs * weights).sum() / weights.sum())


def metrics(im: Image.Image) -> dict[str, float]:
    a = alpha(im)
    mask = a > 18
    h, w = mask.shape
    y0, y1 = body_rows(mask)
    return {
        "y0": y0,
        "y1": y1,
        "h": y1 - y0 + 1,
        "hx": head_cx(a, y0, y1),
        "w": w,
    }


def align_one(path: Path, target_h: int, min_w: int) -> dict[str, float]:
    im = Image.open(path).convert("RGBA")
    bbox = im.getbbox()
    if not bbox:
        return {}
    cropped = im.crop(bbox)
    m = metrics(cropped)
    scale = target_h / max(1.0, m["h"])
    nw = max(1, round(cropped.width * scale))
    nh = max(1, round(cropped.height * scale))
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    sm = metrics(scaled)
    box_w = max(min_w, int(sm["w"] + 24))
    box_w = min(640, box_w if box_w % 2 == 0 else box_w + 1)
    dx = int(round(box_w / 2 - sm["hx"]))
    dy = int(FOOT_Y - sm["y1"])
    if sm["y0"] + dy < 2:
        room = max(8, FOOT_Y - 2)
        scale *= room / max(1, sm["y1"] - dy)
        nw = max(1, round(cropped.width * scale))
        nh = max(1, round(cropped.height * scale))
        scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        sm = metrics(scaled)
        box_w = max(min_w, int(sm["w"] + 24))
        box_w = min(640, box_w if box_w % 2 == 0 else box_w + 1)
        dx = int(round(box_w / 2 - sm["hx"]))
        dy = int(FOOT_Y - sm["y1"])
    canvas = Image.new("RGBA", (box_w, BOX_H), (0, 0, 0, 0))
    canvas.alpha_composite(scaled, (dx, dy))
    placed = metrics(canvas)
    lift = int(FOOT_Y - placed["y1"])
    if lift:
        shifted = Image.new("RGBA", (box_w, BOX_H), (0, 0, 0, 0))
        shifted.alpha_composite(canvas, (0, lift))
        canvas = shifted
    canvas.save(path, "PNG", optimize=True)
    out = metrics(canvas)
    print(f"{path.name:28} body {m['h']:.0f}->{target_h}  headx={out['hx']:.1f}  y0={out['y0']:.0f} y1={out['y1']:.0f}")
    return out


FAMILIES = (
    {
        "front": "char-warm.png",
        "side": "char-warm-side.png",
        "back": "char-warm-back.png",
        "front_files": ("char-warm-walk.png", "char-warm-walk2.png", "char-warm-chop.png", "char-warm-sit.png"),
        "side_files": ("char-warm-side-walk.png", "char-warm-side-walk2.png"),
        "back_files": ("char-warm-back-walk.png", "char-warm-back-walk2.png"),
    },
    {
        "front": "char-pine.png",
        "side": "char-pine-side.png",
        "back": "char-pine-back.png",
        "front_files": ("char-pine-walk.png", "char-pine-walk2.png", "char-pine-chop.png", "char-pine-sit.png"),
        "side_files": ("char-pine-side-walk.png", "char-pine-side-walk2.png"),
        "back_files": ("char-pine-back-walk.png", "char-pine-back-walk2.png"),
    },
)


def main() -> None:
    for fam in FAMILIES:
        front_h = int(max(600, metrics(Image.open(ROOT / fam["front"]).convert("RGBA"))["h"]))
        side_h = int(max(600, metrics(Image.open(ROOT / fam["side"]).convert("RGBA"))["h"]))
        back_h = int(max(600, metrics(Image.open(ROOT / fam["back"]).convert("RGBA"))["h"]))
        for name in fam["front_files"]:
            target = int(front_h * 0.72) if "sit" in name else front_h
            wide = "chop" in name or "sit" in name
            align_one(ROOT / name, target, 560 if wide else 420)
        for name in fam["side_files"]:
            align_one(ROOT / name, side_h, 420)
        for name in fam["back_files"]:
            align_one(ROOT / name, back_h, 420)


if __name__ == "__main__":
    main()
