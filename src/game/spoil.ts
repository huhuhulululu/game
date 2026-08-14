import type { Season } from "./season";
import { item } from "./items";
import type { Stack } from "./types";

const NEVER = new Set([
  "wood",
  "ore",
  "gem",
  "flint",
  "torch",
  "wood_blade",
  "iron_blade",
  "twin_left",
  "twin_right",
  "lucky_bell",
  "ring_left",
  "ring_right",
  "tomato_seed",
  "greens_seed",
  "wheat_seed",
  "mush",
]);

export function isPerishable(id: string): boolean {
  const base = id.split(":")[0];
  if (NEVER.has(base)) return false;
  const kind = item(base).kind;
  return kind === "food" || kind === "consumable" || base === "herb" || base === "osmanthus";
}

export function spoilRate(season: Season, iced: boolean): number {
  const base = season === "夏" ? 0.2 : season === "冬" ? 0.08 : 0.13;
  return iced ? base * 0.12 : base;
}

export function sleepSpoil(season: Season, iced: boolean): number {
  const base = season === "夏" ? 42 : season === "冬" ? 20 : 32;
  return iced ? Math.floor(base * 0.15) : base;
}

export function freshWord(fresh: number): string {
  if (fresh >= 70) return "鲜";
  if (fresh >= 40) return "还行";
  if (fresh > 0) return "蔫了";
  return "坏了";
}

export function freshMul(fresh: number): number {
  if (fresh >= 55) return 1;
  if (fresh >= 25) return 0.55;
  return 0.12;
}

export function parseHeld(held: string): { id: string; state: string; fresh: number } {
  const [id, state, raw] = held.split(":");
  const fresh = raw !== undefined && raw !== "" && !Number.isNaN(Number(raw)) ? Number(raw) : 100;
  return { id: id ?? "", state: state ?? "", fresh };
}

export function writeHeld(id: string, state: string, fresh: number): string {
  return `${id}:${state}:${Math.round(fresh)}`;
}

export function ageBag(bag: Stack[], amount: number): string[] {
  const notes: string[] = [];
  for (const s of [...bag]) {
    if (!isPerishable(s.id)) continue;
    s.fresh = (s.fresh ?? 100) - amount;
    if ((s.fresh ?? 0) > 0) continue;
    const n = s.n;
    bag.splice(bag.indexOf(s), 1);
    const mush = bag.find((x) => x.id === "mush");
    if (mush) mush.n += n;
    else bag.push({ id: "mush", n, fresh: 100 });
    notes.push(`${item(s.id).name}坏成了一锅糊涂`);
  }
  return notes;
}
