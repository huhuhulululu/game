import type { ActorSnap, EnemySnap } from "../sim/net";
import { TILE } from "../world/maps";
import { blitFit, blitStand, blitWrap, blitWrapZoom } from "./art";

type Ctx = CanvasRenderingContext2D;

export type Near = { n: string; s: string; e: string; w: string };
export type DrawPart = "all" | "ground" | "prop";
export type DrawSkip = { grass?: boolean; water?: boolean; path?: boolean };

const FACE = "'Valley Serif', 'Songti SC', 'STSong', 'PingFang SC', 'Hiragino Mincho ProN', 'Source Han Serif SC', serif";
const GRASS_ZOOM = 2.6;

let lookSeason = "春";

export function setLookSeason(season: string): void {
  lookSeason = season;
}

const FILL: Record<string, string> = {
  "#": "#2a1c16",
  T: "#1e2c22",
  t: "#2a4a30",
  ".": "#3a4a34",
  ",": "#6a5a40",
  "~": "#2a4454",
  D: "#4a6a6a",
  P: "#5a4030",
  F: "#2f5a38",
  O: "#8a6a28",
  C: "#5a3224",
  N: "#5a3224",
  A: "#c45c26",
  I: "#c9a06a",
  E: "#4a3a4a",
  S: "#6a4a28",
  G: "#d4a24a",
  B: "#e6d0a6",
  Y: "#8a6a3c",
  "1": "#c45c3e",
  "2": "#e6c36a",
  "3": "#d4b46a",
  "4": "#5a8f62",
  "5": "#8aa4b5",
  "6": "#d4a24a",
  m: "#2a3a28",
  K: "#d47a3c",
  R: "#7a8a92",
  H: "#1a1010",
  V: "#c9a06a",
  "^": "#4a4038",
  b: "#5a5248",
  n: "#3a2018",
  s: "#6a6a38",
  J: "#6a4a32",
  L: "#c9a06a",
  W: "#f4e7d2",
  X: "#3a2020",
  Q: "#e7d3b4",
  U: "#8a3a16",
  o: "#7d8490",
  e: "#3a3344",
  Z: "#7ec8d6",
};

/** Stable look names so tests can assert the canvas still paints each tile as a thing. */
export function tileLook(ch: string, zone = "valley"): string {
  if (ch === "T" || ch === "t") return "tree";
  if (ch === "~") return "water";
  if (ch === "D") return "dock";
  if (ch === "P") return "plot";
  if (ch === "F") return "bush";
  if (ch === "O") return "osmanthus";
  if (ch === "K") return "fire";
  if (ch === "V") return "gate";
  if (ch === "E") return "mine-mouth";
  if (ch === "S") return "stall";
  if (ch === "G") return "altar";
  if (ch === "B") return "board";
  if (ch === ",") return "path";
  if (ch === "m") return "marsh";
  if (ch === "^") return "hill";
  if (ch === "b") return "rock";
  if (ch === "n") return "nest";
  if (ch === "s") return "savanna";
  if (ch === "J") return "camp";
  if (ch === "H") return "hole";
  if (ch === "o") return "ore";
  if (ch === "Z") return "stairs";
  if (ch === "e") return "lurk";
  if (ch === "U") return "stove";
  if (ch === "Q") return "plate";
  if (ch === "X") return "trash";
  if (ch === "W") return zone === "kitchen" ? "pass" : "ground";
  if ("123456".includes(ch)) return "pantry";
  if (ch === "Y") return zone === "mine" ? "chest" : "anvil";
  if (ch === "R") return zone === "wild" ? "relic" : "icebox";
  if (ch === "C") return zone === "kitchen" ? "cut" : "cabin";
  if (ch === "N" || ch === "I") return "inn";
  if (ch === "A") return "lantern";
  if (ch === "L") return "leave";
  if (ch === "#") return "wall";
  if (ch === ".") {
    if (zone === "kitchen") return "floor";
    if (zone === "mine") return "stone";
    return "grass";
  }
  return "ground";
}

export function cellFill(ch: string, zone: string): string {
  return FILL[ch] ?? (zone === "mine" ? "#2a2430" : "#3d4a36");
}

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  if (Number.isNaN(n)) return hex;
  const r = Math.floor(((n >> 16) & 255) * amt);
  const g = Math.floor(((n >> 8) & 255) * amt);
  const b = Math.floor((n & 255) * amt);
  return `rgb(${r},${g},${b})`;
}

function px(g: Ctx, x: number, y: number, w: number, h: number, c: string): void {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}

function oval(g: Ctx, cx: number, cy: number, rx: number, ry: number, c: string): void {
  g.fillStyle = c;
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function tri(g: Ctx, ax: number, ay: number, bx: number, by: number, cx: number, cy: number, c: string): void {
  g.fillStyle = c;
  g.beginPath();
  g.moveTo(ax, ay);
  g.lineTo(bx, by);
  g.lineTo(cx, cy);
  g.closePath();
  g.fill();
}

function hash(x: number, y: number): number {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) % 1000;
}

function tuft(g: Ctx, x: number, y: number, s: number, c: string): void {
  tri(g, x, y + s, x + s * 0.45, y, x + s * 0.9, y + s, c);
}

function grassAt(g: Ctx, x: number, y: number, w: number, h: number): boolean {
  return blitWrapZoom(g, "grass", x, y, w, h, GRASS_ZOOM);
}

export function drawMeadow(g: Ctx, x: number, y: number, w: number, h: number): boolean {
  g.imageSmoothingEnabled = true;
  if ("imageSmoothingQuality" in g) g.imageSmoothingQuality = "high";
  const base = grassAt(g, x, y, w, h);
  if (!base) return false;
  g.save();
  g.globalAlpha = 0.28;
  g.translate(x + w, y);
  g.scale(-1, 1);
  blitWrapZoom(g, "grass", 0, 0, w, h, 1.73, 91, 63);
  g.restore();
  g.save();
  g.globalAlpha = 0.14;
  blitWrapZoom(g, "grass", x, y, w, h, 3.35, 141, 97);
  g.restore();
  for (let py = y - 40; py < y + h + 40; py += 92) {
    for (let px = x - 40; px < x + w + 40; px += 108) {
      const n = hash(Math.round(px), Math.round(py));
      const tint =
        n > 720 ? "rgba(196,92,38,0.05)" : n > 400 ? "rgba(26,48,32,0.1)" : "rgba(74,120,70,0.08)";
      oval(g, px + (n % 37) - 18, py + (hash(py, px) % 29) - 14, 38 + (n % 22), 26 + (n % 16), tint);
    }
  }
  const step = 53;
  const x0 = Math.floor(x / step) * step;
  const y0 = Math.floor(y / step) * step;
  for (let py = y0; py < y + h; py += step) {
    for (let px = x0; px < x + w; px += step) {
      const n = hash(px, py);
      if ((n + hash(py, px + 3)) % 1000 < 540) continue;
      const ox = px + (n % 27) - 13;
      const oy = py + (hash(py, px) % 25) - 12;
      if (!blitFit(g, "tuft", ox - 8, oy - 6, 15 + (n % 9), 12 + (n % 6))) {
        if (n > 880) oval(g, ox + 8, oy + 6, 2, 2, "#c45c26");
        else tuft(g, ox, oy, 7 + (n % 5), "#2f5a38");
      }
    }
  }
  return true;
}

function ground(g: Ctx, zone: string, ch: string, x: number, y: number, now: number, skipGrass = false, skipPath = false): void {
  if (zone === "kitchen") {
    if (blitWrapZoom(g, "wood", x, y, TILE, TILE, 1.85)) return;
    px(g, x, y, TILE, TILE, "#6e4a32");
    return;
  }
  if (zone === "mine") {
    if (blitWrap(g, "stone", x, y, TILE, TILE)) return;
    px(g, x, y, TILE, TILE, "#2a2624");
    oval(g, x + 12, y + 20, 8, 5, "#1c1a18");
    oval(g, x + 26, y + 10, 6, 4, "#3a3632");
    return;
  }
  if (zone === "wild") {
    if (ch === "m") {
      if (blitWrap(g, "marsh", x, y, TILE, TILE)) return;
      px(g, x, y, TILE, TILE, "#24382c");
      oval(g, x + 18, y + 20, 12, 6, "#1a2e24");
      if (Math.sin(now / 640 + x) > 0.2) oval(g, x + 14, y + 16, 7, 3, "#3a6a58");
      return;
    }
    if (ch === "s") {
      px(g, x, y, TILE, TILE, "#6a6a30");
      tuft(g, x + 6, y + 10, 16, "#8a8a40");
      tuft(g, x + 18, y + 8, 18, "#7a7a38");
      return;
    }
    if (skipGrass) return;
    if (blitWrap(g, "grass", x, y, TILE, TILE)) return;
    px(g, x, y, TILE, TILE, "#2e3a28");
    tuft(g, x + 8, y + 14, 12, "#3a4a30");
    return;
  }
  if (ch === ",") {
    if (skipPath) return;
    if (blitWrap(g, "path", x - 1, y - 1, TILE + 2, TILE + 2)) return;
    px(g, x, y, TILE, TILE, "#8a7a58");
    oval(g, x + 18, y + 18, 14, 6, "#7a6a48");
    oval(g, x + 10, y + 10, 4, 3, "#6a5a38");
    return;
  }
  if (skipGrass) return;
  if (blitWrap(g, "grass", x, y, TILE, TILE)) return;
  px(g, x, y, TILE, TILE, "#3f6d45");
  const n = hash(x, y);
  tuft(g, x + 4 + (n % 10), y + 12 + (n % 8), 14, "#2f5a38");
  tuft(g, x + 16 + (n % 7), y + 18, 12, "#4a7d52");
  if (n > 780) oval(g, x + 22, y + 10, 3, 3, "#c45c26");
}

