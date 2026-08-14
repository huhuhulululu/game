import type { WorldSnap } from "../sim/net";
import { TILE } from "../world/maps";

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

export function drawCell(
  g: CanvasRenderingContext2D,
  ch: string,
  px: number,
  py: number,
  fill: string,
  now: number,
): void {
  g.fillStyle = fill;
  g.fillRect(px, py, TILE - 1, TILE - 1);
  const cx = px + TILE / 2;
  const cy = py + TILE / 2;
  if (ch === "." || ch === "s") {
    g.fillStyle = "rgba(20,28,16,0.18)";
    for (let i = 0; i < 4; i++) {
      const x = px + 6 + ((i * 13 + py) % 24);
      const y = py + 8 + ((i * 9 + px) % 20);
      g.fillRect(x, y, 2, 5);
    }
  }
  if (ch === ",") {
    g.fillStyle = "rgba(90,70,40,0.35)";
    g.fillRect(px + 8, py + 16, 4, 3);
    g.fillRect(px + 20, py + 10, 3, 3);
  }
  if (ch === "~" || ch === "D") {
    g.strokeStyle = "rgba(180,210,220,0.22)";
    g.beginPath();
    g.moveTo(px + 2, cy + Math.sin(now / 280 + px) * 2);
    g.lineTo(px + TILE - 3, cy + Math.sin(now / 280 + px + 1.2) * 2);
    g.stroke();
  }
  if (ch === "T" || ch === "t") {
    g.fillStyle = "#2a2014";
    g.fillRect(cx - 2, cy + 2, 4, 10);
    g.fillStyle = ch === "T" ? "#1a3324" : "#2f5a38";
    g.beginPath();
    g.arc(cx, cy - 2, ch === "T" ? 11 : 8, 0, Math.PI * 2);
    g.fill();
  }
  if (ch === "F" || ch === "O") {
    g.fillStyle = ch === "O" ? "#c9a06a" : "#3f6d5c";
    g.beginPath();
    g.arc(cx, cy, 6, 0, Math.PI * 2);
    g.fill();
  }
  if (ch === "b" || ch === "^" || ch === "o") {
    g.fillStyle = "rgba(20,16,12,0.35)";
    g.beginPath();
    g.moveTo(cx - 8, cy + 6);
    g.lineTo(cx, cy - 7);
    g.lineTo(cx + 8, cy + 6);
    g.fill();
  }
  if (ch === "K") {
    g.fillStyle = `rgba(232,140,60,${0.45 + Math.sin(now / 90) * 0.2})`;
    g.beginPath();
    g.arc(cx, cy, 7, 0, Math.PI * 2);
    g.fill();
  }
  if (ch === "H") {
    g.fillStyle = "#0a0606";
    g.beginPath();
    g.arc(cx, cy, 8, 0, Math.PI * 2);
    g.fill();
  }
  if (ch === "R") {
    g.fillStyle = "rgba(200,220,230,0.35)";
    g.fillRect(px + 6, py + 8, TILE - 14, TILE - 16);
  }
  if (ch === "J") {
    g.fillStyle = "#5a3a28";
    g.beginPath();
    g.moveTo(cx, cy - 8);
    g.lineTo(cx - 10, cy + 8);
    g.lineTo(cx + 10, cy + 8);
    g.closePath();
    g.fill();
    g.fillStyle = "rgba(232,140,60,0.28)";
    g.fillRect(cx - 3, cy + 4, 6, 3);
  }
  if (ch === "U") {
    g.fillStyle = "#c45c26";
    g.fillRect(px + 8, py + 18, TILE - 18, 6);
  }
  if (ch === "C") {
    g.fillStyle = "#e7d3b4";
    g.fillRect(px + 6, py + 20, TILE - 14, 4);
  }
  if (ch === "Q") {
    g.fillStyle = "#8a3a16";
    g.beginPath();
    g.arc(cx, cy, 8, 0, Math.PI * 2);
    g.fill();
  }
  if (ch === "W") {
    g.fillStyle = "#f4e7d2";
    g.fillRect(px + 4, py + 10, TILE - 10, 8);
  }
}

export function drawPlot(g: CanvasRenderingContext2D, px: number, py: number, stage: number, seed?: string): void {
  if (!seed && stage <= 0) return;
  const cx = px + TILE / 2;
  const cy = py + TILE / 2;
  g.fillStyle = stage >= 3 ? "#c45c3e" : stage >= 2 ? "#5a8f62" : "#6a6a38";
  g.fillRect(cx - 2, cy + 4, 4, 8);
  if (stage >= 2) {
    g.beginPath();
    g.arc(cx, cy, 5 + stage, 0, Math.PI * 2);
    g.fill();
  }
}

export function drawActor(g: CanvasRenderingContext2D, a: WorldSnap["actors"][0], ox: number, oy: number): void {
  const x = ox + a.x;
  const y = oy + a.y;
  const color = a.side === "left" ? "#c45c26" : "#3f6d5c";
  if (a.torch) {
    const glow = g.createRadialGradient(x, y, 4, x, y, 46);
    glow.addColorStop(0, "rgba(232,140,60,0.4)");
    glow.addColorStop(1, "rgba(232,140,60,0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(x, y, 46, 0, Math.PI * 2);
    g.fill();
  }
  if (a.ping > 0) {
    const r = 16 + (1.6 - Math.min(1.6, a.ping)) * 26;
    g.strokeStyle = `rgba(244,231,210,${Math.min(0.55, a.ping * 0.38)})`;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 1;
  }
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, 12, 0, Math.PI * 2);
  g.fill();
  const face = [
    [0, -7],
    [7, 0],
    [0, 7],
    [-7, 0],
  ][a.facing] ?? [0, 7];
  g.fillStyle = "#f4e7d2";
  g.beginPath();
  g.arc(x + face[0], y + face[1], 3, 0, Math.PI * 2);
  g.fill();
  if (a.fishing === "bite") {
    g.strokeStyle = "#f4e7d2";
    g.strokeRect(x - 16, y - 16, 32, 32);
  }
  g.font = "12px 'Noto Serif SC', serif";
  g.textAlign = "center";
  g.fillText(a.name, x, y - 18);
  g.fillStyle = "#c45c26";
  g.fillRect(x - 12, y + 14, 24 * Math.max(0, a.hp / a.maxHp), 3);
  g.fillStyle = "#6aa36a";
  g.fillRect(x - 12, y + 18, 24 * Math.max(0, a.hunger / 100), 2);
  g.fillStyle = "#f4e7d2";
  if (a.heldName) g.fillText(a.heldName, x, y + 30);
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
