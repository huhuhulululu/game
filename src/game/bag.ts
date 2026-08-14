import { item } from "./items";
import type { Stack } from "./types";

export function countOf(bag: Stack[], id: string): number {
  return bag.find((s) => s.id === id)?.n ?? 0;
}

export function addToBag(bag: Stack[], id: string, n = 1): void {
  const hit = bag.find((s) => s.id === id);
  if (hit) hit.n += n;
  else bag.push({ id, n });
}

export function takeFromBag(bag: Stack[], id: string, n = 1): boolean {
  const hit = bag.find((s) => s.id === id);
  if (!hit || hit.n < n) return false;
  hit.n -= n;
  if (hit.n <= 0) bag.splice(bag.indexOf(hit), 1);
  return true;
}

export function bagLines(bag: Stack[]): string[] {
  return bag.map((s) => `${item(s.id).name} ×${s.n}`);
}
