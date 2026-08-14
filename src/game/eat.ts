import { item } from "./items";
import { potById } from "./food";

export function heldLabel(held: string): string {
  if (!held) return "";
  if (held.startsWith("dish:")) return potById(held.slice(5)).name;
  const name = item(held.split(":")[0]).name;
  return held.includes(":cooked") ? `烤${name}` : name;
}

export function eatValue(held: string): { hp: number; hunger: number } | null {
  if (!held) return null;
  if (held.startsWith("dish:")) {
    const rec = potById(held.slice(5));
    return { hp: 8 + Math.floor(rec.gold / 6), hunger: 36 + rec.bond * 2 };
  }
  const id = held.split(":")[0];
  const cooked = held.includes(":cooked") ? 1 : 0;
  if (id === "tea") return { hp: 10, hunger: 22 };
  if (id === "mush") return { hp: 1, hunger: 8 };
  if (id === "osmanthus") return { hp: 2, hunger: 10 };
  if (id === "herb") return { hp: 1, hunger: 6 };
  const kind = item(id).kind;
  if (kind === "food") {
    if (id.includes("heavy") || id === "meat") return { hp: 6 + cooked * 2, hunger: 28 + cooked * 8 };
    if (id.includes("fish") || id === "morsel") return { hp: 4 + cooked * 2, hunger: 18 + cooked * 8 };
    return { hp: 3 + cooked * 2, hunger: 14 + cooked * 8 };
  }
  return null;
}
