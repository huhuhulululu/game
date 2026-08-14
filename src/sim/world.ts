import { craftGear, makeGear, type GearInst } from "../game/affix";
import { addToBag, countOf, takeFresh, takeFromBag } from "../game/bag";
import { maxHp, shopStock, todayEvent } from "../game/content";
import { eatValue, heldLabel } from "../game/eat";
import { ageBag, freshWord, parseHeld, sleepSpoil, spoilRate, writeHeld } from "../game/spoil";
import { gradeName, rollCatch } from "../game/fishQuality";
import { matchPot, potById, POT_RECIPES } from "../game/food";
import { fortuneById, rollFortune, type Fortune } from "../game/fortune";
import { item } from "../game/items";
import { fireLife, forageMul, growBonus, nightAfter, seasonOf } from "../game/season";
import { rollLootTable } from "../game/loot";
import { LOOT_TABLES } from "../game/lootTables";
import { fighterPower, grantXp, growPlots } from "../game/progress";
import { chance, mulberry, pickWeighted } from "../game/rng";
import { emptySave } from "../game/save";
import { CUSTOMERS, ENCOUNTERS, FISH, MONSTERS } from "../game/tables";
import { rollWeather, weatherById } from "../game/weather";
import type { SaveData, Skills, Zone } from "../game/types";
import { KITCHEN, TILE, VALLEY, buildMap, mineTemplate, replaceTile, tileCenter, toTile, type GridMap } from "../world/maps";
import { biomeName, generateWild, packFog, tileKey, WILD_H, WILD_W } from "../world/wild";
import type { ActorSnap, InputState, WorldSnap } from "./net";

const DIRS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

interface Actor {
  id: string;
  name: string;
  side: "left" | "right";
  x: number;
  y: number;
  zone: Zone;
  hp: number;
  facing: number;
  held: string;
  cool: number;
  fish: {
    phase: "off" | "wait" | "bite" | "fight";
    t: number;
    window: number;
    mark: number;
    pull: number;
    dir: number;
    forge?: boolean;
  } | null;
  chop: { t: number; id: string; key: string } | null;
  input: InputState;
  askedFortune: boolean;
  ping: number;
  dark: number;
  hunger: number;
  torch: number;
}

interface Enemy {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number;
  xp: number;
  hue: string;
  name: string;
  kind: string;
  zone: Zone;
  vx: number;
  vy: number;
  flash: number;
}

interface Order {
  customer: string;
  recipe: string;
  t: number;
  board?: boolean;
}

interface Station {
  key: string;
  item: string;
  t: number;
  need: number;
  ready: boolean;
}

export class World {
  save: SaveData = emptySave();
  players = new Map<string, Actor>();
  toasts: { text: string; t: number }[] = [];
  valley = buildMap(VALLEY, "valley");
  kitchenMap = buildMap(KITCHEN, "kitchen");
  mineMap: GridMap | null = null;
  mineFloor = 0;
  encounter = "";
  enemies: Enemy[] = [];
  stations = new Map<string, Station>();
  orders: Order[] = [];
  orderAcc = 0;
  growAcc = 0;
  weatherAcc = 0;
  pot: string[] = [];
  potFresh: number[] = [];
  potCook = 0;
  potReady: string | null = null;
  ice: import("../game/types").Stack[] = [];
  wildMap: GridMap | null = null;
  clock = 0.22;
  explored = { left: new Set<string>(), right: new Set<string>() };
  relics = new Set<string>();
  fires = new Map<string, number>();
  rushed = false;
  mapRev = 1;
  dirty = true;
  rand = mulberry(Date.now() % 1e9);
  asked: ("left" | "right")[] = [];
  depleted: { zone: Zone; x: number; y: number; ch: string }[] = [];
  howled = false;
  seenBiome = new Set<string>();
  scout = 0;
  combo = 0;
  comboT = 0;
  readySleep = new Set<string>();
  hearthT = 0;
  hearthDone = false;
  rainOutT = 0;
  away = new Set<string>();
  forgeJob: { starter: string; hits: number; good: Record<string, number> } | null = null;
  boardTickets: string[] = [];
  boardOn = false;
  boardAsked: ("left" | "right")[] = [];
  boardServed = 0;

  constructor(public room: string) {
    const home = this.valley.find("A")[0] ?? { x: 8, y: 8 };
    this.home = tileCenter(home.x, home.y);
    this.save.weather = rollWeather(this.rand).id;
  }

  home = { x: 200, y: 200 };

  addPlayer(id: string, name: string, prefer?: "left" | "right"): "left" | "right" {
    const used = [...this.players.values()].map((p) => p.side);
    const side: "left" | "right" =
      prefer && !used.includes(prefer) ? prefer : used.includes("left") ? "right" : "left";
    if (side === "left") this.save.leftName = name;
    else this.save.rightName = name;
    const spawn = this.home;
    const fighter = side === "left" ? this.save.left : this.save.right;
    this.players.set(id, {
      id,
      name,
      side,
      x: spawn.x + (side === "left" ? -16 : 16),
      y: spawn.y,
      zone: "valley",
      hp: maxHp(fighter.level),
      facing: 2,
      held: "",
      cool: 0,
      fish: null,
      chop: null,
      input: { x: 0, y: 0, action: false, held: false, ping: false },
      askedFortune: false,
      ping: 0,
      dark: 0,
      hunger: 82,
      torch: 0,
    });
    this.toast(`${name} 进了山谷`);
    return side;
  }

  removePlayer(id: string): void {
    const p = this.players.get(id);
    if (p) this.toast(`${p.name} 先回去了`);
    this.players.delete(id);
    this.away.delete(id);
    this.readySleep.delete(id);
  }

  present(): Actor[] {
    return [...this.players.values()].filter((p) => !this.away.has(p.id));
  }

  reclaim(name: string, prefer?: "left" | "right"): string | null {
    const all = [...this.players.entries()];
    const awayName = all.find(([id, p]) => p.name === name && this.away.has(id));
    if (awayName) return awayName[0];
    if (prefer) {
      const seat = all.find(([id, p]) => p.side === prefer && this.away.has(id));
      if (seat) {
        seat[1].name = name;
        if (prefer === "left") this.save.leftName = name;
        else this.save.rightName = name;
        return seat[0];
      }
    }
    const ghosts = all.filter(([id]) => this.away.has(id));
    if (ghosts.length === 1) {
      ghosts[0][1].name = name;
      if (ghosts[0][1].side === "left") this.save.leftName = name;
      else this.save.rightName = name;
      return ghosts[0][0];
    }
    return null;
  }

  occupyAway(name: string, prefer?: "left" | "right"): string | null {
    if (this.present().length >= 2) return null;
    const ghosts = [...this.players.entries()].filter(([id]) => this.away.has(id));
    if (!ghosts.length) return null;
    const hit = (prefer && ghosts.find(([, p]) => p.side === prefer)) || ghosts[0];
    hit[1].name = name;
    if (hit[1].side === "left") this.save.leftName = name;
    else this.save.rightName = name;
    return hit[0];
  }

  markAway(id: string): void {
    const p = this.players.get(id);
    if (!p || this.away.has(id)) return;
    this.away.add(id);
    p.input = { x: 0, y: 0, action: false, held: false, ping: false };
    p.fish = null;
    this.readySleep.delete(id);
    this.toast(`${p.name} 断线了，人还在原地`);
    this.dirty = true;
  }

  markBack(id: string): void {
    const p = this.players.get(id);
    if (!p) return;
    this.away.delete(id);
    this.toast(`${p.name} 回来了`);
    this.dirty = true;
  }

  setInput(id: string, input: InputState): void {
    const p = this.players.get(id);
    if (!p) return;
    const prev = p.input.action;
    p.input = input;
    if (input.action && !prev) this.act(p);
    if (input.ping && p.ping <= 0) {
      p.ping = 1.6;
      const other = this.other(p);
      this.toast(other ? `${p.name} 在${zoneName(p.zone)}喊了一声` : `${p.name} 喊了一声`);
    }
  }

  sleep(fromId?: string): void {
    const online = this.present();
    if (online.length === 2 && fromId) {
      this.readySleep.add(fromId);
      if (this.readySleep.size < 2) {
        const who = this.players.get(fromId);
        this.toast(`${who?.name ?? "有人"} 先躺下了，等另一人`);
        return;
      }
    }
    this.readySleep.clear();
    this.hearthDone = false;
    this.hearthT = 0;
    this.forgeJob = null;
    this.boardOn = false;
    this.boardAsked = [];
    this.boardServed = 0;
    this.boardTickets = this.rollBoard();
    const grown = growPlots(this.save, this.isSplit() || growBonus(seasonOf(this.save.day)));
    this.save.day += 1;
    this.save.fortuneId = null;
    this.asked = [];
    for (const p of this.players.values()) {
      p.askedFortune = false;
      p.hp = maxHp(this.fighter(p).level);
      p.hunger = Math.min(100, p.hunger + 28);
      p.dark = 0;
    }
    this.mineMap = null;
    this.mineFloor = 0;
    this.enemies = this.enemies.filter((e) => e.zone === "wild");
    this.orders = [];
    this.fires.clear();
    this.howled = false;
    this.respawnDepleted();
    this.rotFood(true);
    this.save.weather = rollWeather(this.rand, this.save.weather).id;
    this.clock = 0.18;
    this.dirty = true;
    const sea = seasonOf(this.save.day);
    this.toast(`歇了一夜 · ${sea} · ${weatherById(this.save.weather).name}。${grown[0] ?? "田还在长"}`);
  }

