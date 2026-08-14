import type { LootTable } from "./loot";

/** Tables follow the Minecraft pool/entry shape. Names are ours. */
export const LOOT_TABLES: Record<string, LootTable> = {
  slime: {
    pools: [
      {
        rolls: 1,
        bonus_rolls: 0.08,
        entries: [
          { type: "item", name: "mushroom", weight: 24, functions: [{ function: "set_count", count: { min: 1, max: 2 } }] },
          { type: "item", name: "ore", weight: 10 },
          { type: "empty", weight: 12 },
        ],
      },
    ],
  },
  bat: {
    pools: [
      {
        rolls: 1,
        bonus_rolls: 0.1,
        entries: [
          { type: "item", name: "ore", weight: 20 },
          { type: "item", name: "tea", weight: 8 },
          { type: "empty", weight: 10 },
        ],
      },
    ],
  },
  shadow: {
    pools: [
      {
        rolls: 1,
        bonus_rolls: 0.12,
        entries: [
          { type: "item", name: "ore", weight: 18, functions: [{ function: "set_count", count: { min: 1, max: 2 } }] },
          { type: "item", name: "wood", weight: 10 },
          { type: "item", name: "gem", weight: 6 },
          { type: "item", name: "iron_blade", weight: 3, functions: [{ function: "enchant_with_levels", levels: 1 }] },
          { type: "empty", weight: 8 },
        ],
      },
    ],
  },
  lantern: {
    pools: [
      {
        rolls: { min: 1, max: 2 },
        bonus_rolls: 0.15,
        entries: [
          { type: "item", name: "gem", weight: 16 },
          { type: "item", name: "lucky_bell", weight: 8, functions: [{ function: "enchant_with_levels", levels: 2 }] },
          { type: "item", name: "iron_blade", weight: 10, functions: [{ function: "enchant_with_levels", levels: 2 }] },
          { type: "item", name: "tea", weight: 8 },
        ],
      },
    ],
  },
  twin: {
    pools: [
      {
        rolls: 1,
        entries: [
          { type: "item", name: "twin_left", weight: 10, conditions: [{ condition: "pair_near" }], functions: [{ function: "enchant_with_levels", levels: 2 }] },
          { type: "item", name: "twin_right", weight: 10, conditions: [{ condition: "pair_near" }], functions: [{ function: "enchant_with_levels", levels: 2 }] },
          { type: "item", name: "gem", weight: 12 },
          { type: "item", name: "iron_blade", weight: 8, functions: [{ function: "enchant_with_levels", levels: 1 }] },
        ],
      },
    ],
  },
  ore_node: {
    pools: [
      {
        rolls: 1,
        bonus_rolls: 0.1,
        entries: [
          { type: "item", name: "ore", weight: 70, functions: [{ function: "set_count", count: { min: 1, max: 3 } }] },
          { type: "item", name: "gem", weight: 12 },
          { type: "item", name: "wood", weight: 8 },
        ],
      },
    ],
  },
  chest: {
    pools: [
      {
        rolls: { min: 1, max: 2 },
        bonus_rolls: 0.2,
        entries: [
          { type: "item", name: "iron_blade", weight: 16, functions: [{ function: "enchant_with_levels", levels: 2 }] },
          { type: "item", name: "lucky_bell", weight: 12, functions: [{ function: "enchant_with_levels", levels: 2 }] },
          { type: "item", name: "gem", weight: 20, functions: [{ function: "set_count", count: { min: 1, max: 2 } }] },
          { type: "item", name: "tea", weight: 10 },
        ],
      },
    ],
  },
  silk: {
    pools: [
      {
        rolls: 1,
        bonus_rolls: 0.08,
        entries: [
          { type: "item", name: "morsel", weight: 18 },
          { type: "item", name: "herb", weight: 12 },
          { type: "empty", weight: 10 },
        ],
      },
    ],
  },
  marsh: {
    pools: [
      {
        rolls: 1,
        bonus_rolls: 0.1,
        entries: [
          { type: "item", name: "mushroom", weight: 22, functions: [{ function: "set_count", count: { min: 1, max: 2 } }] },
          { type: "item", name: "herb", weight: 10 },
          { type: "empty", weight: 8 },
        ],
      },
    ],
  },
  rain_bonus: {
    pools: [
      {
        rolls: 1,
        conditions: [{ condition: "weather", weather: "rain" }],
        entries: [{ type: "item", name: "osmanthus", weight: 1 }],
      },
    ],
  },
};