export function treeVariant(x: number, y: number, pine: boolean): string {
  const n = hash(x, y);
  const slot = (Math.floor(x / TILE) + Math.floor(y / TILE) * 2) % 3;
  if (pine) return lookSeason === "冬" || n > 780 ? "pineSnow" : "pine";
  if (lookSeason === "秋") return (["treeGold", "treeWide", "treeTall"] as const)[slot];
  if (lookSeason === "冬") return (["treeWide", "treeGold", "pineSnow"] as const)[slot];
  return (["tree", "treeWide", "treeTall"] as const)[slot];
}

function tree(g: Ctx, x: number, y: number, pine: boolean, now: number): void {
  const n = hash(x, y);
  const name = treeVariant(x, y, pine);
  const grow = 0.76 + (n % 32) / 90;
  const ox = (hash(x + 2, y) % 19) - 9;
  const flip = hash(x, y + 11) > 500;
  const tall = name === "treeTall" || name === "pine" || name === "pineSnow";
  const wide = name === "treeWide";
  const bw = (wide ? 98 : tall ? 58 : 84) * grow;
  const bh = (wide ? 100 : tall ? 136 : 114) * grow;
  oval(g, x + 18 + ox, y + 32, (wide ? 18 : tall ? 9 : 13) * grow, 5, "rgba(20,16,10,0.28)");
  g.save();
  g.translate(x + 18 + ox, y + 36);
  if (flip) g.scale(-1, 1);
  const painted = blitFit(g, name, -bw / 2, -bh, bw, bh);
  g.restore();
  if (painted) return;
  const sway = Math.sin(now / 860 + x * 0.03) * 1.4;
  oval(g, x + 18, y + 34, 12, 4, "rgba(20,16,10,0.28)");
  px(g, x + 15, y + 10, 7, 24, "#5a3a22");
  px(g, x + 16, y + 10, 2, 24, "#3a2414");
  oval(g, x + 18, y + 34, 6, 3, "#4a2e18");
  const cx = x + 18 + sway;
  if (pine || name === "pine" || name === "pineSnow") {
    tri(g, cx, y - 16, cx - 14, y + 6, cx + 14, y + 6, "#1e3a24");
    tri(g, cx, y - 6, cx - 16, y + 16, cx + 16, y + 16, "#2a4a30");
    tri(g, cx, y + 4, cx - 13, y + 22, cx + 13, y + 22, "#2a4a28");
    return;
  }
  if (name === "treeTall") {
    oval(g, cx, y - 4, 9, 16, "#2a4a28");
    oval(g, cx + 2, y + 8, 8, 12, "#3f6d4a");
    return;
  }
  oval(g, cx - 6, y + 2, 14, 12, "#2a4a28");
  oval(g, cx + 8, y, 13, 11, "#3f6d4a");
  oval(g, cx, y + 8, 15, 10, "#2f5a38");
  oval(g, cx + 2, y - 6, 8, 6, "#5a8a58");
}

function water(g: Ctx, x: number, y: number, now: number): void {
  if (!blitWrap(g, "water", x - 1, y - 1, TILE + 2, TILE + 2)) {
    px(g, x, y, TILE, TILE, "#1a5470");
    px(g, x, y + 16, TILE, 20, "#143e54");
  }
  const pulse = 0.05 + Math.sin(now / 920 + x * 0.03 + y * 0.02) * 0.03;
  oval(g, x + 18, y + 17, 13, 6, `rgba(190,214,220,${pulse})`);
}

export function dockSheet(x: number, y: number): string {
  void y;
  return Math.floor(x / TILE) % 2 === 0 ? "dock" : "dockB";
}

function dock(g: Ctx, x: number, y: number, skipWater = false): void {
  if (!skipWater) water(g, x, y, 0);
  const n = hash(x, y);
  const name = dockSheet(x, y);
  const wide = name === "dockB";
  const grow = 0.92 + (n % 10) / 90;
  oval(g, x + 18, y + 30, (wide ? 18 : 13) * grow, 4, "rgba(20,16,10,0.22)");
  g.save();
  g.translate(x + 18, y + 28);
  if (wide) g.scale(-1, 1);
  const bw = (wide ? 74 : 52) * grow;
  const bh = (wide ? 40 : 58) * grow;
  const painted = blitFit(g, name, -bw / 2, -bh, bw, bh);
  g.restore();
  oval(g, x + 18, y + 31, wide ? 16 : 12, 4, "rgba(16,36,48,0.35)");
  if (painted) return;
  if (wide) {
    px(g, x - 4, y + 14, TILE + 8, 14, "#5a3e22");
    oval(g, x + 8, y + 16, 6, 7, "#6a4a28");
    px(g, x + 22, y + 8, 5, 18, "#3a2414");
    return;
  }
  px(g, x, y + 12, TILE, 16, "#6a4a28");
  g.strokeStyle = "#8a6a40";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x, y + 16);
  g.lineTo(x + TILE, y + 16);
  g.moveTo(x, y + 24);
  g.lineTo(x + TILE, y + 24);
  g.stroke();
  px(g, x + 4, y + 10, 4, 20, "#4a3018");
  px(g, x + 28, y + 10, 4, 20, "#4a3018");
}

function fire(g: Ctx, x: number, y: number, now: number): void {
  if (blitFit(g, "fire", x - 8, y - 16, 52, 56)) return;
  oval(g, x + 18, y + 28, 14, 5, "#4a4038");
  px(g, x + 8, y + 22, 10, 6, "#5a3a22");
  px(g, x + 18, y + 23, 10, 5, "#3a2414");
  const f = 0.62 + Math.sin(now / 88) * 0.38;
  oval(g, x + 18, y + 16, 7, 10 * f, "#c45c26");
  oval(g, x + 18, y + 12, 4, 7 * f, "#e8a030");
  oval(g, x + 18, y + 8, 2, 4 * f, "#ffe8a0");
}

function roof(g: Ctx, x: number, y: number, warm: boolean): void {
  px(g, x + 1, y + 4, 34, 12, warm ? "#c45c26" : "#8a3a20");
  px(g, x + 6, y + 1, 24, 6, warm ? "#a44a20" : "#6a2a14");
  px(g, x + 3, y + 14, 30, 20, "#c4a070");
  px(g, x + 3, y + 14, 30, 3, "#8a6a48");
}

function cabin(g: Ctx, x: number, y: number): void {
  roof(g, x, y, true);
  px(g, x + 6, y + 20, 6, 6, "#6a8aaa");
  px(g, x + 24, y + 20, 6, 6, "#5a7a98");
}

function inn(g: Ctx, x: number, y: number, door: boolean): void {
  roof(g, x, y, false);
  if (door) {
    px(g, x + 14, y + 20, 8, 14, "#3f6d5c");
    px(g, x + 16, y + 26, 3, 3, "#e8c070");
  } else {
    px(g, x + 6, y + 20, 6, 6, "#f0c27a");
    px(g, x + 24, y + 20, 6, 6, "#d4a24a");
  }
}

function lanternDoor(g: Ctx, x: number, y: number, now: number): void {
  roof(g, x, y, true);
  px(g, x + 13, y + 20, 10, 14, "#5a3a22");
  const glow = 0.55 + Math.sin(now / 220) * 0.2;
  px(g, x + 6, y + 20, 6, 6, `rgba(255,224,138,${glow})`);
  px(g, x + 24, y + 20, 6, 6, "#d4a24a");
}

function plotSoil(g: Ctx, x: number, y: number): void {
  if (!blitWrap(g, "path", x, y, TILE, TILE)) px(g, x, y, TILE, TILE, "#6b4a28");
  const n = hash(x, y);
  oval(g, x + 8 + (n % 7), y + 12 + (n % 5), 5, 2, "rgba(42,24,16,0.22)");
  oval(g, x + 20 + (n % 6), y + 22, 6, 2, "rgba(32,18,12,0.2)");
}

