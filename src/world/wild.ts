import { mulberry } from "../game/rng";

export const WILD_W = 48;
export const WILD_H = 32;

export type WildBiome = "forest" | "grass" | "marsh" | "savanna" | "rocky" | "water" | "road";

/** Don't Starve-like surface: biomes, road, set pieces. Seeded per room. */
export function generateWild(seed: number): string[] {
  const w = WILD_W;
  const h = WILD_H;
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

  const sites: { x: number; y: number; b: WildBiome }[] = [
    { x: 11 + Math.floor(rand() * 5), y: 8 + Math.floor(rand() * 4), b: "forest" },
    { x: 36 + Math.floor(rand() * 4), y: 8 + Math.floor(rand() * 3), b: "forest" },
    { x: 38 + Math.floor(rand() * 3), y: 21 + Math.floor(rand() * 3), b: "marsh" },
    { x: 8 + Math.floor(rand() * 4), y: 20 + Math.floor(rand() * 3), b: "marsh" },
    { x: 24 + Math.floor(rand() * 3), y: 5 + Math.floor(rand() * 3), b: "rocky" },
    { x: 22 + Math.floor(rand() * 4), y: 14 + Math.floor(rand() * 3), b: "savanna" },
    { x: 24, y: 27, b: "water" },
  ];

  const nearest = (x: number, y: number): WildBiome => {
    let best: WildBiome = "grass";
    let d0 = 1e9;
    for (const s of sites) {
      const d = Math.hypot(x - s.x, y - s.y);
      if (d < d0) {
        d0 = d;
        best = s.b;
      }
    }
    return best;
  };

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const b = nearest(x, y);
      if (b === "forest") g[y][x] = rand() < 0.22 ? "T" : rand() < 0.45 ? "t" : ".";
      else if (b === "marsh") g[y][x] = rand() < 0.72 ? "m" : ".";
      else if (b === "savanna") g[y][x] = "s";
      else if (b === "rocky") g[y][x] = rand() < 0.55 ? "^" : ".";
      else if (b === "water") g[y][x] = rand() < 0.8 ? "~" : ".";
    }
  }

  for (let x = 2; x < w - 2; x++) {
    if (rand() < 0.7) g[h - 3][x] = "~";
    if (rand() < 0.45) g[h - 4][x] = "~";
  }

  const roadX = 24;
  for (let y = h - 5; y >= 3; y--) {
    g[y][roadX] = ",";
    if (rand() < 0.28) g[y][roadX + (rand() < 0.5 ? -1 : 1)] = ",";
  }

  const sprinkle = (ok: (ch: string) => boolean, ch: string, n: number) => {
    let left = n;
    let guard = 200;
    while (left > 0 && guard-- > 0) {
      const x = 2 + Math.floor(rand() * (w - 4));
      const y = 2 + Math.floor(rand() * (h - 6));
      if (ok(g[y][x])) {
        g[y][x] = ch;
        left -= 1;
      }
    }
  };

  sprinkle((c) => c === "." || c === "s", "F", 16);
  sprinkle((c) => c === "^" || c === ".", "b", 8);
  sprinkle((c) => c === "m" || c === "T" || c === "t", "n", 5);
  sprinkle((c) => c === "." || c === "s" || c === "m", "K", 3);
  sprinkle((c) => c === "." || c === "s" || c === "^", "R", 4);
  sprinkle((c) => c === "." || c === "s", "J", 2);
  sprinkle((c) => c === "m" || c === "." || c === "s", "e", 7);

  const holes: { x: number; y: number }[] = [];
  let guard = 80;
  while (holes.length < 2 && guard-- > 0) {
    const x = 3 + Math.floor(rand() * (w - 6));
    const y = 3 + Math.floor(rand() * (h - 8));
    if ((g[y][x] === "." || g[y][x] === "s" || g[y][x] === "m") && holes.every((h0) => Math.hypot(h0.x - x, h0.y - y) > 14)) {
      g[y][x] = "H";
      holes.push({ x, y });
    }
  }

  for (let x = 3; x < w - 3; x++) {
    if (g[h - 4][x] === "~" && g[h - 5][x] === "m" && rand() < 0.15) g[h - 5][x] = "D";
  }

  g[h - 5][roadX] = "L";
  g[h - 4][roadX] = "D";
  g[h - 5][roadX - 1] = ",";
  g[h - 5][roadX + 1] = ",";
  return g.map((row) => row.join(""));
}

export function biomeOf(ch: string): WildBiome {
  if (ch === "T" || ch === "t") return "forest";
  if (ch === "m" || ch === "n") return "marsh";
  if (ch === "s") return "savanna";
  if (ch === "^" || ch === "b") return "rocky";
  if (ch === "~") return "water";
  if (ch === ",") return "road";
  return "grass";
}

export function biomeName(ch: string): string {
  const b = biomeOf(ch);
  if (b === "forest") return "林";
  if (b === "marsh") return "沼";
  if (b === "savanna") return "荒草";
  if (b === "rocky") return "石丘";
  if (b === "water") return "岸";
  if (b === "road") return "路";
  return "野地";
}

export function packFog(set: Set<number>): number[] {
  return [...set].sort((a, b) => a - b);
}

export function tileKey(x: number, y: number, w: number): number {
  return y * w + x;
}

export function compass(dx: number, dy: number): string {
  const m = Math.hypot(dx, dy);
  if (m < 48) return "就在身旁";
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax > ay * 1.4) return dx > 0 ? "东边" : "西边";
  if (ay > ax * 1.4) return dy > 0 ? "南边" : "北边";
  if (dx > 0 && dy > 0) return "东南";
  if (dx > 0) return "东北";
  if (dy > 0) return "西南";
  return "西北";
}
