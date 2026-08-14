import { item } from "./items";
import { potById } from "./food";

export function heldLabel(held: string): string {
  if (!held) return "";
  if (held.startsWith("dish:")) return potById(held.slice(5)).name;
  return item(held.split(":")[0]).name;
}

export function eatValue(held: string): { hp: number; hunger: number } | null {
  if (!held) return null;
  if (held.startsWith("dish:")) {
    const rec = potById(held.slice(5));
    return { hp: 8 + Math.floor(rec.gold / 6), hunger: 36 + rec.bond * 2 };
  }
  const id = held.split(":")[0];
  if (id === "tea") return { hp: 10, hunger: 22 };
  if (id === "mush") return { hp: 1, hunger: 8 };
  if (id === "osmanthus") return { hp: 2, hunger: 10 };
  if (id === "herb") return { hp: 1, hunger: 6 };
  const kind = item(id).kind;
  if (kind === "food") {
    if (id.includes("heavy") || id === "meat") return { hp: 6, hunger: 28 };
    if (id.includes("fish") || id === "morsel") return { hp: 4, hunger: 18 };
    return { hp: 3, hunger: 14 };
  }
  return null;
}
