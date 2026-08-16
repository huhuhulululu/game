#!/usr/bin/env python3
"""Lock every person to the same stature and foot line so walk/chop frames do not jump."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "art"
FOOT_Y = 634
BOX_H = 640


def metrics(im: Image.Image) -> dict[str, float]:
    a = np.array(im.split()[-1])
    mask = a > 18
    h, w = mask.shape
    # Prefer the torso column so an axe or rod does not steal the height.
    c0, c1 = int(w * 0.28), int(w * 0.72)
    if c1 <= c0 + 4:
        c0, c1 = 0, w
    col = mask[:, c0:c1]
    row_w = col.sum(axis=1)
    rows = np.where(row_w > 6)[0]
    if len(rows) < 6:
        rows = np.where(mask.sum(axis=1) > 3)[0]
    y0, y1 = int(rows[0]), int(rows[-1])
    f0 = y0 + int((y1 - y0) * 0.9)
    foot_cols = np.where(mask[f0 : y1 + 1].any(axis=0))[0]
    fx = float(foot_cols.mean()) if len(foot_cols) else w / 2
    t0 = y0 + int((y1 - y0) * 0.4)
    t1 = max(t0 + 1, y0 + int((y1 - y0) * 0.72))
    weights = a[t0:t1].sum(axis=0).astype(np.float64)
    xs = np.arange(w, dtype=np.float64)
    cx = float((xs * weights).sum() / max(1.0, weights.sum())) if weights.sum() else w / 2
    return {"y0": y0, "y1": y1, "h": y1 - y0 + 1, "fx": fx, "cx": cx, "w": w, "canvas_h": h}


def align_one(path: Path, target_h: int, min_w: int) -> None:
    im = Image.open(path).convert("RGBA")
    bbox = im.getbbox()
    if not bbox:
        return
    cropped = im.crop(bbox)
    m = metrics(cropped)
    scale = target_h / max(1.0, m["h"])
    nw = max(1, round(cropped.width * scale))
    nh = max(1, round(cropped.height * scale))
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    sm = metrics(scaled)
    box_w = max(min_w, int(sm["w"] + 28))
    box_w = min(640, box_w if box_w % 2 == 0 else box_w + 1)
    dx = int(round(box_w / 2 - sm["cx"]))
    dy = int(FOOT_Y - sm["y1"])
    if dy < 2:
        # Hair would clip; shrink just enough to keep the foot line.
        room = max(8, FOOT_Y - 2)
        scale *= room / max(1, sm["y1"] - dy)
        nw = max(1, round(cropped.width * scale))
        nh = max(1, round(cropped.height * scale))
        scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        sm = metrics(scaled)
        box_w = max(min_w, int(sm["w"] + 28))
        box_w = min(640, box_w if box_w % 2 == 0 else box_w + 1)
        dx = int(round(box_w / 2 - sm["cx"]))
        dy = int(FOOT_Y - sm["y1"])
    canvas = Image.new("RGBA", (box_w, BOX_H), (0, 0, 0, 0))
    canvas.alpha_composite(scaled, (dx, dy))
    canvas.save(path, "PNG", optimize=True)
    print(f"{path.name:28} body {m['h']:.0f} -> {target_h}  canvas={box_w}x{BOX_H}  scale={scale:.2f}")


def main() -> None:
    files = sorted(ROOT.glob("char-*.png"))
    for family, idle_name in (("warm", "char-warm.png"), ("pine", "char-pine.png")):
        idle = Image.open(ROOT / idle_name).convert("RGBA")
        standing = int(max(600, metrics(idle)["h"]))
        for path in files:
            if family == "warm" and not path.name.startswith("char-warm"):
                continue
            if family == "pine" and not path.name.startswith("char-pine"):
                continue
            wide = any(k in path.name for k in ("fish", "forge", "chop", "sit"))
            target = standing
            if "sit" in path.name:
                target = int(standing * 0.72)
            align_one(path, target, 560 if wide else 420)


if __name__ == "__main__":
    main()
