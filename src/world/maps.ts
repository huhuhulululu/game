export const TILE = 36;

export const VALLEY = [
  "##################################",
  "#TTTT..........TTTTTTTT..........#",
  "#TTTT...EE.....TTFFTTTT..........#",
  "#.......EE........FF.............#",
  "#................................#",
  "#....CCCC..........NNNN..........#",
  "#....C..C...PPPP...N..N..........#",
  "#....C..A...PPPP...N..I..........#",
  "#...........PPPP.................#",
  "#....,,,,,,,,,,,,,,,,,,,,,.......#",
  "#~~~~D~~~~~~D~~~~~~~~~~~~~~~~~~~~#",
  "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
  "#................................#",
  "#......SS....GG....BB....YY......#",
  "#......S.................Y.....O.#",
  "#..............................V.#",
  "##################################",
];

export const KITCHEN = [
  "################",
  "#12345....Q...X#",
  "#..............#",
  "#C..........U..#",
  "#C..........U..#",
  "#..............#",
  "#L.............#",
  "#6...........W.#",
  "################",
];

export function mineTemplate(seed: number, floor: number): string[] {
  const variants = [
    [
      "################",
      "#L.............#",
      "#..o......e...#",
      "#..............#",
      "#......Z.......#",
      "#..............#",
      "#...e......o..#",
      "#..............#",
      "################",
    ],
    [
      "################",
      "#L...####......#",
      "#.o..#..#..e...#",
      "#....#..#......#",
      "#....Z.........#",
      "#........####..#",
      "#..e.....o.....#",
      "#..............#",
      "################",
    ],
    [
      "################",
      "#L.o.........o.#",
      "#......ee......#",
      "#..##########..#",
      "#......Z.......#",
      "#..##########..#",
      "#.e..........e.#",
      "#..............#",
      "################",
    ],
  ];
  const base = variants[(seed + floor) % variants.length].map((r) => r.split(""));
  if (floor >= 2) {
    base[2][8] = "e";
    base[6][4] = "o";
  }
  if (floor >= 3) base[4][3] = "Y";
  return base.map((r) => r.join(""));
}

export type Cell =
  | "wall"
  | "grass"
  | "path"
  | "water"
  | "dock"
  | "plot"
  | "bush"
  | "osmanthus"
  | "cabin"
  | "inn"
  | "mine"
  | "shop"
  | "gacha"
  | "board"
  | "floor"
  | "cut"
  | "stove"
  | "window"
  | "trash"
  | "plate"
  | "pantry"
  | "ore"
  | "stairs"
  | "chest"
  | "leave"
  | "forge"
  | "marsh"
  | "fire"
  | "relic"
  | "hole"
  | "hill"
  | "gate"
  | "spawn"
  | "tree"
  | "rock"
  | "nest"
  | "savanna";

const VALLEY_KEY: Record<string, Cell> = {
  "#": "wall",
  T: "wall",
  ".": "grass",
  ",": "path",
  "~": "water",
  D: "dock",
  P: "plot",
  F: "bush",
  O: "osmanthus",
  C: "cabin",
  N: "inn",
  A: "spawn",
  I: "inn",
  E: "mine",
  S: "shop",
  G: "gacha",
  B: "board",
  L: "leave",
  Y: "forge",
  V: "gate",
};

const KITCHEN_KEY: Record<string, Cell> = {
  "#": "wall",
  ".": "floor",
  C: "cut",
  U: "stove",
  W: "window",
  X: "trash",
  Q: "plate",
  "1": "pantry",
  "2": "pantry",
  "3": "pantry",
  "4": "pantry",
  "5": "pantry",
  "6": "pantry",
  L: "leave",
};

const WILD_KEY: Record<string, Cell> = {
  "#": "wall",
  T: "wall",
  "^": "hill",
  ".": "grass",
  ",": "path",
  "~": "water",
  D: "dock",
  F: "bush",
  m: "marsh",
  K: "fire",
  R: "relic",
  H: "hole",
  L: "leave",
  e: "spawn",
  t: "tree",
  b: "rock",
  n: "nest",
  s: "savanna",
};

const MINE_KEY: Record<string, Cell> = {
  "#": "wall",
  ".": "floor",
  o: "ore",
  e: "spawn",
  Z: "stairs",
  Y: "chest",
  L: "leave",
};

export interface GridMap {
  rows: string[];
  w: number;
  h: number;
  cell: (x: number, y: number) => Cell;
  walk: (x: number, y: number) => boolean;
  find: (ch: string) => { x: number; y: number }[];
  pantryId: (x: number, y: number) => string | null;
}

const PANTRY_AT: Record<string, string> = {
  "1": "tomato",
  "2": "egg",
  "3": "wheat",
  "4": "greens",
  "5": "fish",
  "6": "osmanthus",
};

export function buildMap(rows: string[], kind: "valley" | "kitchen" | "mine" | "wild"): GridMap {
  const key = kind === "valley" ? VALLEY_KEY : kind === "kitchen" ? KITCHEN_KEY : kind === "wild" ? WILD_KEY : MINE_KEY;
  const w = rows[0].length;
  const h = rows.length;
  const walkable = new Set<Cell>([
    "grass",
    "path",
    "dock",
    "plot",
    "bush",
    "osmanthus",
    "floor",
    "spawn",
    "shop",
    "gacha",
    "board",
    "ore",
    "stairs",
    "chest",
    "leave",
    "forge",
    "marsh",
    "fire",
    "relic",
    "hole",
    "hill",
    "gate",
    "tree",
    "rock",
    "nest",
    "savanna",
  ]);
  return {
    rows,
    w,
    h,
    cell: (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return "wall";
      return key[rows[y][x]] ?? "wall";
    },
    walk: (x, y) =>
      walkable.has(key[rows[y]?.[x]] ?? "wall") ||
      rows[y]?.[x] === "A" ||
      rows[y]?.[x] === "I" ||
      rows[y]?.[x] === "E" ||
      rows[y]?.[x] === "V",
    find: (ch) => {
      const out: { x: number; y: number }[] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) if (rows[y][x] === ch) out.push({ x, y });
      }
      return out;
    },
    pantryId: (x, y) => PANTRY_AT[rows[y]?.[x]] ?? null,
  };
}

export function replaceTile(map: GridMap, kind: "valley" | "kitchen" | "mine" | "wild", x: number, y: number, ch: string): GridMap {
  const next = map.rows.map((r, iy) => (iy === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
  return buildMap(next, kind);
}

export function tileCenter(tx: number, ty: number): { x: number; y: number } {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

export function toTile(px: number, py: number): { x: number; y: number } {
  return { x: Math.floor(px / TILE), y: Math.floor(py / TILE) };
}
