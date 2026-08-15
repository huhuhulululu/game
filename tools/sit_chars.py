#!/usr/bin/env python3
"""Put the cover-family 暖/松 on one foot line. Never read Wilson raws."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from paint_look import ART, flood_cut, save  # noqa: E402

REFS = Path("/opt/cursor/artifacts/assets")
BOX_W, BOX_H = 320, 480
FOOT_Y = 470
BODY = 428

# Wilson / DST scratch sheets. Do not open.
BAN = {
    "char-warm-walk-raw.png",
    "char-warm-walk2-raw.png",
    "char-pine-walk-raw.png",
    "char-warm-chop-raw.png",
    "char-pine-chop-raw.png",
    "char-warm-sit-raw.png",
    "char-pine-sit-raw.png",
}

SRCS = {
    "char-warm.png": "char-warm-ref.png",
    "char-pine.png": "char-pine-ref.png",
    "char-warm-walk.png": "char-warm-walk-ref.png",
    "char-pine-walk.png": "char-pine-walk-ref.png",
    "char-warm-side.png": "char-warm-side-ref.png",
    "char-pine-side.png": "char-pine-side-ref.png",
    "char-warm-back.png": "char-warm-back-ref.png",
    "char-pine-back.png": "char-pine-back-ref.png",
}


def cut_person(im: Image.Image) -> Image.Image:
    cut = flood_cut(im.convert("RGBA"), 30.0)
    a = np.asarray(cut.split()[-1])
    if (a > 18).sum() < 800:
        cut = flood_cut(im.convert("RGBA"), 42.0)
    bbox = cut.getchannel("A").getbbox()
    if not bbox:
        return cut
    pad = 10
    x0, y0, x1, y1 = bbox
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(cut.size[0], x1 + pad), min(cut.size[1], y1 + pad)
    return cut.crop((x0, y0, x1, y1))


def body_span(im: Image.Image) -> tuple[int, int]:
    a = np.asarray(im.split()[-1])
    rows = np.where(a.max(axis=1) > 18)[0]
    if len(rows) == 0:
        return 0, im.size[1] - 1
    return int(rows[0]), int(rows[-1])


def torso_cx(im: Image.Image) -> float:
    a = np.asarray(im.split()[-1])
    y0, y1 = body_span(im)
    t0 = y0 + int((y1 - y0) * 0.32)
    t1 = max(t0 + 4, y0 + int((y1 - y0) * 0.68))
    wts = a[t0:t1].sum(axis=0).astype(np.float64)
    if wts.sum() < 8:
        return im.size[0] / 2
    return float((np.arange(a.shape[1]) * wts).sum() / wts.sum())


def plant(im: Image.Image, body_h: int = BODY, foot_y: int = FOOT_Y) -> Image.Image:
    spr = cut_person(im)
    y0, y1 = body_span(spr)
    src_h = max(1, y1 - y0 + 1)
    scale = body_h / src_h
    nw = max(8, int(spr.size[0] * scale))
    nh = max(8, int(spr.size[1] * scale))
    spr = spr.resize((nw, nh), Image.Resampling.LANCZOS)
    y0, y1 = body_span(spr)
    canvas = Image.new("RGBA", (BOX_W, BOX_H), (0, 0, 0, 0))
    dx = int(round(BOX_W / 2 - torso_cx(spr)))
    dy = foot_y - y1
    canvas.alpha_composite(spr, (dx, dy))
    a = canvas.getchannel("A").filter(ImageFilter.GaussianBlur(0.7))
    canvas.putalpha(a)
    return canvas


def planted_step(im: Image.Image, torso_dx: int = 0, torso_dy: int = 0) -> Image.Image:
    """Same person, same feet. Only the coat and head take the step."""
    arr = np.asarray(im.convert("RGBA"))
    h, w = arr.shape[:2]
    split = int(h * 0.58)
    out = arr.copy()
    band = arr[:split]
    shifted = np.zeros_like(band)
    src_x = np.clip(np.arange(w) - torso_dx, 0, w - 1)
    src_y = np.clip(np.arange(split) - torso_dy, 0, split - 1)
    shifted[:] = band[src_y][:, src_x]
    # keep already-transparent pixels from punching holes
    keep = band[:, :, 3] > shifted[:, :, 3]
    shifted[keep] = band[keep]
    out[:split] = shifted
    return Image.fromarray(out, "RGBA")


def main() -> None:
    for name in BAN:
        if name in SRCS.values():
            raise SystemExit(f"ref map points at banned Wilson sheet {name}")
    made: dict[str, Image.Image] = {}
    for dest, src in SRCS.items():
        path = REFS / src
        if not path.exists():
            print("skip missing", src)
            continue
        if src in BAN:
            raise SystemExit(f"refused {src}")
        sit = 0.78 if "sit" in dest else 1.0
        made[dest] = plant(Image.open(path), int(BODY * sit))
        save(made[dest], dest)
    # Second walk from the same painted step, feet locked.
    save(planted_step(made["char-warm-walk.png"], 2, -2), "char-warm-walk2.png")
    save(planted_step(made["char-pine-walk.png"], 2, -2), "char-pine-walk2.png")
    save(planted_step(made["char-warm-side.png"], 3, 1), "char-warm-side-walk.png")
    save(planted_step(made["char-warm-side.png"], -3, 0), "char-warm-side-walk2.png")
    save(planted_step(made["char-pine-side.png"], 3, 1), "char-pine-side-walk.png")
    save(planted_step(made["char-pine-side.png"], -3, 0), "char-pine-side-walk2.png")
    save(planted_step(made["char-warm-back.png"], 0, 1), "char-warm-back-walk.png")
    save(planted_step(made["char-warm-back.png"], 0, 0), "char-warm-back-walk2.png")
    save(planted_step(made["char-pine-back.png"], 0, 1), "char-pine-back-walk.png")
    save(planted_step(made["char-pine-back.png"], 0, 0), "char-pine-back-walk2.png")
    for who in ("warm", "pine"):
        idle = made[f"char-{who}.png"]
        save(idle.copy(), f"char-{who}-fish.png")
        save(idle.copy(), f"char-{who}-chop.png")
        save(idle.copy(), f"char-{who}-forge.png")
        save(plant(Image.open(REFS / f"char-{who}-ref.png"), int(BODY * 0.78)), f"char-{who}-sit.png")
    print("sat chars")


if __name__ == "__main__":
    main()
