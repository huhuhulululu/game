/**
 * Diablo II-style item generation (publicly documented pipeline).
 * Quality: unique/pair → rare → magic → normal.
 * Magic: 1 prefix and/or 1 suffix. Rare: 3–6 affixes, one per group.
 * @see https://engineered.at/articles/under-the-hood-diablo-ii-item-generation
 */

import { item } from "./items";

export type Quality = "normal" | "magic" | "rare" | "pair" | "unique";

export interface AffixDef {
  id: string;
  name: string;
  slot: "prefix" | "suffix";
  group: string;
  level: number;
  w: number;
  atk?: number;
  luck?: number;
  bond?: number;
}

export interface GearInst {
  uid: string;
  base: string;
  quality: Quality;
  name: string;
  atk: number;
  luck: number;
  bond: number;
  ilvl: number;
}

export const PREFIXES: AffixDef[] = [
  { id: "keen", name: "锋", slot: "prefix", group: "atk", level: 1, w: 24, atk: 2 },
  { id: "cruel", name: "烈", slot: "prefix", group: "atk", level: 4, w: 10, atk: 4 },
  { id: "lucky", name: "幸", slot: "prefix", group: "luck", level: 1, w: 16, luck: 4 },
  { id: "gilded", name: "金", slot: "prefix", group: "luck", level: 5, w: 6, luck: 8 },
  { id: "twin", name: "同路", slot: "prefix", group: "bond", level: 3, w: 10, bond: 2 },
  { id: "dull", name: "钝", slot: "prefix", group: "atk", level: 1, w: 8, atk: -1 },
];

export const SUFFIXES: AffixDef[] = [
  { id: "of-power", name: "力", slot: "suffix", group: "atk2", level: 1, w: 20, atk: 1 },
  { id: "of-the-whale", name: "泽", slot: "suffix", group: "luck2", level: 2, w: 14, luck: 3 },
  { id: "of-two", name: "并肩", slot: "suffix", group: "bond2", level: 3, w: 10, bond: 3 },
  { id: "of-night", name: "夜", slot: "suffix", group: "luck2", level: 4, w: 8, luck: 5 },
  { id: "of-ore", name: "矿", slot: "suffix", group: "atk2", level: 2, w: 12, atk: 2 },
];

export function rollQuality(ilvl: number, mf: number, rand: () => number, pairBias = false): Quality {
  const boost = 1 + mf / 100 + ilvl / 40;
  if (pairBias && rand() < 0.08 * boost) return "pair";
  if (rand() < 0.02 * boost) return "unique";
  if (rand() < 0.08 * boost) return "rare";
  if (rand() < 0.28 * boost) return "magic";
  return "normal";
}

function pickAffix(pool: AffixDef[], ilvl: number, used: Set<string>, rand: () => number): AffixDef | null {
  const live = pool.filter((a) => a.level <= ilvl && !used.has(a.group));
  const total = live.reduce((s, a) => s + a.w, 0);
  if (!total) return null;
  let r = rand() * total;
  for (const a of live) {
    r -= a.w;
    if (r <= 0) return a;
  }
  return live[live.length - 1] ?? null;
}

function rareCount(ilvl: number, rand: () => number): number {
  if (ilvl >= 8) return 5 + (rand() < 0.5 ? 1 : 0);
  if (ilvl >= 5) return 4 + (rand() < 0.5 ? 1 : 0);
  return 3 + (rand() < 0.4 ? 1 : 0);
}

export function rollAffixes(quality: Quality, ilvl: number, rand: () => number): AffixDef[] {
  const used = new Set<string>();
  const out: AffixDef[] = [];
  const add = (slot: "prefix" | "suffix") => {
    const hit = pickAffix(slot === "prefix" ? PREFIXES : SUFFIXES, ilvl, used, rand);
    if (!hit) return;
    used.add(hit.group);
    out.push(hit);
  };
  if (quality === "normal") return out;
  if (quality === "magic") {
    const both = rand() < 0.5;
    if (both || rand() < 0.5) add("prefix");
    if (both || out.length === 0) add("suffix");
    return out;
  }
  const n = quality === "rare" ? rareCount(ilvl, rand) : 2;
  for (let i = 0; i < n; i++) add(i % 2 === 0 ? "prefix" : "suffix");
  return out;
}

export function makeGear(base: string, ilvl: number, mf: number, rand: () => number, pairBias = false): GearInst {
  const def = item(base);
  let quality = def.rarity === "pair" ? "pair" : rollQuality(ilvl, mf, rand, pairBias);
  if (def.rarity === "pair") quality = "pair";
  const affixes = quality === "pair" || quality === "unique" ? [] : rollAffixes(quality, ilvl, rand);
  const atk = (def.atk ?? 0) + affixes.reduce((s, a) => s + (a.atk ?? 0), 0) + (quality === "unique" ? 3 : 0);
  const luck = (def.luck ?? 0) + affixes.reduce((s, a) => s + (a.luck ?? 0), 0);
  const bond = (def.bond ?? 0) + affixes.reduce((s, a) => s + (a.bond ?? 0), 0) + (quality === "pair" ? 2 : 0);
  const pre = affixes.find((a) => a.slot === "prefix");
  const suf = affixes.find((a) => a.slot === "suffix");
  const name =
    quality === "pair"
      ? def.name
      : quality === "unique"
        ? `旧藏·${def.name}`
        : `${pre ? pre.name : ""}${def.name}${suf ? `之${suf.name}` : ""}`;
  return {
    uid: `${Date.now().toString(36)}-${Math.floor(rand() * 1e6).toString(36)}`,
    base,
    quality,
    name,
    atk,
    luck,
    bond,
    ilvl,
  };
}

/** Crafted items: guaranteed property + 1–2 affixes (D2 crafted). */
export function craftGear(base: string, ilvl: number, forgeSkill: number, rand: () => number): GearInst {
  const quality: Quality = forgeSkill >= 8 && rand() < 0.15 ? "rare" : "magic";
  const gear = makeGear(base, ilvl + Math.floor(forgeSkill / 3), forgeSkill * 4, rand);
  gear.quality = quality;
  gear.atk += 1 + Math.floor(forgeSkill / 4);
  gear.name = `锻·${gear.name}`;
  return gear;
}
