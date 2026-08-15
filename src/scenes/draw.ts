import type { ActorSnap, EnemySnap } from "../sim/net";
import { TILE } from "../world/maps";

type Ctx = CanvasRenderingContext2D;

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
  g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

function ground(g: Ctx, zone: string, ch: string, x: number, y: number, now: number): void {
  if (zone === "kitchen") {
    px(g, x, y, TILE - 1, TILE - 1, "#6e4a32");
    px(g, x, y + 11, TILE - 1, 2, "#5a3c28");
    px(g, x, y + 23, TILE - 1, 2, "#5a3c28");
    const seam = ((Math.floor(x / TILE) + Math.floor(y / TILE)) % 2) * 12;
    px(g, x + seam, y, 2, TILE - 1, "#7d5840");
    return;
  }
  if (zone === "mine") {
    px(g, x, y, TILE - 1, TILE - 1, "#2a2624");
    px(g, x + 3, y + 8, 7, 3, "#1c1a18");
    px(g, x + 20, y + 22, 9, 3, "#3a3632");
    px(g, x + 14, y + 4, 4, 2, "#4a4038");
    return;
  }
  if (zone === "wild") {
    if (ch === "m") {
      px(g, x, y, TILE - 1, TILE - 1, "#24382c");
      px(g, x + 4, y + 10, 10, 4, "#1a2e24");
      px(g, x + 18, y + 22, 8, 3, "#2a4838");
      if (Math.sin(now / 640 + x) > 0.35) px(g, x + 12, y + 16, 5, 2, "#3a6a58");
      return;
    }
    if (ch === "s") {
      px(g, x, y, TILE - 1, TILE - 1, "#6a6a30");
      px(g, x + 6, y + 8, 3, 16, "#8a8a40");
      px(g, x + 16, y + 12, 3, 14, "#7a7a38");
      px(g, x + 26, y + 6, 3, 18, "#9a9a48");
      return;
    }
    px(g, x, y, TILE - 1, TILE - 1, "#2e3a28");
    px(g, x + 8, y + 7, 4, 3, "#3a4a30");
    px(g, x + 20, y + 20, 5, 3, "#4a5a38");
    return;
  }
  if (ch === ",") {
    px(g, x, y, TILE - 1, TILE - 1, "#8a7a58");
    px(g, x + 4, y + 8, 10, 3, "#7a6a48");
    px(g, x + 18, y + 20, 8, 3, "#9a8a68");
    px(g, x + 10, y + 14, 4, 2, "#6a5a38");
    return;
  }
  px(g, x, y, TILE - 1, TILE - 1, "#3f6d45");
  px(g, x + 7, y + 6, 3, 4, "#2f5a38");
  px(g, x + 22, y + 16, 4, 3, "#4a7d52");
  px(g, x + 14, y + 26, 3, 3, "#5a8a58");
  px(g, x + 4, y + 20, 2, 5, "#2a4a30");
}

function tree(g: Ctx, x: number, y: number, pine: boolean, now: number): void {
  const sway = Math.sin(now / 860 + x * 0.03) * 1.4;
  px(g, x + 15, y + 20, 6, 14, "#5a3a22");
  px(g, x + 16, y + 20, 2, 14, "#3a2414");
  px(g, x + 13, y + 32, 10, 3, "#4a2e18");
  if (pine) {
    px(g, x + 7 + sway, y + 3, 22, 9, "#1e3a24");
    px(g, x + 9 + sway, y + 9, 18, 8, "#2a4a30");
    px(g, x + 11 + sway, y + 15, 14, 7, "#355a38");
    px(g, x + 15 + sway, y + 5, 5, 3, "#4a7a50");
    return;
  }
  px(g, x + 3 + sway, y + 1, 30, 16, "#2a4a28");
  px(g, x + 7 + sway, y + 8, 22, 12, "#3f6d4a");
  px(g, x + 5 + sway, y + 14, 26, 8, "#2f5a38");
  px(g, x + 12 + sway, y + 3, 8, 5, "#5a8a58");
}

