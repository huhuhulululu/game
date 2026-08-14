export interface FishDef {
  id: string;
  name: string;
  skill: number;
  w: number;
  minW: number;
  maxW: number;
  pair?: boolean;
  trash?: boolean;
  treasure?: boolean;
}

export const FISH: FishDef[] = [
  { id: "crucian", name: "鲫", skill: 0, w: 28, minW: 40, maxW: 56 },
  { id: "carp", name: "鲤", skill: 2, w: 18, minW: 80, maxW: 140 },
  { id: "catfish", name: "鲶", skill: 5, w: 10, minW: 160, maxW: 240 },
  { id: "eel", name: "鳗", skill: 7, w: 6, minW: 165, maxW: 212 },
  { id: "silver", name: "银鳞", skill: 8, w: 3, minW: 90, maxW: 160, pair: true },
  { id: "boot", name: "旧靴", skill: 0, w: 8, minW: 10, maxW: 20, trash: true },
  { id: "box", name: "水底匣", skill: 3, w: 5, minW: 20, maxW: 40, treasure: true },
];

export interface MonsterDef {
  id: string;
  name: string;
  hp: number;
  atk: number;
  speed: number;
  xp: number;
  hue: string;
}

export const MONSTERS: Record<string, MonsterDef> = {
  slime: { id: "slime", name: "青沫", hp: 16, atk: 3, speed: 28, xp: 4, hue: "#6aa36a" },
  bat: { id: "bat", name: "矿蝠", hp: 12, atk: 4, speed: 46, xp: 5, hue: "#6d5a7a" },
  shadow: { id: "shadow", name: "长影", hp: 22, atk: 5, speed: 32, xp: 7, hue: "#3a3344" },
  lantern: { id: "lantern", name: "提灯", hp: 28, atk: 6, speed: 24, xp: 12, hue: "#d4a24a" },
  twin: { id: "twin", name: "双生影", hp: 36, atk: 7, speed: 34, xp: 16, hue: "#8a3a16" },
  silk: { id: "silk", name: "丝巢虫", hp: 14, atk: 4, speed: 40, xp: 5, hue: "#5a3a28" },
  marsh: { id: "marsh", name: "沼沫", hp: 18, atk: 3, speed: 22, xp: 5, hue: "#4a5a3a" },
};

export type Encounter = "empty" | "pack" | "ambush" | "elite" | "vein" | "shrine";

export const ENCOUNTERS: { id: Encounter; w: number }[] = [
  { id: "empty", w: 10 },
  { id: "pack", w: 28 },
  { id: "ambush", w: 16 },
  { id: "elite", w: 12 },
  { id: "vein", w: 18 },
  { id: "shrine", w: 10 },
];

export const FORGE_PREFIX = [
  { id: "dull", name: "钝", atk: -1, w: 18 },
  { id: "plain", name: "常", atk: 0, w: 40 },
  { id: "sharp", name: "锋", atk: 2, w: 24 },
  { id: "spirit", name: "灵", atk: 3, luck: 4, w: 10 },
  { id: "pair", name: "并肩", atk: 2, pair: true, w: 8 },
];

export const CUSTOMERS = [
  { id: "painter", name: "画家", patience: 1 },
  { id: "postman", name: "邮差", patience: 0 },
  { id: "kid", name: "孩子", patience: 1 },
  { id: "miner", name: "矿工", patience: 0 },
  { id: "fisher", name: "渔人", patience: 1 },
  { id: "wander", name: "过路人", patience: 0 },
];
