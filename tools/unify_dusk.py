#!/usr/bin/env python3
"""One dusk. Play roofs are the cover buildings. Does not touch the cover."""

from __future__ import annotations

import importlib.util
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"

# Cover boxes. Read only. Does not write cover-valley.png.
HUT_BOX = (60, 310, 260, 550)
LODGE_BOX = (840, 190, 1180, 510)
# Trees, lamp, shore. Same painting. No second brush.
WILLOW_BOX = (0, 168, 90, 338)
RIDGE_BOX = (1195, 105, 1280, 190)
LAMP_BOX = (918, 298, 972, 372)
SHORE_BOX = (1008, 548, 1148, 668)
VERGE_BOX = (210, 535, 345, 665)


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
    # Shore and verge keep grass and water. soften_sit would eat both.
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32)
    h, w = buf.shape[:2]
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    fx = np.clip(np.minimum(xx / pad, (1.0 - xx) / pad), 0.0, 1.0)
    fy = np.clip(np.minimum(yy / pad, (1.0 - yy) / pad), 0.0, 1.0)
    t = np.minimum(fx, fy)
    edge = t * t * (3.0 - 2.0 * t)
    cy, cx = 0.48, 0.50
    dist = np.sqrt(((xx - cx) / 0.56) ** 2 + ((yy - cy) / 0.56) ** 2)
    blob = np.clip(1.12 - dist, 0.0, 1.0)
    blob = blob * blob
    buf[:, :, 3] *= edge * blob
    out = Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8), "RGBA")
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(2.4))
    out.putalpha(a)
    return out


def keep_lamp(im: Image.Image) -> Image.Image:
    buf = np.asarray(im.convert("RGBA"), dtype=np.float32)
    h, w = buf.shape[:2]
    yy, xx = np.ogrid[:h, :w]
    cy, cx = h * 0.50, w * 0.40
    dist = np.sqrt(((xx - cx) / (w * 0.46)) ** 2 + ((yy - cy) / (h * 0.46)) ** 2)
    fall = np.clip(1.18 - dist, 0.0, 1.0)
    fall = fall * fall
    lum = buf[:, :, :3] @ np.array([0.35, 0.45, 0.20], dtype=np.float32)
    glow = np.clip((lum - 48.0) / 90.0, 0.0, 1.0)
    buf[:, :, 3] *= np.clip(np.maximum(fall, glow), 0.0, 1.0)
    out = Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8), "RGBA")
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(1.2))
    out.putalpha(a)
    return out


def trim_alpha(im: Image.Image, t: int = 10) -> Image.Image:
    a = np.asarray(im.split()[-1])
    ys, xs = np.where(a > t)
    if len(xs) == 0:
        return im.convert("RGBA")
    return im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))


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


def sit_cover_grove() -> None:
    # Trees, lamp, shore from the same cover. Does not touch the cover.
    cover = Image.open(ART / "cover-valley.png").convert("RGBA")
    look = _look()
    willow = trim_alpha(look.soften_sit(fade_edges(eat_sky(cover.crop(WILLOW_BOX), 16.0), 0.12), 0.16))
    willow.save(ART / "prop-cover-tree.png")
    print("wrote prop-cover-tree.png from cover willow", willow.size)
    # Ridge canopy is gold-lit. Do not flood-eat the sky or the crown goes with it.
    ridge = trim_alpha(look.soften_sit(fade_edges(cover.crop(RIDGE_BOX), 0.12), 0.14))
    ridge.save(ART / "prop-cover-tree-b.png")
    print("wrote prop-cover-tree-b.png from cover ridge", ridge.size)
    lamp = trim_alpha(look.soften_sit(keep_lamp(cover.crop(LAMP_BOX)), 0.10))
    lamp.save(ART / "prop-cover-lamp.png")
    print("wrote prop-cover-lamp.png from cover lamp", lamp.size)
    shore = trim_alpha(fade_bank(cover.crop(SHORE_BOX), 0.26))
    shore.save(ART / "prop-cover-shore.png")
    print("wrote prop-cover-shore.png from cover shore", shore.size)
    verge = trim_alpha(fade_bank(cover.crop(VERGE_BOX), 0.28))
    verge.save(ART / "prop-cover-verge.png")
    print("wrote prop-cover-verge.png from cover verge", verge.size)


def main() -> None:
    sit_cover_houses()
    sit_cover_grove()


if __name__ == "__main__":
    main()