  tick(dt: number): void {
    this.growAcc += dt;
    if (this.growAcc > 80) {
      this.growAcc = 0;
      growPlots(this.save, this.isSplit() || weatherById(this.save.weather).grow > 0 || growBonus(seasonOf(this.save.day)));
    }
    for (const p of this.present()) {
      p.cool = Math.max(0, p.cool - dt);
      p.ping = Math.max(0, p.ping - dt);
      this.move(p, dt);
      this.tickFish(p, dt);
      this.tickChop(p, dt);
      this.tickHunger(p, dt);
      if (p.torch > 0) {
        p.torch = Math.max(0, p.torch - dt);
        if (p.torch <= 0) {
          if (parseHeld(p.held).id === "torch") p.held = "";
          this.toast(`${p.name} 的火把燃尽了`);
        }
      }
    }
    this.tickMine(dt);
    this.tickKitchen(dt);
    this.tickWeather(dt);
    this.tickPot(dt);
    this.tickClock(dt);
    this.tickFog();
    this.tickDark(dt);
    this.tickFires(dt);
    this.tickHearth(dt);
    this.tickForge();
    this.tickWild(dt);
    this.rotFood(false, dt);
    this.comboT = Math.max(0, this.comboT - dt);
    if (this.comboT <= 0) this.combo = 0;
    this.rainOutT = Math.max(0, this.rainOutT - dt);
    this.toasts = this.toasts.filter((t) => {
      t.t -= dt;
      return t.t > 0;
    });
  }

  snapshot(id: string, full = true): WorldSnap {
    const you = this.players.get(id);
    const other = you ? this.other(you) : undefined;
    const fortune = fortuneById(this.save.fortuneId);
    const skills = you ? this.skills(you) : this.save.leftSkills;
    const zone = you?.zone ?? "valley";
    const sea = seasonOf(this.save.day);
    return {
      you: id,
      room: this.room,
      day: this.save.day,
      gold: this.save.gold,
      bond: this.save.bond,
      fortune: fortune ? { title: fortune.title, life: fortune.life, tilt: fortune.tilt } : null,
      weather: { id: weatherById(this.save.weather).id, name: weatherById(this.save.weather).name },
      waitingFortune: this.asked,
      bag: this.save.bag.map((s) => ({
        ...s,
        name: `${item(s.id).name}${s.fresh !== undefined && s.fresh < 70 ? "·" + freshWord(s.fresh) : ""}`,
      })),
      ice: this.ice.map((s) => ({
        ...s,
        name: `${item(s.id).name}${s.fresh !== undefined && s.fresh < 70 ? "·" + freshWord(s.fresh) : ""}`,
      })),
      gear: this.save.gear.map((g) => g.name),
      cookbook: this.save.cookbook.map((id) => potById(id).name),
      pot: this.pot.map((id) => item(id.split(":")[0]).name),
      potReady: this.potReady ? potById(this.potReady).name : this.potCook > 0 ? "在煮" : "",
      plots: this.save.plots,
      partner: other
        ? {
            name: other.name,
            zone: other.zone,
            online: !this.away.has(other.id),
            biome: other.zone === "wild" ? this.biomeAt(other) : undefined,
            ping: other.ping,
          }
        : { name: you?.side === "left" ? this.save.rightName || "还没来" : this.save.leftName || "还没来", zone: "valley", online: false },
      zone,
      tiles: full ? this.mapFor(zone).rows : [],
      floor: this.mineFloor,
      encounter: this.encounter,
      clock: this.clock,
      night: this.isNight(),
      dusk: this.clock > 0.5 && !this.isNight(),
      lit: you ? this.isLit(you) : true,
      rush: this.rushed,
      combo: this.combo,
      revealed: full && you ? this.revealedList(you.side, zone) : [],
      visible: you ? this.visibleList(you) : [],
      fires: full ? this.fireKeys(zone) : [],
      youAt: you ? { x: you.x, y: you.y } : { x: 0, y: 0 },
      partnerAt: other ? { x: other.x, y: other.y, zone: other.zone } : null,
      biome: you && zone === "wild" ? this.biomeAt(you) : "",
      season: sea,
      hp: you ? Math.max(0, Math.round(you.hp)) : 0,
      maxHp: you ? maxHp(this.fighter(you).level) : 28,
      hunger: you ? Math.round(you.hunger) : 0,
      mapRev: this.mapRev,
      full,
      actors: [...this.players.values()]
        .filter((p) => p.zone === zone)
        .map((p) => this.actorSnap(p)),
      enemies: this.enemies
        .filter((e) => e.zone === zone)
        .map((e) => ({ x: e.x, y: e.y, hp: e.hp, maxHp: e.maxHp, hue: e.hue, name: e.name, flash: e.flash })),
      orders: this.orders.map((o) => ({
        name: CUSTOMERS.find((c) => c.id === o.customer)?.name ?? "客人",
        recipe: potById(o.recipe).name,
        left: Math.max(0, o.t),
      })),
      toasts: this.toasts.map((t) => t.text),
      prompt: you ? this.prompt(you) : "",
      skills,
      album: this.albumOf(you),
      board: this.boardOn ? this.boardTickets.map((id) => potById(id).name) : [],
    };
  }

  private actorSnap(p: Actor): ActorSnap {
    const f = p.side === "left" ? this.save.left : this.save.right;
    return {
      id: p.id,
      name: p.name,
      side: p.side,
      x: p.x,
      y: p.y,
      zone: p.zone,
      hp: p.hp,
      maxHp: maxHp(f.level),
      facing: p.facing,
      held: p.held,
      heldName: heldLabel(p.held),
      fishing: p.fish?.phase ?? "off",
      fishMark: p.fish?.mark ?? 0,
      fishPull: p.fish?.pull ?? 0,
      hunger: Math.round(p.hunger),
      torch: p.torch > 0 || p.held.split(":")[0] === "torch",
      ping: p.ping,
    };
  }

  private albumOf(you?: Actor) {
    const fishMax = FISH.filter((f) => !f.trash && !f.treasure).length;
    const cookMax = POT_RECIPES.filter((r) => r.id !== "wet-goop").length;
    const map = you && you.zone === "wild" ? Math.round((this.revealedList(you.side, "wild").length / (WILD_W * WILD_H)) * 100) : Math.round((this.explored[you?.side ?? "left"].size / Math.max(1, WILD_W * WILD_H)) * 100);
    return {
      fish: this.save.fishAlbum.length,
      fishMax,
      cook: this.save.cookbook.filter((id) => id !== "wet-goop").length,
      cookMax,
      map: Math.min(100, map),
    };
  }

  private skills(p: Actor): Skills {
    return p.side === "left" ? this.save.leftSkills : this.save.rightSkills;
  }

  private fighter(p: Actor) {
    return p.side === "left" ? this.save.left : this.save.right;
  }

  private other(p: Actor): Actor | undefined {
    return [...this.players.values()].find((o) => o.id !== p.id);
  }

  private fortune(): Fortune | null {
    return fortuneById(this.save.fortuneId);
  }

  private near(a: Actor, b: Actor | undefined): boolean {
    if (!b || this.away.has(a.id) || this.away.has(b.id) || a.zone !== b.zone) return false;
    const r = a.zone === "kitchen" && this.rushed ? 150 : 90;
    return Math.hypot(a.x - b.x, a.y - b.y) < r;
  }

  private canPass(p: Actor): boolean {
    const o = this.other(p);
    return !!o && this.near(p, o) && !!p.held && !o.held;
  }

  private isSplit(): boolean {
    const ps = this.present();
    return ps.length === 2 && ps[0].zone !== ps[1].zone;
  }

  private pairFishing(): boolean {
    const ps = this.present();
    if (ps.length !== 2 || !ps[0].fish || !ps[1].fish) return false;
    if (ps[0].zone !== ps[1].zone) return false;
    if (ps[0].zone !== "valley" && ps[0].zone !== "wild") return false;
    if (this.near(ps[0], ps[1])) return true;
    return this.sameWater(ps[0], ps[1]);
  }

  private sameWater(a: Actor, b: Actor): boolean {
    const fa = this.facingTile(a);
    const fb = this.facingTile(b);
    if (!this.waterTile(a.zone, fa.x, fa.y) || !this.waterTile(b.zone, fb.x, fb.y)) return false;
    return Math.max(Math.abs(fa.x - fb.x), Math.abs(fa.y - fb.y)) <= 2;
  }

  private waterTile(zone: Zone, x: number, y: number): boolean {
    const map = this.mapFor(zone);
    const cell = map.cell(x, y);
    const ch = map.rows[y]?.[x];
    return cell === "dock" || cell === "water" || ch === "~" || ch === "D";
  }

  private holdingTorch(p: Actor): boolean {
    return p.torch > 0 || parseHeld(p.held).id === "torch";
  }

  private mapFor(zone: Zone): GridMap {
    if (zone === "kitchen") return this.kitchenMap;
    if (zone === "mine") return this.mineMap ?? this.valley;
    if (zone === "wild") return this.wildMap ?? this.valley;
    return this.valley;
  }

  private toast(text: string): void {
    this.toasts.unshift({ text, t: 4.2 });
    this.toasts = this.toasts.slice(0, 4);
  }

  private move(p: Actor, dt: number): void {
    if (p.fish?.phase === "wait" || p.fish?.phase === "bite" || p.fish?.phase === "fight") return;
    if (p.chop) return;
    const ix = p.input.x;
    const iy = p.input.y;
    if (Math.abs(ix) < 0.2 && Math.abs(iy) < 0.2) return;
    if (Math.abs(ix) > Math.abs(iy)) p.facing = ix > 0 ? 1 : 3;
    else p.facing = iy > 0 ? 2 : 0;
    const map = this.mapFor(p.zone);
    const t = toTile(p.x, p.y);
    const marsh = map.cell(t.x, t.y) === "marsh";
    const winter = seasonOf(this.save.day) === "冬";
    const starved = p.hunger < 18;
    const speed =
      (this.rushed && p.zone === "kitchen" ? 140 : 118) *
      (marsh ? (winter ? 0.48 : 0.62) : 1) *
      (starved ? 0.72 : 1);
    const nx = p.x + ix * speed * dt;
    const ny = p.y + iy * speed * dt;
    if (this.free(p.zone, nx, p.y)) p.x = nx;
    if (this.free(p.zone, p.x, ny)) p.y = ny;
  }

