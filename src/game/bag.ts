import { item } from "./items";
import { isPerishable } from "./spoil";
import type { Stack } from "./types";

export function countOf(bag: Stack[], id: string): number {
  return bag.filter((s) => s.id === id).reduce((n, s) => n + s.n, 0);
}

export function addToBag(bag: Stack[], id: string, n = 1, fresh = 100): void {
  const start = isPerishable(id) ? fresh : undefined;
  const hit = bag.find((s) => {
    if (s.id !== id) return false;
    if (start === undefined) return true;
    return Math.abs((s.fresh ?? 100) - start) <= 22;
  });
  if (hit) {
    if (start !== undefined) {
      const a = hit.fresh ?? 100;
      hit.fresh = Math.round((a * hit.n + start * n) / (hit.n + n));
    }
    hit.n += n;
    return;
  }
  bag.push(start === undefined ? { id, n } : { id, n, fresh: start });
}

export function takeFresh(bag: Stack[], id: string, n = 1): number | null {
  const stacks = bag.filter((s) => s.id === id).sort((a, b) => (a.fresh ?? 100) - (b.fresh ?? 100));
  const have = stacks.reduce((s, x) => s + x.n, 0);
  if (have < n) return null;
  let left = n;
  let acc = 0;
  for (const s of stacks) {
    const take = Math.min(s.n, left);
    acc += (s.fresh ?? 100) * take;
    s.n -= take;
    left -= take;
    if (s.n <= 0) bag.splice(bag.indexOf(s), 1);
    if (!left) break;
  }
  return acc / n;
}

export function takeFromBag(bag: Stack[], id: string, n = 1): boolean {
  return takeFresh(bag, id, n) !== null;
}

export function bagLines(bag: Stack[]): string[] {
  return bag.map((s) => `${item(s.id).name} ×${s.n}`);
}