function water(g: Ctx, x: number, y: number, now: number): void {
  px(g, x, y, TILE - 1, TILE - 1, "#1a5470");
  px(g, x, y + 16, TILE - 1, 19, "#143e54");
  const t = now / 360;
  for (let i = 0; i < 3; i++) {
    const yy = y + 5 + i * 9 + Math.sin(t + x * 0.07 + i * 1.1) * 2.2;
    px(g, x + 2, yy, 15, 2, i % 2 ? "#3a8aaa" : "#8ed0de");
    px(g, x + 19, yy + 2, 13, 2, "#2a6a84");
  }
}

function dock(g: Ctx, x: number, y: number): void {
  px(g, x, y + 10, TILE - 1, 20, "#6a4a28");
  px(g, x + 2, y + 12, TILE - 5, 3, "#8a6a40");
  px(g, x + 2, y + 20, TILE - 5, 3, "#8a6a40");
  px(g, x + 6, y + 8, 4, 24, "#4a3018");
  px(g, x + 26, y + 8, 4, 24, "#4a3018");
}

function fire(g: Ctx, x: number, y: number, now: number): void {
  px(g, x + 5, y + 24, 26, 8, "#4a4038");
  px(g, x + 8, y + 22, 9, 6, "#5a3a22");
  px(g, x + 18, y + 23, 10, 5, "#3a2414");
  const f = 0.62 + Math.sin(now / 88) * 0.38;
  px(g, x + 12, y + 8, 12, 16 * f, "#c45c26");
  px(g, x + 15, y + 4, 7, 12 * f, "#e8a030");
  px(g, x + 17, y + 1, 4, 8 * f, "#ffe8a0");
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
  px(g, x, y, TILE - 1, TILE - 1, "#6b4a28");
  px(g, x + 2, y + 8, TILE - 5, 4, "#5a3a1c");
  px(g, x + 2, y + 18, TILE - 5, 4, "#5a3a1c");
  px(g, x + 2, y + 28, TILE - 5, 3, "#4a3018");
}

function bush(g: Ctx, x: number, y: number, gold: boolean): void {
  px(g, x + 6, y + 14, 24, 16, gold ? "#8a6a28" : "#2f5a38");
  px(g, x + 10, y + 8, 16, 12, gold ? "#c9a06a" : "#3f6d5c");
  px(g, x + 14, y + 6, 6, 5, gold ? "#e6d0a6" : "#5a8a58");
}

function stall(g: Ctx, x: number, y: number): void {
  px(g, x + 2, y + 16, 32, 16, "#8a6a40");
  px(g, x + 4, y + 18, 28, 8, "#c4a060");
  px(g, x + 2, y + 6, 32, 12, "#c45c26");
  px(g, x + 6, y + 8, 8, 6, "#3f6d5c");
  px(g, x + 22, y + 8, 8, 6, "#3f6d5c");
}

function anvil(g: Ctx, x: number, y: number): void {
  px(g, x + 10, y + 22, 16, 10, "#3a342c");
  px(g, x + 6, y + 12, 24, 12, "#6a6460");
  px(g, x + 8, y + 10, 20, 4, "#8a8480");
  px(g, x + 20, y + 8, 8, 6, "#4a4844");
}

function altar(g: Ctx, x: number, y: number): void {
  px(g, x + 8, y + 18, 20, 14, "#6a5848");
  px(g, x + 12, y + 8, 12, 12, "#8a7868");
  px(g, x + 15, y + 4, 6, 6, "#d4a24a");
}

function board(g: Ctx, x: number, y: number): void {
  px(g, x + 8, y + 6, 20, 24, "#5a4838");
  px(g, x + 10, y + 8, 16, 20, "#d4c4a0");
  px(g, x + 12, y + 12, 12, 2, "#8a6a40");
  px(g, x + 12, y + 18, 10, 2, "#8a6a40");
}

