import { mulberry } from "../game/rng";

/** Don't Starve-like surface: biomes, road, set pieces. Seeded per room. */
export function generateWild(seed: number): string[] {
  const w = 42;
  const h = 28;
  const rand = mulberry(seed >>> 0);
  const g: string[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => "."));

  for (let x = 0; x < w; x++) {
    g[0][x] = "#";
    g[h - 1][x] = "#";
  }
  for (let y = 0; y < h; y++) {
    g[y][0] = "#";
    g[y][w - 1] = "#";
  }

  const blob = (cx: number, cy: number, r: number, ch: string, p: number) => {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d < r && rand() < p) g[y][x] = ch;
      }
    }
  };

  blob(10, 8, 7, "T", 0.72);
  blob(30, 9, 6, "T", 0.65);
  blob(32, 20, 6, "m", 0.7);
  blob(12, 20, 5, "m", 0.55);
  blob(22, 6, 4, "^", 0.5);

  for (let x = 2; x < w - 2; x++) {
    if (rand() < 0.55) g[h - 3][x] = "~";
    if (rand() < 0.35) g[h - 4][x] = "~";
  }

  const roadX = 21;
  for (let y = h - 5; y >= 3; y--) {
    g[y][roadX] = ",";
    if (rand() < 0.2) g[y][roadX + (rand() < 0.5 ? -1 : 1)] = ",";
  }

  const place = (ch: string, n: number) => {
    let left = n;
    let guard = 80;
    while (left > 0 && guard-- > 0) {
      const x = 2 + Math.floor(rand() * (w - 4));
      const y = 2 + Math.floor(rand() * (h - 6));
      if (g[y][x] === "." || g[y][x] === "T" || g[y][x] === "m") {
        g[y][x] = ch;
        left -= 1;
      }
    }
  };

  place("F", 10);
  place("K", 2);
  place("R", 3);
  place("H", 2);
  place("e", 5);

  g[h - 5][roadX] = "L";
  g[h - 4][roadX] = "D";
  return g.map((row) => row.join(""));
}

export function packFog(set: Set<number>): number[] {
  return [...set].sort((a, b) => a - b);
}

export function tileKey(x: number, y: number, w: number): number {
  return y * w + x;
}