  private free(zone: Zone, px: number, py: number): boolean {
    const map = this.mapFor(zone);
    const t = toTile(px, py);
    const inset = 10;
    const corners = [
      [px - inset, py - inset],
      [px + inset, py - inset],
      [px - inset, py + inset],
      [px + inset, py + inset],
    ];
    return corners.every(([x, y]) => {
      const c = toTile(x, y);
      return map.walk(c.x, c.y) || (c.x === t.x && c.y === t.y && map.walk(t.x, t.y));
    });
  }

  private facingTile(p: Actor) {
    const d = DIRS[p.facing];
    const t = toTile(p.x, p.y);
    return { x: t.x + d.x, y: t.y + d.y };
  }

  private prompt(p: Actor): string {
    if (p.fish?.phase === "wait") return this.pairFishing() ? "两人同钓 · 水面还没动" : "水面还没动";
    if (p.fish?.phase === "bite") return "起竿";
    if (p.fish?.phase === "fight") return "稳住 · 绿的时候按";
    const map = this.mapFor(p.zone);
    const f = this.facingTile(p);
    const cell = map.cell(f.x, f.y);
    const ch = map.rows[f.y]?.[f.x];
    if (p.zone === "valley") {
      if (cell === "dock") return "下竿";
      if (cell === "plot") return this.plotPrompt(f.x, f.y);
      if (cell === "bush" || cell === "osmanthus") return "采";
      if (ch === "E") return "进矿";
      if (ch === "I") return "进厨房";
      if (ch === "A") {
        if (this.present().length === 2 && this.readySleep.size === 1 && !this.readySleep.has(p.id)) return "也躺下，一起歇一夜";
        if (this.present().length === 2 && this.readySleep.has(p.id)) return "等她也躺下";
        return "歇一夜（田会自己长）";
      }
      if (ch === "V" || cell === "gate") return "出谷 · 荒野";
      if (cell === "shop") return "摊位";
      if (cell === "forge") return this.forgeJob ? "锻 · 绿的时候按" : "打造";
      if (cell === "gacha") return this.save.fortuneId ? "今日已问过" : "问今日";
      if (cell === "board") return this.boardPrompt(p);
      if (this.idleFace(cell) && eatValue(p.held)) return "吃";
    }
    if (p.zone === "mine") {
      if (cell === "leave") return "出矿";
      if (cell === "stairs") return "再下一层";
      if (cell === "ore") return "挖";
      if (cell === "chest") return "开匣";
      return "挥";
    }
    if (p.zone === "kitchen") {
      if (cell === "leave") return "出厨房";
      if (cell === "pantry") return "取";
      if (cell === "cut") return "切";
      if (cell === "stove") return "炉";
      if (cell === "plate") {
        if (this.potReady) return `取 · ${potById(this.potReady).name}`;
        if (this.potCook > 0) return "锅还在响";
        if (this.pot.length >= 2) return `开煮 · ${this.pot.length}样`;
        return this.pot.length ? `入锅 · ${this.pot.length}/4` : "入锅";
      }
      if (cell === "window") return this.rushed ? "上菜！堂口在催" : "上菜";
      if (cell === "ice") return p.held && !p.held.startsWith("dish:") ? "入冰" : this.ice.length ? "取冰" : "冰柜空着";
      if (this.near(p, this.other(p)) && p.held && this.other(p) && !this.other(p)!.held) return "递给对方";
      if (this.idleFace(cell) && eatValue(p.held)) return "吃";
      if (cell === "trash") return "丢掉";
    }
    if (p.zone === "wild") {
      if (cell === "leave") return "回山谷";
      if (cell === "dock") return "下竿";
      if (cell === "bush") return "采";
      if (cell === "tree") return "砍";
      if (cell === "rock") return "砸";
      if (cell === "fire") {
        const lit = this.fires.has(`${f.x},${f.y}`);
        if (lit && this.canCookAtFire(p)) return "烤";
        if (countOf(this.save.bag, "flint") && countOf(this.save.bag, "wood") && countOf(this.save.bag, "herb") && lit)
          return "搓火把";
        return lit ? "火还旺" : "添火";
      }
      if (cell === "relic") return "翻残骸";
      if (cell === "camp") return this.near(p, this.other(p)) ? "并肩搜旧营" : "搜旧营";
      if (cell === "hole") return "钻洞";
      if (cell === "nest") return "挥";
      if (this.idleFace(cell) && eatValue(p.held)) return "吃";
      return this.isNight() && !this.isLit(p) ? "太暗了" : "";
    }
    return "";
  }

  private act(p: Actor): void {
    if (p.cool > 0) return;
    p.cool = 0.18;
    if (p.fish?.phase === "bite") {
      p.fish.phase = "fight";
      p.fish.t = 6.2;
      p.fish.mark = 0.2;
      p.fish.pull = 0.22;
      p.fish.dir = 1;
      this.toast("咬住了——绿的时候按");
      return;
    }
    if (p.fish?.phase === "fight") {
      this.yank(p);
      return;
    }
    if (p.fish?.phase === "wait") return;
    const map = this.mapFor(p.zone);
    const f = this.facingTile(p);
    const cell = map.cell(f.x, f.y);
    const ch = map.rows[f.y]?.[f.x];
    if (this.idleFace(cell) && !this.canPass(p) && this.tryEat(p)) return;

    if (p.zone === "valley") {
      if (cell === "dock") return this.cast(p);
      if (cell === "plot") return this.plot(p, f.x, f.y);
      if (cell === "bush") return this.forage(p, "herb", 0.7, f.x, f.y);
      if (cell === "osmanthus") return this.forage(p, "osmanthus", 0.35, f.x, f.y);
      if (ch === "E") return this.enterMine(p);
      if (ch === "I") return this.enterKitchen(p);
      if (ch === "A") return this.sleep(p.id);
      if (ch === "V" || cell === "gate") return this.enterWild(p);
      if (cell === "shop") return this.shop(p);
      if (cell === "forge") return this.forgeAct(p);
      if (cell === "gacha") return this.askFortune(p);
      if (cell === "board") return this.revealBoard(p);
      if (this.tryGive(p)) return;
    }
    if (p.zone === "mine") {
      if (cell === "leave") return this.leaveToValley(p);
      if (cell === "stairs") return this.downFloor();
      if (cell === "ore") return this.dig(p, f.x, f.y);
      if (cell === "chest") return this.chest(p, f.x, f.y);
      return this.swing(p);
    }
    if (p.zone === "kitchen") {
      if (cell === "leave") return this.leaveToValley(p);
      if (cell === "pantry") return this.pantry(p, map.pantryId(f.x, f.y));
      if (cell === "cut") return this.cut(p, f.x, f.y);
      if (cell === "stove") return this.stove(p, f.x, f.y);
      if (cell === "plate") return this.potAct(p);
      if (cell === "window") return this.serve(p);
      if (cell === "ice") return this.iceAct(p);
      if (cell === "trash") {
        p.held = "";
        return;
      }
      this.tryGive(p);
    }
    if (p.zone === "wild") {
      if (cell === "leave") return this.leaveToValley(p);
      if (cell === "dock") return this.cast(p);
      if (cell === "bush") return this.forage(p, chance(0.35, this.rand) ? "mushroom" : "herb", 0.75, f.x, f.y);
      if (cell === "tree") return this.chopTree(p, f.x, f.y);
      if (cell === "rock") return this.crackRock(p, f.x, f.y);
      if (cell === "fire") {
        if (this.cookAtFire(p, f.x, f.y)) return;
        if (!this.fires.has(`${f.x},${f.y}`)) return this.stoke(p, f.x, f.y);
        if (this.tryTorch(p, f.x, f.y)) return;
        return this.stoke(p, f.x, f.y);
      }
      if (cell === "relic") return this.relic(p, f.x, f.y);
      if (cell === "camp") return this.lootCamp(p, f.x, f.y);
      if (cell === "hole") return this.hole(p);
      if (this.tryGive(p)) return;
      return this.swing(p);
    }
  }

  private tryGive(p: Actor): boolean {
    const o = this.other(p);
    if (!o || !this.near(p, o) || !p.held || o.held) return false;
    o.held = p.held;
    p.held = "";
    this.save.bond += 1;
    this.toast(`${p.name} 把东西递给了 ${o.name}`);
    return true;
  }

  private cast(p: Actor): void {
    const skill = this.skills(p).fish;
    const window = 0.55 + skill * 0.04 + ((this.fortune()?.fish ?? 0) + weatherById(this.save.weather).fish) / 200;
    p.fish = { phase: "wait", t: 1.1 + this.rand() * 2.2, window, mark: 0, pull: 0, dir: 1 };
  }

  private tickFish(p: Actor, dt: number): void {
    if (!p.fish) return;
    p.fish.t -= dt;
    if (p.fish.phase === "wait" && p.fish.t <= 0) {
      p.fish.phase = "bite";
      p.fish.t = p.fish.window;
    } else if (p.fish.phase === "bite" && p.fish.t <= 0) {
      p.fish = null;
      this.toast("走了");
    } else if (p.fish.phase === "fight") {
      if (p.fish.forge) {
        if (this.forgeJob && p.id !== this.forgeJob.starter) return;
        p.fish.mark += p.fish.dir * dt * 1.15;
        if (p.fish.mark > 1) {
          p.fish.mark = 1;
          p.fish.dir = -1;
        }
        if (p.fish.mark < 0) {
          p.fish.mark = 0;
          p.fish.dir = 1;
        }
        if (p.fish.t <= 0) this.finishForge();
        return;
      }
      p.fish.mark += p.fish.dir * dt * (1.15 + this.skills(p).fish * 0.02);
      if (p.fish.mark > 1) {
        p.fish.mark = 1;
        p.fish.dir = -1;
      }
      if (p.fish.mark < 0) {
        p.fish.mark = 0;
        p.fish.dir = 1;
      }
      p.fish.pull = Math.max(0, p.fish.pull - dt * 0.08);
      if (p.fish.t <= 0 || p.fish.pull <= 0) {
        p.fish = null;
        this.toast("跑了");
      }
    }
  }