function gate(g: Ctx, x: number, y: number): void {
  px(g, x + 4, y + 4, 6, 28, "#5a3a22");
  px(g, x + 26, y + 4, 6, 28, "#5a3a22");
  px(g, x + 6, y + 8, 24, 6, "#3f6d5c");
  px(g, x + 10, y + 18, 16, 4, "#2a4a38");
}

function mineMouth(g: Ctx, x: number, y: number): void {
  px(g, x + 2, y + 8, 32, 24, "#1a1814");
  px(g, x + 4, y + 6, 28, 6, "#5a4a38");
  px(g, x + 6, y + 14, 24, 16, "#0e0c0a");
  px(g, x + 8, y + 8, 4, 22, "#6a5a44");
  px(g, x + 24, y + 8, 4, 22, "#6a5a44");
}

function ore(g: Ctx, x: number, y: number, now: number): void {
  px(g, x + 6, y + 10, 24, 20, "#4a443c");
  px(g, x + 10, y + 14, 8, 8, "#6a6460");
  px(g, x + 14, y + 22, 6, 4, "#8a8070");
  if (Math.sin(now / 200 + x) > 0.25) px(g, x + 20, y + 16, 5, 5, "#c8d0d8");
}

function stairs(g: Ctx, x: number, y: number): void {
  px(g, x + 6, y + 6, 24, 6, "#5a4a38");
  px(g, x + 8, y + 14, 20, 6, "#4a3a2c");
  px(g, x + 10, y + 22, 16, 6, "#3a2e22");
}

function lurk(g: Ctx, x: number, y: number, now: number): void {
  const bob = Math.sin(now / 400) * 2;
  px(g, x + 10, y + 14 + bob, 16, 14, "#1a1410");
  px(g, x + 12, y + 10 + bob, 12, 8, "#2a2018");
  px(g, x + 14, y + 16 + bob, 3, 3, "#c45c26");
  px(g, x + 22, y + 16 + bob, 3, 3, "#c45c26");
}

function stove(g: Ctx, x: number, y: number, now: number): void {
  px(g, x + 4, y + 10, 28, 22, "#6a4030");
  px(g, x + 8, y + 14, 20, 10, "#2a2018");
  const f = 0.5 + Math.sin(now / 80) * 0.4;
  px(g, x + 14, y + 16, 8, 8 * f, "#c45c26");
  px(g, x + 16, y + 14, 4, 6 * f, "#e8a030");
}

function plate(g: Ctx, x: number, y: number): void {
  px(g, x + 8, y + 14, 20, 16, "#4a5060");
  px(g, x + 6, y + 18, 4, 8, "#6a7080");
  px(g, x + 26, y + 18, 4, 8, "#6a7080");
  px(g, x + 12, y + 10, 12, 6, "#8a9098");
}

function icebox(g: Ctx, x: number, y: number): void {
  px(g, x + 6, y + 6, 24, 26, "#4a6a88");
  px(g, x + 8, y + 8, 20, 10, "#7aa0b8");
  px(g, x + 8, y + 20, 20, 8, "#3a5870");
}

function pantry(g: Ctx, x: number, y: number, ch: string): void {
  px(g, x + 4, y + 6, 28, 26, "#6a4a30");
  px(g, x + 6, y + 8, 11, 20, "#8a6a48");
  px(g, x + 19, y + 8, 11, 20, "#8a6a48");
  const jar =
    ch === "1" ? "#c45c3e" : ch === "2" ? "#e6c36a" : ch === "4" ? "#5a8f62" : ch === "5" ? "#8aa4b5" : "#d4a24a";
  px(g, x + 8, y + 12, 6, 8, jar);
  px(g, x + 21, y + 14, 6, 8, jar);
}

function cut(g: Ctx, x: number, y: number): void {
  px(g, x + 4, y + 16, 28, 12, "#8a6a40");
  px(g, x + 6, y + 18, 24, 6, "#c4a070");
  px(g, x + 22, y + 12, 8, 3, "#8a8480");
}

function pass(g: Ctx, x: number, y: number): void {
  px(g, x + 2, y + 6, 32, 24, "#c8b090");
  px(g, x + 6, y + 10, 24, 16, "#e8d8b8");
  px(g, x + 12, y + 4, 12, 8, "#8a6a40");
}

