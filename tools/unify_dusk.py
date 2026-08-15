#!/usr/bin/env python3
"""One dusk. Play roofs are the cover buildings. Does not touch the cover."""

from __future__ import annotations

import importlib.util
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"

# Cover boxes. Read only. Does not write cover-valley.png.
HUT_BOX = (60, 310, 260, 550)
LODGE_BOX = (840, 190, 1180, 510)


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


def sit_cover_houses() -> None:
    # Read the cover. Does not touch the cover.
    cover = Image.open(ART / "cover-valley.png").convert("RGBA")
    look = _look()
    hut = look.soften_sit(eat_corners(cover.crop(HUT_BOX)), 0.28)
    hut.save(ART / "prop-hut.png")
    print("wrote prop-hut.png from cover hut", hut.size)
    lodge = look.soften_sit(eat_corners(cover.crop(LODGE_BOX)), 0.26)
    lodge.save(ART / "prop-lodge.png")
    print("wrote prop-lodge.png from cover lodge", lodge.size)
    raw = (ART / "prop-lodge.png").read_bytes()
    if b"Wanderer" in raw or b"WANDERER" in raw or b"Good Ale" in raw:
        raise SystemExit("English inn sign still on the play lodge")


def main() -> None:
    sit_cover_houses()


if __name__ == "__main__":
    main()