  private yank(p: Actor): void {
    if (!p.fish || p.fish.phase !== "fight") return;
    if (p.fish.forge || this.forgeJob) {
      this.yankForge(p);
      return;
    }
    const good = p.fish.mark > 0.38 && p.fish.mark < 0.72;
    p.fish.pull += good ? 0.3 : -0.16;
    if (p.fish.pull >= 1) {
      this.hook(p);
      return;
    }
    if (p.fish.pull <= 0) {
      p.fish = null;
      this.toast("线松了");
    }
  }

  private hook(p: Actor): void {
    const skill = this.skills(p);
    const tilt = this.fortune()?.fish ?? 0;
    const pair = this.pairFishing();
    const wild = p.zone === "wild";
    const pool = FISH.filter((f) => skill.fish >= f.skill && (!f.pair || pair) && (!f.wild || wild)).map((f) => ({
      ...f,
      w: f.w + (f.pair && pair ? 10 : 0) + (tilt > 0 && !f.trash ? 6 : 0) + (f.wild && wild ? 14 : 0) + (!f.wild && wild && !f.pair ? -6 : 0),
    }));
    const hit = pickWeighted(pool, this.rand);
    p.fish = null;
    skill.fish += 1;
    if (hit.trash) {
      this.toast(`${p.name} 钓上${hit.name}`);
      return;
    }
    if (hit.treasure) {
      addToBag(this.save.bag, chance(0.5, this.rand) ? "gem" : "tea");
      this.save.gold += 8;
      this.toast(`${p.name} 捞到水底匣`);
      return;
    }
    const caught = rollCatch(hit.id, this.rand, this.save.fishBest[hit.id]);
    addToBag(this.save.bag, caught.bagId);
    this.save.fishTotal += 1;
    if (!this.save.fishAlbum.includes(hit.id)) {
      this.save.fishAlbum.push(hit.id);
      this.toast(`写入鱼册：${hit.name}`);
    }
    if (caught.record) this.save.fishBest[hit.id] = caught.weight;
    const rec = caught.record ? " · 新纪录" : "";
    this.toast(`${p.name} 钓上${gradeName(caught.grade)}${caught.name} ${caught.weight}${rec}`);
  }

  private plot(p: Actor, x: number, y: number): void {
    const plots = this.valley.find("P");
    const i = plots.findIndex((t) => t.x === x && t.y === y);
    if (i < 0) return;
    const plot = this.save.plots[i] ?? (this.save.plots[i] = { stage: 0 });
    if (plot.seed && plot.stage >= 3) {
      const grow = item(plot.seed).growInto;
      if (grow) addToBag(this.save.bag, grow, this.isSplit() ? 2 : 1);
      let extra = "";
      if (this.rand() < 0.18) {
        const odd = grow === "tomato" ? "osmanthus" : grow === "greens" ? "mushroom" : "herb";
        addToBag(this.save.bag, odd);
        extra = ` · 异株${item(odd).name}`;
      }
      this.toast(`收了${grow ? item(grow).name : "一垄"}${extra}`);
      plot.seed = undefined;
      plot.stage = 0;
      return;
    }
    if (plot.seed) {
      this.toast(`还在长 · ${plot.stage}/3`);
      return;
    }
    const seed = ["tomato_seed", "greens_seed", "wheat_seed"].find((id) => countOf(this.save.bag, id) > 0);
    if (!seed) {
      this.toast("袋子里没有种");
      return;
    }
    takeFromBag(this.save.bag, seed);
    plot.seed = seed;
    plot.stage = 0;
    this.toast(`${p.name} 种下${item(seed).name}`);
  }

  private forage(p: Actor, id: string, pHit: number, x?: number, y?: number): void {
    const hit = pHit * forageMul(seasonOf(this.save.day));
    if (this.rand() > hit) {
      this.toast("这一丛还早");
      return;
    }
    addToBag(this.save.bag, id);
    this.toast(`${p.name} 采到${item(id).name}`);
    if (x === undefined || y === undefined) return;
    const map = this.mapFor(p.zone);
    const ch = map.rows[y]?.[x];
    if (!ch || ch === ".") return;
    this.depleted.push({ zone: p.zone, x, y, ch });
    if (p.zone === "wild") this.paintWild(x, y, ch === "s" ? "s" : ".");
    else if (p.zone === "valley") {
      this.valley = replaceTile(this.valley, "valley", x, y, ".");
      this.bumpMap();
    }
  }

  private enterMine(p: Actor): void {
    if (!this.mineMap) this.downFloor(true);
    const leave = this.mineMap?.find("L")[0] ?? { x: 2, y: 2 };
    const c = tileCenter(leave.x + 1, leave.y);
    p.zone = "mine";
    p.x = c.x;
    p.y = c.y;
    this.dirty = true;
    const o = this.other(p);
    this.toast(o?.zone === "mine" ? "矿道里两个人的脚步" : `${p.name} 进了矿`);
  }

  private enterKitchen(p: Actor): void {
    const leave = this.kitchenMap.find("L")[0] ?? { x: 2, y: 6 };
    const c = tileCenter(leave.x + 1, leave.y);
    p.zone = "kitchen";
    p.x = c.x;
    p.y = c.y;
    this.seedBoardOrders();
    this.dirty = true;
    this.toast(`${p.name} 进了厨房`);
  }

  private leaveToValley(p: Actor): void {
    const from = p.zone;
    p.zone = "valley";
    const door =
      from === "wild"
        ? this.valley.find("V")[0]
        : from === "mine"
          ? this.valley.find("E")[0]
          : from === "kitchen"
            ? this.valley.find("I")[0]
            : null;
    if (door) {
      const c = tileCenter(door.x, door.y);
      p.x = c.x + (from === "wild" ? -TILE : TILE);
      p.y = c.y;
    } else {
      p.x = this.home.x;
      p.y = this.home.y + 30;
    }
    this.dirty = true;
    this.toast(`${p.name} 回到山谷`);
  }

  private downFloor(first = false): void {
    this.mineFloor = first ? 1 : this.mineFloor + 1;
    if (this.mineFloor > 5) {
      this.toast("矿底没有路了");
      this.mineFloor = 5;
      return;
    }
    this.mineMap = buildMap(mineTemplate(this.save.day * 13 + this.mineFloor, this.mineFloor), "mine");
    this.bumpMap();
    this.enemies = this.enemies.filter((e) => e.zone !== "mine");
    const ev = pickWeighted(
      ENCOUNTERS.map((e) => ({ ...e, w: e.w + (this.fortune()?.mine ?? 0) })),
      this.rand,
    ).id;
    this.encounter = ev;
    const spawns = this.mineMap.find("e");
    const kinds = ev === "elite" ? ["lantern"] : ev === "ambush" ? ["bat", "bat", "shadow"] : ev === "empty" ? [] : ["slime", "shadow"];
    if (ev === "pack") kinds.push("slime");
    if (this.isSplit() && ev !== "empty") kinds.push("twin");
    kinds.forEach((kind, i) => {
      const def = MONSTERS[kind];
      const s = spawns[i % Math.max(1, spawns.length)] ?? { x: 4, y: 4 };
      const c = tileCenter(s.x, s.y);
      this.enemies.push({
        x: c.x + i * 6,
        y: c.y,
        hp: def.hp + this.mineFloor * 3,
        maxHp: def.hp + this.mineFloor * 3,
        atk: def.atk,
        speed: def.speed,
        xp: def.xp,
        hue: def.hue,
        name: def.name,
        kind,
        zone: "mine",
        vx: 0,
        vy: 0,
        flash: 0,
      });
    });
    if (ev === "vein") {
      this.sprinkleVein();
      this.toast("这一层矿脉很响");
    }
    if (ev === "shrine") {
      this.save.bond += 2;
      this.toast("神龛亮了一下，默契 +2");
    }
    if (ev === "ambush") this.toast("伏击");
    if (ev === "empty") this.toast("空荡荡的一层");
  }

  private dig(p: Actor, x: number, y: number): void {
    const luck = this.power(p).luck;
    const pair = this.near(p, this.other(p));
    this.giveLoot(p, "ore_node", luck, pair);
    if (this.encounter === "vein") {
      addToBag(this.save.bag, "ore", 1 + (pair ? 1 : 0));
      this.toast(`${p.name} 从矿脉里多掏出一块`);
    } else {
      this.toast(`${p.name} 挖了一处矿`);
    }
    if (this.mineMap) {
      this.mineMap = replaceTile(this.mineMap, "mine", x, y, ".");
      this.bumpMap();
    }
  }

  private chest(p: Actor, x: number, y: number): void {
    this.giveLoot(p, "chest", this.power(p).luck, this.near(p, this.other(p)));
    this.toast(`${p.name} 开了匣`);
    if (this.mineMap) {
      this.mineMap = replaceTile(this.mineMap, "mine", x, y, ".");
      this.bumpMap();
    }
  }

  private swing(p: Actor): void {
    const o = this.other(p);
    const pow = this.power(p);
    const pairNear = this.near(p, o);
    const d = DIRS[p.facing];
    const reach = 34;
    let hit = false;
    for (const e of this.enemies.filter((en) => en.zone === p.zone)) {
      const along = (e.x - p.x) * d.x + (e.y - p.y) * d.y;
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (along > 4 && dist < reach + 10) {
        const crit = pairNear && chance(0.18 + (this.fortune()?.pair ?? 0) / 100, this.rand);
        e.hp -= pow.atk + (crit ? 4 : 0);
        e.vx = d.x * 90;
        e.vy = d.y * 90;
        e.flash = 0.12;
        hit = true;
        if (crit) this.toast("并肩一击");
      }
    }
    if (!hit) return;
    this.skills(p).fight += 1;
    const dead = this.enemies.filter((e) => e.hp <= 0);
    this.enemies = this.enemies.filter((e) => e.hp > 0);
    for (const e of dead) {
      this.save.killsTotal += 1;
      const share = pairNear && o;
      const up = grantXp(this.fighter(p), e.xp);
      if (share) grantXp(this.fighter(o), Math.ceil(e.xp * 0.7));
      if (up) this.toast(`${p.name} 又懂了一点`);
      const drops = this.giveLoot(p, e.kind, pow.luck, pairNear);
      if (chance(0.35, this.rand)) addToBag(this.save.bag, chance(0.25, this.rand) ? "meat" : "morsel");
      this.toast(drops[0] ? `${e.name} 掉了${drops[0]}` : `${p.name} 打倒了${e.name}`);
    }
  }