function bush(g: Ctx, x: number, y: number, gold: boolean): void {
  if (blitFit(g, "bush", x - 8, y - 14, 52, 52)) {
    if (gold) {
      oval(g, x + 10, y + 12, 3, 3, "#e6d0a6");
      oval(g, x + 24, y + 16, 3, 3, "#c9a06a");
    }
    return;
  }
  oval(g, x + 18, y + 24, 13, 8, gold ? "#8a6a28" : "#2f5a38");
  oval(g, x + 18, y + 16, 10, 8, gold ? "#c9a06a" : "#3f6d5c");
  oval(g, x + 18, y + 10, 5, 4, gold ? "#e6d0a6" : "#5a8a58");
}

function stall(g: Ctx, x: number, y: number, near?: Near): void {
  if (near && (near.w === "S" || near.n === "S")) {
    oval(g, x + 18, y + 24, 7, 4, "#6a4a28");
    oval(g, x + 18, y + 20, 5, 4, "#c45c26");
    return;
  }
  oval(g, x + 18, y + 32, 14, 4, "rgba(20,16,10,0.22)");
  if (blitFit(g, "stall", x - 12, y - 36, 60, 78)) return;
  px(g, x + 2, y + 16, 32, 16, "#8a6a40");
  px(g, x + 4, y + 18, 28, 8, "#c4a060");
  tri(g, x + 18, y + 2, x, y + 16, x + 36, y + 16, "#c45c26");
  oval(g, x + 10, y + 20, 4, 3, "#c45c26");
  oval(g, x + 26, y + 20, 4, 3, "#3f6d5c");
}

function anvil(g: Ctx, x: number, y: number): void {
  if (blitFit(g, "anvil", x - 6, y - 8, 48, 48)) return;
  oval(g, x + 18, y + 30, 12, 5, "#4a3420");
  px(g, x + 10, y + 22, 16, 10, "#3a342c");
  px(g, x + 6, y + 14, 24, 10, "#6a6460");
  px(g, x + 4, y + 12, 10, 6, "#8a8480");
  px(g, x + 8, y + 10, 20, 4, "#8a8480");
}

function altar(g: Ctx, x: number, y: number): void {
  if (blitFit(g, "altar", x - 6, y - 10, 48, 50)) return;
  px(g, x + 8, y + 18, 20, 14, "#6a5848");
  px(g, x + 12, y + 10, 12, 10, "#8a7868");
  oval(g, x + 18, y + 8, 5, 4, "#c45c26");
  oval(g, x + 18, y + 5, 2, 2, "#3f6d5c");
}

function board(g: Ctx, x: number, y: number): void {
  if (blitFit(g, "board", x - 6, y - 14, 48, 54)) return;
  px(g, x + 8, y + 22, 4, 12, "#5a3a22");
  px(g, x + 24, y + 22, 4, 12, "#5a3a22");
  px(g, x + 6, y + 6, 24, 20, "#6a4a30");
  px(g, x + 8, y + 8, 20, 16, "#e6d0a6");
  px(g, x + 10, y + 12, 14, 2, "#8a6a40");
  px(g, x + 10, y + 17, 10, 2, "#8a6a40");
}

function gate(g: Ctx, x: number, y: number): void {
  if (blitFit(g, "gate", x - 8, y - 16, 52, 56)) return;
  px(g, x + 4, y + 4, 6, 28, "#5a3a22");
  px(g, x + 26, y + 4, 6, 28, "#5a3a22");
  px(g, x + 6, y + 8, 24, 6, "#3f6d5c");
  oval(g, x + 30, y + 10, 4, 5, "#c45c26");
}

function mineMouth(g: Ctx, x: number, y: number): void {
  px(g, x + 2, y + 8, 32, 24, "#1a1814");
  px(g, x + 4, y + 6, 28, 6, "#5a4a38");
  px(g, x + 6, y + 14, 24, 16, "#0e0c0a");
  px(g, x + 8, y + 8, 4, 22, "#6a5a44");
  px(g, x + 24, y + 8, 4, 22, "#6a5a44");
}

function ore(g: Ctx, x: number, y: number, now: number): void {
  oval(g, x + 18, y + 30, 12, 4, "rgba(20,16,10,0.28)");
  if (blitFit(g, "ore", x - 10, y - 10, 56, 50)) {
    if (Math.sin(now / 220 + x) > 0.35) oval(g, x + 22, y + 14, 4, 3, "rgba(220,210,160,0.28)");
    return;
  }
  oval(g, x + 18, y + 28, 12, 4, "#2a2218");
  tri(g, x + 10, y + 26, x + 16, y + 10, x + 22, y + 26, "#4a443c");
  tri(g, x + 16, y + 26, x + 24, y + 8, x + 30, y + 26, "#6a6460");
  if (Math.sin(now / 200 + x) > 0.25) oval(g, x + 22, y + 14, 3, 3, "#c8d0d8");
}

function stairs(g: Ctx, x: number, y: number): void {
  if (blitFit(g, "stairs", x - 8, y - 10, 52, 50)) return;
  px(g, x + 4, y + 6, 28, 8, "#6a5a44");
  px(g, x + 7, y + 14, 22, 8, "#5a4a38");
  px(g, x + 10, y + 22, 16, 8, "#3a2e22");
  px(g, x + 4, y + 12, 28, 2, "#2a2018");
  px(g, x + 7, y + 20, 22, 2, "#2a2018");
}

function lurk(g: Ctx, x: number, y: number, now: number): void {
  const bob = Math.sin(now / 400) * 2;
  oval(g, x + 18, y + 30 + bob, 11, 4, "rgba(10,8,6,0.32)");
  if (blitFit(g, "beast", x - 12, y - 18 + bob, 60, 54)) return;
  oval(g, x + 18, y + 28 + bob, 10, 3, "rgba(10,8,6,0.35)");
  oval(g, x + 18, y + 20 + bob, 11, 8, "#1a1410");
  oval(g, x + 18, y + 12 + bob, 7, 6, "#2a2018");
  oval(g, x + 15, y + 11 + bob, 1.6, 1.6, "#c45c26");
  oval(g, x + 22, y + 11 + bob, 1.6, 1.6, "#c45c26");
}

function stove(g: Ctx, x: number, y: number, now: number, near?: Near): void {
  if (near?.s === "U") return;
  oval(g, x + 18, y + 34, 16, 5, "rgba(20,16,10,0.3)");
  if (blitFit(g, "stove", x - 22, y - 58, 80, 100)) {
    const f = 0.5 + Math.sin(now / 80) * 0.4;
    oval(g, x + 18, y + 10, 6, 4 * f, "rgba(232,160,48,0.48)");
    return;
  }
  px(g, x + 6, y + 12, 24, 20, "#6a4030");
  px(g, x + 8, y + 8, 20, 6, "#4a2a1c");
  oval(g, x + 18, y + 22, 8, 7, "#2a2018");
  const f = 0.5 + Math.sin(now / 80) * 0.4;
  oval(g, x + 18, y + 22, 5, 5 * f, "#c45c26");
  oval(g, x + 18, y + 20, 3, 3 * f, "#e8a030");
}

function plate(g: Ctx, x: number, y: number): void {
  oval(g, x + 18, y + 34, 16, 5, "rgba(20,16,10,0.28)");
  if (blitFit(g, "pot", x - 22, y - 48, 80, 90)) return;
  oval(g, x + 18, y + 24, 14, 6, "#3a4048");
  oval(g, x + 18, y + 20, 13, 8, "#6a7080");
  oval(g, x + 18, y + 18, 9, 5, "#c8d0d4");
  px(g, x + 8, y + 16, 4, 8, "#5a6068");
  px(g, x + 24, y + 16, 4, 8, "#5a6068");
}

function icebox(g: Ctx, x: number, y: number): void {
  oval(g, x + 18, y + 34, 14, 5, "rgba(20,16,10,0.28)");
  if (blitFit(g, "icebox", x - 18, y - 46, 72, 88)) return;
  px(g, x + 8, y + 6, 20, 26, "#5a3a22");
  px(g, x + 10, y + 8, 16, 12, "#7aa0b8");
  px(g, x + 10, y + 22, 16, 8, "#3a5870");
  oval(g, x + 22, y + 20, 2, 2, "#d4a24a");
}

function pantry(g: Ctx, x: number, y: number, ch: string): void {
  if (blitFit(g, "pantry", x - 4, y - 10, 44, 50)) return;
  px(g, x + 4, y + 6, 28, 26, "#6a4a30");
  px(g, x + 6, y + 8, 11, 20, "#8a6a48");
  px(g, x + 19, y + 8, 11, 20, "#8a6a48");
  const jar =
    ch === "1" ? "#c45c3e" : ch === "2" ? "#e6c36a" : ch === "4" ? "#5a8f62" : ch === "5" ? "#8aa4b5" : "#d4a24a";
  oval(g, x + 11, y + 16, 4, 5, jar);
  oval(g, x + 24, y + 18, 4, 5, jar);
}

