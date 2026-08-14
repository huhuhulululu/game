export function mulberry(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickWeighted<T extends { w: number }>(list: T[], rand: () => number): T {
  const total = list.reduce((a, b) => a + b.w, 0);
  let r = rand() * total;
  for (const row of list) {
    r -= row.w;
    if (r <= 0) return row;
  }
  return list[list.length - 1];
}

export function pickWeightedRecord(rec: Record<string, number>, rand: () => number): string {
  return pickWeighted(
    Object.entries(rec).map(([id, w]) => ({ id, w })),
    rand,
  ).id;
}

export function chance(p: number, rand: () => number): boolean {
  return rand() < p;
}
