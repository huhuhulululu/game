import type { GearInst } from "./affix";
import { maxHp, todayEvent, todayGuest, xpToNext } from "./content";
import { item } from "./items";
import type { FighterSave, SaveData } from "./types";

function piece(gear: GearInst[] | undefined, uid?: string, base?: string) {
  const inst = uid ? gear?.find((g) => g.uid === uid) : undefined;
  if (inst) return { atk: inst.atk, luck: inst.luck, bond: inst.bond, pairId: item(inst.base).pairId, id: inst.base };
  const def = base ? item(base) : undefined;
  return { atk: def?.atk ?? 0, luck: def?.luck ?? 0, bond: def?.bond ?? 0, pairId: def?.pairId, id: def?.id };
}

export function fighterPower(f: FighterSave, other: FighterSave, bond: number, gear: GearInst[] = []) {
  const w = piece(gear, f.weaponUid, f.weapon);
  const c = piece(gear, f.charmUid, f.charm);
  const ow = piece(gear, other.weaponUid, other.weapon);
  const oc = piece(gear, other.charmUid, other.charm);
  const pairWeapon = !!(w.pairId && ow.id === w.pairId);
  const pairCharm = !!(c.pairId && oc.id === c.pairId);
  return {
    atk: f.atk + w.atk + (pairWeapon ? 3 : 0) + Math.floor(bond / 20),
    luck: f.luck + c.luck + (pairCharm ? 6 : 0),
    bondBonus: w.bond + c.bond + (pairWeapon ? 2 : 0) + (pairCharm ? 3 : 0),
    pairWeapon,
    pairCharm,
    maxHp: maxHp(f.level),
  };
}

export function grantXp(f: FighterSave, amount: number): boolean {
  f.xp += amount;
  let up = false;
  while (f.xp >= xpToNext(f.level)) {
    f.xp -= xpToNext(f.level);
    f.level += 1;
    f.atk += 1;
    if (f.level % 2 === 0) f.luck += 1;
    up = true;
  }
  return up;
}

export function growPlots(save: SaveData, extra: boolean): string[] {
  const notes: string[] = [];
  for (const plot of save.plots) {
    if (!plot.seed || plot.stage >= 3) continue;
    plot.stage = Math.min(3, plot.stage + (extra ? 2 : 1));
    const def = item(plot.seed);
    if (plot.stage >= 3 && def.growInto) notes.push(`${item(def.growInto).name}熟了`);
  }
  return notes;
}

export function closeDay(save: SaveData, input: { gold: number; bond: number; dishes: number; kills: number; splitWork: boolean }) {
  const ev = todayEvent(save.day);
  const guest = todayGuest(save.day);
  const grown = growPlots(save, input.splitWork);
  save.gold += input.gold;
  save.bond += input.bond + ev.bond;
  save.bestBond = Math.max(save.bestBond, save.bond);
  save.dishesTotal += input.dishes;
  save.killsTotal += input.kills;
  save.days.push({
    day: save.day,
    title: ev.title,
    gold: input.gold,
    bond: input.bond,
    dishes: input.dishes,
    kills: input.kills,
    at: Date.now(),
  });
  save.memories.push(guest.letter);
  save.day += 1;
  const detail = [
    input.dishes ? `菜 ${input.dishes}` : "",
    input.kills ? `战 ${input.kills}` : "",
    input.gold ? `金 ${input.gold}` : "",
    input.splitWork ? "有人看家，田长得更快" : "",
    ...grown,
  ]
    .filter(Boolean)
    .join(" · ");
  return { title: ev.title, detail: detail || "安静的一天", gold: input.gold, bond: input.bond, dishes: input.dishes, kills: input.kills };
}