function cut(g: Ctx, x: number, y: number): void {
  if (blitFit(g, "cut", x - 10, y - 12, 56, 52)) return;
  oval(g, x + 18, y + 22, 14, 7, "#6a4a28");
  oval(g, x + 18, y + 20, 13, 6, "#c4a070");
  px(g, x + 20, y + 10, 10, 3, "#8a8480");
  px(g, x + 28, y + 8, 3, 6, "#6a6460");
}

function pass(g: Ctx, x: number, y: number): void {
  oval(g, x + 18, y + 34, 18, 5, "rgba(20,16,10,0.28)");
  if (blitFit(g, "pass", x - 28, y - 52, 92, 96)) return;
  px(g, x + 2, y + 8, 32, 22, "#6a4a30");
  px(g, x + 6, y + 12, 24, 14, "#e8d8b8");
  px(g, x + 8, y + 4, 20, 8, "#5a3a22");
  oval(g, x + 18, y + 18, 8, 4, "#c45c26");
}

function trash(g: Ctx, x: number, y: number): void {
  oval(g, x + 18, y + 30, 10, 4, "rgba(20,16,10,0.28)");
  if (blitFit(g, "trash", x - 10, y - 20, 56, 58)) return;
  oval(g, x + 18, y + 28, 8, 3, "#2a1810");
  px(g, x + 10, y + 14, 16, 14, "#3a2020");
  px(g, x + 8, y + 12, 20, 4, "#5a3030");
  oval(g, x + 18, y + 12, 10, 3, "#4a2820");
}

function wall(g: Ctx, x: number, y: number, zone: string): void {
  if (zone === "mine") {
    if (!blitWrap(g, "stone", x, y, TILE, TILE)) {
      px(g, x, y, TILE, TILE, "#1a1614");
      oval(g, x + 12, y + 16, 8, 6, "#2a2420");
    }
    px(g, x + 8, y, 4, TILE, "#4a3a2c");
    return;
  }
  if (zone === "kitchen") {
    if (blitWrap(g, "wood", x, y, TILE, TILE)) {
      g.fillStyle = "rgba(18, 10, 6, 0.42)";
      g.fillRect(x, y, TILE, TILE);
      return;
    }
    px(g, x, y, TILE, TILE, "#3a2418");
    return;
  }
  /* Valley walls sit under the meadow. A bush per cell is the map frame. */
}

function hill(g: Ctx, x: number, y: number): void {
  oval(g, x + 18, y + 24, 16, 8, "#4a4038");
  oval(g, x + 18, y + 16, 11, 8, "#5a5248");
}

function rock(g: Ctx, x: number, y: number): void {
  oval(g, x + 18, y + 28, 12, 4, "rgba(20,16,10,0.26)");
  if (blitFit(g, "rock", x - 12, y - 14, 60, 52)) return;
  oval(g, x + 18, y + 22, 11, 8, "#5a5248");
  oval(g, x + 16, y + 16, 7, 5, "#6a6460");
}

function nest(g: Ctx, x: number, y: number): void {
  px(g, x + 8, y + 18, 20, 10, "#3a2018");
  px(g, x + 12, y + 14, 12, 8, "#5a3a22");
  px(g, x + 16, y + 12, 4, 4, "#c45c26");
}

function camp(g: Ctx, x: number, y: number): void {
  px(g, x + 6, y + 18, 24, 10, "#5a3a22");
  px(g, x + 8, y + 8, 20, 14, "#8a5a30");
  px(g, x + 16, y + 4, 4, 8, "#3a2414");
}

function relic(g: Ctx, x: number, y: number): void {
  px(g, x + 10, y + 10, 16, 18, "#7a8a92");
  px(g, x + 14, y + 6, 8, 8, "#c8d4d8");
  px(g, x + 16, y + 16, 4, 8, "#4a5a60");
}

function hole(g: Ctx, x: number, y: number): void {
  px(g, x + 6, y + 10, 24, 18, "#0a0606");
  px(g, x + 10, y + 14, 16, 10, "#1a1010");
  px(g, x + 8, y + 8, 20, 4, "#3a2418");
}

function leave(g: Ctx, x: number, y: number, zone: string): void {
  if (zone === "kitchen") {
    oval(g, x + 18, y + 32, 10, 4, "rgba(20,16,10,0.26)");
    px(g, x + 7, y + 2, 22, 30, "#4a3220");
    px(g, x + 10, y + 6, 16, 24, "#1a1008");
    oval(g, x + 22, y + 18, 1.5, 1.5, "#c9a06a");
    return;
  }
  px(g, x + 8, y + 8, 20, 20, "#c9a06a");
  px(g, x + 12, y + 12, 12, 12, "#2a2018");
  px(g, x + 16, y + 16, 4, 8, "#f4e7d2");
}

function chest(g: Ctx, x: number, y: number): void {
  px(g, x + 6, y + 14, 24, 16, "#8a6a3c");
  px(g, x + 6, y + 12, 24, 6, "#c9a06a");
  px(g, x + 16, y + 18, 4, 4, "#d4a24a");
}

export function drawPlot(g: Ctx, px0: number, py0: number, stage: number, seed?: string, soil = true): void {
  if (soil) plotSoil(g, px0, py0);
  if (!seed && stage <= 0) return;
  const name = seed ?? "";
  const green = name.includes("柿") ? "#c45c26" : name.includes("姜") ? "#d4c060" : "#3f6d4a";
  if (stage <= 0) {
    tuft(g, px0 + 14, py0 + 18, 8, "#6a6a38");
    return;
  }
  if (stage === 1) {
    tuft(g, px0 + 10, py0 + 16, 10, green);
    tuft(g, px0 + 20, py0 + 20, 9, green);
    return;
  }
  if (stage === 2) {
    px(g, px0 + 11, py0 + 20, 2, 8, "#5a3a22");
    px(g, px0 + 23, py0 + 22, 2, 8, "#5a3a22");
    oval(g, px0 + 12, py0 + 16, 5, 8, green);
    oval(g, px0 + 24, py0 + 18, 5, 8, green);
    return;
  }
  px(g, px0 + 11, py0 + 20, 2, 10, "#5a3a22");
  px(g, px0 + 23, py0 + 22, 2, 10, "#5a3a22");
  oval(g, px0 + 12, py0 + 14, 6, 10, green);
  oval(g, px0 + 24, py0 + 16, 6, 10, green);
  oval(g, px0 + 12, py0 + 8, 4, 4, name.includes("柿") ? "#c45c26" : "#e8c070");
  oval(g, px0 + 24, py0 + 10, 4, 4, name.includes("姜") ? "#e8d080" : "#d4a24a");
}

function paintProp(g: Ctx, look: string, ch: string, x: number, y: number, now: number, zone: string, near?: Near, skipWater = false): void {
  if (look === "tree") tree(g, x, y, ch === "t" || (zone === "wild" && ch === "T"), now);
  else if (look === "dock") dock(g, x, y, skipWater);
  else if (look === "fire") fire(g, x, y, now);
  else if (look === "cabin") cabin(g, x, y);
  else if (look === "inn") inn(g, x, y, ch === "I");
  else if (look === "lantern") lanternDoor(g, x, y, now);
  else if (look === "bush") bush(g, x, y, false);
  else if (look === "osmanthus") bush(g, x, y, true);
  else if (look === "stall") stall(g, x, y, near);
  else if (look === "anvil") anvil(g, x, y);
  else if (look === "altar") altar(g, x, y);
  else if (look === "board") board(g, x, y);
  else if (look === "gate") gate(g, x, y);
  else if (look === "mine-mouth") mineMouth(g, x, y);
  else if (look === "ore") ore(g, x, y, now);
  else if (look === "stairs") stairs(g, x, y);
  else if (look === "lurk") lurk(g, x, y, now);
  else if (look === "stove") stove(g, x, y, now, near);
  else if (look === "plate") plate(g, x, y);
  else if (look === "icebox") icebox(g, x, y);
  else if (look === "pantry") pantry(g, x, y, ch);
  else if (look === "cut") cut(g, x, y);
  else if (look === "pass") pass(g, x, y);
  else if (look === "trash") trash(g, x, y);
  else if (look === "hill") hill(g, x, y);
  else if (look === "rock") rock(g, x, y);
  else if (look === "nest") nest(g, x, y);
  else if (look === "camp") camp(g, x, y);
  else if (look === "relic") relic(g, x, y);
  else if (look === "hole") hole(g, x, y);
  else if (look === "leave") leave(g, x, y, zone);
  else if (look === "chest") chest(g, x, y);
}

