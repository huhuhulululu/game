/**
 * Minecraft-style loot tables (public schema).
 * Pools → rolls + bonus_rolls*luck → weighted entries → functions.
 * @see https://minecraft.wiki/w/Loot_table
 */

export type NumProv = number | { min: number; max: number };

export interface LootFn {
  function: "set_count" | "enchant_with_levels";
  count?: NumProv;
  levels?: number;
}

export interface LootCond {
  condition: "weather" | "pair_near" | "random_chance";
  weather?: string;
  chance?: number;
}

export interface LootEntry {
  type: "item" | "empty" | "loot_table";
  name?: string;
  weight?: number;
  quality?: number;
  functions?: LootFn[];
  conditions?: LootCond[];
}

export interface LootPool {
  rolls: NumProv;
  bonus_rolls?: number;
  entries: LootEntry[];
  conditions?: LootCond[];
}

export interface LootTable {
  pools: LootPool[];
}

export interface LootCtx {
  rand: () => number;
  luck: number;
  weather: string;
  pairNear: boolean;
}

export interface LootStack {
  id: string;
  n: number;
  enchant?: number;
}

function resolveNum(n: NumProv, rand: () => number): number {
  if (typeof n === "number") return n;
  return n.min + Math.floor(rand() * (n.max - n.min + 1));
}

function condOk(conds: LootCond[] | undefined, ctx: LootCtx): boolean {
  if (!conds?.length) return true;
  return conds.every((c) => {
    if (c.condition === "weather") return ctx.weather === c.weather;
    if (c.condition === "pair_near") return ctx.pairNear;
    if (c.condition === "random_chance") return ctx.rand() < (c.chance ?? 0);
    return true;
  });
}

function pickEntry(entries: LootEntry[], ctx: LootCtx): LootEntry | null {
  const live = entries.filter((e) => condOk(e.conditions, ctx));
  const total = live.reduce((a, e) => a + (e.weight ?? 1), 0);
  if (total <= 0) return null;
  let r = ctx.rand() * total;
  for (const e of live) {
    r -= e.weight ?? 1;
    if (r <= 0) return e;
  }
  return live[live.length - 1] ?? null;
}

export function rollLootTable(table: LootTable, ctx: LootCtx, tables?: Record<string, LootTable>): LootStack[] {
  const out: LootStack[] = [];
  for (const pool of table.pools) {
    if (!condOk(pool.conditions, ctx)) continue;
    const rolls = resolveNum(pool.rolls, ctx.rand) + Math.floor((pool.bonus_rolls ?? 0) * ctx.luck);
    for (let i = 0; i < Math.max(0, rolls); i++) {
      const entry = pickEntry(pool.entries, ctx);
      if (!entry || entry.type === "empty") continue;
      if (entry.type === "loot_table" && entry.name && tables?.[entry.name]) {
        out.push(...rollLootTable(tables[entry.name], ctx, tables));
        continue;
      }
      if (entry.type !== "item" || !entry.name) continue;
      let n = 1;
      let enchant = 0;
      for (const fn of entry.functions ?? []) {
        if (fn.function === "set_count" && fn.count !== undefined) n = resolveNum(fn.count, ctx.rand);
        if (fn.function === "enchant_with_levels") enchant = fn.levels ?? 1;
      }
      out.push({ id: entry.name, n, enchant: enchant || undefined });
    }
  }
  return out;
}