  private tickMine(dt: number): void {
    const miners = this.present().filter((p) => p.zone === "mine");
    if (!miners.length) return;
    for (const e of this.enemies.filter((en) => en.zone === "mine")) {
      const t = miners.slice().sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
      const dx = t.x - e.x;
      const dy = t.y - e.y;
      const m = Math.hypot(dx, dy) || 1;
      e.flash = Math.max(0, e.flash - dt);
      e.vx *= 0.82;
      e.vy *= 0.82;
      const nx = e.x + (dx / m) * e.speed * dt + e.vx * dt;
      const ny = e.y + (dy / m) * e.speed * dt + e.vy * dt;
      if (this.free("mine", nx, e.y)) e.x = nx;
      if (this.free("mine", e.x, ny)) e.y = ny;
      if (m < 18 && t.cool < 0.05) {
        t.hp -= e.atk * dt * 0.7;
        if (t.hp <= 0) {
          t.hp = maxHp(this.fighter(t).level);
          this.leaveToValley(t);
          this.toast(`${t.name} 被送出了矿道`);
        }
      }
    }
  }

  private pantry(p: Actor, id: string | null): void {
    if (!id || p.held) return;
    const choices = id === "fish" ? ["rare_fish_heavy", "fish_heavy", "rare_fish", "fish_thick", "fish"] : [id];
    const found = choices.find((x) => countOf(this.save.bag, x) > 0);
    if (!found) {
      this.toast(`没有${item(id).name}`);
      return;
    }
    const fresh = takeFresh(this.save.bag, found) ?? 100;
    p.held = writeHeld(found, item(found).cook === "none" ? "ready" : "raw", fresh);
  }

  takeItem(id: string, playerId: string): void {
    const p = this.players.get(playerId);
    if (!p || p.held) return;
    const fresh = takeFresh(this.save.bag, id);
    if (fresh === null) return;
    p.held = writeHeld(id, item(id).cook === "none" ? "ready" : "raw", fresh);
    if (id === "torch") p.torch = Math.max(p.torch, 70);
  }

  private cut(p: Actor, x: number, y: number): void {
    const key = `c:${x},${y}`;
    const st = this.stations.get(key);
    if (st?.ready) {
      if (p.held) return;
      p.held = st.item;
      this.stations.delete(key);
      return;
    }
    const held = parseHeld(p.held);
    if (held.state !== "raw") return;
    const need = item(held.id).cook;
    if (need !== "chop" && need !== "both") {
      this.toast("这个不用切");
      return;
    }
    p.chop = { t: Math.max(0.45, 1.15 - this.skills(p).cook * 0.03), id: writeHeld(held.id, "prepped", held.fresh), key };
    p.held = "";
    this.stations.set(key, { key, item: "", t: 0, need: 1, ready: false });
  }

  private tickChop(p: Actor, dt: number): void {
    if (!p.chop) return;
    if (!p.input.held) return;
    p.chop.t -= dt;
    if (p.chop.t <= 0) {
      const next = p.chop.id.includes(":") ? p.chop.id : `${p.chop.id}:prepped`;
      this.stations.set(p.chop.key, { key: p.chop.key, item: next, t: 0, need: 0, ready: true });
      p.chop = null;
      this.skills(p).cook += 1;
    }
  }

  private stove(p: Actor, x: number, y: number): void {
    const key = `s:${x},${y}`;
    const st = this.stations.get(key);
    if (st?.ready) {
      if (p.held) return;
      p.held = st.item;
      this.stations.delete(key);
      return;
    }
    if (st && !st.ready) return;
    if (!p.held) return;
    const held = parseHeld(p.held);
    const need = item(held.id).cook;
    const ok = (need === "cook" && held.state === "raw") || (need === "both" && held.state === "prepped");
    if (!ok) {
      this.toast("现在还不能下锅");
      return;
    }
    p.held = "";
    this.stations.set(key, {
      key,
      item: writeHeld(held.id, "cooked", held.fresh),
      t: 0,
      need: Math.max(0.8, 2 - this.skills(p).cook * 0.04),
      ready: false,
    });
  }

  private tickKitchen(dt: number): void {
    for (const st of this.stations.values()) {
      if (st.key.startsWith("s:")) {
        st.t += dt;
        if (!st.ready && st.need && st.t >= st.need) st.ready = true;
        if (this.rushed && st.ready && st.item && !st.item.startsWith("mush") && st.t > st.need + 5) {
          st.item = "mush:ready";
          this.toast("糊了——堂口等不及也别糊锅");
        }
        continue;
      }
      if (st.ready || !st.need) continue;
    }
    const cooks = this.present().filter((p) => p.zone === "kitchen");
    if (!cooks.length) return;
    this.orderAcc += dt;
    const rush = this.orders.length >= 2;
    if (rush && !this.rushed) {
      this.rushed = true;
      this.toast("堂口热起来了——两个人得传菜");
    }
    if (!this.orders.length) this.rushed = false;
    const maxOrders = rush ? 4 : 3;
    const gap = rush ? 4 : 7;
    if (this.orders.length < maxOrders && this.orderAcc > gap) {
      this.orderAcc = 0;
      const known = POT_RECIPES.filter((r) => this.save.cookbook.includes(r.id) && r.id !== "wet-goop");
      const rec = known[Math.floor(this.rand() * known.length)] ?? potById("herb-tea");
      const cus = CUSTOMERS[Math.floor(this.rand() * CUSTOMERS.length)];
      this.orders.push({ customer: cus.id, recipe: rec.id, t: (rush ? 22 : 36) + (this.fortune()?.cook ?? 0) });
    }
    for (const o of this.orders) o.t -= dt;
    const lost = this.orders.filter((o) => o.t <= 0);
    this.orders = this.orders.filter((o) => o.t > 0);
    if (lost.length) this.toast("有人等不及，走了");
  }

  private potAct(p: Actor): void {
    if (this.potReady) {
      if (p.held) return;
      p.held = `dish:${this.potReady}`;
      this.potReady = null;
      return;
    }
    if (this.potCook > 0) {
      this.toast("锅还在响");
      return;
    }
    if (p.held && !p.held.startsWith("dish:") && !p.held.startsWith("plate:")) {
      if (this.pot.length >= 4) {
        this.toast("四格满了，像饥荒的锅");
        return;
      }
      const held = parseHeld(p.held);
      const ready =
        !held.state ||
        held.state === "prepped" ||
        held.state === "cooked" ||
        held.state === "ready" ||
        item(held.id).cook === "none";
      if (!ready && item(held.id).cook && item(held.id).cook !== "none") {
        this.toast("还没处理好");
        return;
      }
      this.pot.push(held.id);
      this.potFresh.push(held.fresh);
      p.held = "";
      this.toast(`入锅 ${item(held.id).name} · ${this.pot.length}/4`);
      if (this.pot.length === 4) this.startPot(p);
      return;
    }
    if (!p.held && this.pot.length >= 2) this.startPot(p);
  }

  private startPot(p: Actor): void {
    this.potCook = Math.max(2.2, 5.5 - this.skills(p).cook * 0.08);
    this.toast(`${p.name} 把锅盖上了`);
  }

  private tickPot(dt: number): void {
    if (this.potCook <= 0) return;
    this.potCook -= dt;
    if (this.potCook > 0) return;
    const avg = this.potFresh.length ? this.potFresh.reduce((a, b) => a + b, 0) / this.potFresh.length : 100;
    const recipe = matchPot(this.pot, this.rand, avg);
    this.pot = [];
    this.potFresh = [];
    this.potReady = recipe.id;
    if (avg < 40 && recipe.id !== "wet-goop") this.toast("菜有点蔫，好在还认得");
    if (!this.save.cookbook.includes(recipe.id)) {
      this.save.cookbook.push(recipe.id);
      this.save.knownRecipes = this.save.cookbook;
      this.toast(`写入菜单：${recipe.name}`);
    } else {
      this.toast(`出锅：${recipe.name}`);
    }
  }

  private serve(p: Actor): void {
    if (!p.held.startsWith("dish:")) {
      this.toast("手里没有出锅的菜");
      return;
    }
    const match = potById(p.held.slice(5));
    const expected = this.boardOn ? this.boardTickets[this.boardServed] : undefined;
    const exact =
      (expected === match.id ? this.orders.find((o) => o.board && o.recipe === match.id) : undefined) ??
      this.orders.find((o) => o.recipe === match.id);
    if (this.rushed && !exact) {
      this.toast("堂口不要这道，递给对方或者重做");
      return;
    }
    const order = exact ?? this.orders[0];
    const weather = weatherById(this.save.weather);
    const tip = 1 + Math.floor(this.rand() * 4) + Math.floor(((this.fortune()?.cook ?? 0) + weather.cook) / 8);
    const gold = match.gold + tip + (this.isSplit() ? 2 : 0);
    this.save.gold += gold;
    this.save.bond += match.bond;
    this.save.dishesTotal += 1;
    this.skills(p).cook += 2;
    p.held = "";
    if (order) this.orders.splice(this.orders.indexOf(order), 1);
    let extra = "";
    if (chance(0.22 + (this.fortune()?.cook ?? 0) / 80, this.rand)) {
      const gift = pickWeighted(
        [
          { id: "tomato_seed", w: 20 },
          { id: "wheat_seed", w: 16 },
          { id: "osmanthus", w: 8 },
          { id: "morsel", w: 8 },
        ],
        this.rand,
      ).id;
      addToBag(this.save.bag, gift);
      extra = `客人留下了${item(gift).name}`;
    }
    const boardDish = this.boardOn && this.boardTickets.includes(match.id);
    if (expected && match.id === expected) {
      this.boardServed += 1;
      this.combo = this.boardServed;
      this.comboT = 9;
    } else if (this.rushed && boardDish && match.id !== expected) {
      this.combo = 0;
    }
    const streak = this.combo > 1 ? this.combo : 0;
    this.save.gold += streak;
    const pay = gold + streak;
    this.toast(
      streak
        ? `连上了×${this.combo} · ${p.name} 上了${match.name} · ${pay}金${extra ? " · " + extra : ""}`
        : `${p.name} 上了${match.name} · ${pay}金${extra ? " · " + extra : ""}`,
    );
  }

