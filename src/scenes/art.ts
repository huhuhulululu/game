type Sheet = HTMLCanvasElement;

const SRC: Record<string, string> = {
  tree: "/art/prop-tree.png",
  pine: "/art/prop-pine.png",
  fire: "/art/prop-fire.png",
  cabin: "/art/prop-cabin.png",
  inn: "/art/prop-inn.png",
  mine: "/art/prop-mine.png",
  warm: "/art/char-warm.png",
  pineChar: "/art/char-pine.png",
};

const sheets = new Map<string, Sheet>();

function keyMagenta(img: HTMLImageElement): Sheet {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d");
  if (!g) return c;
  g.drawImage(img, 0, 0);
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
  for (const [name, src] of Object.entries(SRC)) {
    if (sheets.has(name)) continue;
    const img = new Image();
    img.onload = () => sheets.set(name, keyMagenta(img));
    img.src = src;
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