export function drawCell(
  g: Ctx,
  ch: string,
  x: number,
  y: number,
  fill: string,
  now: number,
  zone = "valley",
  near?: Near,
  part: DrawPart = "all",
  skip: DrawSkip | boolean = {},
): void {
  const flags: DrawSkip = typeof skip === "boolean" ? { grass: skip } : skip;
  g.imageSmoothingEnabled = true;
  if ("imageSmoothingQuality" in g) g.imageSmoothingQuality = "high";
  const look = tileLook(ch, zone);
  const floor =
    look === "grass" ||
    look === "path" ||
    look === "marsh" ||
    look === "savanna" ||
    look === "floor" ||
    look === "stone" ||
    look === "ground" ||
    look === "water" ||
    look === "wall";
  if (part !== "prop") {
    if (look === "water") {
      if (!flags.water) water(g, x, y, now);
    } else if (look === "wall") wall(g, x, y, zone);
    else if (look === "ground") px(g, x, y, TILE, TILE, fill || "#3d4a36");
    else if (floor) {
      ground(g, zone, ch, x, y, now, !!flags.grass, !!flags.path);
      if (fill && fill !== cellFill(ch, zone)) {
        g.fillStyle = fill;
        g.globalAlpha = 0.2;
        g.fillRect(x, y, TILE, TILE);
        g.globalAlpha = 1;
      }
    } else if (look === "dock" && flags.water) {
      /* river sheet already covers the slip */
    } else {
      ground(g, zone, look === "plot" ? "," : ".", x, y, now, !!flags.grass, !!flags.path);
    }
  }
  if (part !== "ground" && !floor && look !== "plot") paintProp(g, look, ch, x, y, now, zone, near, !!flags.water);
}

function heldChip(name: string): string {
  if (!name) return "";
  if (name.includes("火把")) return "炬";
  if (name.includes("鱼") || name.includes("鳞")) return "鱼";
  if (name.includes("矿") || name.includes("铁") || name.includes("铜")) return "矿";
  if (name.includes("种")) return "种";
  if (name.includes("柿") || name.includes("菜") || name.includes("姜") || name.includes("麦")) return "菜";
  if (name.includes("膳") || name.includes("汤") || name.includes("饭") || name.includes("饼")) return "膳";
  if (name.includes("戒") || name.includes("铃") || name.includes("桂")) return "礼";
  return name.slice(0, 1);
}

function walkPair(warm: boolean, facing: number): [string, string] {
  if (facing === 0) return warm ? ["warmBackWalk", "warmBackWalk2"] : ["pineBackWalk", "pineBackWalk2"];
  if (facing === 1 || facing === 3) {
    return warm ? ["warmSideWalk", "warmSideWalk2"] : ["pineSideWalk", "pineSideWalk2"];
  }
  return warm ? ["warmWalk", "warmWalk2"] : ["pineWalk", "pineWalk2"];
}

function actorSheets(warm: boolean, facing: number, moving: boolean, now: number, busy = ""): string[] {
  if (busy === "sit") return warm ? ["warmSit", "warm"] : ["pineSit", "pineChar"];
  if (busy === "fish") return warm ? ["warmFish", "warmSide", "warm"] : ["pineFish", "pineSide", "pineChar"];
  if (busy === "forge") return warm ? ["warmForge", "warm"] : ["pineForge", "pineChar"];
  if (busy === "chop") return warm ? ["warmChop", "warm"] : ["pineChop", "pineChar"];
  const step = Math.floor(now / 210) % 2 === 0;
  if (facing === 0) {
    const idle = warm ? "warmBack" : "pineBack";
    if (!moving) return [idle];
    return warm
      ? step
        ? ["warmBackWalk", idle]
        : ["warmBackWalk2", idle]
      : step
        ? ["pineBackWalk", idle]
        : ["pineBackWalk2", idle];
  }
  if (facing === 1 || facing === 3) {
    const idle = warm ? "warmSide" : "pineSide";
    if (!moving) return [idle];
    return warm
      ? step
        ? ["warmSideWalk", idle]
        : ["warmSideWalk2", idle]
      : step
        ? ["pineSideWalk", idle]
        : ["pineSideWalk2", idle];
  }
  const idle = warm ? "warm" : "pineChar";
  if (!moving) return [idle];
  return warm
    ? step
      ? ["warmWalk", idle]
      : ["warmWalk2", idle]
    : step
      ? ["pineWalk", idle]
      : ["pineWalk2", idle];
}

export function drawActor(g: Ctx, a: ActorSnap, ox: number, oy: number, now = 0, moving = false): void {
  const x = ox + a.x;
  const y = oy + a.y;
  const warm = a.side === "left";
  const body = warm ? "#c45c26" : "#3f6d5c";
  const cloth = warm ? "#e8a060" : "#6a9a88";
  const face = [
    [0, -3],
    [3, 0],
    [0, 3],
    [-3, 0],
  ][a.facing] ?? [0, 3];
  if (a.torch) drawLamp(g, x, y, 52, 0.42);
  if (a.ping > 0) {
    const r = 16 + (1.6 - Math.min(1.6, a.ping)) * 26;
    g.strokeStyle = `rgba(244,231,210,${Math.min(0.55, a.ping * 0.38)})`;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 1;
  }
  const busy = a.busy ?? "";
  const bob = busy || !moving ? 0.08 : Math.sin(now / 280) * 0.28;
  oval(g, x, y + 8, 11, 3.4, "rgba(20,16,10,0.3)");
  g.save();
  g.translate(x, y + bob);
  if (a.facing === 3 && busy !== "sit") g.scale(-1, 1);
  let drew = false;
  const box =
    busy === "sit"
      ? ([-24, -58, 48, 60] as const)
      : busy === "fish"
        ? ([-28, -70, 58, 70] as const)
        : ([-23, -70, 46, 70] as const);
  if (moving && !busy) {
    const pair = walkPair(warm, a.facing);
    const slot = Math.floor(now / 280) % 2;
    if (blitStand(g, pair[slot], box[0], box[1], box[2], box[3])) drew = true;
  }
  if (!drew) {
    for (const sheet of actorSheets(warm, a.facing, moving, now, busy)) {
      if (blitStand(g, sheet, box[0], box[1], box[2], box[3])) {
        drew = true;
        break;
      }
    }
  }
  g.restore();
  if (drew) {
    const mark = heldChip(a.heldName);
    if (mark && busy !== "fish" && busy !== "forge" && busy !== "chop") {
      const hx = a.facing === 3 ? x - 20 : x + 12;
      oval(g, hx + 5, y - 6, 6, 6, "#d4a24a");
      g.fillStyle = "#2a2018";
      g.font = `8px ${FACE}`;
      g.textAlign = "center";
      g.fillText(mark, hx + 5, y - 2);
    }
    if (a.fishing === "bite") {
      g.strokeStyle = "#f4e7d2";
      g.strokeRect(x - 18, y - 24, 36, 36);
    }
    const nw = Math.min(52, a.name.length * 8 + 10);
    const nameY = busy === "sit" ? y - 66 : y - 78;
    px(g, x - nw / 2, nameY, nw, 11, "rgba(40,28,16,0.78)");
    g.fillStyle = "#f4e8d0";
    g.font = `10px ${FACE}`;
    g.textAlign = "center";
    g.fillText(a.name, x, nameY + 9);
    px(g, x - 11, y + 5, 22, 3, "#3a2018");
    px(g, x - 11, y + 5, 22 * Math.max(0, a.hp / a.maxHp), 3, a.hp / a.maxHp < 0.35 ? "#c45c26" : "#3f6d5c");
    px(g, x - 11, y + 9, 22 * Math.max(0, a.hunger / 100), 2, "#6aa36a");
    return;
  }
  oval(g, x, y + 12, 9, 3, "rgba(20,16,10,0.3)");
  px(g, x - 6, y + 2, 5, 9, "#3a2a1c");
  px(g, x + 1, y + 2, 5, 9, "#3a2a1c");
  oval(g, x, y - 2, 9, 8, body);
  oval(g, x, y - 2, 7, 5, cloth);
  oval(g, x, y - 14, 7, 7, "#e8c8a0");
  oval(g, x, y - 17, 7, 3, warm ? "#5a2a14" : "#2a3a30");
  oval(g, x - 2 + face[0], y - 13 + face[1], 1.6, 1.6, "#2a2018");
  oval(g, x + 3 + face[0], y - 13 + face[1], 1.4, 1.4, "#2a2018");
  if (a.facing === 1) oval(g, x + 10, y - 2, 4, 3, body);
  if (a.facing === 3) oval(g, x - 10, y - 2, 4, 3, body);
  const mark = heldChip(a.heldName);
  if (mark) {
    const hx = a.facing === 3 ? x - 16 : x + 8;
    const hy = y - 6;
    px(g, hx, hy, 10, 10, "#d4a24a");
    g.fillStyle = "#2a2018";
    g.font = `8px ${FACE}`;
    g.textAlign = "center";
    g.fillText(mark, hx + 5, hy + 8);
  }
  if (a.fishing === "bite") {
    g.strokeStyle = "#f4e7d2";
    g.strokeRect(x - 16, y - 20, 32, 32);
  }
  const nw = Math.min(48, a.name.length * 8 + 10);
  px(g, x - nw / 2, y - 30, nw, 11, "rgba(40,28,16,0.78)");
  g.fillStyle = "#f4e8d0";
  g.font = `10px ${FACE}`;
  g.textAlign = "center";
  g.fillText(a.name, x, y - 21);
  px(g, x - 10, y + 12, 20, 3, "#3a2018");
  px(g, x - 10, y + 12, 20 * Math.max(0, a.hp / a.maxHp), 3, a.hp / a.maxHp < 0.35 ? "#c45c26" : "#3f6d5c");
  px(g, x - 10, y + 16, 20 * Math.max(0, a.hunger / 100), 2, "#6aa36a");
  void now;
}

