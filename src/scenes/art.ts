type Sheet = HTMLCanvasElement;

const SRC: Record<string, { src: string; key: boolean }> = {
  tree: { src: "/art/prop-tree.png", key: true },
  pine: { src: "/art/prop-pine.png", key: true },
  fire: { src: "/art/prop-fire.png", key: true },
  cabin: { src: "/art/prop-cabin.png", key: true },
  inn: { src: "/art/prop-inn.png", key: true },
  mine: { src: "/art/prop-mine.png", key: true },
  stall: { src: "/art/prop-stall.png", key: true },
  dock: { src: "/art/prop-dock.png", key: true },
  anvil: { src: "/art/prop-anvil.png", key: true },
  altar: { src: "/art/prop-altar.png", key: true },
  board: { src: "/art/prop-board.png", key: true },
  bush: { src: "/art/prop-bush.png", key: true },
  gate: { src: "/art/prop-gate.png", key: true },
  stove: { src: "/art/prop-stove.png", key: true },
  icebox: { src: "/art/prop-icebox.png", key: true },
  pantry: { src: "/art/prop-pantry.png", key: true },
  cut: { src: "/art/prop-cut.png", key: true },
  warm: { src: "/art/char-warm.png", key: true },
  pineChar: { src: "/art/char-pine.png", key: true },
  warmSide: { src: "/art/char-warm-side.png", key: true },
  pineSide: { src: "/art/char-pine-side.png", key: true },
  warmBack: { src: "/art/char-warm-back.png", key: true },
  pineBack: { src: "/art/char-pine-back.png", key: true },
  grass: { src: "/art/tex-grass.png", key: false },
  path: { src: "/art/tex-path.png", key: false },
  water: { src: "/art/tex-water.png", key: false },
  wood: { src: "/art/tex-wood.png", key: false },
  stone: { src: "/art/tex-stone.png", key: false },
  marsh: { src: "/art/tex-marsh.png", key: false },
};

const sheets = new Map<string, Sheet>();

function keyMagenta(img: HTMLImageElement, key: boolean): Sheet {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d");
  if (!g) return c;
  g.drawImage(img, 0, 0);
  if (!key) return c;
  const d = g.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    const r = d.data[i];
    const gr = d.data[i + 1];
    const b = d.data[i + 2];
    if (r > 170 && b > 160 && gr < 100) d.data[i + 3] = 0;
  }
  g.putImageData(d, 0, 0);
  return c;
}

export function loadArt(): void {
  if (typeof Image === "undefined") return;
  for (const [name, spec] of Object.entries(SRC)) {
    if (sheets.has(name)) continue;
    const img = new Image();
    img.onload = () => sheets.set(name, keyMagenta(img, spec.key));
    img.src = spec.src;
  }
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
  const tw = Math.min(96, s.width);
  const th = Math.min(96, s.height);
  const sx = Math.abs(Math.imul(seedX, 17) + seedY * 3) % Math.max(1, s.width - tw);
  const sy = Math.abs(Math.imul(seedY, 13) + seedX * 5) % Math.max(1, s.height - th);
  g.drawImage(s, sx, sy, tw, th, x, y, w, h);
  return true;
}
