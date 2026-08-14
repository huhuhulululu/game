import type { SaveData } from "./types";

export interface Recipe {
  id: string;
  name: string;
  parts: string[];
  gold: number;
  bond: number;
  note: string;
}

export interface Guest {
  id: string;
  name: string;
  lines: string[];
  letter: string;
}

export interface DayEvent {
  id: string;
  title: string;
  weather: string;
  blurb: string;
  drop: number;
  fish: number;
  bond: number;
  shop: number;
}

export const RECIPES: Recipe[] = [
  { id: "herb-tea", name: "山草茶", parts: ["herb:ready"], gold: 6, bond: 1, note: "第一晚先暖手。" },
  { id: "mushroom-soup", name: "矿菇汤", parts: ["mushroom:prepped"], gold: 10, bond: 2, note: "潮气变成热气。" },
  { id: "garden-noodle", name: "时蔬面", parts: ["greens:prepped", "wheat:cooked"], gold: 16, bond: 3, note: "地里和案板上的距离。" },
  { id: "tomato-egg", name: "番茄炒蛋", parts: ["tomato:prepped", "egg:cooked"], gold: 14, bond: 3, note: "谁翻锅，谁递碗。" },
  { id: "fish-noodle", name: "河鱼面", parts: ["fish:cooked", "wheat:cooked"], gold: 20, bond: 4, note: "河和炉子终于见面。" },
  { id: "osmanthus-fish", name: "桂花银鳞", parts: ["rare_fish:cooked", "osmanthus:ready"], gold: 36, bond: 6, note: "两个人都安静时才会出现的味道。" },
];

export const GUESTS: Guest[] = [
  {
    id: "painter",
    name: "赶路的画家",
    lines: ["门开时风先一步进来。", "她只要一碗还冒热气的东西。", "桌上留下未干的速写：两个人，一盏灯。"],
    letter: "灯不必很大。有人一起添火，房间自己会亮。",
  },
  {
    id: "postman",
    name: "失眠的邮差",
    lines: ["帽子放在膝上，像放下没说完的话。", "他说怕信到时，收信的人不在灯下。", "汤喝完，他才肯把眼睛闭上片刻。"],
    letter: "有些路要两个人走，才不会把夜走丢。",
  },
  {
    id: "miner",
    name: "矿道里的老人",
    lines: ["他笑你们的刀还新。", "说矿里的东西认人，也认并肩的脚步。", "临走留下一块还温热的粗矿。"],
    letter: "掉落的不是运气。是你们同时伸手的那一下。",
  },
  {
    id: "fisher",
    name: "雨停的渔人",
    lines: ["河面亮得像刚擦过的铜。", "他问：你们谁更有耐心？", "后来又说，答案不重要，两根竿子都在水里就好。"],
    letter: "鱼会来，或者不来。你们坐在一起时，河已经够了。",
  },
  {
    id: "kid",
    name: "找猫的孩子",
    lines: ["一张手绘的猫被递过门槛。", "矿道最深处有铃铛响过。", "打烊前猫跳上窗台，像从未离开。"],
    letter: "有些陪伴不必喊得很响。",
  },
  {
    id: "old",
    name: "从前的客人",
    lines: ["点的是第一夜的茶，连放杯的位置都一样。", "离开前说：别把它过成每天打卡的功课。", "想起时再开灯，就很好。"],
    letter: "山谷不是日历。它是你们愿意一起回来的地方。",
  },
];

