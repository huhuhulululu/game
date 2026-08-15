import { TILE } from "../world/maps";
import type { ActorSnap, WorldSnap } from "../sim/net";

export type FeelSound = "step" | "shore" | "fire" | "door" | "green" | "night" | "ready" | "bite";

export type AmbientKind = "day" | "water" | "night" | "inn" | "";

export type FeelState = {
  zone: string;
  x: number;
  y: number;
  stepAt: number;
  shoreAt: number;
  fireAt: number;
  inGreen: boolean;
  night: boolean;
  potReady: boolean;
  fishing: string;
};

const GREEN_LO = 0.38;
const GREEN_HI = 0.72;

export function emptyFeel(): FeelState {
  return {
    zone: "",
    x: 0,
    y: 0,
    stepAt: -999,
    shoreAt: -999,
    fireAt: -999,
    inGreen: false,
    night: false,
    potReady: false,
    fishing: "",
  };
}

function meOf(snap: WorldSnap): ActorSnap | undefined {
  return snap.actors.find((a) => a.id === snap.you) ?? snap.actors[0];
}

function tileAt(rows: string[], x: number, y: number): string {
  return rows[y]?.[x] ?? "";
}

function nearWater(rows: string[], tx: number, ty: number): boolean {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ch = tileAt(rows, tx + dx, ty + dy);
      if (ch === "~" || ch === "D") return true;
    }
  }
  return false;
}

function nearFire(snap: WorldSnap, tx: number, ty: number): boolean {
  const rows = snap.tiles;
  const mw = rows[0]?.length ?? 1;
  for (const key of snap.fires) {
    const fx = key % mw;
    const fy = Math.floor(key / mw);
    if (Math.abs(fx - tx) <= 2 && Math.abs(fy - ty) <= 2) return true;
  }
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ch = tileAt(rows, tx + dx, ty + dy);
      if (ch === "K" || ch === "J") return true;
    }
  }
  return false;
}

function inGreenWindow(mark: number): boolean {
  return mark >= GREEN_LO && mark <= GREEN_HI;
}

export function pickAmbient(snap: WorldSnap): AmbientKind {
  if (snap.zone === "kitchen") return "inn";
  const me = meOf(snap);
  const x = me?.x ?? snap.youAt.x;
  const y = me?.y ?? snap.youAt.y;
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  if (snap.tiles.length && nearWater(snap.tiles, tx, ty)) return "water";
  if (snap.night && snap.zone !== "mine") return "night";
  if (snap.zone === "valley" || snap.zone === "wild" || snap.zone === "mine") return "day";
  return "";
}

export function tickFeel(prev: FeelState | null, snap: WorldSnap, now: number): { next: FeelState; sounds: FeelSound[] } {
  const me = meOf(snap);
  const x = me?.x ?? snap.youAt.x;
  const y = me?.y ?? snap.youAt.y;
  const last = prev ?? emptyFeel();
  const sounds: FeelSound[] = [];
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  const moved = Math.hypot(x - last.x, y - last.y) > 0.45;
  const busy = me?.busy ?? "";

  if (last.zone && snap.zone === "kitchen" && last.zone !== "kitchen") sounds.push("door");
  if (last.zone && !last.night && snap.night) sounds.push("night");
  const potReady = !!(snap.potReady && snap.potReady !== "在煮");
  if (last.zone && !last.potReady && potReady) sounds.push("ready");

  let stepAt = last.stepAt;
  if (moved && !busy && now - stepAt >= 280) {
    sounds.push("step");
    stepAt = now;
  }

  let shoreAt = last.shoreAt;
  if (snap.tiles.length && nearWater(snap.tiles, tx, ty) && now - shoreAt >= 1400) {
    sounds.push("shore");
    shoreAt = now;
  }

  let fireAt = last.fireAt;
  if (snap.tiles.length && nearFire(snap, tx, ty) && now - fireAt >= 900) {
    sounds.push("fire");
    fireAt = now;
  }

  const fishing = me?.fishing ?? "";
  if (last.zone && fishing === "bite" && last.fishing !== "bite") sounds.push("bite");
  const fighting = fishing === "fight";
  const green = fighting && inGreenWindow(me?.fishMark ?? 0);
  if (green && !last.inGreen) sounds.push("green");

  return {
    next: { zone: snap.zone, x, y, stepAt, shoreAt, fireAt, inGreen: green, night: snap.night, potReady, fishing },
    sounds,
  };
}