function trash(g: Ctx, x: number, y: number): void {
  px(g, x + 10, y + 12, 16, 18, "#3a2020");
  px(g, x + 8, y + 10, 20, 4, "#5a3030");
}

function wall(g: Ctx, x: number, y: number, zone: string): void {
  if (zone === "mine") {
    px(g, x, y, TILE - 1, TILE - 1, "#1a1614");
    px(g, x + 2, y + 4, 14, 8, "#2a2420");
    px(g, x + 18, y + 16, 14, 8, "#12100e");
    px(g, x + 8, y, 4, TILE - 1, "#4a3a2c");
    return;
  }
  if (zone === "kitchen") {
    px(g, x, y, TILE - 1, TILE - 1, "#4a3224");
    px(g, x + 4, y + 6, 10, 8, "#5a4030");
    px(g, x + 20, y + 18, 10, 8, "#3a2418");
    return;
  }
  px(g, x, y, TILE - 1, TILE - 1, "#2a4a28");
  px(g, x + 4, y + 2, 28, 10, "#1e3a24");
  px(g, x + 10, y + 12, 16, 8, "#3f6d4a");
  px(g, x + 16, y + 20, 6, 12, "#5a3a22");
}

function hill(g: Ctx, x: number, y: number): void {
  px(g, x + 2, y + 16, 32, 16, "#4a4038");
  px(g, x + 8, y + 8, 20, 12, "#5a5248");
  px(g, x + 14, y + 4, 10, 8, "#6a6460");
}

function rock(g: Ctx, x: number, y: number): void {
  px(g, x + 8, y + 14, 20, 14, "#5a5248");
  px(g, x + 12, y + 10, 12, 8, "#6a6460");
  px(g, x + 10, y + 18, 8, 4, "#3a3632");
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
  px(g, x + 8, y + 8, 20, 20, zone === "kitchen" ? "#8a6a40" : "#c9a06a");
  px(g, x + 12, y + 12, 12, 12, "#2a2018");
  px(g, x + 16, y + 16, 4, 8, "#f4e7d2");
}

function chest(g: Ctx, x: number, y: number): void {
  px(g, x + 6, y + 14, 24, 16, "#8a6a3c");
  px(g, x + 6, y + 12, 24, 6, "#c9a06a");
  px(g, x + 16, y + 18, 4, 4, "#d4a24a");
}

export function drawPlot(g: Ctx, px0: number, py0: number, stage: number, seed?: string): void {
  plotSoil(g, px0, py0);
  if (!seed && stage <= 0) return;
  const name = seed ?? "";
  const green = name.includes("柿") ? "#c45c26" : name.includes("姜") ? "#d4c060" : "#3f6d4a";
  if (stage <= 0) {
    px(g, px0 + 16, py0 + 20, 3, 4, "#6a6a38");
    return;
  }
  if (stage === 1) {
    px(g, px0 + 10, py0 + 16, 3, 6, green);
    px(g, px0 + 22, py0 + 24, 3, 5, green);
    return;
  }
  if (stage === 2) {
    px(g, px0 + 8, py0 + 10, 6, 10, green);
    px(g, px0 + 20, py0 + 16, 6, 10, green);
    px(g, px0 + 10, py0 + 8, 4, 3, "#5a8a50");
    return;
  }
  px(g, px0 + 7, py0 + 6, 8, 14, green);
  px(g, px0 + 20, py0 + 10, 8, 14, green);
  px(g, px0 + 9, py0 + 4, 5, 5, name.includes("柿") ? "#c45c26" : "#e8c070");
  px(g, px0 + 22, py0 + 8, 5, 5, name.includes("姜") ? "#e8d080" : "#d4a24a");
}