export function drawEnemy(g: Ctx, e: EnemySnap, ox: number, oy: number, now: number): void {
  const x = ox + e.x;
  const y = oy + e.y;
  const bob = Math.sin(now / 180 + e.x) * 1.5;
  const c = e.flash > 0 ? "#f4e7d2" : e.hue || "#3a2018";
  const ink = typeof c === "string" && c.startsWith("#") ? c : "#3a2018";
  oval(g, x, y + 12 + bob, 12, 4, "rgba(10,8,6,0.35)");
  if (e.flash > 0) oval(g, x, y - 4 + bob, 18, 14, "rgba(244,231,210,0.4)");
  if (blitFit(g, "beast", x - 24, y - 42 + bob, 48, 50)) {
    px(g, x - 12, y - 44 + bob, 24 * (e.hp / e.maxHp), 3, "#c45c26");
    return;
  }
  oval(g, x - 7, y + 6 + bob, 3, 5, shade(ink, 0.55));
  oval(g, x + 7, y + 6 + bob, 3, 5, shade(ink, 0.55));
  oval(g, x, y + bob, 12, 8, c);
  oval(g, x, y - 8 + bob, 7, 6, shade(ink, 0.72));
  oval(g, x - 3, y - 8 + bob, 1.7, 1.7, "#c45c26");
  oval(g, x + 3, y - 8 + bob, 1.7, 1.7, "#c45c26");
  px(g, x - 12, y - 20, 24 * (e.hp / e.maxHp), 3, "#c45c26");
}

export function drawSky(g: Ctx, w: number, h: number, night: boolean, dusk: boolean, zone: string, weather: string): void {
  let top = "#7eb6d4";
  let bot = "#c8dcc0";
  if (zone === "kitchen") {
    top = "#5a3a28";
    bot = "#3a2418";
  } else if (zone === "mine") {
    top = "#0e0c0a";
    bot = "#1a1614";
  } else if (zone === "wild") {
    top = night ? "#0a1210" : dusk ? "#3a2818" : "#4a5a40";
    bot = night ? "#121810" : dusk ? "#2a2014" : "#2e3a28";
  } else if (night) {
    top = "#0c1428";
    bot = "#1a2438";
  } else if (dusk) {
    top = "#c45c26";
    bot = "#3f2a40";
  } else if (weather === "rain" || weather === "storm") {
    top = "#4a5a68";
    bot = "#2a3a40";
  } else if (weather === "fog") {
    top = "#8a9a90";
    bot = "#6a7a68";
  }
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, top);
  grd.addColorStop(1, bot);
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  if (night && zone !== "kitchen" && zone !== "mine") {
    g.fillStyle = "rgba(244,231,210,0.55)";
    for (let i = 0; i < 18; i++) {
      const sx = ((i * 97) % w) + 8;
      const sy = 8 + ((i * 53) % Math.max(40, h * 0.28));
      g.fillRect(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
  }
}

export function drawLamp(g: Ctx, cx: number, cy: number, r: number, a: number): void {
  const grd = g.createRadialGradient(cx, cy, 2, cx, cy, r);
  grd.addColorStop(0, `rgba(255,200,90,${a})`);
  grd.addColorStop(0.45, `rgba(196,92,38,${a * 0.32})`);
  grd.addColorStop(1, "rgba(196,92,38,0)");
  g.fillStyle = grd;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
}

export function drawNightVignette(g: Ctx, w: number, h: number, lit: boolean): void {
  const grd = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.22, w / 2, h / 2, Math.max(w, h) * 0.72);
  grd.addColorStop(0, "rgba(8,10,22,0)");
  grd.addColorStop(1, lit ? "rgba(8,10,22,0.42)" : "rgba(6,8,18,0.62)");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
}

export function viewScale(w: number, h: number): number {
  const portrait = h >= w;
  const tilesX = portrait ? 8.2 : 13;
  const tilesY = portrait ? 11 : 8.5;
  return Math.max(w / (tilesX * TILE), h / (tilesY * TILE));
}

export type HouseKind = "cabin" | "inn" | "mine";

export interface HouseCluster {
  kind: HouseKind;
  x: number;
  y: number;
  w: number;
  h: number;
  doorX: number;
  doorY: number;
}

export function houseKind(ch: string, zone: string): HouseKind | "" {
  if (zone === "kitchen") return "";
  if (ch === "C" || ch === "A") return "cabin";
  if (ch === "N" || ch === "I") return "inn";
  if (ch === "E") return "mine";
  return "";
}

export function houseClusters(rows: string[], zone: string): HouseCluster[] {
  const seen = new Set<number>();
  const mw = rows[0]?.length ?? 0;
  const out: HouseCluster[] = [];
  const kindAt = (x: number, y: number) => houseKind(rows[y]?.[x] ?? "", zone);
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < mw; x++) {
      const kind = kindAt(x, y);
      const key = y * mw + x;
      if (!kind || seen.has(key)) continue;
      const stack = [[x, y]];
      seen.add(key);
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      let doorX = x;
      let doorY = y;
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        const ch = rows[cy][cx];
        if (ch === "A" || ch === "I") {
          doorX = cx;
          doorY = cy;
        }
        minX = Math.min(minX, cx);
        minY = Math.min(minY, cy);
        maxX = Math.max(maxX, cx);
        maxY = Math.max(maxY, cy);
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          const nk = ny * mw + nx;
          if (kindAt(nx, ny) === kind && !seen.has(nk)) {
            seen.add(nk);
            stack.push([nx, ny]);
          }
        }
      }
      out.push({ kind, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, doorX, doorY });
    }
  }
  return out;
}

const HOUSE_AR: Record<string, number> = { cabin: 640 / 543, inn: 640 / 485 };

export function housePaintBox(c: HouseCluster): { x: number; y: number; w: number; h: number } {
  const boxX = c.x * TILE - 18;
  const boxY = c.y * TILE - 56;
  const boxW = c.w * TILE + 36;
  const boxH = c.h * TILE + 72;
  const ar = HOUSE_AR[c.kind] ?? 1;
  let w = boxW;
  let h = w / ar;
  if (h > boxH) {
    h = boxH;
    w = h * ar;
  }
  return { x: boxX + (boxW - w) / 2, y: boxY + boxH - h, w, h };
}

/** Door on the painted south face — not the map tile on the cabin's right. */
export function doorPaint(c: HouseCluster): { x: number; y: number; w: number; h: number } {
  const b = housePaintBox(c);
  if (c.kind === "inn") return { x: b.x + b.w * 0.16, y: b.y + b.h * 0.52, w: b.w * 0.14, h: b.h * 0.32 };
  return { x: b.x + b.w * 0.22, y: b.y + b.h * 0.5, w: b.w * 0.14, h: b.h * 0.3 };
}

export function chimneyMouth(c: HouseCluster): { x: number; y: number } {
  const b = housePaintBox(c);
  if (c.kind === "inn") return { x: b.x + b.w * 0.6, y: b.y + b.h * 0.08 };
  return { x: b.x + b.w * 0.71, y: b.y + b.h * 0.1 };
}

function drawSmoke(g: Ctx, x: number, y: number, now: number): void {
  for (let i = 0; i < 5; i++) {
    const t = (now / 680 + i * 0.18) % 1;
    const rise = t * t;
    const sx = x + Math.sin(now / 360 + i * 0.9) * (0.3 + rise * 3.4);
    const sy = y - 1 - t * 26;
    oval(g, sx, sy, 1 + t * 4.2, 1.1 + t * 5, `rgba(232,224,214,${0.5 * (1 - t) * (1 - t)})`);
  }
}

function drawDoor(g: Ctx, door: { x: number; y: number; w: number; h: number }, open: boolean, now: number): void {
  const { x, y, w, h } = door;
  if (!open) return;
  const ix = x + w * 0.14;
  const iy = y + h * 0.1;
  const iw = w * 0.72;
  const ih = h * 0.78;
  px(g, ix, iy, iw, ih, "#1a100c");
  g.save();
  const pulse = 0.2 + Math.sin(now / 220) * 0.05;
  const grd = g.createRadialGradient(ix + iw * 0.5, iy + ih * 0.7, 2, ix + iw * 0.5, iy + ih * 0.55, iw * 0.7);
  grd.addColorStop(0, `rgba(255,180,80,${0.45 + pulse})`);
  grd.addColorStop(1, "rgba(255,180,80,0)");
  g.fillStyle = grd;
  g.fillRect(ix, iy, iw, ih);
  g.globalAlpha = 0.18 + pulse;
  g.fillStyle = "#ffc46e";
  g.beginPath();
  g.moveTo(ix + iw * 0.15, iy + ih);
  g.lineTo(ix + iw * 0.85, iy + ih);
  g.lineTo(ix + iw * 1.15, iy + ih + 10);
  g.lineTo(ix - iw * 0.15, iy + ih + 10);
  g.closePath();
  g.fill();
  g.restore();
}

