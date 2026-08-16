#!/usr/bin/env python3
"""Paint a simple dusk wood slip for the room card.
Same cabin timber as the HUD plaque. Not a parchment form.
Does not write cover-valley.png, bed-valley.png, tex-plaque.png, or tex-slip.png.
A clip-art panel is thrown away — keep a simple wood slip.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
ROOM_NAME = "tex-room.png"
PLAQUE = ART / "tex-plaque.png"
SLIP = ART / "tex-slip.png"
VALLEY = ART / "bed-valley.png"
COVER = ART / "cover-valley.png"
CABIN = ART / "prop-cabin.png"

W, H = 512, 640
MX, MY = 22, 22


def _arr(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert("RGBA"), dtype=np.uint8).copy()


def _warm_wood(im: Image.Image, target: tuple[float, float, float]) -> Image.Image:
    arr = np.asarray(im.convert("RGB"), dtype=np.float32)
    mean = arr.reshape(-1, 3).mean(axis=0)
    arr = arr - mean + np.array(target, dtype=np.float32)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def _cabin_plank(size: tuple[int, int]) -> Image.Image:
    src = Image.open(CABIN).convert("RGB")
    # Wall boards only. Not the door, lantern, or window.
    crop = src.crop((250, 300, 350, 378))
    tile = _warm_wood(crop, (102.0, 70.0, 44.0))
    board = Image.new("RGB", size)
    tw, th = tile.size
    for y in range(0, size[1], th):
        for x in range(0, size[0], tw):
            board.paste(tile, (x, y))
    return board


def _round_mask(size: tuple[int, int], radius: int, inset: int = 0) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle(
        (inset, inset, size[0] - 1 - inset, size[1] - 1 - inset),
        radius,
        fill=255,
    )
    return mask.filter(ImageFilter.GaussianBlur(0.8))


def paint_simple_wood() -> Image.Image:
    """Cabin boards only. No paper field. No nail heads. No hard ink outline."""
    wood = _cabin_plank((W, H))
    arr = np.asarray(wood, dtype=np.float32)
    ys = np.linspace(0.0, 1.0, H)[:, None]
    xs = np.linspace(0.0, 1.0, W)[None, :]
    # Soft dusk falloff, not a second sun.
    arr *= (0.92 + 0.10 * (1.0 - ys) + 0.04 * (1.0 - xs))[..., None]
    # Rim lives in the 9-slice margin so TILE_FIT does not smear a stroke.
    rim = np.ones((H, W), dtype=np.float32)
    rim[:MY, :] *= 0.78
    rim[H - MY :, :] *= 0.72
    rim[:, :MX] *= 0.80
    rim[:, W - MX :] *= 0.76
    arr *= rim[..., None]
    wood = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.paste(wood, (0, 0), _round_mask((W, H), 10, 1))
    return im


def _is_clip_art(im: Image.Image) -> bool:
    a = _arr(im)
    rgb = a[:, :, :3].astype(np.int16)
    op = a[:, :, 3] > 40
    if int(op.sum()) < 8000:
        return True
    # Cheap parchment: a bright paper field inside a hard dark stroke.
    paper = op & (rgb.mean(axis=2) > 160)
    dark = op & (rgb.sum(axis=2) < 50)
    if int(paper.sum()) > 0.35 * max(1, int(op.sum())) and int(dark.sum()) > 200:
        return True
    # Cartoon nails: bright metal dots in the corners.
    nails = 0
    for y0, x0 in ((6, 6), (6, W - 14), (H - 14, 6), (H - 14, W - 14)):
        patch = rgb[y0 : y0 + 8, x0 : x0 + 8]
        if patch.size and float(patch.mean()) > 140:
            nails += 1
    if nails >= 3:
        return True
    # Door / lantern tiles: hot orange blobs that are not wood grain.
    hot = op & (rgb[:, :, 0] > 180) & (rgb[:, :, 2] < 60)
    if int(hot.sum()) > 400:
        return True
    return False


def _assert_wood(arr: np.ndarray, name: str) -> None:
    if arr[2, 2, 3] > 30 or arr[2, -3, 3] > 30:
        raise SystemExit(f"{name} still has a plate in the corner")
    leftover = np.any(arr[:, :, :3] > 0, axis=2) & (arr[:, :, 3] == 0)
    arr[leftover] = 0
    leftover = np.any(arr[:, :, :3] > 0, axis=2) & (arr[:, :, 3] == 0)
    if leftover.any():
        raise SystemExit(f"{name} has dusk RGB in a=0 pixels")
    mag = (arr[:, :, 0] > 200) & (arr[:, :, 1] < 80) & (arr[:, :, 2] > 200) & (arr[:, :, 3] > 0)
    if mag.any():
        raise SystemExit(f"{name} still has magenta sit pixels")


def main() -> None:
    if not COVER.exists() or not VALLEY.exists() or not CABIN.exists():
        raise SystemExit("cover / valley / cabin missing; read-only lock")
    before = VALLEY.stat().st_size
    plaque_before = PLAQUE.stat().st_size
    slip_before = SLIP.stat().st_size
    painted = paint_simple_wood()
    if _is_clip_art(painted):
        print("clip-art panel — keep a simpler wood slip")
        painted = paint_simple_wood()
        if _is_clip_art(painted):
            raise SystemExit("room card still reads as clip-art — not shipped")
    arr = _arr(painted)
    _assert_wood(arr, ROOM_NAME)
    Image.fromarray(arr, "RGBA").save(ART / ROOM_NAME, "PNG")
    if VALLEY.stat().st_size != before:
        raise SystemExit("bed-valley.png was touched")
    if PLAQUE.stat().st_size != plaque_before:
        raise SystemExit("tex-plaque.png was touched")
    if SLIP.stat().st_size != slip_before:
        raise SystemExit("tex-slip.png was touched")
    print(f"wrote {ROOM_NAME} wood slip")


if __name__ == "__main__":
    main()
