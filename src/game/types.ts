export type SceneId = "boot" | "setup" | "room" | "play" | "letter" | "scrapbook";

export interface Skills {
  fish: number;
  cook: number;
  fight: number;
  forge: number;
}

export type Zone = "valley" | "mine" | "kitchen";

export type Rarity = "common" | "rare" | "epic" | "pair";

export type EquipSlot = "weapon" | "charm";

export interface ItemDef {
  id: string;
  name: string;
  kind: "mat" | "food" | "seed" | "equip" | "consumable" | "recipe";
  rarity: Rarity;
  hue: string;
  desc: string;
  cook?: "chop" | "cook" | "both" | "none";
  slot?: EquipSlot;
  atk?: number;
  luck?: number;
  bond?: number;
  pairId?: string;
  growInto?: string;
}

export interface Stack {
  id: string;
  n: number;
}

export interface EquipIds {
  weapon?: string;
  charm?: string;
}

export interface FighterSave {
  level: number;
  xp: number;
  atk: number;
  luck: number;
  weapon?: string;
  charm?: string;
  weaponUid?: string;
  charmUid?: string;
}

export interface Plot {
  seed?: string;
  stage: number;
}

export interface DayRecord {
  day: number;
  title: string;
  gold: number;
  bond: number;
  dishes: number;
  kills: number;
  at: number;
}

export interface SaveData {
  leftName: string;
  rightName: string;
  innName: string;
  day: number;
  gold: number;
  bond: number;
  left: FighterSave;
  right: FighterSave;
  bag: Stack[];
  plots: Plot[];
  unlockedMine: boolean;
  unlockedGacha: boolean;
  memories: string[];
  days: DayRecord[];
  bestBond: number;
  dishesTotal: number;
  killsTotal: number;
  fishTotal: number;
  muted: boolean;
  lastCheckinDate: string;
  checkinStreak: number;
  checkinLeft: boolean;
  checkinRight: boolean;
  gachaCount: number;
  pity: number;
  seenHint: boolean;
  leftSkills: Skills;
  rightSkills: Skills;
  fishAlbum: string[];
  fishBest: Record<string, number>;
  knownRecipes: string[];
  cookbook: string[];
  fortuneId: string | null;
  weather: string;
  gear: import("./affix").GearInst[];
}

export interface DayResult {
  title: string;
  detail: string;
  gold: number;
  bond: number;
  dishes: number;
  kills: number;
}

export interface GameContext {
  save: SaveData;
  persist: () => void;
  goto: (id: SceneId) => void;
  lastResult: DayResult | null;
  myName: string;
  roomCode: string;
  prefer: "left" | "right" | "";
  audio: {
    muted: boolean;
    setMuted: (v: boolean) => void;
    tone: (kind: "tap" | "chop" | "sizzle" | "serve" | "ok" | "soft" | "water" | "hit" | "drop" | "level") => void;
    unlock: () => void;
  };
}