export const EVENTS: DayEvent[] = [
  { id: "still", title: "薄暮无风", weather: "晴", blurb: "什么都还没开始，所以什么都可以去做。", drop: 0, fish: 0, bond: 0, shop: 0 },
  { id: "echo", title: "后山异响", weather: "矿风", blurb: "矿道今晚掉落会偏心。两个人离得近时更甚。", drop: 12, fish: 0, bond: 0, shop: 0 },
  { id: "rain", title: "过雨", weather: "雨", blurb: "河变亮了。鱼比话多。", drop: 0, fish: 18, bond: 0, shop: 0 },
  { id: "market", title: "行商歇脚", weather: "暖", blurb: "摊位上的种子肯让一点价。", drop: 0, fish: 0, bond: 0, shop: 0.2 },
  { id: "twin", title: "两人之日", weather: "金", blurb: "默契涨得快。缘分灯也肯亮得更实。", drop: 4, fish: 4, bond: 1, shop: 0 },
  { id: "cat", title: "铃铛", weather: "细雨", blurb: "有东西在跟着你们，但不是敌意。", drop: 6, fish: 0, bond: 0, shop: 0 },
];

export function todayEvent(day: number): DayEvent {
  return EVENTS[day % EVENTS.length];
}

export function todayGuest(day: number): Guest {
  return GUESTS[Math.min(day, GUESTS.length - 1) % GUESTS.length];
}

export function recipeById(id: string): Recipe {
  return RECIPES.find((r) => r.id === id) ?? RECIPES[0];
}

export function xpToNext(level: number): number {
  return 20 + level * 16;
}

export function maxHp(level: number): number {
  return 28 + level * 6;
}

export function shopStock(day: number): { id: string; price: number }[] {
  const base = [
    { id: "tomato_seed", price: 8 },
    { id: "greens_seed", price: 8 },
    { id: "wheat_seed", price: 10 },
    { id: "egg", price: 6 },
    { id: "tea", price: 10 },
    { id: "wood_blade", price: 24 },
  ];
  if (day >= 2) base.push({ id: "lucky_bell", price: 40 });
  if (day >= 3) base.push({ id: "iron_blade", price: 70 });
  return base;
}

export function gachaPool(pity: number): { id: string; w: number }[] {
  const pool = [
    { id: "tomato_seed", w: 18 },
    { id: "greens_seed", w: 18 },
    { id: "wheat_seed", w: 12 },
    { id: "tea", w: 12 },
    { id: "ore", w: 10 },
    { id: "osmanthus", w: 8 },
    { id: "lucky_bell", w: 7 },
    { id: "iron_blade", w: 5 },
    { id: "twin_left", w: 4 },
    { id: "twin_right", w: 4 },
    { id: "ring_left", w: 1 },
    { id: "ring_right", w: 1 },
  ];
  if (pity >= 8) {
    return pool.map((p) =>
      ["twin_left", "twin_right", "ring_left", "ring_right", "iron_blade", "lucky_bell"].includes(p.id)
        ? { ...p, w: p.w * 4 }
        : p,
    );
  }
  return pool;
}

export function mineDropWeights(floor: number, luck: number, pairNear: boolean, eventDrop: number) {
  const rareBoost = luck + (pairNear ? 10 : 0) + eventDrop + floor * 3;
  return {
    ore: 34,
    mushroom: 22,
    wood: 8,
    tea: 8,
    gem: 6 + Math.floor(rareBoost / 8),
    iron_blade: 3 + Math.floor(rareBoost / 14),
    lucky_bell: 2 + Math.floor(rareBoost / 18),
    twin_left: 1 + (pairNear ? 2 : 0),
    twin_right: 1 + (pairNear ? 2 : 0),
  };
}

export function startingBag(): { id: string; n: number }[] {
  return [
    { id: "herb", n: 3 },
    { id: "wheat", n: 2 },
    { id: "egg", n: 2 },
    { id: "tomato_seed", n: 2 },
    { id: "tea", n: 1 },
    { id: "wood_blade", n: 2 },
  ];
}

export function defaultFighter() {
  return { level: 1, xp: 0, atk: 4, luck: 1 };
}

export function calendarDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function checkinReset(save: SaveData, today: string): void {
  if (save.lastCheckinDate === today) return;
  if (save.lastCheckinDate) {
    const prev = new Date(save.lastCheckinDate).getTime();
    const cur = new Date(today).getTime();
    if (cur - prev > 86400000 * 1.5) save.checkinStreak = 0;
  }
  save.checkinLeft = false;
  save.checkinRight = false;
}
