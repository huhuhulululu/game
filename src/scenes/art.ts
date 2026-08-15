type Sheet = HTMLCanvasElement;

const ART_REV = "look9";

const SRC: Record<string, { src: string }> = {
  tree: { src: "/art/prop-tree.png" },
  pine: { src: "/art/prop-pine.png" },
  fire: { src: "/art/prop-fire.png" },
  cabin: { src: "/art/prop-cabin.png" },
  inn: { src: "/art/prop-inn.png" },
  mine: { src: "/art/prop-mine.png" },
  stall: { src: "/art/prop-stall.png" },
  dock: { src: "/art/prop-dock.png" },
  dockB: { src: "/art/prop-dock-b.png" },
  trash: { src: "/art/prop-trash.png" },
  rock: { src: "/art/prop-rock.png" },
  tuft: { src: "/art/prop-tuft.png" },
  anvil: { src: "/art/prop-anvil.png" },
  altar: { src: "/art/prop-altar.png" },
  board: { src: "/art/prop-board.png" },
  bush: { src: "/art/prop-bush.png" },
  gate: { src: "/art/prop-gate.png" },
  stove: { src: "/art/prop-stove.png" },
  icebox: { src: "/art/prop-icebox.png" },
  pantry: { src: "/art/prop-pantry.png" },
  pot: { src: "/art/prop-pot.png" },
  pass: { src: "/art/prop-pass.png" },
  doorOpen: { src: "/art/prop-door-open.png" },
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
  warmChop: { src: "/art/char-warm-chop.png" },
  pineChop: { src: "/art/char-pine-chop.png" },
  warmSit: { src: "/art/char-warm-sit.png" },
  pineSit: { src: "/art/char-pine-sit.png" },
  warmFish: { src: "/art/char-warm-fish.png" },
  pineFish: { src: "/art/char-pine-fish.png" },
  warmForge: { src: "/art/char-warm-forge.png" },
  pineForge: { src: "/art/char-pine-forge.png" },
  treeGold: { src: "/art/prop-tree-gold.png" },
  treeWide: { src: "/art/prop-tree-wide.png" },
  treeTall: { src: "/art/prop-tree-tall.png" },
  pineSnow: { src: "/art/prop-pine-snow.png" },
  grass: { src: "/art/tex-grass.png" },
  path: { src: "/art/tex-path.png" },
  water: { src: "/art/tex-water.png" },
  wood: { src: "/art/tex-wood.png" },
  stone: { src: "/art/tex-stone.png" },
  marsh: { src: "/art/tex-marsh.png" },
};

const sheets = new Map<string, Sheet>();

const WRAP = new Set(["grass", "path", "water", "wood", "stone", "marsh"]);

/** Crossfade wrap edges so a field does not show a wallpaper seam. Not a mirror. */
function softenWrap(g: CanvasRenderingContext2D, w: number, h: number): void {
  const fade = Math.min(96, Math.floor(w / 6), Math.floor(h / 6));
  if (fade < 8) return;
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  const at = (x: number, y: number) => (y * w + x) * 4;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < fade; x++) {
      const t = x / fade;
      const iL = at(x, y);
      const iR = at(w - fade + x, y);
      for (let c = 0; c < 4; c++) d[iL + c] = d[iR + c] * (1 - t) + d[iL + c] * t;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < fade; y++) {
      const t = y / fade;
      const iT = at(x, y);
      const iB = at(x, h - fade + y);
      for (let c = 0; c < 4; c++) d[iT + c] = d[iB + c] * (1 - t) + d[iT + c] * t;
    }
  }
  g.putImageData(img, 0, 0);
}

function sheetFrom(img: HTMLImageElement, wrap = false): Sheet {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d");
  if (!g) return c;
  g.imageSmoothingEnabled = true;
  g.drawImage(img, 0, 0);
  if (wrap) softenWrap(g, c.width, c.height);
  return c;
}

export function loadArt(): void {
  if (typeof Image === "undefined") return;
  for (const [name, spec] of Object.entries(SRC)) {
    if (sheets.has(name)) continue;
    const img = new Image();
    img.onload = () => sheets.set(name, sheetFrom(img, WRAP.has(name)));
    img.src = `${spec.src}?v=${ART_REV}`;
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

/** Draw a person so sheet height maps to the box — walk and idle stay the same stature. */
export function blitStand(
  g: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  boxW: number,
  boxH: number,
): boolean {
  const s = sheets.get(name);
  if (!s) return false;
  const h = boxH;
  const w = h * (s.width / Math.max(1, s.height));
  smooth(g);
  g.drawImage(s, x + (boxW - w) / 2, y + boxH - h, w, h);
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

const TEXEL = 2.35;

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

/** Paint a wrapping texture. Higher zoom makes painted clumps smaller so the field is not wallpaper. */
export function blitWrapZoom(
  g: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom = TEXEL,
  ox = 0,
  oy = 0,
): boolean {
  const s = sheets.get(name);
  if (!s) return false;
  smooth(g);
  try {
    const pat = g.createPattern(s, "repeat");
    if (pat && typeof pat.setTransform === "function") {
      const m = new DOMMatrix();
      m.scaleSelf(1 / zoom, 1 / zoom);
      m.translateSelf(ox, oy);
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
  const sx0 = ((((x + ox) * zoom) % tw) + tw) % tw;
  const sy0 = ((((y + oy) * zoom) % th) + th) % th;
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

/** Paint a tile from a wrapping texture using world pixels so neighbors meet. */
export function blitWrap(
  g: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean {
  return blitWrapZoom(g, name, x, y, w, h, TEXEL);
}
