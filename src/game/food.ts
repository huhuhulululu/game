/**
 * Don't Starve Crock Pot rules (public wiki), with our names.
 * 4 ingredients → sum food tags → highest priority recipe.
 * Wet Goop always matches at priority -2.
 * @see https://dontstarve.wiki.gg/wiki/Crock_Pot
 * @see https://dontstarve.wiki.gg/wiki/Food_Value
 */

export type FoodTag = "meat" | "fish" | "veggie" | "fruit" | "egg" | "sweet" | "filler" | "inedible";

export type FoodValue = Partial<Record<FoodTag, number>>;

export interface PotRecipe {
  id: string;
  name: string;
  priority: number;
  gold: number;
  bond: number;
  note: string;
  need?: FoodValue;
  no?: FoodValue;
  oneOf?: string[];
  allOf?: string[];
}

export const INGREDIENT_TAGS: Record<string, FoodValue> = {
  herb: { filler: 1, veggie: 0.5 },
  mushroom: { veggie: 1 },
  tomato: { veggie: 1 },
  greens: { veggie: 1 },
  wheat: { filler: 1 },
  egg: { egg: 1 },
  osmanthus: { sweet: 1, fruit: 0.5 },
  fish: { fish: 0.5, meat: 0.5 },
  fish_thick: { fish: 1, meat: 0.5 },
  fish_heavy: { fish: 1, meat: 1 },
  rare_fish: { fish: 1, meat: 0.5 },
  rare_fish_heavy: { fish: 1.5, meat: 1 },
  morsel: { meat: 0.5 },
  meat: { meat: 1 },
  wood: { inedible: 1, filler: 1 },
};

export const POT_RECIPES: PotRecipe[] = [
  {
    id: "osmanthus-fish",
    name: "桂花银鳞",
    priority: 30,
    gold: 40,
    bond: 8,
    note: "银鳞和桂花同时在锅里。",
    oneOf: ["rare_fish", "rare_fish_heavy"],
    allOf: ["osmanthus"],
  },
  {
    id: "fish-sticks",
    name: "酥鱼条",
    priority: 10,
    gold: 22,
    bond: 4,
    note: "有鱼，再加一点能撑锅的东西。",
    need: { fish: 0.25 },
    no: { inedible: 2 },
  },
  {
    id: "fish-noodle",
    name: "河鱼面",
    priority: 10,
    gold: 24,
    bond: 4,
    note: "鱼和麦遇见。",
    need: { fish: 0.5, filler: 1 },
  },
  {
    id: "tomato-egg",
    name: "番茄炒蛋",
    priority: 8,
    gold: 16,
    bond: 3,
    note: "蛋和菜。谁翻锅谁有理。",
    need: { egg: 1, veggie: 0.5 },
  },
  {
    id: "honey-veg",
    name: "桂花时蔬",
    priority: 6,
    gold: 18,
    bond: 3,
    note: "甜和青菜。",
    need: { sweet: 1, veggie: 0.5 },
  },
  {
    id: "mushroom-soup",
    name: "矿菇汤",
    priority: 5,
    gold: 12,
    bond: 2,
    note: "菇够一碗就行。",
    oneOf: ["mushroom"],
  },
  {
    id: "meaty-stew",
    name: "厚肉羹",
    priority: 0,
    gold: 28,
    bond: 5,
    note: "肉值够 3，就是羹，不是丸。",
    need: { meat: 3 },
    no: { inedible: 1 },
  },
  {
    id: "garden-noodle",
    name: "时蔬面",
    priority: 0,
    gold: 14,
    bond: 3,
    note: "菜多、没有肉。",
    need: { veggie: 1.5 },
    no: { meat: 0.5 },
  },
  {
    id: "herb-tea",
    name: "山草茶",
    priority: 1,
    gold: 6,
    bond: 1,
    note: "几乎只有草的时候。",
    oneOf: ["herb"],
    no: { meat: 0.5, fish: 0.25 },
  },
  {
    id: "meatballs",
    name: "肉丸",
    priority: -1,
    gold: 14,
    bond: 2,
    note: "有一点肉就成。肉再多，就会变成羹。",
    need: { meat: 0.5 },
    no: { inedible: 1 },
  },
  {
    id: "wet-goop",
    name: "一锅糊涂",
    priority: -2,
    gold: 1,
    bond: 0,
    note: "什么都对不上的时候。饥荒里叫 Wet Goop。",
  },
];

export function tagsOf(id: string): FoodValue {
  const key = id.split(":")[0];
  return { ...(INGREDIENT_TAGS[key] ?? { filler: 0.5 }) };
}

export function sumTags(ids: string[]): FoodValue {
  const sum: FoodValue = {};
  for (const id of ids) {
    const t = tagsOf(id);
    for (const [k, v] of Object.entries(t) as [FoodTag, number][]) {
      sum[k] = (sum[k] ?? 0) + v;
    }
  }
  return sum;
}

function meets(have: FoodValue, recipe: PotRecipe, ids: string[]): boolean {
  const bases = ids.map((id) => id.split(":")[0]);
  if (recipe.oneOf && !recipe.oneOf.some((x) => bases.includes(x))) return false;
  if (recipe.allOf && !recipe.allOf.every((x) => bases.includes(x))) return false;
  for (const [k, v] of Object.entries(recipe.need ?? {}) as [FoodTag, number][]) {
    if ((have[k] ?? 0) < v) return false;
  }
  for (const [k, v] of Object.entries(recipe.no ?? {}) as [FoodTag, number][]) {
    if ((have[k] ?? 0) >= v) return false;
  }
  return true;
}

export function matchPot(ids: string[], rand: () => number): PotRecipe {
  const have = sumTags(ids);
  const hits = POT_RECIPES.filter((r) => meets(have, r, ids));
  const best = Math.max(...hits.map((r) => r.priority));
  const top = hits.filter((r) => r.priority === best);
  return top[Math.floor(rand() * top.length)] ?? POT_RECIPES[POT_RECIPES.length - 1];
}

export function potById(id: string): PotRecipe {
  return POT_RECIPES.find((r) => r.id === id) ?? POT_RECIPES[POT_RECIPES.length - 1];
}
