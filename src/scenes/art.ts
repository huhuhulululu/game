type Sheet = HTMLCanvasElement;

const SRC: Record<string, { src: string }> = {
  tree: { src: "/art/prop-tree.png" },
  pine: { src: "/art/prop-pine.png" },
  fire: { src: "/art/prop-fire.png" },
  cabin: { src: "/art/prop-cabin.png" },
  inn: { src: "/art/prop-inn.png" },
  mine: { src: "/art/prop-mine.png" },
  stall: { src: "/art/prop-stall.png" },
  dock: { src: "/art/prop-dock.png" },
  anvil: { src: "/art/prop-anvil.png" },
  altar: { src: "/art/prop-altar.png" },
  board: { src: "/art/prop-board.png" },
  bush: { src: "/art/prop-bush.png" },
  gate: { src: "/art/prop-gate.png" },
  stove: { src: "/art/prop-stove.png" },
  icebox: { src: "/art/prop-icebox.png" },
  pantry: { src: "/art/prop-pantry.png" },
  cut: { src: "/art/prop-cut.png" },
  ore: { src: "/art/prop-ore.png" },
  stairs: { src: "/art/prop-stairs.png" },
  beast: { src: "/art/prop-beast.png" },
  warm: { src: "/art/char-warm.png" },
  pineChar: { src: "/art/char-pine.png" },
  warmSide: { src: "/art/char-warm-side.png" },
  pineSide: { src: "/art/char-pine-side.png" },
  warmBack: { src: "/art/char-warm-back.png" },
  pineBack: { src: "/art/char-pine-back.png" },
  warmWalk: { src: "/art/char-warm-walk.png" },
  warmWalk2: { src: "/art/char-warm-walk2.png" },
  pineWalk: { src: "/art/char-pine-walk.png" },
  pineWalk2: { src: "/art/char-pine-walk2.png" },
  warmSideWalk: { src: "/art/char-warm-side-walk.png" },
  warmSideWalk2: { src: "/art/char-warm-side-walk2.png" },
  pineSideWalk: { src: "/art/char-pine-side-walk.png" },
  pineSideWalk2: { src: "/art/char-pine-side-walk2.png" },
  warmBackWalk: { src: "/art/char-warm-back-walk.png" },
  warmBackWalk2: { src: "/art/char-warm-back-walk2.png" },
  pineBackWalk: { src: "/art/char-pine-back-walk.png" },
  pineBackWalk2: { src: "/art/char-pine-back-walk2.png" },
  grass: { src: "/art/tex-grass.png" },
  path: { src: "/art/tex-path.png" },
  water: { src: "/art/tex-water.png" },
  wood: { src: "/art/tex-wood.png" },
  stone: { src: "/art/tex-stone.png" },
  marsh: { src: "/art/tex-marsh.png" },
};

const sheets = new Map<string, Sheet>();

function sheetFrom(img: HTMLImageElement): Sheet {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d");
  if (!g) return c;
  g.imageSmoothingEnabled = true;
  g.drawImage(img, 0, 0);
  return c;
}

export function loadArt(): void {
  if (typeof Image === "undefined") return;
  for (const [name, spec] of Object.entries(SRC)) {
    if (sheets.has(name)) continue;
    const img = new Image();
    img.onload = () => sheets.set(name, sheetFrom(img));
    img.src = spec.src;
  }
}

export function hasSheet(name: string): boolean {
  return sheets.has(name);
}

function smooth(g: CanvasRenderingContext2D): void {
  g.imageSmoothingEnabled = true;
  if ("imageSmoothingQuality" in g) g.imageSmoothingQuality = "high";
}

export function blit(
  g: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean {
  const s = sheets.get(name);
  if (!s) return false;
  smooth(g);
  g.drawImage(s, x, y, w, h);
  return true;
}

/** Draw a sprite keeping its aspect, sitting on the bottom of the box. */
export function blitFit(
  g: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  boxW: number,
  boxH: number,
): boolean {
  const s = sheets.get(name);
  if (!s) return false;
  const ar = s.width / Math.max(1, s.height);
  let w = boxW;
  let h = w / ar;
  if (h > boxH) {
    h = boxH;
    w = h * ar;
  }
  smooth(g);
  g.drawImage(s, x + (boxW - w) / 2, y + boxH - h, w, h);
  return true;
}

/** Stamp a tile from a painted texture, offset so neighbors do not look identical. */
export function blitPatch(
  g: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  seedX: number,
  seedY: number,
): boolean {
  const s = sheets.get(name);
  if (!s) return false;
  const tw = Math.min(160, s.width);
  const th = Math.min(160, s.height);
  const sx = Math.abs(Math.imul(seedX, 17) + seedY * 3) % Math.max(1, s.width - tw);
  const sy = Math.abs(Math.imul(seedY, 13) + seedX * 5) % Math.max(1, s.height - th);
  smooth(g);
  g.drawImage(s, sx, sy, tw, th, x, y, w, h);
  return true;
}

const TEXEL = 2.8;

function wrapBlit(
  g: CanvasRenderingContext2D,
  s: Sheet,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void {
  if (sw < 0.6 || sh < 0.6 || dw < 0.4 || dh < 0.4) return;
  g.drawImage(s, sx, sy, sw, sh, dx, dy, dw, dh);
}

/** Paint a tile from a wrapping texture using world pixels so neighbors meet. */
export function blitWrap(
  g: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean {
  const s = sheets.get(name);
  if (!s) return false;
  smooth(g);
  const zoom = TEXEL;
  try {
    const pat = g.createPattern(s, "repeat");
    if (pat && typeof pat.setTransform === "function") {
      const m = new DOMMatrix();
      m.scaleSelf(1 / zoom, 1 / zoom);
      pat.setTransform(m);
      g.fillStyle = pat;
      g.fillRect(x, y, w, h);
      return true;
    }
  } catch {
    /* fall through to wrapped drawImage */
  }
  const tw = s.width;
  const th = s.height;
  const srcW = w * zoom;
  const srcH = h * zoom;
  const sx0 = (((x * zoom) % tw) + tw) % tw;
  const sy0 = (((y * zoom) % th) + th) % th;
  const w1 = Math.min(srcW, tw - sx0);
  const h1 = Math.min(srcH, th - sy0);
  const dw1 = (w1 / srcW) * w;
  const dh1 = (h1 / srcH) * h;
  wrapBlit(g, s, sx0, sy0, w1, h1, x, y, dw1, dh1);
  if (w1 < srcW) wrapBlit(g, s, 0, sy0, srcW - w1, h1, x + dw1, y, w - dw1, dh1);
  if (h1 < srcH) wrapBlit(g, s, sx0, 0, w1, srcH - h1, x, y + dh1, dw1, h - dh1);
  if (w1 < srcW && h1 < srcH) wrapBlit(g, s, 0, 0, srcW - w1, srcH - h1, x + dw1, y + dh1, w - dw1, h - dh1);
  return true;
}