export function doorIsOpen(c: HouseCluster, people: { x: number; y: number; zone?: string }[], zone: string): boolean {
  if (zone !== "valley" && zone !== "wild") return false;
  const dx = c.doorX * TILE + 18;
  const dy = c.doorY * TILE + 18;
  return people.some((a) => (a.zone ?? zone) === zone && Math.hypot(a.x - dx, a.y - dy) < 40);
}

export function drawHouseCluster(g: Ctx, c: HouseCluster, now: number, open = false): void {
  const x = c.x * TILE;
  const y = c.y * TILE;
  const w = c.w * TILE;
  const h = c.h * TILE;
  oval(g, x + w / 2, y + h - 2, w * 0.42, 8, "rgba(20,16,10,0.28)");
  const boxW = w + 36;
  const boxH = h + 72;
  const painted =
    (c.kind === "cabin" && blitFit(g, "cabin", x - 18, y - 56, boxW, boxH)) ||
    (c.kind === "inn" && blitFit(g, "inn", x - 18, y - 56, boxW, boxH)) ||
    (c.kind === "mine" && blitFit(g, "mine", x - 14, y - 28, w + 28, h + 40));
  if (!painted) {
    if (c.kind === "mine") {
      px(g, x + 6, y + 10, w - 12, h - 10, "#1a1814");
      oval(g, x + w / 2, y + h * 0.55, w * 0.32, h * 0.28, "#0e0c0a");
      px(g, x + 8, y + 8, 6, h - 12, "#6a5a44");
      px(g, x + w - 14, y + 8, 6, h - 12, "#6a5a44");
    } else {
      const inn = c.kind === "inn";
      px(g, x + 2, y + 22, w - 4, h - 18, "#c4a070");
      tri(g, x + w / 2, y - 10, x - 6, y + 24, x + w + 6, y + 24, inn ? "#8a3a20" : "#c45c26");
      tri(g, x + w / 2, y - 4, x + 16, y + 20, x + w - 16, y + 20, inn ? "#6a2a14" : "#a44a20");
      const dx = c.doorX * TILE;
      const dy = c.doorY * TILE;
      px(g, dx + 12, dy + 16, 12, 20, inn ? "#3f6d5c" : "#5a3a22");
      oval(g, dx + 18, dy + 26, 2, 2, "#e8c070");
      const glow = 0.5 + Math.sin(now / 220) * 0.2;
      for (let i = 0; i < c.w; i++) {
        const wx = x + i * TILE + 18;
        if (Math.abs(wx - (dx + 18)) < 16) continue;
        oval(g, wx, y + h - 16, 5, 5, inn ? `rgba(255,224,138,${glow})` : "#6a8aaa");
      }
    }
  }
  if (c.kind === "cabin" || c.kind === "inn") {
    const mouth = chimneyMouth(c);
    drawSmoke(g, mouth.x, mouth.y, now);
    drawDoor(g, doorPaint(c), open, now);
  }
}

export function drawGround(g: Ctx, ch: string, x: number, y: number, now: number, zone: string): void {
  const look = tileLook(ch, zone);
  if (look === "water") water(g, x, y, now);
  else if (look === "wall") wall(g, x, y, zone);
  else if (look === "plot") plotSoil(g, x, y);
  else ground(g, zone, look === "path" ? "," : look === "marsh" ? "m" : look === "savanna" ? "s" : ".", x, y, now);
}

export function isHouseLook(look: string): boolean {
  return look === "cabin" || look === "inn" || look === "lantern" || look === "mine-mouth";
}

export function isTallLook(look: string): boolean {
  return (
    look === "tree" ||
    look === "bush" ||
    look === "osmanthus" ||
    look === "stall" ||
    look === "fire" ||
    look === "gate" ||
    look === "board" ||
    look === "altar" ||
    look === "anvil" ||
    look === "stove" ||
    look === "icebox" ||
    look === "pantry" ||
    look === "plate" ||
    look === "pass" ||
    isHouseLook(look)
  );
}

export interface FieldCluster {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function fillClusters(rows: string[], ok: (ch: string) => boolean): FieldCluster[] {
  const seen = new Set<number>();
  const mw = rows[0]?.length ?? 0;
  const out: FieldCluster[] = [];
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < mw; x++) {
      const key = y * mw + x;
      if (!ok(rows[y][x]) || seen.has(key)) continue;
      const stack = [[x, y]];
      seen.add(key);
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        minX = Math.min(minX, cx);
        minY = Math.min(minY, cy);
        maxX = Math.max(maxX, cx);
        maxY = Math.max(maxY, cy);
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          const nk = ny * mw + nx;
          if (ok(rows[ny]?.[nx] ?? "") && !seen.has(nk)) {
            seen.add(nk);
            stack.push([nx, ny]);
          }
        }
      }
      out.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
    }
  }
  return out;
}

export function plotClusters(rows: string[]): FieldCluster[] {
  return fillClusters(rows, (ch) => ch === "P");
}

export function drawSheet(g: Ctx, name: string, c: FieldCluster): boolean {
  return blitWrap(g, name, c.x * TILE - 1, c.y * TILE - 1, c.w * TILE + 2, c.h * TILE + 2);
}

function wander(seed: number, x: number): number {
  return Math.sin(seed + x * 0.026) * 0.6 + Math.sin(seed * 1.8 + x * 0.01) * 0.28 + Math.sin(seed * 0.5 + x * 0.048) * 0.12;
}

function organicPath(g: Ctx, x: number, y: number, w: number, h: number, seed: number, amp = 12): void {
  const across = Math.max(8, Math.round(w / 14));
  const down = Math.max(5, Math.round(h / 16));
  g.beginPath();
  g.moveTo(x + wander(seed, 0) * amp * 0.35, y + wander(seed + 1, 0) * amp);
  for (let i = 1; i <= across; i++) {
    const px = (i / across) * w;
    g.lineTo(x + px + wander(seed + 2, px) * amp * 0.25, y + wander(seed + 3, px) * amp);
  }
  for (let i = 1; i <= down; i++) {
    const py = (i / down) * h;
    g.lineTo(x + w + wander(seed + 4, py) * amp * 0.7, y + py + wander(seed + 5, py) * amp * 0.25);
  }
  for (let i = 1; i <= across; i++) {
    const px = (1 - i / across) * w;
    g.lineTo(x + px + wander(seed + 6, px) * amp * 0.25, y + h + wander(seed + 7, px) * amp);
  }
  for (let i = 1; i <= down; i++) {
    const py = (1 - i / down) * h;
    g.lineTo(x + wander(seed + 8, py) * amp * 0.7, y + py + wander(seed + 9, py) * amp * 0.25);
  }
  g.closePath();
}

function waveBand(g: Ctx, x: number, y: number, w: number, h: number, seed: number, amp: number): void {
  const step = 10;
  g.beginPath();
  g.moveTo(x, y + wander(seed, 0) * amp);
  for (let i = step; i <= w; i += step) {
    g.lineTo(x + i, y + wander(seed, i) * amp);
  }
  g.lineTo(x + w + wander(seed, w) * amp * 0.3, y + h * 0.5);
  for (let i = w; i >= 0; i -= step) {
    g.lineTo(x + i, y + h + wander(seed + 2.2, i) * amp);
  }
  g.lineTo(x + wander(seed, 8) * amp * 0.3, y + h * 0.5);
  g.closePath();
}

function nibbleGrass(g: Ctx, x: number, y: number, w: number, seed: number, dir: number): void {
  for (let i = -8; i <= w + 8; i += 12) {
    const cx = x + i + wander(seed, i) * 11;
    const cy = y + wander(seed + 2, i) * 8 * dir;
    g.save();
    g.beginPath();
    g.ellipse(cx, cy, 20, 13, wander(seed, i + 3) * 0.45, 0, Math.PI * 2);
    g.clip();
    if (!grassAt(g, cx - 22, cy - 14, 44, 28)) oval(g, cx, cy, 18, 11, "#3f6d45");
    g.restore();
  }
}

function nibbleGrassV(g: Ctx, x: number, y: number, h: number, seed: number, dir: number): void {
  for (let i = -8; i <= h + 8; i += 12) {
    const cy = y + i + wander(seed, i) * 11;
    const cx = x + wander(seed + 2, i) * 8 * dir;
    g.save();
    g.beginPath();
    g.ellipse(cx, cy, 13, 20, wander(seed, i + 3) * 0.45, 0, Math.PI * 2);
    g.clip();
    if (!grassAt(g, cx - 14, cy - 22, 28, 44)) oval(g, cx, cy, 11, 18, "#3f6d45");
    g.restore();
  }
}