  private shop(p: Actor): void {
    const stock = shopStock(this.save.day);
    const ev = todayEvent(this.save.day);
    const row = stock[Math.floor(this.rand() * Math.min(3, stock.length))];
    const price = Math.max(1, Math.floor(row.price * (1 - ev.shop)));
    if (this.save.gold < price) {
      this.toast(`想买${item(row.id).name}，还差金`);
      return;
    }
    this.save.gold -= price;
    addToBag(this.save.bag, row.id);
    this.toast(`${p.name} 买下${item(row.id).name}`);
  }

  private askFortune(p: Actor): void {
    if (this.save.fortuneId) {
      const f = this.fortune();
      this.toast(f ? `${f.title}：${f.life}` : "今日已问过");
      return;
    }
    if (!this.asked.includes(p.side)) this.asked.push(p.side);
    p.askedFortune = true;
    const online = new Set(this.present().map((x) => x.side));
    const needBoth = online.size === 2;
    if (needBoth && this.asked.length < 2) {
      this.toast(`${p.name} 先把签筒握上了，等另一只手`);
      return;
    }
    const f = rollFortune(this.rand);
    this.save.fortuneId = f.id;
    this.save.bond += 1;
    this.toast(`今日${f.title} · ${f.life}`);
  }

  private facingForge(p: Actor): boolean {
    if (p.zone !== "valley") return false;
    const f = this.facingTile(p);
    return this.mapFor(p.zone).cell(f.x, f.y) === "forge";
  }

  private canForgeYank(p: Actor): boolean {
    if (!this.forgeJob || this.away.has(p.id)) return false;
    if (p.id === this.forgeJob.starter) return true;
    const starter = this.players.get(this.forgeJob.starter);
    return !!starter && !this.away.has(starter.id) && this.near(p, starter) && this.facingForge(p);
  }

  private forgeAct(p: Actor): void {
    if (this.forgeJob) {
      this.yankForge(p);
      return;
    }
    if (countOf(this.save.bag, "ore") < 2 || countOf(this.save.bag, "wood") < 1) {
      this.toast("打造需要粗矿×2、青木×1");
      return;
    }
    takeFromBag(this.save.bag, "ore", 2);
    takeFromBag(this.save.bag, "wood", 1);
    this.forgeJob = { starter: p.id, hits: 0, good: {} };
    p.fish = { phase: "fight", t: 4, window: 1, mark: 0.2, pull: 1, dir: 1, forge: true };
    this.toast("炉子热了");
  }

  private yankForge(p: Actor): void {
    if (!this.forgeJob || !this.canForgeYank(p)) return;
    const starter = this.players.get(this.forgeJob.starter);
    const mark = starter?.fish?.mark ?? p.fish?.mark ?? 0;
    const good = mark > 0.38 && mark < 0.72;
    this.forgeJob.hits += 1;
    this.forgeJob.good[p.id] = (this.forgeJob.good[p.id] ?? 0) + (good ? 1 : 0);
    if (this.forgeJob.hits >= 3) this.finishForge();
  }

  private tickForge(): void {
    if (!this.forgeJob) return;
    const starter = this.players.get(this.forgeJob.starter);
    if (!starter?.fish?.forge) {
      this.finishForge();
      return;
    }
    const o = this.other(starter);
    if (o && !this.away.has(o.id) && this.facingForge(o) && this.near(starter, o)) {
      o.fish = { ...starter.fish };
    } else if (o?.fish?.forge) {
      o.fish = null;
    }
  }

  private finishForge(): void {
    const job = this.forgeJob;
    if (!job) return;
    this.forgeJob = null;
    const starter = this.players.get(job.starter);
    for (const p of this.players.values()) {
      if (p.fish?.forge) p.fish = null;
    }
    if (!starter) return;
    const goods = Object.values(job.good).reduce((s, n) => s + n, 0);
    const partner = this.other(starter);
    const pairOk =
      !!partner &&
      !this.away.has(partner.id) &&
      this.near(starter, partner) &&
      (job.good[starter.id] ?? 0) >= 1 &&
      (job.good[partner.id] ?? 0) >= 1;
    if (goods < 1) {
      addToBag(this.save.bag, "ore", 1);
      this.toast("卷刃了");
      return;
    }
    const skill = this.skills(starter).forge;
    const base = goods >= 2 && skill >= 2 ? "iron_blade" : "wood_blade";
    const gear = craftGear(base, 2 + this.mineFloor + skill, skill, this.rand);
    if (pairOk) {
      gear.quality = "pair";
      gear.pairId = starter.side === "left" ? "twin_right" : "twin_left";
      gear.name = gear.name.replace(/^锻·/, "并肩·");
      this.toast("两个人对着砧");
    }
    this.keepGear(starter, gear);
    this.skills(starter).forge += 1;
    this.toast(`${starter.name} 锻出${gear.name}`);
  }

  private boardPrompt(p: Actor): string {
    if (this.boardOn) return `今晚 · ${this.boardTickets.map((id) => potById(id).name).join("、")}`;
    if (this.present().length === 2 && this.boardAsked.length === 1 && !this.boardAsked.includes(p.side)) {
      return "也揭今晚的看板";
    }
    if (this.present().length === 2 && this.boardAsked.includes(p.side)) return "等她也揭";
    return "揭今晚看板";
  }

