import type { ItemDef, Rarity } from "./types";

export const ITEMS: Record<string, ItemDef> = {
  herb: { id: "herb", name: "山草", kind: "mat", rarity: "common", hue: "#6aa36a", desc: "后山随手能采到的草。", cook: "none" },
  mushroom: { id: "mushroom", name: "矿菇", kind: "food", rarity: "common", hue: "#b5836a", desc: "潮气里长出来的。", cook: "chop" },
  wood: { id: "wood", name: "青木", kind: "mat", rarity: "common", hue: "#8a6a3c", desc: "生火、修篱笆都用得上。" },
  ore: { id: "ore", name: "粗矿", kind: "mat", rarity: "common", hue: "#7d8490", desc: "还带着石头的体温。" },
  gem: { id: "gem", name: "夜晶", kind: "mat", rarity: "rare", hue: "#7ec8d6", desc: "矿道深处才肯亮一下。" },
  tomato: { id: "tomato", name: "番茄", kind: "food", rarity: "common", hue: "#c45c3e", desc: "地里红起来的时候最好看。", cook: "chop" },
  greens: { id: "greens", name: "青菜", kind: "food", rarity: "common", hue: "#5a8f62", desc: "洗过之后还响着水声。", cook: "chop" },
  wheat: { id: "wheat", name: "麦", kind: "food", rarity: "common", hue: "#d4b46a", desc: "可以擀成面条。", cook: "cook" },
  egg: { id: "egg", name: "鸡蛋", kind: "food", rarity: "common", hue: "#e6c36a", desc: "邻摊留下的。", cook: "cook" },
  fish: { id: "fish", name: "河鱼", kind: "food", rarity: "common", hue: "#8aa4b5", desc: "普通重量。", cook: "both" },
  fish_thick: { id: "fish_thick", name: "厚实河鱼", kind: "food", rarity: "common", hue: "#7a9aab", desc: "过了半秤。", cook: "both" },
  fish_heavy: { id: "fish_heavy", name: "沉重河鱼", kind: "food", rarity: "rare", hue: "#6a8a9b", desc: "过了七成，像饥荒里给寄居蟹的那种。", cook: "both" },
  rare_fish: { id: "rare_fish", name: "银鳞", kind: "food", rarity: "rare", hue: "#d5e6ef", desc: "两个人同时下竿才肯来。", cook: "both" },
  rare_fish_heavy: { id: "rare_fish_heavy", name: "沉重银鳞", kind: "food", rarity: "epic", hue: "#e8f2f6", desc: "纪录级的一条。", cook: "both" },
  morsel: { id: "morsel", name: "肉丁", kind: "food", rarity: "common", hue: "#b56a5a", desc: "小东西身上下来的。", cook: "cook" },
  meat: { id: "meat", name: "兽肉", kind: "food", rarity: "rare", hue: "#8a3a2a", desc: "够进一锅羹。", cook: "cook" },
  mush: { id: "mush", name: "一锅糊涂", kind: "food", rarity: "common", hue: "#6a5a48", desc: "什么都对不上的时候。", cook: "none" },
  osmanthus: { id: "osmanthus", name: "桂花", kind: "food", rarity: "rare", hue: "#d4a24a", desc: "香气比花更先到。", cook: "none" },
  tomato_seed: { id: "tomato_seed", name: "番茄种", kind: "seed", rarity: "common", hue: "#c45c3e", desc: "埋下去，去别处走一走。", growInto: "tomato" },
  greens_seed: { id: "greens_seed", name: "青菜种", kind: "seed", rarity: "common", hue: "#5a8f62", desc: "不用天天浇。它听得见你们的脚步。", growInto: "greens" },
  wheat_seed: { id: "wheat_seed", name: "麦种", kind: "seed", rarity: "common", hue: "#d4b46a", desc: "长满一垄，夜里就有面。", growInto: "wheat" },
  tea: { id: "tea", name: "热茶", kind: "consumable", rarity: "common", hue: "#d8b07a", desc: "喝一口，血色会回来。" },
  wood_blade: { id: "wood_blade", name: "木折刀", kind: "equip", rarity: "common", hue: "#a9844f", desc: "开山第一夜够用。", slot: "weapon", atk: 2 },
  iron_blade: { id: "iron_blade", name: "铁脊", kind: "equip", rarity: "rare", hue: "#9aa3ad", desc: "矿道里敲出来的。", slot: "weapon", atk: 5 },
  twin_left: { id: "twin_left", name: "并肩·左刃", kind: "equip", rarity: "pair", hue: "#c45c26", desc: "只有右刃也在时，才会热起来。", slot: "weapon", atk: 4, pairId: "twin_right", bond: 2 },
  twin_right: { id: "twin_right", name: "并肩·右刃", kind: "equip", rarity: "pair", hue: "#3f6d5c", desc: "只有左刃也在时，才会热起来。", slot: "weapon", atk: 4, pairId: "twin_left", bond: 2 },
  lucky_bell: { id: "lucky_bell", name: "铃铛", kind: "equip", rarity: "rare", hue: "#e6d0a6", desc: "掉落会偏心一点。", slot: "charm", luck: 8 },
  ring_left: { id: "ring_left", name: "同路戒·左", kind: "equip", rarity: "pair", hue: "#c9a06a", desc: "两枚都戴上，经验会合成一处。", slot: "charm", bond: 3, pairId: "ring_right" },
  ring_right: { id: "ring_right", name: "同路戒·右", kind: "equip", rarity: "pair", hue: "#c9a06a", desc: "两枚都戴上，经验会合成一处。", slot: "charm", bond: 3, pairId: "ring_left" },
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#d7c4a3",
  rare: "#7ec8d6",
  epic: "#c9a06a",
  pair: "#e08a4f",
};

export function item(id: string): ItemDef {
  return ITEMS[id] ?? ITEMS.herb;
}