export function drawPool(g: Ctx, c: FieldCluster): boolean {
  const x = c.x * TILE;
  const y = c.y * TILE;
  const w = c.w * TILE;
  const h = c.h * TILE;
  const seed = c.x * 13 + c.y * 7;
  g.save();
  waveBand(g, x - 10, y - 8, w + 20, h + 16, seed, 18);
  g.clip();
  const ok = blitWrapZoom(g, "water", x - 8, y - 8, w + 16, h + 16, 3.1);
  g.save();
  g.globalAlpha = 0.28;
  blitWrapZoom(g, "water", x - 8, y - 8, w + 16, h + 16, 1.9, 90, 40);
  g.restore();
  g.restore();
  nibbleGrass(g, x - 4, y - 2, w + 8, seed, -1);
  nibbleGrass(g, x - 4, y + h + 2, w + 8, seed + 4, 1);
  return ok;
}

export function drawLane(g: Ctx, c: FieldCluster): boolean {
  const x = c.x * TILE;
  const y = c.y * TILE;
  const w = c.w * TILE;
  const h = c.h * TILE;
  const seed = c.x * 5 + c.y * 11;
  const mid = y + h / 2;
  const step = 7;
  g.save();
  g.beginPath();
  g.moveTo(x - 16, mid + wander(seed, -16) * 22 - 12);
  for (let i = -16; i <= w + 16; i += step) {
    const half = 14 + Math.abs(wander(seed + 3, i)) * 8;
    g.lineTo(x + i, mid + wander(seed, i) * 22 - half);
  }
  for (let i = w + 16; i >= -16; i -= step) {
    const half = 14 + Math.abs(wander(seed + 3, i)) * 8;
    g.lineTo(x + i, mid + wander(seed, i) * 22 + half);
  }
  g.closePath();
  g.clip();
  const ok = blitWrapZoom(g, "path", x - 24, mid - 36, w + 48, 72, 3.6, seed * 3, seed);
  if (!ok) {
    g.fillStyle = "#7a6a48";
    g.fill();
  }
  g.restore();
  nibblePath(g, x - 8, mid - 14, w + 16, seed, -1);
  nibblePath(g, x - 8, mid + 14, w + 16, seed + 6, 1);
  return ok;
}

function nibblePath(g: Ctx, x: number, y: number, w: number, seed: number, dir: number): void {
  for (let i = -6; i <= w + 6; i += 18) {
    const cx = x + i + wander(seed, i) * 8;
    const cy = y + wander(seed + 2, i) * 5 * dir;
    g.save();
    g.beginPath();
    g.ellipse(cx, cy, 12, 7, wander(seed, i + 3) * 0.3, 0, Math.PI * 2);
    g.clip();
    grassAt(g, cx - 14, cy - 8, 28, 16);
    g.restore();
  }
}

export function drawField(g: Ctx, c: FieldCluster): void {
  const x = c.x * TILE;
  const y = c.y * TILE;
  const w = c.w * TILE;
  const h = c.h * TILE;
  const seed = c.x * 9 + c.y;
  g.save();
  organicPath(g, x + 2, y + 4, w - 4, h - 8, seed + 2, 28);
  g.clip();
  if (!blitWrap(g, "path", x - 8, y - 8, w + 16, h + 16)) {
    g.fillStyle = "#6b4a28";
    g.fillRect(x - 8, y - 8, w + 16, h + 16);
  }
  g.strokeStyle = "rgba(42,24,16,0.28)";
  g.lineWidth = 2.2;
  g.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const yy = y + 14 + i * ((h - 20) / 3);
    g.beginPath();
    g.moveTo(x - 4, yy);
    for (let t = 0; t <= w + 8; t += 10) {
      g.lineTo(x - 4 + t, yy + wander(seed + i * 4, t) * 7);
    }
    g.stroke();
  }
  g.restore();
  nibbleGrass(g, x, y + 2, w, seed, -1);
  nibbleGrass(g, x, y + h - 2, w, seed + 6, 1);
  nibbleGrassV(g, x + 2, y, h, seed + 8, -1);
  nibbleGrassV(g, x + w - 2, y, h, seed + 9, 1);
}

function wet(look: string): boolean {
  return look === "water" || look === "dock";
}

export function drawFringe(g: Ctx, ch: string, near: Near, x: number, y: number, zone: string, now: number): void {
  const look = tileLook(ch, zone);
  if (look !== "grass") {
    void now;
    return;
  }
  const n = tileLook(near.n, zone);
  const s = tileLook(near.s, zone);
  const e = tileLook(near.e, zone);
  const w = tileLook(near.w, zone);
  const jitter = hash(x, y) % 7;
  if (wet(n)) oval(g, x + 18, y + 4 + jitter * 0.3, 15, 7, "rgba(26,68,88,0.16)");
  if (wet(s)) oval(g, x + 18, y + TILE - 4, 15, 7, "rgba(26,68,88,0.16)");
  if (wet(e)) oval(g, x + TILE - 4, y + 18, 7, 13, "rgba(26,68,88,0.12)");
  if (wet(w)) oval(g, x + 4, y + 18, 7, 13, "rgba(26,68,88,0.12)");
}

export function drawAtlas(
  g: Ctx,
  rows: string[],
  zone: string,
  cell: number,
  you: { x: number; y: number },
  partner: { x: number; y: number } | null,
  fog?: { seen: Set<number>; vis: Set<number> },
  fires: number[] = [],
): void {
  const mw = rows[0]?.length ?? 1;
  const mh = rows.length;
  const W = mw * cell;
  const H = mh * cell;
  g.imageSmoothingEnabled = true;
  const paper = g.createLinearGradient(0, 0, W, H);
  paper.addColorStop(0, "#e6d2ae");
  paper.addColorStop(0.55, "#d4b888");
  paper.addColorStop(1, "#c49a68");
  g.fillStyle = paper;
  if (typeof g.roundRect === "function") {
    g.beginPath();
    g.roundRect(0, 0, W, H, 8);
    g.fill();
  } else {
    g.fillRect(0, 0, W, H);
  }
  for (let i = 0; i < 16; i++) {
    const n = hash(i * 13, i * 29);
    oval(g, n % W, (n * 3) % H, 10 + (n % 16), 6 + (n % 10), "rgba(90,60,30,0.05)");
  }
  g.fillStyle = "rgba(63,109,92,0.16)";
  g.fillRect(2, 2, W - 4, H - 4);
  const known = (x: number, y: number) => !fog || fog.seen.has(y * mw + x);
  const wash = (ok: (ch: string) => boolean, fill: string) => {
    for (const c of fillClusters(rows, ok)) {
      if (!known(c.x, c.y)) continue;
      g.fillStyle = fill;
      organicPath(g, c.x * cell - 2, c.y * cell - 2, c.w * cell + 4, c.h * cell + 4, c.x * 9 + c.y, Math.max(3, cell * 0.45));
      g.fill();
    }
  };
  wash((ch) => ch === "~" || ch === "D", "rgba(42,84,110,0.55)");
  wash((ch) => ch === ",", "rgba(138,106,64,0.48)");
  wash((ch) => ch === "P", "rgba(90,58,36,0.4)");
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      if (!known(x, y)) continue;
      const look = tileLook(rows[y][x], zone);
      const n = hash(x, y);
      const cx = x * cell + cell / 2 + (n % 5) - 2;
      const cy = y * cell + cell / 2 + (hash(y, x) % 5) - 2;
      const faded = fog && !fog.vis.has(y * mw + x);
      if (look === "tree") {
        oval(g, cx, cy, cell * 0.26, cell * 0.36, faded ? "rgba(40,70,55,0.32)" : "rgba(47,90,56,0.68)");
      } else if (look === "cabin" || look === "inn" || look === "lantern") {
        tri(g, cx, cy - cell * 0.28, cx - cell * 0.3, cy + cell * 0.12, cx + cell * 0.3, cy + cell * 0.12, "#c45c26");
      } else if (look === "mine-mouth") {
        oval(g, cx, cy, cell * 0.3, cell * 0.2, "#4a3a4a");
      }
    }
  }
  for (const key of fires) {
    oval(g, (key % mw) * cell + cell / 2, Math.floor(key / mw) * cell + cell / 2, cell * 0.32, cell * 0.26, "#e08a4f");
  }
  const mark = (px: number, py: number, color: string) => {
    const mx = (px / TILE) * cell;
    const my = (py / TILE) * cell;
    oval(g, mx, my, Math.max(3.2, cell * 0.46), Math.max(2.6, cell * 0.38), color);
  };
  mark(you.x, you.y, "#c45c26");
  if (partner) mark(partner.x, partner.y, "#3f6d5c");
}

export function plotIndex(tiles: string[], tx: number, ty: number): number {
  let i = 0;
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      if (tiles[y][x] !== "P") continue;
      if (x === tx && y === ty) return i;
      i += 1;
    }
  }
  return -1;
}
