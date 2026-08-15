#!/usr/bin/env python3
"""Play-area roofs and sit stains. Do not touch cover-valley.png."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"
REFS = Path("/opt/cursor/artifacts/assets")


def save(im: Image.Image, name: str) -> None:
    path = ART / name
    im.save(path, "PNG")
    print("wrote", path.name, im.size)


def noise(h: int, w: int, cell: int, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    sh, sw = max(2, h // cell + 2), max(2, w // cell + 2)
    small = rng.random((sh, sw)).astype(np.float32)
    return np.asarray(
        Image.fromarray((small * 255).astype(np.uint8), "L").resize((w, h), Image.Resampling.BICUBIC),
        dtype=np.float32,
    ) / 255.0


def fbm(h: int, w: int, seed: int) -> np.ndarray:
    n = noise(h, w, 48, seed) * 0.50
    n += noise(h, w, 22, seed + 3) * 0.28
    n += noise(h, w, 9, seed + 7) * 0.22
    return n


def load_rgb(name: str) -> np.ndarray:
    for folder in (ART, REFS):
        p = folder / name
        if p.exists():
            return np.asarray(Image.open(p).convert("RGB"), dtype=np.float32) / 255.0
    raise FileNotFoundError(name)


def tile_tex(tex: np.ndarray, h: int, w: int, ox: int = 0, oy: int = 0) -> np.ndarray:
    th, tw = tex.shape[:2]
    yy, xx = np.indices((h, w))
    return tex[(yy + oy) % th, (xx + ox) % tw]


def grain(tex: np.ndarray) -> np.ndarray:
    lum = tex.mean(axis=2)
    lum = (lum - lum.min()) / (lum.max() - lum.min() + 1e-5)
    return 0.70 + 0.42 * lum


def wash(color: tuple[float, float, float], tex: np.ndarray) -> np.ndarray:
    g = grain(tex)
    return np.clip(np.array(color, dtype=np.float32) * g[..., None], 0, 1)


def soft_poly(h: int, w: int, pts: list[tuple[float, float]], blur: float = 1.6) -> np.ndarray:
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).polygon([(int(x), int(y)) for x, y in pts], fill=255)
    if blur > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(mask, dtype=np.float32) / 255.0


def ellipse_mask(h: int, w: int, box: tuple[float, float, float, float], blur: float = 2.0) -> np.ndarray:
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse(box, fill=255)
    if blur > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(mask, dtype=np.float32) / 255.0


def paint_house(kind: str) -> Image.Image:
    w, h = (640, 400) if kind == "hut" else (720, 420)
    wood = load_rgb("tex-wood.png")
    stone = load_rgb("tex-stone.png")
    grass = load_rgb("tex-grass.png")
    n = fbm(h, w, 11 if kind == "hut" else 29)
    yy, xx = np.indices((h, w))
    fx = xx / float(w)
    fy = yy / float(h)
    wood_t = tile_tex(wood, h, w, 40, 18)
    stone_t = tile_tex(stone, h, w, 8, 70)
    grass_t = tile_tex(grass, h, w, 90, 30)

    if kind == "hut":
        roof_c = (0.82, 0.46, 0.24)
        wall_c = (0.80, 0.60, 0.38)
        door_c = (0.36, 0.22, 0.14)
        win_c = (0.46, 0.56, 0.58)
        moss_c = (0.36, 0.48, 0.26)
        far, near, wall_b = 0.16, 0.58, 0.86
        x0, x1 = 0.14, 0.86
    else:
        roof_c = (0.62, 0.30, 0.20)
        wall_c = (0.84, 0.70, 0.52)
        door_c = (0.24, 0.38, 0.32)
        win_c = (0.50, 0.48, 0.40)
        moss_c = (0.32, 0.42, 0.24)
        far, near, wall_b = 0.14, 0.56, 0.87
        x0, x1 = 0.08, 0.92

    # Roof is a wide south-facing plane, not a night gable sticker.
    roof = soft_poly(
        h,
        w,
        [
            (w * (x0 + 0.10), h * far),
            (w * (x1 - 0.10), h * far),
            (w * (x1 + 0.02), h * near),
            (w * (x0 - 0.02), h * near),
        ],
        2.0,
    )
    wall = soft_poly(
        h,
        w,
        [
            (w * (x0 + 0.04), h * (near - 0.02)),
            (w * (x1 - 0.04), h * (near - 0.02)),
            (w * (x1 - 0.06), h * wall_b),
            (w * (x0 + 0.06), h * wall_b),
        ],
        1.6,
    )
    found = ellipse_mask(h, w, (w * 0.18, h * 0.80, w * 0.82, h * 0.96), 3.2)
    sit = ellipse_mask(h, w, (w * 0.10, h * 0.83, w * 0.90, h * 0.995), 6.0)

    roof_rgb = wash(roof_c, wood_t)
    roof_rgb = np.clip(roof_rgb * (0.86 + 0.28 * n[..., None]) * (1.06 - 0.18 * fy[..., None]), 0, 1)
    shingle = 0.90 + 0.10 * np.sin((fy * 46.0 + n * 1.8) * np.pi)
    roof_rgb *= shingle[..., None]
    moss = (n > 0.64) & (roof > 0.45) & (fy < near)
    roof_rgb = np.where(moss[..., None], wash(moss_c, grass_t), roof_rgb)
    ridge = np.exp(-((fy - (far + 0.04)) ** 2) / 0.0018) * roof
    roof_rgb = np.clip(roof_rgb + ridge[..., None] * np.array([0.16, 0.10, 0.05]), 0, 1)

    wall_rgb = wash(wall_c, wood_t)
    plank = 0.92 + 0.08 * np.sin(fx * (38 if kind == "hut" else 50) * np.pi)
    wall_rgb = np.clip(wall_rgb * plank[..., None] * (0.90 + 0.16 * n[..., None]), 0, 1)
    if kind == "lodge":
        timber = ((np.abs((fx - 0.16) % 0.17) < 0.014) | (np.abs(fy - (near + 0.08)) < 0.010)) & (wall > 0.4)
        wall_rgb = np.where(timber[..., None], wash((0.38, 0.24, 0.16), wood_t), wall_rgb)

    found_rgb = wash((0.46, 0.36, 0.24), stone_t)
    door = soft_poly(
        h,
        w,
        [
            (w * 0.445, h * (near + 0.04)),
            (w * 0.555, h * (near + 0.04)),
            (w * 0.558, h * (wall_b - 0.01)),
            (w * 0.442, h * (wall_b - 0.01)),
        ],
        1.0,
    )
    door_rgb = wash(door_c, wood_t)
    knob = ellipse_mask(h, w, (w * 0.528, h * 0.74, w * 0.552, h * 0.768), 0.5)
    win_l = soft_poly(h, w, [(w * 0.22, h * (near + 0.06)), (w * 0.32, h * (near + 0.06)), (w * 0.32, h * (near + 0.18)), (w * 0.22, h * (near + 0.18))], 0.8)
    win_r = soft_poly(h, w, [(w * 0.68, h * (near + 0.06)), (w * 0.78, h * (near + 0.06)), (w * 0.78, h * (near + 0.18)), (w * 0.68, h * (near + 0.18))], 0.8)
    if kind == "lodge":
        win_l = soft_poly(h, w, [(w * 0.16, h * (near + 0.05)), (w * 0.28, h * (near + 0.05)), (w * 0.28, h * (near + 0.17)), (w * 0.16, h * (near + 0.17))], 0.8)
        win_r = soft_poly(h, w, [(w * 0.72, h * (near + 0.05)), (w * 0.84, h * (near + 0.05)), (w * 0.84, h * (near + 0.17)), (w * 0.72, h * (near + 0.17))], 0.8)
    win_rgb = wash(win_c, stone_t) * 0.92
    chim = soft_poly(
        h,
        w,
        [
            (w * 0.72, h * (far - 0.08)),
            (w * 0.80, h * (far - 0.08)),
            (w * 0.805, h * (far + 0.10)),
            (w * 0.715, h * (far + 0.10)),
        ],
        0.9,
    )
    chim_rgb = wash((0.52, 0.42, 0.34), stone_t)

    rgb = np.zeros((h, w, 3), dtype=np.float32)
    a = np.zeros((h, w), dtype=np.float32)
    for layer, col in (
        (sit * 0.80, np.array([0.08, 0.04, 0.02])),
        (found, found_rgb),
        (wall, wall_rgb),
        (door, door_rgb),
        (win_l, win_rgb),
        (win_r, win_rgb),
        (roof, roof_rgb),
        (chim, chim_rgb),
        (knob, np.array([0.82, 0.66, 0.34])),
    ):
        rgb = rgb * (1 - layer[..., None]) + col * layer[..., None]
        a = np.clip(a + layer, 0, 1)

    eave_shade = wall * np.clip((near + 0.08 - fy) / 0.08, 0, 1) * 0.22
    rgb *= 1.0 - eave_shade[..., None]
    rgb = np.clip(rgb * np.array([1.06, 0.96, 0.82]), 0, 1)
    out = Image.fromarray(np.dstack([np.clip(rgb * 255, 0, 255).astype(np.uint8), (a * 255).astype(np.uint8)]), "RGBA")
    out = _stamp_bushes(out, kind)
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    out.putalpha(a)
    return out


def _stamp_bushes(im: Image.Image, kind: str) -> Image.Image:
    bush_path = ART / "prop-bush.png"
    if not bush_path.exists():
        return im
    bush = Image.open(bush_path).convert("RGBA")
    bbox = bush.getchannel("A").getbbox()
    if not bbox:
        return im
    bush = bush.crop(bbox).resize((150 if kind == "hut" else 170, 90 if kind == "hut" else 100), Image.Resampling.LANCZOS)
    out = im.copy()
    w, h = out.size
    out.alpha_composite(bush, (int(w * 0.08), int(h * 0.72)))
    flipped = bush.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    out.alpha_composite(flipped, (int(w * 0.68), int(h * 0.74)))
    return out


def paint_verge() -> Image.Image:
    w, h = 320, 780
    grass = load_rgb("tex-grass.png")
    meadow = load_rgb("meadow-a.png") if (REFS / "meadow-a.png").exists() else load_rgb("ground-valley.png")
    ground = load_rgb("ground-valley.png")
    n = fbm(h, w, 41)
    g = tile_tex(grass, h, w, 20, 40)
    m = tile_tex(meadow, h, w, 80, 10)
    d = tile_tex(ground, h, w, 0, 0)
    mix = np.clip(g * 0.18 + m * 0.22 + d * 0.60, 0, 1)
    mix = np.clip(mix * np.array([1.08, 0.96, 0.78]) * (0.92 + 0.18 * n[..., None]), 0, 1)
    yy, xx = np.indices((h, w))
    fx, fy = xx / float(w), yy / float(h)
    edge = np.clip(1.0 - np.abs(fx - 0.46) * 1.7, 0, 1) ** 1.15
    edge *= np.clip(1.0 - np.abs(fy - 0.50) * 1.55, 0, 1)
    edge *= 0.55 + 0.45 * n
    # scatter stones and pale flowers
    rng = np.random.default_rng(17)
    a = edge
    rgb = mix
    for _ in range(28):
        cx, cy = rng.integers(20, w - 20), rng.integers(20, h - 20)
        rw, rh = int(rng.integers(7, 16)), int(rng.integers(4, 9))
        stone = ellipse_mask(h, w, (cx - rw, cy - rh, cx + rw, cy + rh), 1.2)
        rgb = rgb * (1 - stone[..., None] * 0.85) + np.array([0.42, 0.34, 0.24]) * stone[..., None] * 0.85
        a = np.clip(a + stone * 0.35, 0, 1)
    for _ in range(40):
        cx, cy = rng.integers(16, w - 16), rng.integers(16, h - 16)
        flower = ellipse_mask(h, w, (cx - 2, cy - 2, cx + 2, cy + 2), 0.4)
        rgb = rgb * (1 - flower[..., None]) + np.array([0.86, 0.80, 0.62]) * flower[..., None]
    out = Image.fromarray(np.dstack([np.clip(rgb * 255, 0, 255).astype(np.uint8), (a * 255).astype(np.uint8)]), "RGBA")
    a = out.getchannel("A").filter(ImageFilter.GaussianBlur(1.4))
    out.putalpha(a)
    return out


def _wood_sit(arr: np.ndarray) -> int:
    a = arr[:, :, 3]
    lum = arr[:, :, :3].astype(np.float32).mean(2)
    mid = a.shape[0] // 2
    body = int((a[mid] > 80).sum())
    need = max(10, int(body * 0.16))
    for y in range(a.shape[0] - 1, mid, -1):
        if int(((a[y] > 70) & (lum[y] > 22)).sum()) >= need:
            return y
    ys = np.where((a > 80).sum(1) > 8)[0]
    return int(ys.max()) if len(ys) else a.shape[0] - 1


def plant_sit(name: str) -> None:
    path = ART / name
    arr = np.array(Image.open(path).convert("RGBA"))
    y1 = _wood_sit(arr)
    y0 = max(0, y1 - 8)
    band = arr[y0 : y1 + 1]
    has = band[:, :, 3] > 18
    band[:, :, 3] = np.where(has, np.maximum(band[:, :, 3], 235), band[:, :, 3])
    arr = arr[: y1 + 5]
    a = arr[:, :, 3]
    xs = np.where(a[min(y1, arr.shape[0] - 1)] > 70)[0]
    if len(xs) == 0:
        xs = np.where(a.max(0) > 70)[0]
    x0, x1 = int(xs.min()), int(xs.max())
    cx = (x0 + x1) * 0.5
    rw = max(26.0, (x1 - x0) * 0.48)
    sit_y = min(arr.shape[0] - 3, y1 + 1)
    shadow = Image.new("RGBA", (arr.shape[1], arr.shape[0]), (0, 0, 0, 0))
    d = ImageDraw.Draw(shadow)
    d.ellipse((cx - rw, sit_y - 10, cx + rw, sit_y + 8), fill=(12, 6, 3, 200))
    d.ellipse((cx - rw * 0.48, sit_y - 5, cx + rw * 0.48, sit_y + 5), fill=(6, 3, 2, 230))
    shadow = shadow.filter(ImageFilter.GaussianBlur(2.2))
    out = Image.alpha_composite(shadow, Image.fromarray(arr))
    save(out, name)


def main() -> None:
    save(paint_house("hut"), "prop-hut.png")
    save(paint_house("lodge"), "prop-lodge.png")
    save(paint_verge(), "prop-verge.png")
    if "--sit" in __import__("sys").argv:
        for name in ("prop-stall.png", "prop-altar.png", "prop-board.png", "prop-anvil.png"):
            plant_sit(name)


if __name__ == "__main__":
    main()
