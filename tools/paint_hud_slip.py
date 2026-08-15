#!/usr/bin/env python3
"""HUD slip only. Valley wood + old paper. Does not touch the floor or cover."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"

# 9-slice wood rim. Wider than the prompt bar so TILE_FIT stays one slip.
# Keep margins in lockstep with Look.slip_box().
W, H = 640, 80
MX, MY = 16, 13


def _warm_wood(im: Image.Image, target: tuple[float, float, float]) -> Image.Image:
    arr = np.asarray(im.convert("RGB"), dtype=np.float32)
    mean = arr.reshape(-1, 3).mean(axis=0)
    # Keep grain. Shift the dusk mean toward the board, not a flat fill.
    arr = arr - mean + np.array(target, dtype=np.float32)
    arr = np.clip(arr, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGB")


def _wood_plank(size: tuple[int, int], horizontal: bool) -> Image.Image:
    src = Image.open(ART / "tex-wood.png").convert("RGB")
    # Lantern sits in the upper-left. Use a lower-right board.
    crop = src.crop((448, 520, 448 + 280, 520 + 160))
    if horizontal:
        crop = crop.rotate(90, expand=True)
    plank = crop.resize(size, Image.Resampling.LANCZOS)
    return _warm_wood(plank, (102.0, 70.0, 44.0))


def _paper_sheet(size: tuple[int, int]) -> Image.Image:
    src = Image.open(ART / "tex-paper.png").convert("RGB")
    # Tile the sheet. Do not shrink it into a flat beige fill.
    sheet = Image.new("RGB", size)
    sw, sh = src.size
    for y in range(0, size[1], sh):
        for x in range(0, size[0], sw):
            sheet.paste(src, (x, y))
    arr = np.asarray(sheet, dtype=np.float32)
    # Keep the sheet light so ink stays readable.
    arr = arr * np.array([1.02, 0.99, 0.93]) + np.array([4.0, 3.0, 1.0])
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def _round_mask(size: tuple[int, int], radius: int, inset: int = 0) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle(
        (inset, inset, size[0] - 1 - inset, size[1] - 1 - inset),
        radius,
        fill=255,
    )
    return mask


def paint_slip() -> Image.Image:
    # Same set as the valley board: wood planks, paper pinned on.
    wood_v = _wood_plank((240, H), horizontal=False)
    wood_h = _wood_plank((240, H), horizontal=True)
    frame = Image.new("RGB", (W, H))
    for x in range(0, W, 240):
        frame.paste(wood_v, (x, 0))
    # Top / bottom rims read as one long plank. Corners stay vertical.
    top_src = wood_h.crop((MX, 0, 240 - MX, MY))
    bot_src = wood_h.crop((MX, H - MY, 240 - MX, H))
    x = MX
    while x < W - MX:
        piece = min(top_src.size[0], W - MX - x)
        frame.paste(top_src.crop((0, 0, piece, MY)), (x, 0))
        frame.paste(bot_src.crop((0, 0, piece, MY)), (x, H - MY))
        x += piece
    # Two thin seams so the rim reads as boards, not a brown stroke.
    arr = np.asarray(frame, dtype=np.float32)
    for y in (4, MY - 3, H - MY + 2, H - 5):
        arr[y : y + 1, :] *= 0.62
        arr[max(0, y - 1) : y, :] *= 0.84
    frame = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")

    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.paste(frame, (0, 0), _round_mask((W, H), 5, 1))

    pw, ph = W - 2 * MX, H - 2 * MY
    paper = _paper_sheet((pw, ph))
    im.paste(paper, (MX, MY), _round_mask((pw, ph), 3))

    d = ImageDraw.Draw(im)
    # Inner lip lives in the wood rim so the 9-slice edge stays a plank.
    d.rounded_rectangle(
        (MX - 1, MY - 1, W - MX, H - MY),
        3,
        outline=(58, 36, 20, 230),
        width=2,
    )
    d.rounded_rectangle((1, 1, W - 2, H - 2), 5, outline=(34, 20, 12, 255), width=2)
    # Tacks only in the 9-slice corners. They must not sit on the paper strip.
    for px, py in ((8, 6), (W - 9, 6), (8, H - 7), (W - 9, H - 7)):
        d.ellipse((px - 2, py - 2, px + 2, py + 2), fill=(52, 38, 28, 255))
        d.point((px, py), fill=(168, 140, 96, 255))
    return im


def save(im: Image.Image) -> Path:
    dest = ART / "tex-slip.png"
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest)
    return dest


def main() -> None:
    dest = save(paint_slip())
    print(f"wrote {dest}")


if __name__ == "__main__":
    main()