export function drawCell(
  g: Ctx,
  ch: string,
  x: number,
  y: number,
  fill: string,
  now: number,
  zone = "valley",
): void {
  g.imageSmoothingEnabled = false;
  const look = tileLook(ch, zone);
  if (look === "water") {
    water(g, x, y, now);
    return;
  }
  if (look === "wall") {
    wall(g, x, y, zone);
    return;
  }
  if (look === "grass" || look === "path" || look === "marsh" || look === "savanna" || look === "floor" || look === "stone" || look === "ground") {
    if (look === "ground") {
      px(g, x, y, TILE - 1, TILE - 1, fill || "#3d4a36");
      return;
    }
    ground(g, zone, ch, x, y, now);
    if (fill && fill !== cellFill(ch, zone)) {
      g.fillStyle = fill;
      g.globalAlpha = 0.2;
      g.fillRect(x, y, TILE - 1, TILE - 1);
      g.globalAlpha = 1;
    }
    return;
  }
  ground(g, zone, look === "plot" ? "," : ".", x, y, now);
  if (look === "tree") tree(g, x, y, ch === "t" || (zone === "wild" && ch === "T"), now);
  else if (look === "dock") dock(g, x, y);
  else if (look === "fire") fire(g, x, y, now);
  else if (look === "cabin") cabin(g, x, y);
  else if (look === "inn") inn(g, x, y, ch === "I");
  else if (look === "lantern") lanternDoor(g, x, y, now);
  else if (look === "plot") plotSoil(g, x, y);
  else if (look === "bush") bush(g, x, y, false);
  else if (look === "osmanthus") bush(g, x, y, true);
  else if (look === "stall") stall(g, x, y);
  else if (look === "anvil") anvil(g, x, y);
  else if (look === "altar") altar(g, x, y);
  else if (look === "board") board(g, x, y);
  else if (look === "gate") gate(g, x, y);
  else if (look === "mine-mouth") mineMouth(g, x, y);
  else if (look === "ore") ore(g, x, y, now);
  else if (look === "stairs") stairs(g, x, y);
  else if (look === "lurk") lurk(g, x, y, now);
  else if (look === "stove") stove(g, x, y, now);
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

export function drawActor(g: Ctx, a: ActorSnap, ox: number, oy: number, now = 0): void {
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
  px(g, x - 8, y + 10, 16, 4, "rgba(20,16,10,0.3)");
  px(g, x - 6, y + 2, 5, 9, "#3a2a1c");
  px(g, x + 1, y + 2, 5, 9, "#3a2a1c");
  px(g, x - 8, y - 8, 16, 12, body);
  px(g, x - 6, y - 6, 12, 6, cloth);
  px(g, x - 6, y - 18, 12, 11, "#e8c8a0");
  px(g, x - 6, y - 18, 12, 4, warm ? "#5a2a14" : "#2a3a30");
  px(g, x - 2 + face[0], y - 13 + face[1], 3, 3, "#2a2018");
  px(g, x + 3 + face[0], y - 13 + face[1], 2, 2, "#2a2018");
  if (a.facing === 1) px(g, x + 8, y - 4, 6, 4, body);
  if (a.facing === 3) px(g, x - 14, y - 4, 6, 4, body);
  const mark = heldChip(a.heldName);
  if (mark) {
    const hx = a.facing === 3 ? x - 16 : x + 8;
    const hy = y - 6;
    px(g, hx, hy, 10, 10, "#d4a24a");
    g.fillStyle = "#2a2018";
    g.font = "8px 'Noto Serif SC', serif";
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
  g.font = "10px 'Noto Serif SC', serif";
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
  px(g, x - 9, y + 6 + bob, 18, 5, "rgba(10,8,6,0.35)");
  px(g, x - 10, y - 4 + bob, 20, 12, c);
  px(g, x - 6, y - 10 + bob, 12, 8, shade(typeof c === "string" && c.startsWith("#") ? c : "#3a2018", 0.7));
  px(g, x - 4, y - 6 + bob, 3, 3, "#c45c26");
  px(g, x + 2, y - 6 + bob, 3, 3, "#c45c26");
  px(g, x - 12, y - 16, 24 * (e.hp / e.maxHp), 3, "#c45c26");
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