  private rollBoard(): string[] {
    const pool = POT_RECIPES.filter((r) => r.id !== "wet-goop");
    const n = this.rand() < 0.45 ? 1 : 2;
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const rec = pool[Math.floor(this.rand() * pool.length)];
      if (rec && !out.includes(rec.id)) out.push(rec.id);
    }
    if (!out.length) out.push("herb-tea");
    return out;
  }

  private revealBoard(p: Actor): void {
    if (this.boardOn) {
      this.toast(`今晚 · ${this.boardTickets.map((id) => potById(id).name).join("、")}`);
      return;
    }
    if (!this.boardTickets.length) this.boardTickets = this.rollBoard();
    if (!this.boardAsked.includes(p.side)) this.boardAsked.push(p.side);
    const needBoth = this.present().length === 2;
    if (needBoth && this.boardAsked.length < 2) {
      this.toast(`${p.name} 先按住看板，等另一只手`);
      return;
    }
    this.boardOn = true;
    this.toast(`看板：${this.boardTickets.map((id) => potById(id).name).join("、")}`);
  }

  private seedBoardOrders(): void {
    if (!this.boardOn) return;
    for (const id of this.boardTickets) {
      if (this.orders.some((o) => o.board && o.recipe === id)) continue;
      this.orders.push({ customer: "wander", recipe: id, t: 40, board: true });
    }
  }

  private power(p: Actor) {
    const o = this.other(p);
    return fighterPower(this.fighter(p), o ? this.fighter(o) : this.fighter(p), this.save.bond, this.save.gear);
  }

  private tickWeather(dt: number): void {
    this.weatherAcc += dt;
    if (this.weatherAcc < 90) return;
    this.weatherAcc = 0;
    this.save.weather = rollWeather(this.rand, this.save.weather).id;
    this.toast(`天气转成${weatherById(this.save.weather).name}`);
  }

  private giveLoot(p: Actor, table: string, luck: number, pairNear: boolean): string[] {
    const def = LOOT_TABLES[table];
    if (!def) return [];
    const weather = weatherById(this.save.weather);
    const stacks = rollLootTable(def, {
      rand: this.rand,
      luck: luck + weather.mine / 10,
      weather: this.save.weather,
      pairNear,
    });
    const names: string[] = [];
    for (const s of stacks) {
      const it = item(s.id);
      if (it.kind === "equip" || s.enchant) {
        const gear = makeGear(s.id, 1 + this.mineFloor + (s.enchant ?? 0), luck, this.rand, pairNear);
        this.keepGear(p, gear);
        names.push(gear.name);
      } else {
        addToBag(this.save.bag, s.id, s.n);
        names.push(`${it.name}${s.n > 1 ? "×" + s.n : ""}`);
      }
    }
    return names;
  }

  private revealedList(side: "left" | "right", zone: Zone): number[] {
    const map = this.mapFor(zone);
    const out: number[] = [];
    for (const key of this.explored[side]) {
      if (!key.startsWith(`${zone}:`)) continue;
      const [, rest] = key.split(":");
      const [x, y] = rest.split(",").map(Number);
      out.push(tileKey(x, y, map.w));
    }
    return packFog(new Set(out));
  }

  private visibleList(p: Actor): number[] {
    const map = this.mapFor(p.zone);
    const t = toTile(p.x, p.y);
    const r = this.visionRadius(p);
    const out: number[] = [];
    for (let y = t.y - r; y <= t.y + r; y++) {
      for (let x = t.x - r; x <= t.x + r; x++) {
        if (x < 0 || y < 0 || x >= map.w || y >= map.h) continue;
        if (Math.hypot(x - t.x, y - t.y) <= r) out.push(tileKey(x, y, map.w));
      }
    }
    return packFog(new Set(out));
  }

  private visionRadius(p: Actor): number {
    if (p.zone !== "wild") return 8;
    if (this.isNight() && !this.isLit(p)) return 2;
    if (this.isNight()) return 4;
    return 5;
  }

  private fireKeys(zone: Zone): number[] {
    if (zone !== "wild" || !this.wildMap) return [];
    const out: number[] = [];
    for (const key of this.fires.keys()) {
      const [x, y] = key.split(",").map(Number);
      out.push(tileKey(x, y, this.wildMap.w));
    }
    return out;
  }

  private biomeAt(p: Actor): string {
    const map = this.mapFor(p.zone);
    const t = toTile(p.x, p.y);
    return biomeName(map.rows[t.y]?.[t.x] ?? ".");
  }

  private paintWild(x: number, y: number, ch: string): void {
    if (!this.wildMap) return;
    this.wildMap = replaceTile(this.wildMap, "wild", x, y, ch);
    this.bumpMap();
  }

  private bumpMap(): void {
    this.mapRev += 1;
    this.dirty = true;
  }

  private idleFace(cell: string): boolean {
    return cell === "grass" || cell === "path" || cell === "savanna" || cell === "floor" || cell === "hill" || cell === "wall";
  }

  private tryEat(p: Actor): boolean {
    const v = eatValue(p.held);
    if (!v) return false;
    if (p.held.startsWith("dish:") && this.orders.length && p.zone === "kitchen") return false;
    const fresh = parseHeld(p.held).fresh;
    const mul = fresh >= 40 ? 1 : 0.45;
    p.hp = Math.min(maxHp(this.fighter(p).level), p.hp + v.hp * mul);
    p.hunger = Math.min(100, p.hunger + v.hunger * mul);
    this.toast(`${p.name} 吃了${heldLabel(p.held)}${fresh < 40 ? "（蔫了）" : ""}`);
    p.held = "";
    return true;
  }

  private iceAct(p: Actor): void {
    if (p.held && !p.held.startsWith("dish:")) {
      const held = parseHeld(p.held);
      addToBag(this.ice, held.id, 1, held.fresh);
      p.held = "";
      this.toast(`${p.name} 把${item(held.id).name}放进冰柜`);
      return;
    }
    if (p.held) return;
    const row = this.ice[0];
    if (!row) {
      this.toast("冰柜空着");
      return;
    }
    const fresh = takeFresh(this.ice, row.id) ?? 100;
    p.held = writeHeld(row.id, item(row.id).cook === "none" ? "ready" : "raw", fresh);
    this.toast(`${p.name} 从冰柜取出${item(row.id).name}`);
  }

  private rotFood(sleeping: boolean, dt = 0): void {
    const sea = seasonOf(this.save.day);
    const bagAmt = sleeping ? sleepSpoil(sea, false) : spoilRate(sea, false) * dt;
    const iceAmt = sleeping ? sleepSpoil(sea, true) : spoilRate(sea, true) * dt;
    const notes = [...ageBag(this.save.bag, bagAmt), ...ageBag(this.ice, iceAmt)];
    if (notes[0]) this.toast(notes[0]);
    for (const p of this.players.values()) {
      if (!p.held || p.held.startsWith("dish:") || p.held.split(":")[0] === "torch") continue;
      const held = parseHeld(p.held);
      if (!held.id) continue;
      const next = held.fresh - (sleeping ? sleepSpoil(sea, false) : spoilRate(sea, false) * dt);
      if (next <= 0) {
        p.held = writeHeld("mush", "ready", 100);
        this.toast(`${p.name} 手里的东西坏了`);
      } else p.held = writeHeld(held.id, held.state || "raw", next);
    }
  }

  private tryTorch(p: Actor, x: number, y: number): boolean {
    if (this.holdingTorch(p)) {
      this.stoke(p, x, y);
      return true;
    }
    if (countOf(this.save.bag, "flint") <= 0 || countOf(this.save.bag, "wood") <= 0 || countOf(this.save.bag, "herb") <= 0) {
      return false;
    }
    takeFromBag(this.save.bag, "flint");
    takeFromBag(this.save.bag, "wood");
    takeFromBag(this.save.bag, "herb");
    p.held = "torch";
    p.torch = 70;
    this.toast(`${p.name} 搓出一支火把`);
    return true;
  }

  private plotPrompt(x: number, y: number): string {
    const plots = this.valley.find("P");
    const i = plots.findIndex((t) => t.x === x && t.y === y);
    const plot = this.save.plots[i];
    if (plot?.seed && plot.stage >= 3) {
      const grow = item(plot.seed).growInto;
      return `收 · ${grow ? item(grow).name : "一垄"}`;
    }
    if (plot?.seed) return `${item(plot.seed).name} · ${plot.stage}/3`;
    return "种";
  }

  private sprinkleVein(): void {
    if (!this.mineMap) return;
    let extra = 2;
    for (let y = 1; y < this.mineMap.h - 1 && extra > 0; y++) {
      for (let x = 1; x < this.mineMap.w - 1 && extra > 0; x++) {
        if (this.mineMap.rows[y][x] !== ".") continue;
        if (this.rand() > 0.28) continue;
        this.mineMap = replaceTile(this.mineMap, "mine", x, y, "o");
        extra -= 1;
      }
    }
    this.bumpMap();
  }

  private atHearth(p: Actor): boolean {
    const map = this.mapFor(p.zone);
    const t = toTile(p.x, p.y);
    for (let y = t.y - 2; y <= t.y + 2; y++) {
      for (let x = t.x - 2; x <= t.x + 2; x++) {
        if (map.rows[y]?.[x] === "A") return true;
        if (map.cell(x, y) === "fire" && this.fires.has(`${x},${y}`)) return true;
      }
    }
    return false;
  }

  private tickHearth(dt: number): void {
    if (!this.isNight() || this.hearthDone) {
      if (!this.isNight()) this.hearthDone = false;
      this.hearthT = 0;
      return;
    }
    const ps = this.present();
    if (ps.length < 2 || !this.near(ps[0], ps[1]) || !this.atHearth(ps[0]) || !this.atHearth(ps[1])) {
      this.hearthT = 0;
      return;
    }
    this.hearthT += dt;
    if (this.hearthT >= 7) {
      this.hearthDone = true;
      this.save.bond += 1;
      this.toast("火边坐了一会儿");
    }
  }

  private tickHunger(p: Actor, dt: number): void {
    const o = this.other(p);
    const cozy = this.isNight() && !!o && this.near(p, o) && this.atHearth(p) && this.atHearth(o);
    const drain = cozy ? 0.08 : this.isNight() ? 0.55 : 0.38;
    p.hunger = Math.max(0, p.hunger - dt * drain);
    if (cozy) p.hunger = Math.min(100, p.hunger + dt * 0.25);
    if (p.hunger <= 0) {
      p.hp -= dt * 0.8;
      if (p.hp <= 0) {
        p.hp = maxHp(this.fighter(p).level) * 0.4;
        p.hunger = 22;
        this.leaveToValley(p);
        this.toast(`${p.name} 饿得走不动，被送回山谷`);
      }
    }
  }

  private respawnDepleted(): void {
    for (const d of this.depleted) {
      if (this.rand() > 0.7) continue;
      if (d.zone === "wild" && this.wildMap) this.wildMap = replaceTile(this.wildMap, "wild", d.x, d.y, d.ch);
      if (d.zone === "valley") this.valley = replaceTile(this.valley, "valley", d.x, d.y, d.ch);
    }
    this.depleted = this.depleted.filter(() => this.rand() > 0.55);
    this.bumpMap();
  }

  private chopTree(p: Actor, x: number, y: number): void {
    addToBag(this.save.bag, "wood", chance(0.35, this.rand) ? 2 : 1);
    const nearSavanna = [this.wildMap?.rows[y]?.[x - 1], this.wildMap?.rows[y]?.[x + 1]].includes("s");
    const left = nearSavanna ? "s" : ".";
    this.depleted.push({ zone: "wild", x, y, ch: "t" });
    this.paintWild(x, y, left);
    this.toast(`${p.name} 砍下一截青木`);
  }

  private crackRock(p: Actor, x: number, y: number): void {
    this.giveLoot(p, "ore_node", this.power(p).luck, this.near(p, this.other(p)));
    if (chance(0.55, this.rand)) addToBag(this.save.bag, "flint");
    this.depleted.push({ zone: "wild", x, y, ch: "b" });
    this.paintWild(x, y, "^");
    this.toast(`${p.name} 砸开一块石头`);
  }

  private keepGear(p: Actor, gear: GearInst): void {
    this.save.gear.push(gear);
    const f = this.fighter(p);
    const slot = item(gear.base).slot;
    if (slot === "weapon" && gear.atk >= (this.save.gear.find((g) => g.uid === f.weaponUid)?.atk ?? 0)) {
      f.weapon = gear.base;
      f.weaponUid = gear.uid;
    }
    if (slot === "charm" && gear.luck >= (this.save.gear.find((g) => g.uid === f.charmUid)?.luck ?? 0)) {
      f.charm = gear.base;
      f.charmUid = gear.uid;
    }
  }

  private isNight(): boolean {
    return this.clock > nightAfter(seasonOf(this.save.day));
  }

  private atValleyEdge(p: Actor): boolean {
    if (p.zone !== "valley") return false;
    const t = toTile(p.x, p.y);
    return this.valley.find("V").some((g) => Math.max(Math.abs(t.x - g.x), Math.abs(t.y - g.y)) <= 3);
  }

  private isLit(p: Actor, hop = false): boolean {
    if (p.zone === "kitchen" || p.zone === "mine") return true;
    if (p.zone === "valley" && !this.atValleyEdge(p)) return true;
    if (this.holdingTorch(p) || p.held.startsWith("tea") || p.held.includes("lantern")) return true;
    const map = this.mapFor(p.zone);
    const t = toTile(p.x, p.y);
    for (let y = t.y - 2; y <= t.y + 2; y++) {
      for (let x = t.x - 2; x <= t.x + 2; x++) {
        const cell = map.cell(x, y);
        const ch = map.rows[y]?.[x];
        if (ch === "A" || ch === "I") return true;
        if (cell === "fire" && this.fires.has(`${x},${y}`)) return true;
      }
    }
    const o = this.other(p);
    return !hop && !!o && this.near(p, o) && this.isLit(o, true);
  }

  private tickClock(dt: number): void {
    const wasNight = this.isNight();
    this.clock += dt / 200;
    if (this.clock >= 1) this.clock -= 1;
    if (wasNight && !this.isNight()) {
      this.howled = false;
      this.hearthDone = false;
    }
    this.tickHowl();
    this.tickBiome();
  }

  private tickHowl(): void {
    if (!this.isNight() || this.howled) return;
    const explorers = this.present().filter((p) => p.zone === "wild");
    if (!explorers.length || this.clock < nightAfter(seasonOf(this.save.day)) + 0.08) return;
    this.howled = true;
    const t = explorers[0];
    const tile = toTile(t.x, t.y);
    const sx = Math.max(2, Math.min(WILD_W - 3, tile.x));
    const sy = Math.max(2, Math.min(WILD_H - 3, tile.y));
    this.spawnWild("shadow", sx + 1, sy);
    this.spawnWild("silk", sx - 1, sy + 1);
    this.toast("林子里有东西跟来了——靠近火");
  }

  private tickBiome(): void {
    for (const p of this.present()) {
      if (p.zone !== "wild") continue;
      const b = this.biomeAt(p);
      const key = `${p.side}:${b}`;
      if (this.seenBiome.has(key) || !b) continue;
      this.seenBiome.add(key);
      this.toast(`${p.name} 走进了${b}`);
    }
  }

  private tickFog(): void {
    const pair = this.present();
    const share = pair.length === 2 && this.near(pair[0], pair[1]);
    for (const p of pair) {
      const map = this.mapFor(p.zone);
      const t = toTile(p.x, p.y);
      const r = this.visionRadius(p);
      let fresh = 0;
      for (let y = t.y - r; y <= t.y + r; y++) {
        for (let x = t.x - r; x <= t.x + r; x++) {
          if (x < 0 || y < 0 || x >= map.w || y >= map.h) continue;
          if (Math.hypot(x - t.x, y - t.y) > r) continue;
          const key = `${p.zone}:${x},${y}`;
          if (!this.explored[p.side].has(key)) {
            this.explored[p.side].add(key);
            if (p.zone === "wild") fresh += 1;
          }
          if (share) {
            const o = pair.find((q) => q.id !== p.id);
            if (o) this.explored[o.side].add(key);
          }
        }
      }
      if (fresh) this.scoutFind(p, fresh);
    }
  }

  private tickDark(dt: number): void {
    if (!this.isNight()) {
      for (const p of this.players.values()) p.dark = 0;
      return;
    }
    for (const p of this.present()) {
      if (p.zone === "kitchen" || p.zone === "mine" || this.isLit(p)) {
        p.dark = 0;
        continue;
      }
      p.dark += dt;
      if (p.dark > 2.8) {
        p.dark = 0;
        p.hp -= 6;
        this.toast(`${p.name} 被黑暗咬了一口`);
        if (p.hp <= 0) {
          p.hp = maxHp(this.fighter(p).level);
          this.leaveToValley(p);
        }
      }
    }
  }

  private tickFires(dt: number): void {
    const wet = this.save.weather === "rain" || this.save.weather === "storm";
    const rate = wet ? 2.8 : 1;
    let died = false;
    for (const [k, t] of [...this.fires]) {
      const next = t - dt * rate;
      if (next <= 0) {
        this.fires.delete(k);
        died = true;
      } else this.fires.set(k, next);
    }
    if (died && wet && this.rainOutT <= 0) {
      this.rainOutT = 8;
      this.toast("雨把火浇灭了");
    }
  }

  private tickWild(dt: number): void {
    const explorers = this.present().filter((p) => p.zone === "wild");
    if (!explorers.length) return;
    for (const e of this.enemies.filter((en) => en.zone === "wild")) {
      const t = explorers.slice().sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
      const dx = t.x - e.x;
      const dy = t.y - e.y;
      const m = Math.hypot(dx, dy) || 1;
      e.flash = Math.max(0, e.flash - dt);
      e.vx *= 0.82;
      e.vy *= 0.82;
      const step = e.speed * dt * (this.isNight() ? 1.15 : 0.75);
      const nx = e.x + (dx / m) * step + e.vx * dt;
      const ny = e.y + (dy / m) * step + e.vy * dt;
      if (this.free("wild", nx, e.y)) e.x = nx;
      if (this.free("wild", e.x, ny)) e.y = ny;
      if (m < 18) {
        t.hp -= e.atk * dt * 0.55;
        if (t.hp <= 0) {
          t.hp = maxHp(this.fighter(t).level);
          this.leaveToValley(t);
          this.toast(`${t.name} 被送出了荒野`);
        }
      }
    }
  }

  private spawnWild(kind: string, x: number, y: number): void {
    const def = MONSTERS[kind] ?? MONSTERS.slime;
    const c = tileCenter(x, y);
    this.enemies.push({
      x: c.x,
      y: c.y,
      hp: def.hp,
      maxHp: def.hp,
      atk: def.atk,
      speed: def.speed,
      xp: def.xp,
      hue: def.hue,
      name: def.name,
      kind,
      zone: "wild",
      vx: 0,
      vy: 0,
      flash: 0,
    });
  }

  private enterWild(p: Actor): void {
    if (!this.wildMap) {
      this.wildMap = buildMap(generateWild(this.room.split("").reduce((s, c) => s + c.charCodeAt(0), 17)), "wild");
      this.enemies = this.enemies.filter((e) => e.zone !== "wild");
      for (const s of this.wildMap.find("e")) {
        const nbs = [
          this.wildMap.rows[s.y]?.[s.x - 1],
          this.wildMap.rows[s.y]?.[s.x + 1],
          this.wildMap.rows[s.y - 1]?.[s.x],
          this.wildMap.rows[s.y + 1]?.[s.x],
        ];
        const kind = nbs.some((c) => c === "m" || c === "n") ? "marsh" : "shadow";
        this.spawnWild(kind, s.x, s.y);
      }
      for (const s of this.wildMap.find("n")) this.spawnWild("silk", s.x, s.y);
    }
    const leave = this.wildMap.find("L")[0] ?? { x: 24, y: 27 };
    const c = tileCenter(leave.x, leave.y - 1);
    p.zone = "wild";
    p.x = c.x;
    p.y = c.y;
    this.dirty = true;
    this.toast(`${p.name} 出了谷。地图还是黑的`);
  }

  private stoke(p: Actor, x: number, y: number): void {
    if (countOf(this.save.bag, "wood") <= 0 && countOf(this.save.bag, "herb") <= 0) {
      this.toast("没有能烧的东西");
      return;
    }
    if (countOf(this.save.bag, "wood") > 0) takeFromBag(this.save.bag, "wood");
    else takeFromBag(this.save.bag, "herb");
    this.fires.set(`${x},${y}`, fireLife(seasonOf(this.save.day)));
    this.dirty = true;
    this.toast(`${p.name} 把火添旺了`);
  }

  private relic(p: Actor, x: number, y: number): void {
    const key = `${x},${y}`;
    if (this.relics.has(key)) {
      this.toast("这具残骸被翻过了");
      return;
    }
    this.relics.add(key);
    this.giveLoot(p, "chest", this.power(p).luck + 4, this.near(p, this.other(p)));
    this.toast(`${p.name} 在残骸旁蹲了下来`);
  }

  private canCookAtFire(p: Actor): boolean {
    const held = parseHeld(p.held);
    if (!held.id || held.id === "torch") return false;
    const need = item(held.id).cook;
    if (need !== "cook" && need !== "both") return false;
    return held.state !== "cooked" && held.state !== "prepped" && held.state !== "ready";
  }

  private cookAtFire(p: Actor, x: number, y: number): boolean {
    if (!this.fires.has(`${x},${y}`) || !this.canCookAtFire(p)) return false;
    const held = parseHeld(p.held);
    p.held = writeHeld(held.id, "cooked", held.fresh);
    this.toast(`${p.name} 烤好了${item(held.id).name}`);
    return true;
  }

  private scoutFind(p: Actor, n: number): void {
    this.scout += n;
    if (this.scout < 16) return;
    this.scout = 0;
    if (this.rand() > 0.42) return;
    const pick =
      this.rand() < 0.4 ? "herb" : this.rand() < 0.55 ? "flint" : this.rand() < 0.5 ? "tomato_seed" : "greens_seed";
    addToBag(this.save.bag, pick);
    this.toast(`${p.name} 脚下绊到 · ${item(pick).name}`);
  }

  private lootCamp(p: Actor, x: number, y: number): void {
    const key = `J:${x},${y}`;
    if (this.relics.has(key)) {
      this.toast("旧营被翻过了");
      return;
    }
    this.relics.add(key);
    const pair = this.near(p, this.other(p));
    this.giveLoot(p, "chest", this.power(p).luck + (pair ? 6 : 2), pair);
    if (pair) {
      const ring = p.side === "left" ? "ring_left" : "ring_right";
      this.keepGear(p, makeGear(ring, 2, this.power(p).luck, this.rand, true));
      this.toast("旧营还留着两个人的东西");
      return;
    }
    this.toast(`${p.name} 在旧营里翻出一点存货`);
  }

  private hole(p: Actor): void {
    const holes = this.wildMap?.find("H") ?? [];
    if (holes.length < 2) return;
    const t = toTile(p.x, p.y);
    const here = holes.find((h) => Math.abs(h.x - t.x) + Math.abs(h.y - t.y) <= 1) ?? holes[0];
    const dest = holes.find((h) => h !== here) ?? holes[0];
    const c = tileCenter(dest.x, dest.y);
    p.x = c.x;
    p.y = c.y + TILE;
    this.toast(`${p.name} 钻进了洞的另一头`);
  }
}

function zoneName(z: Zone): string {
  if (z === "mine") return "矿里";
  if (z === "kitchen") return "厨房";
  if (z === "wild") return "荒野";
  return "山谷";
}
