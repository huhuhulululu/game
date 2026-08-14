import { defaultFighter, startingBag } from "./content";
import type { SaveData } from "./types";

const KEY = "jianbang-valley-v1";

export function emptySave(): SaveData {
  return {
    leftName: "",
    rightName: "",
    innName: "并肩山谷",
    day: 0,
    gold: 20,
    bond: 0,
    left: defaultFighter(),
    right: defaultFighter(),
    bag: startingBag(),
    plots: [{ stage: 0 }, { stage: 0 }, { stage: 0 }, { stage: 0 }, { stage: 0 }, { stage: 0 }],
    unlockedMine: true,
    unlockedGacha: true,
    memories: [],
    days: [],
    bestBond: 0,
    dishesTotal: 0,
    killsTotal: 0,
    fishTotal: 0,
    muted: false,
    lastCheckinDate: "",
    checkinStreak: 0,
    checkinLeft: false,
    checkinRight: false,
    gachaCount: 0,
    pity: 0,
    seenHint: false,
    leftSkills: { fish: 1, cook: 1, fight: 1, forge: 1 },
    rightSkills: { fish: 1, cook: 1, fight: 1, forge: 1 },
    fishAlbum: [],
    fishBest: {},
    knownRecipes: ["herb-tea", "mushroom-soup", "tomato-egg"],
    cookbook: ["herb-tea", "mushroom-soup", "tomato-egg"],
    fortuneId: null,
    weather: "clear",
    gear: [],
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const base = emptySave();
    return {
      ...base,
      ...parsed,
      left: { ...base.left, ...parsed.left },
      right: { ...base.right, ...parsed.right },
      leftSkills: { ...base.leftSkills, ...parsed.leftSkills },
      rightSkills: { ...base.rightSkills, ...parsed.rightSkills },
      bag: parsed.bag ?? base.bag,
      plots: parsed.plots?.length ? parsed.plots : base.plots,
      memories: parsed.memories ?? [],
      days: parsed.days ?? [],
      gear: parsed.gear ?? [],
      fishBest: parsed.fishBest ?? {},
      cookbook: parsed.cookbook ?? parsed.knownRecipes ?? base.cookbook,
    };
  } catch {
    return emptySave();
  }
}

export function writeSave(save: SaveData): void {
  localStorage.setItem(KEY, JSON.stringify(save));
}

export function resetSave(): SaveData {
  const next = emptySave();
  writeSave(next);
  return next;
}
