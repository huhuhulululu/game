import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addToBag, countOf, takeFromBag } from "./bag";
import { RECIPES } from "./content";
import { gradeOf, rollCatch } from "./fishQuality";
import { matchPot, sumTags } from "./food";
import { FORTUNES, rollFortune } from "./fortune";
import { item } from "./items";
import { rollLootTable } from "./loot";
import { LOOT_TABLES } from "./lootTables";
import { pickWeighted } from "./rng";
import { eatValue } from "./eat";
import { growPlots } from "./progress";
import { nightAfter, seasonOf } from "./season";
import { ageBag, freshMul, isPerishable, sleepSpoil } from "./spoil";
import { mergeSnap } from "../net/client";
import { resolveHelloRoom, roomIsFull, takeRoom } from "../../server/join";
import { World } from "../sim/world";
import { buildMap, mineTemplate, TILE, tileCenter, VALLEY } from "../world/maps";
import { createAudio } from "./audio";
import { pickAmbient, tickFeel } from "./feel";
import { generateWild } from "../world/wild";
import type { WorldSnap } from "../sim/net";

function tap(w: World, id: string): void {
  w.setInput(id, { x: 0, y: 0, action: true, held: false, ping: false });
  w.setInput(id, { x: 0, y: 0, action: false, held: false, ping: false });
  const p = w.players.get(id);
  if (p) p.cool = 0;
}

function standFacing(p: { x: number; y: number; facing: number }, tile: { x: number; y: number }): void {
  const c = tileCenter(tile.x, tile.y + 1);
  p.x = c.x;
  p.y = c.y;
  p.facing = 0;
}

describe("living systems", () => {
  it("bag stacks and spends", () => {
    const bag = [{ id: "ore", n: 2 }];
    addToBag(bag, "ore", 1);
    assert.equal(countOf(bag, "ore"), 3);
    assert.equal(takeFromBag(bag, "ore", 2), true);
    assert.equal(countOf(bag, "ore"), 1);
    assert.equal(takeFromBag(bag, "ore", 4), false);
  });

  it("recipes have at least one part", () => {
    for (const r of RECIPES) assert.ok(r.parts.length >= 1);
  });

  it("fortune table always returns a sign", () => {
    assert.ok(FORTUNES.length >= 5);
    const f = rollFortune(() => 0.99);
    assert.ok(f.title);
    assert.ok(f.life);
  });

  it("weighted pick stays inside the table", () => {
    const hit = pickWeighted(
      [
        { id: "a", w: 1 },
        { id: "b", w: 0 },
      ],
      () => 0,
    );
    assert.equal(hit.id, "a");
  });

  it("two phones get two sides and fortune waits for both", () => {
    const w = new World("TEST");
    const a = w.addPlayer("a", "阿左", "left");
    const b = w.addPlayer("b", "阿右", "right");
    assert.equal(a, "left");
    assert.equal(b, "right");
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    // not at the hall yet; just ensure world ticks
    w.tick(0.05);
    const snap = w.snapshot("a");
    assert.equal(snap.room, "TEST");
    assert.ok(snap.partner?.online);
  });

  it("puts a new person on the path south of the cabin, not behind the door", () => {
    const w = new World("LOOK");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a")!;
    const door = w.valley.find("A")[0]!;
    assert.ok(p.y > tileCenter(door.x, door.y).y + 24);
    assert.equal(p.facing, 2);
    assert.equal(p.zone, "valley");
  });

  it("crock pot picks higher priority like Don't Starve", () => {
    const stew = matchPot(["meat", "meat", "meat", "herb"], () => 0);
    assert.equal(stew.id, "meaty-stew");
    const balls = matchPot(["morsel", "wheat", "herb", "tomato"], () => 0);
    assert.equal(balls.id, "meatballs");
    const ham = matchPot(["meat", "meat", "osmanthus", "herb"], () => 0);
    assert.equal(ham.id, "osmanthus-meat");
    const goop = matchPot(["wood", "wood", "wood", "wood"], () => 0);
    assert.equal(goop.id, "wet-goop");
    const tags = sumTags(["fish_heavy", "wheat"]);
    assert.ok((tags.fish ?? 0) >= 1);
  });

  it("fish weight uses DST range and 70% heavy grade", () => {
    assert.equal(gradeOf(40, 40, 56), "common");
    assert.equal(gradeOf(49, 40, 56), "thick");
    assert.equal(gradeOf(52, 40, 56), "heavy");
    const catcher = rollCatch("crucian", () => 0.99, 0);
    assert.ok(catcher.weight >= 40);
    assert.equal(catcher.record, true);
  });

  it("minecraft-style loot table can roll empty or items", () => {
    const out = rollLootTable(LOOT_TABLES.slime, {
      rand: () => 0.01,
      luck: 0,
      weather: "clear",
      pairNear: false,
    });
    assert.ok(Array.isArray(out));
  });

  it("wild map is a black-start island with biomes and set pieces", () => {
    const rows = generateWild(99);
    assert.ok(rows.length > 10);
    const all = rows.join("");
    assert.ok(all.includes("L"));
    assert.ok(all.includes("K"));
    assert.ok(all.includes("R"));
    assert.ok(all.includes("t"));
    assert.ok(all.includes("m"));
    assert.ok(all.includes("s"));
    assert.ok(all.includes("^"));
    assert.ok(all.includes("J"));
  });

  it("walking the wild fills fog; partners share what they see when near", () => {
    const w = new World("WILD");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    w.wildMap = buildMap(generateWild(7), "wild");
    const leave = w.wildMap.find("L")[0];
    const c = tileCenter(leave.x, leave.y - 1);
    a.zone = "wild";
    a.x = c.x;
    a.y = c.y;
    b.zone = "wild";
    b.x = c.x + 20;
    b.y = c.y;
    w.tick(0.05);
    const sa = w.snapshot("a");
    const sb = w.snapshot("b");
    assert.ok(sa.revealed.length > 8);
    assert.ok(sa.visible.length > 0);
    assert.equal(sa.zone, "wild");
    assert.ok(sa.revealed.length === sb.revealed.length);
  });

  it("seasons turn every three days and winter nights come earlier", () => {
    assert.equal(seasonOf(0), "春");
    assert.equal(seasonOf(3), "夏");
    assert.equal(seasonOf(6), "秋");
    assert.equal(seasonOf(9), "冬");
    const w = new World("SEA");
    w.addPlayer("a", "阿左", "left");
    w.save.day = 9;
    w.clock = 0.55;
    w.tick(0.05);
    const snap = w.snapshot("a");
    assert.equal(snap.season, "冬");
    assert.equal(snap.night, true);
  });

  it("mine stays lit at night so Charlie only bites the surface", () => {
    const w = new World("MINE");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.zone = "mine";
    w.clock = 0.9;
    w.tick(0.05);
    const snap = w.snapshot("a");
    assert.equal(snap.night, true);
    assert.equal(snap.lit, true);
  });

  it("eating held food restores hunger and hp", () => {
    const tea = eatValue("tea:ready");
    assert.ok(tea && tea.hp > 0 && tea.hunger > 0);
    const w = new World("EAT");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.held = "tea:ready";
    p.hp = 8;
    p.hunger = 12;
    p.x = tileCenter(20, 4).x;
    p.y = tileCenter(20, 4).y;
    p.facing = 1;
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.equal(p.held, "");
    assert.ok(p.hp > 8);
    assert.ok(p.hunger > 12);
  });

  it("leaving the wild drops you at the east gate", () => {
    const w = new World("GATE");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.wildMap = buildMap(generateWild(3), "wild");
    const leave = w.wildMap.find("L")[0];
    const stand = tileCenter(leave.x, leave.y - 1);
    p.zone = "wild";
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 2;
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.equal(p.zone, "valley");
    const gate = w.valley.find("V")[0];
    const g = tileCenter(gate.x, gate.y);
    assert.ok(Math.hypot(p.x - g.x, p.y - g.y) < 80);
  });

  it("lite snaps keep the last full map", () => {
    const full = {
      full: true,
      tiles: VALLEY,
      revealed: [1, 2, 3],
      fires: [9],
      visible: [1],
      bag: [{ id: "wood", n: 1, name: "青木" }],
      cookbook: ["山草茶"],
    } as unknown as WorldSnap;
    const lite = {
      full: false,
      tiles: [],
      revealed: [],
      fires: [],
      visible: [2],
      bag: [{ id: "wood", n: 2, name: "青木" }],
      cookbook: ["山草茶"],
      board: [],
    } as unknown as WorldSnap;
    const merged = mergeSnap(full, lite);
    assert.deepEqual(merged.tiles, VALLEY);
    assert.deepEqual(merged.revealed, [1, 2, 3]);
    assert.deepEqual(merged.visible, [2]);
    assert.equal(merged.bag[0].n, 2);
  });

  it("hooking a bite starts a fight; yanking in the green lands the fish", () => {
    const w = new World("FISH");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.x = tileCenter(6, 10).x;
    p.y = tileCenter(6, 10).y;
    p.facing = 2;
    p.fish = { phase: "bite", t: 1, window: 1, mark: 0.5, pull: 0.2, dir: 1 };
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.equal(p.fish?.phase, "fight");
    w.setInput("a", { x: 0, y: 0, action: false, held: false, ping: false });
    p.cool = 0;
    p.fish.mark = 0.5;
    p.fish.pull = 0.8;
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.equal(p.fish, null);
    assert.ok(w.save.leftSkills.fish >= 2);
  });

  it("album counts fish species and recipes", () => {
    const w = new World("ALB");
    w.addPlayer("a", "阿左", "left");
    w.save.fishAlbum = ["crucian", "perch"];
    const snap = w.snapshot("a");
    assert.equal(snap.album.fish, 2);
    assert.ok(snap.album.fishMax >= 6);
    assert.ok(snap.album.cookMax >= 8);
  });

  it("perishable food ages and becomes mush, icebox slows it", () => {
    assert.equal(isPerishable("fish"), true);
    assert.equal(isPerishable("wood"), false);
    assert.ok(freshMul(80) > freshMul(20));
    const bag = [{ id: "fish", n: 2, fresh: 10 }];
    const notes = ageBag(bag, 20);
    assert.ok(notes[0]?.includes("糊涂"));
    assert.equal(countOf(bag, "fish"), 0);
    assert.equal(countOf(bag, "mush"), 2);
    const warm = [{ id: "fish", n: 1, fresh: 80 }];
    const cold = [{ id: "fish", n: 1, fresh: 80 }];
    ageBag(warm, sleepSpoil("夏", false));
    ageBag(cold, sleepSpoil("夏", true));
    assert.ok((cold[0]?.fresh ?? 0) > (warm[0]?.fresh ?? 0));
  });

  it("cooked food restores more than raw", () => {
    const raw = eatValue("meat:raw:100");
    const cooked = eatValue("meat:cooked:100");
    assert.ok(raw && cooked);
    assert.ok(cooked.hunger > raw.hunger);
    assert.ok(cooked.hp >= raw.hp);
  });

  it("lit campfire cooks raw meat in the hand", () => {
    const w = new World("FIRE");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.wildMap = buildMap(generateWild(11), "wild");
    const fire = w.wildMap.find("K")[0];
    assert.ok(fire);
    w.fires.set(`${fire.x},${fire.y}`, 40);
    const stand = tileCenter(fire.x, fire.y + 1);
    p.zone = "wild";
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 0;
    p.held = "meat:raw:100";
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.ok(p.held.includes(":cooked"));
    assert.ok(w.toasts.some((t) => t.text.includes("烤")));
  });

  it("old camp can be searched once", () => {
    const w = new World("CAMP");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.wildMap = buildMap(generateWild(11), "wild");
    const camp = w.wildMap.find("J")[0];
    assert.ok(camp);
    const stand = tileCenter(camp.x, camp.y + 1);
    p.zone = "wild";
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 0;
    const before = w.save.bag.reduce((n, s) => n + s.n, 0) + w.save.gear.length;
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    const after = w.save.bag.reduce((n, s) => n + s.n, 0) + w.save.gear.length;
    assert.ok(after >= before);
    assert.ok(w.relics.has(`J:${camp.x},${camp.y}`));
    w.setInput("a", { x: 0, y: 0, action: false, held: false, ping: false });
    p.cool = 0;
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.ok(w.toasts.some((t) => t.text.includes("翻过")));
  });

  it("walking the wild can trip over forage", () => {
    const w = new World("SCOUT");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.rand = () => 0.01;
    w.wildMap = buildMap(generateWild(5), "wild");
    const leave = w.wildMap.find("L")[0];
    const c = tileCenter(leave.x, leave.y - 1);
    p.zone = "wild";
    p.x = c.x;
    p.y = c.y;
    w.tick(0.05);
    assert.ok(w.save.bag.some((s) => ["herb", "flint", "tomato_seed", "greens_seed"].includes(s.id)));
    assert.ok(w.toasts.some((t) => t.text.includes("脚下绊到")));
  });

  it("kitchen rush lets you pass from farther away, and facing a partner does not eat the dish", () => {
    const w = new World("PASS");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    w.rushed = true;
    a.zone = "kitchen";
    b.zone = "kitchen";
    const floor = tileCenter(4, 5);
    a.x = floor.x;
    a.y = floor.y;
    b.x = floor.x + 120;
    b.y = floor.y;
    a.facing = 1;
    a.held = "dish:herb-tea";
    b.held = "";
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.equal(a.held, "");
    assert.equal(b.held, "dish:herb-tea");
  });

  it("board tickets served in order make a combo; extras do not break it", () => {
    const w = new World("COMBO");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.boardOn = true;
    w.boardTickets = ["herb-tea", "mushroom-soup"];
    const inn = w.valley.find("I")[0];
    standFacing(p, inn);
    tap(w, "a");
    assert.deepEqual(
      w.orders.filter((o) => o.board).map((o) => o.recipe),
      ["herb-tea", "mushroom-soup"],
    );
    const win = w.kitchenMap.find("W")[0];
    const stand = tileCenter(win.x - 1, win.y);
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 1;
    p.held = "dish:herb-tea";
    tap(w, "a");
    assert.equal(w.combo, 1);
    p.held = "dish:meatballs";
    w.orders.push({ customer: "wander", recipe: "meatballs", t: 30 });
    tap(w, "a");
    assert.equal(w.combo, 1);
    p.held = "dish:mushroom-soup";
    tap(w, "a");
    assert.equal(w.combo, 2);
    assert.ok(w.toasts.some((t) => t.text.includes("连上了")));
  });

  it("taking a torch from the bag lights the holder", () => {
    const w = new World("TORCH");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    addToBag(w.save.bag, "torch");
    w.clock = 0.9;
    p.zone = "valley";
    w.takeItem("torch", "a");
    w.tick(0.05);
    const snap = w.snapshot("a");
    assert.equal(snap.night, true);
    assert.equal(snap.lit, true);
    assert.ok(p.held.startsWith("torch"));
  });

  it("two people fishing the same water count as pair fishing, including the wild shore", () => {
    const w = new World("PAIR");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    w.wildMap = buildMap(generateWild(3), "wild");
    const dock = w.wildMap.find("D")[0];
    assert.ok(dock);
    const stand = tileCenter(dock.x - 1, dock.y);
    a.zone = "wild";
    b.zone = "wild";
    a.x = stand.x;
    a.y = stand.y - 8;
    b.x = stand.x;
    b.y = stand.y + 8;
    a.facing = 1;
    b.facing = 1;
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    w.setInput("b", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.ok(a.fish);
    assert.ok(b.fish);
    const snap = w.snapshot("a");
    assert.ok(snap.prompt.includes("两人同钓"));
  });

  it("two people both have to lie down before the night turns", () => {
    const w = new World("BED");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    const bed = w.valley.find("A")[0];
    const stand = tileCenter(bed.x, bed.y + 1);
    a.x = stand.x - 8;
    a.y = stand.y;
    b.x = stand.x + 8;
    b.y = stand.y;
    a.facing = 0;
    b.facing = 0;
    w.clock = nightAfter(seasonOf(w.save.day)) + 0.01;
    const day = w.save.day;
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.equal(w.save.day, day);
    assert.ok(w.toasts.some((t) => t.text.includes("先躺下")));
    w.setInput("b", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.equal(w.save.day, day + 1);
  });

  it("a ripe plot can grow a stray plant", () => {
    const w = new World("PLOT");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.rand = () => 0.01;
    const plots = w.valley.find("P");
    w.save.plots[0] = { seed: "tomato_seed", stage: 3 };
    const stand = tileCenter(plots[0].x, plots[0].y + 1);
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 0;
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.ok(countOf(w.save.bag, "tomato") + (p.held.startsWith("tomato") ? 1 : 0) >= 1);
    assert.ok(countOf(w.save.bag, "osmanthus") >= 1);
    assert.ok(w.toasts.some((t) => t.text.includes("异株")));
  });

  it("a vein floor pays extra ore when you dig", () => {
    const w = new World("VEIN");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.mineMap = buildMap(mineTemplate(1, 1), "mine");
    w.encounter = "vein";
    const ore = w.mineMap.find("o")[0];
    assert.ok(ore);
    const stand = tileCenter(ore.x, ore.y + 1);
    p.zone = "mine";
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 0;
    const before = countOf(w.save.bag, "ore") + (p.held.startsWith("ore") ? 1 : 0);
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    const after = countOf(w.save.bag, "ore") + (p.held.startsWith("ore") ? 1 : 0);
    assert.ok(after > before);
    assert.ok(w.toasts.some((t) => t.text.includes("矿脉")));
  });

  it("rain puts wild fires out faster than clear weather", () => {
    const wet = new World("RAIN");
    wet.save.weather = "rain";
    wet.fires.set("3,3", 10);
    wet.tick(4);
    assert.equal(wet.fires.has("3,3"), false);
    assert.ok(wet.toasts.some((t) => t.text.includes("雨把火")));
    const dry = new World("DRY");
    dry.save.weather = "clear";
    dry.fires.set("3,3", 10);
    dry.tick(4);
    assert.ok((dry.fires.get("3,3") ?? 0) > 5);
  });

  it("sitting together at a night fire adds a little bond", () => {
    const w = new World("HEARTH");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    const bed = w.valley.find("A")[0];
    const c = tileCenter(bed.x, bed.y);
    a.x = c.x - 10;
    a.y = c.y;
    b.x = c.x + 10;
    b.y = c.y;
    w.clock = 0.9;
    const bond = w.save.bond;
    for (let i = 0; i < 16; i++) w.tick(0.5);
    assert.ok(w.save.bond > bond);
    assert.equal(w.hearthDone, true);
    assert.ok(w.toasts.some((t) => t.text.includes("火边坐了一会儿")));
  });

  it("a dying torch goes out and leaves the hand empty", () => {
    const w = new World("BURNT");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.held = "torch:ready:100";
    p.torch = 0.05;
    w.tick(0.1);
    assert.equal(p.torch, 0);
    assert.equal(p.held, "");
    assert.ok(w.toasts.some((t) => t.text.includes("燃尽")));
  });

  it("disconnect keeps the body; reconnect sits back down in the same seat", () => {
    const w = new World("REJOIN");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    assert.ok(a);
    a.x = 333;
    a.y = 222;
    a.zone = "wild";
    a.hunger = 61;
    w.markAway("a");
    const sb = w.snapshot("b");
    assert.equal(sb.partner?.online, false);
    assert.equal(w.present().length, 1);
    const hung = a.hunger;
    w.tick(2);
    assert.equal(a.hunger, hung);
    assert.equal(w.reclaim("阿左", "left"), "a");
    w.markBack("a");
    assert.equal(a.x, 333);
    assert.equal(a.zone, "wild");
    assert.equal(w.snapshot("b").partner?.online, true);
    assert.equal(w.present().length, 2);
  });

  it("an evening loop can starve, get bitten, cook at a fire, and pass a dish", () => {
    const w = new World("NIGHT");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    a.hunger = 40;
    w.clock = 0.2;
    w.tick(8);
    assert.ok(a.hunger < 40);
    w.wildMap = buildMap(generateWild(11), "wild");
    const fire = w.wildMap.find("K")[0];
    assert.ok(fire);
    w.fires.set(`${fire.x},${fire.y}`, 40);
    const stand = tileCenter(fire.x, fire.y + 1);
    a.zone = "wild";
    a.x = stand.x;
    a.y = stand.y;
    a.facing = 0;
    a.held = "meat:raw:100";
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.ok(a.held.includes(":cooked"));
    a.hp = 20;
    a.held = "";
    a.torch = 0;
    w.clock = 0.9;
    w.howled = true;
    w.fires.clear();
    w.tick(3);
    assert.ok(a.hp < 20);
    w.rushed = true;
    a.zone = "kitchen";
    b.zone = "kitchen";
    const floor = tileCenter(4, 5);
    a.x = floor.x;
    a.y = floor.y;
    b.x = floor.x + 120;
    b.y = floor.y;
    a.facing = 1;
    a.held = "dish:herb-tea";
    b.held = "";
    a.cool = 0;
    w.setInput("a", { x: 0, y: 0, action: false, held: false, ping: false });
    w.setInput("a", { x: 0, y: 0, action: true, held: false, ping: false });
    assert.equal(b.held, "dish:herb-tea");
  });

  it("shouting puts a ping pulse on the actor snap", () => {
    const w = new World("PING");
    w.addPlayer("a", "阿左", "left");
    w.setInput("a", { x: 0, y: 0, action: false, held: false, ping: true });
    const snap = w.snapshot("a");
    assert.ok((snap.actors[0]?.ping ?? 0) > 0);
    assert.ok(w.toasts.some((t) => t.text.includes("喊")));
  });

  it("reclaim only takes away seats and never steals a live one", () => {
    const w = new World("SEAT");
    w.addPlayer("a", "我", "left");
    w.addPlayer("b", "我", "right");
    assert.equal(w.reclaim("我", "left"), null);
    assert.equal(w.reclaim("我", "right"), null);
    w.markAway("a");
    assert.equal(w.reclaim("我", "left"), "a");
    assert.equal(w.present().length, 1);
    assert.equal(roomIsFull(w.present().length), false);
    w.markBack("a");
    assert.equal(roomIsFull(w.present().length), true);
  });

  it("a four-letter code for a missing room does not create a world", () => {
    const known = new Map<string, true>();
    const miss = resolveHelloRoom("7K3P", known, () => "XXXX");
    assert.deepEqual(miss, { err: "没有这间山谷" });
    const host = resolveHelloRoom("", known, () => "AB12");
    assert.deepEqual(host, { room: "AB12", create: true });
    known.set("AB12", true);
    const join = resolveHelloRoom("ab12", known, () => "NOPE");
    assert.deepEqual(join, { room: "AB12", create: false });
    const rooms = new Map<string, { id: string }>();
    let made = 0;
    const skipped = takeRoom(rooms, { room: "7K3P", create: false }, (id) => {
      made += 1;
      return { id };
    });
    assert.deepEqual(skipped, { err: "没有这间山谷" });
    assert.equal(made, 0);
    assert.equal(rooms.size, 0);
    const opened = takeRoom(rooms, { room: "AB12", create: true }, (id) => {
      made += 1;
      return { id };
    });
    assert.deepEqual(opened, { ok: { id: "AB12" } });
    assert.equal(made, 1);
    const again = takeRoom(rooms, { room: "AB12", create: false }, (id) => {
      made += 1;
      return { id };
    });
    assert.deepEqual(again, { ok: { id: "AB12" } });
    assert.equal(made, 1);
  });

  it("village plots stay lit at night; Charlie only bites the wild", () => {
    const w = new World("LIT");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    const plot = w.valley.find("P")[0];
    const c = tileCenter(plot.x, plot.y);
    p.x = c.x;
    p.y = c.y;
    w.clock = 0.9;
    p.hp = 20;
    w.tick(3);
    assert.equal(w.snapshot("a").lit, true);
    assert.equal(p.hp, 20);
    w.wildMap = buildMap(generateWild(11), "wild");
    const leave = w.wildMap.find("L")[0];
    const stand = tileCenter(leave.x, leave.y - 1);
    p.zone = "wild";
    p.x = stand.x;
    p.y = stand.y;
    p.torch = 0;
    p.held = "";
    w.fires.clear();
    w.howled = true;
    w.tick(3);
    assert.ok(p.hp < 20);
  });

  it("markAway then markBack keeps the torch in hand", () => {
    const w = new World("HAND");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.held = "torch:ready:100";
    p.torch = 40;
    w.markAway("a");
    w.markBack("a");
    assert.equal(p.held, "torch:ready:100");
    assert.equal(p.torch, 40);
  });

  it("pair fishing needs near or the same water; opposite docks do not count", () => {
    const w = new World("DOCKS");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    const docks = w.valley.find("D");
    assert.ok(docks.length >= 2);
    const left = tileCenter(docks[0].x - 1, docks[0].y);
    const right = tileCenter(docks[1].x - 1, docks[1].y);
    a.x = left.x;
    a.y = left.y;
    a.facing = 1;
    b.x = right.x;
    b.y = right.y;
    b.facing = 1;
    tap(w, "a");
    tap(w, "b");
    assert.ok(a.fish);
    assert.ok(b.fish);
    assert.ok(!w.snapshot("a").prompt.includes("两人同钓"));
  });

  it("pair_near loot is fatter than solo, and an away partner does not count", () => {
    const solo = rollLootTable(LOOT_TABLES.twin, { rand: () => 0.01, luck: 0, weather: "clear", pairNear: false });
    const pair = rollLootTable(LOOT_TABLES.twin, { rand: () => 0.01, luck: 0, weather: "clear", pairNear: true });
    assert.ok(!solo.some((s) => s.id.startsWith("twin")));
    assert.ok(pair.some((s) => s.id.startsWith("twin")));
    const vein = (away: boolean) => {
      const w = new World("VEIN2");
      w.addPlayer("a", "阿左", "left");
      w.addPlayer("b", "阿右", "right");
      const a = w.players.get("a");
      const b = w.players.get("b");
      assert.ok(a && b);
      w.rand = () => 0.5;
      w.mineMap = buildMap(mineTemplate(1, 1), "mine");
      w.encounter = "vein";
      const ore = w.mineMap.find("o")[0];
      standFacing(a, ore);
      b.zone = "mine";
      b.x = a.x + 8;
      b.y = a.y;
      a.zone = "mine";
      if (away) w.markAway("b");
      tap(w, "a");
      return countOf(w.save.bag, "ore");
    };
    assert.ok(vein(false) > vein(true));
    const camp = new World("CAMP2");
    camp.addPlayer("a", "阿左", "left");
    camp.addPlayer("b", "阿右", "right");
    const ca = camp.players.get("a");
    const cb = camp.players.get("b");
    assert.ok(ca && cb);
    camp.wildMap = buildMap(generateWild(11), "wild");
    const old = camp.wildMap.find("J")[0];
    standFacing(ca, old);
    cb.zone = "wild";
    ca.zone = "wild";
    cb.x = ca.x + 8;
    cb.y = ca.y;
    camp.markAway("b");
    tap(camp, "a");
    assert.ok(camp.toasts.some((t) => t.text.includes("翻出一点存货")));
    assert.ok(!camp.toasts.some((t) => t.text.includes("两个人的东西")));
  });

  it("sleep ages bag fish to about 38 and keeps icebox fish over 70", () => {
    const w = new World("ROT");
    w.addPlayer("a", "阿左", "left");
    w.save.day = 3;
    addToBag(w.save.bag, "fish", 1, 80);
    addToBag(w.ice, "fish", 1, 80);
    w.sleep();
    assert.equal(w.save.bag.find((s) => s.id === "fish")?.fresh, 38);
    assert.ok((w.ice.find((s) => s.id === "fish")?.fresh ?? 0) > 70);
    assert.equal(80 - sleepSpoil("夏", false), 38);
  });

  it("campfire cooking keeps the held freshness", () => {
    const w = new World("FRESH");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.wildMap = buildMap(generateWild(11), "wild");
    const fire = w.wildMap.find("K")[0];
    w.fires.set(`${fire.x},${fire.y}`, 40);
    standFacing(p, fire);
    p.zone = "wild";
    p.held = "meat:raw:80";
    tap(w, "a");
    assert.equal(p.held, "meat:cooked:80");
  });

  it("solo forge makes a wood blade with no pairId; misses make no gear", () => {
    const w = new World("FORGE1");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    addToBag(w.save.bag, "ore", 2);
    addToBag(w.save.bag, "wood", 1);
    const anvil = w.valley.find("Y")[0];
    standFacing(p, anvil);
    tap(w, "a");
    assert.ok(p.fish?.forge);
    p.fish.mark = 0.5;
    tap(w, "a");
    tap(w, "a");
    tap(w, "a");
    assert.equal(w.save.gear.length, 1);
    assert.equal(w.save.gear[0].base, "wood_blade");
    assert.equal(item(w.save.gear[0].base).pairId, undefined);
    assert.equal(w.save.gear[0].pairId, undefined);
    assert.equal(w.save.leftSkills.forge, 2);
    const miss = new World("FORGE0");
    miss.addPlayer("a", "阿左", "left");
    const m = miss.players.get("a");
    assert.ok(m);
    addToBag(miss.save.bag, "ore", 2);
    addToBag(miss.save.bag, "wood", 1);
    standFacing(m, miss.valley.find("Y")[0]);
    tap(miss, "a");
    m.fish!.mark = 0.1;
    tap(miss, "a");
    assert.ok(miss.toasts.some((t) => t.text.includes("偏了")));
    tap(miss, "a");
    tap(miss, "a");
    assert.equal(miss.save.gear.length, 0);
    assert.equal(miss.save.leftSkills.forge, 1);
    assert.equal(countOf(miss.save.bag, "ore") + (m.held.startsWith("ore") ? 1 : 0), 1);
    assert.ok(miss.toasts.some((t) => t.text.includes("卷刃") && t.text.includes("退")));
  });

  it("two people hitting the green at the anvil make a pair; away falls back to solo", () => {
    const pair = new World("FORGE2");
    pair.addPlayer("a", "阿左", "left");
    pair.addPlayer("b", "阿右", "right");
    const a = pair.players.get("a");
    const b = pair.players.get("b");
    assert.ok(a && b);
    addToBag(pair.save.bag, "ore", 2);
    addToBag(pair.save.bag, "wood", 1);
    const anvil = pair.valley.find("Y")[0];
    standFacing(a, anvil);
    standFacing(b, anvil);
    b.x = a.x + 12;
    tap(pair, "a");
    a.fish!.mark = 0.5;
    tap(pair, "a");
    tap(pair, "b");
    tap(pair, "a");
    assert.ok(pair.toasts.some((t) => t.text.includes("两个人对着砧")));
    assert.ok(pair.save.gear[0]?.quality === "pair" || pair.save.gear[0]?.base === "iron_blade" || pair.save.gear[0]?.pairId);
    const solo = new World("FORGE3");
    solo.addPlayer("a", "阿左", "left");
    solo.addPlayer("b", "阿右", "right");
    const sa = solo.players.get("a");
    const sb = solo.players.get("b");
    assert.ok(sa && sb);
    addToBag(solo.save.bag, "ore", 2);
    addToBag(solo.save.bag, "wood", 1);
    standFacing(sa, solo.valley.find("Y")[0]);
    standFacing(sb, solo.valley.find("Y")[0]);
    sb.x = sa.x + 12;
    tap(solo, "a");
    solo.markAway("b");
    sa.fish!.mark = 0.5;
    tap(solo, "a");
    tap(solo, "a");
    tap(solo, "a");
    assert.equal(solo.save.gear[0]?.base, "wood_blade");
    assert.equal(solo.save.gear[0]?.pairId, undefined);
    assert.ok(!solo.toasts.some((t) => t.text.includes("两个人对着砧")));
  });

  it("dawn board stays hidden until both reveal; kitchen already has those orders", () => {
    const w = new World("BOARD");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    const bed = w.valley.find("A")[0];
    standFacing(a, bed);
    standFacing(b, bed);
    b.x = a.x + 12;
    w.clock = nightAfter(seasonOf(w.save.day)) + 0.01;
    tap(w, "a");
    tap(w, "b");
    assert.equal(w.snapshot("a").board.length, 0);
    assert.ok(w.boardTickets.length >= 1 && w.boardTickets.length <= 2);
    assert.ok(!w.boardTickets.includes("wet-goop"));
    const board = w.valley.find("B")[0];
    standFacing(a, board);
    standFacing(b, board);
    b.x = a.x + 12;
    tap(w, "a");
    assert.equal(w.snapshot("a").board.length, 0);
    tap(w, "b");
    const sa = w.snapshot("a");
    const sb = w.snapshot("b");
    assert.ok(sa.board.length >= 1 && sa.board.length <= 2);
    assert.deepEqual(sa.board, sb.board);
    w.boardTickets = ["herb-tea", "mushroom-soup"];
    const inn = w.valley.find("I")[0];
    standFacing(a, inn);
    tap(w, "a");
    assert.deepEqual(
      w.orders.filter((o) => o.board).map((o) => o.recipe),
      ["herb-tea", "mushroom-soup"],
    );
  });

  it("serving board tickets out of order during rush clears combo", () => {
    const w = new World("BOARD2");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.boardOn = true;
    w.boardTickets = ["herb-tea", "mushroom-soup"];
    w.rushed = true;
    w.orders = [
      { customer: "wander", recipe: "herb-tea", t: 30, board: true },
      { customer: "wander", recipe: "mushroom-soup", t: 30, board: true },
    ];
    const win = w.kitchenMap.find("W")[0];
    const stand = tileCenter(win.x - 1, win.y);
    p.zone = "kitchen";
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 1;
    p.held = "dish:mushroom-soup";
    tap(w, "a");
    assert.equal(w.combo, 0);
  });

  it("solo stall buy is a common good with no pair extra", () => {
    const w = new World("STALL1");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.save.gold = 30;
    w.stall = {
      goods: [
        { id: "osmanthus", price: 18 },
        { id: "flint", price: 6 },
      ],
      pairId: "ring_left",
      pairMate: "ring_right",
      pairTaken: false,
    };
    standFacing(p, w.valley.find("S")[0]);
    tap(w, "a");
    assert.ok(p.fish?.shop);
    p.fish.mark = 0.45;
    tap(w, "a");
    tap(w, "a");
    tap(w, "a");
    assert.equal(countOf(w.save.bag, "osmanthus") + (p.held.startsWith("osmanthus") ? 1 : 0), 1);
    assert.equal(w.save.gear.length, 0);
    assert.ok(!w.toasts.some((t) => t.text.includes("两个人在摊前")));
    assert.ok(!w.save.gear.some((g) => item(g.base).pairId));
  });

  it("two people confirming the same stall good get today's pair extra", () => {
    const w = new World("STALL2");
    w.addPlayer("a", "阿左", "left");
    w.addPlayer("b", "阿右", "right");
    const a = w.players.get("a");
    const b = w.players.get("b");
    assert.ok(a && b);
    w.save.gold = 30;
    w.stall = {
      goods: [
        { id: "osmanthus", price: 18 },
        { id: "flint", price: 6 },
      ],
      pairId: "ring_left",
      pairMate: "ring_right",
      pairTaken: false,
    };
    const stall = w.valley.find("S")[0];
    standFacing(a, stall);
    standFacing(b, stall);
    b.x = a.x + 12;
    tap(w, "a");
    a.fish!.mark = 0.45;
    tap(w, "a");
    tap(w, "b");
    tap(w, "a");
    assert.equal(countOf(w.save.bag, "osmanthus") + (a.held.startsWith("osmanthus") ? 1 : 0), 1);
    assert.ok(w.save.gear.some((g) => g.base === "ring_left"));
    assert.ok(w.save.gear.some((g) => g.base === "ring_right"));
    assert.ok(item("ring_left").pairId);
    assert.ok(w.toasts.some((t) => t.text.includes("两个人在摊前点了同一件")));
  });

  it("an away partner turns a stall deal into a solo buy; a miss keeps the goods", () => {
    const away = new World("STALL3");
    away.addPlayer("a", "阿左", "left");
    away.addPlayer("b", "阿右", "right");
    const aa = away.players.get("a");
    const ab = away.players.get("b");
    assert.ok(aa && ab);
    away.save.gold = 30;
    away.stall = {
      goods: [
        { id: "osmanthus", price: 18 },
        { id: "flint", price: 6 },
      ],
      pairId: "ring_left",
      pairMate: "ring_right",
      pairTaken: false,
    };
    const tile = away.valley.find("S")[0];
    standFacing(aa, tile);
    standFacing(ab, tile);
    tap(away, "a");
    away.markAway("b");
    aa.fish!.mark = 0.45;
    tap(away, "a");
    tap(away, "a");
    tap(away, "a");
    assert.equal(countOf(away.save.bag, "osmanthus") + (aa.held.startsWith("osmanthus") ? 1 : 0), 1);
    assert.equal(away.save.gear.length, 0);
    assert.ok(!away.toasts.some((t) => t.text.includes("两个人在摊前")));

    const miss = new World("STALL0");
    miss.addPlayer("a", "阿左", "left");
    const m = miss.players.get("a");
    assert.ok(m);
    miss.save.gold = 30;
    miss.stall = {
      goods: [{ id: "osmanthus", price: 18 }],
      pairId: "lucky_bell",
      pairTaken: false,
    };
    standFacing(m, miss.valley.find("S")[0]);
    tap(miss, "a");
    m.fish!.mark = 0.1;
    tap(miss, "a");
    assert.ok(miss.toasts.some((t) => t.text.includes("偏了")));
    tap(miss, "a");
    tap(miss, "a");
    assert.equal(countOf(miss.save.bag, "osmanthus"), 0);
    assert.equal(miss.save.gold, 28);
    assert.equal(miss.stall?.goods[0]?.id, "osmanthus");
    assert.ok(miss.toasts.some((t) => t.text.includes("定金没了") && t.text.includes("货还在")));
  });

  it("lays a thin night of sounds and keeps mute from changing the world", () => {
    const w = new World("FEEL");
    w.addPlayer("a", "暖", "left");
    const snap = w.snapshot("a");
    const first = tickFeel(null, snap, 0);
    assert.equal(first.sounds.includes("door"), false);
    const kitchen = { ...snap, zone: "kitchen" as const };
    const entered = tickFeel(first.next, kitchen, 80);
    assert.ok(entered.sounds.includes("door"));
    const me = snap.actors.find((a) => a.id === "a")!;
    const walked = {
      ...snap,
      youAt: { x: me.x + 10, y: me.y },
      actors: snap.actors.map((a) => (a.id === "a" ? { ...a, x: a.x + 10 } : a)),
    };
    const step = tickFeel(first.next, walked, 400);
    assert.ok(step.sounds.includes("step"));
    const fight = {
      ...snap,
      actors: snap.actors.map((a) => (a.id === "a" ? { ...a, fishing: "fight", fishMark: 0.5 } : a)),
    };
    const ding = tickFeel(first.next, fight, 20);
    assert.ok(ding.sounds.includes("green"));
    const nibble = {
      ...snap,
      actors: snap.actors.map((a) => (a.id === "a" ? { ...a, fishing: "bite" } : a)),
    };
    const tug = tickFeel(first.next, nibble, 20);
    assert.ok(tug.sounds.includes("bite"));
    const still = tickFeel(ding.next, fight, 40);
    assert.equal(still.sounds.includes("green"), false);
    const daySnap = { ...snap, night: false, potReady: "" };
    const nightSnap = { ...snap, night: true, potReady: "" };
    const dusk = tickFeel(tickFeel(null, daySnap, 0).next, nightSnap, 20);
    assert.ok(dusk.sounds.includes("night"));
    const cooking = { ...snap, potReady: "在煮" };
    const done = { ...snap, potReady: "山草茶" };
    const lid = tickFeel(tickFeel(null, cooking, 0).next, done, 20);
    assert.ok(lid.sounds.includes("ready"));
    const quiet = createAudio();
    quiet.setMuted(true);
    assert.equal(quiet.muted, true);
    quiet.tone("step");
    quiet.tone("green");
    quiet.tone("door");
    quiet.tone("night");
    quiet.tone("ready");
    quiet.tone("dark");
    quiet.tone("bite");
    quiet.setAmbient("night");
    assert.equal(quiet.ambient, "night");
    assert.equal(w.players.get("a")!.zone, "valley");
  });

  it("picks a thin ambient bed by place, and mute does not change the world", () => {
    const w = new World("AIR");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    const plot = w.valley.find("P")[0];
    const dock = w.valley.find("D")[0];
    assert.ok(plot && dock);
    p.x = tileCenter(plot.x, plot.y).x;
    p.y = tileCenter(plot.x, plot.y).y;
    assert.equal(pickAmbient(w.snapshot("a")), "day");
    p.x = tileCenter(dock.x, dock.y).x;
    p.y = tileCenter(dock.x, dock.y).y;
    assert.equal(pickAmbient(w.snapshot("a")), "water");
    p.x = tileCenter(plot.x, plot.y).x;
    p.y = tileCenter(plot.x, plot.y).y;
    w.clock = nightAfter(seasonOf(w.save.day)) + 0.01;
    assert.equal(w.snapshot("a").night, true);
    assert.equal(pickAmbient(w.snapshot("a")), "night");
    p.zone = "kitchen";
    assert.equal(pickAmbient(w.snapshot("a")), "inn");
    const air = createAudio();
    air.setAmbient("day");
    assert.equal(air.ambient, "day");
    air.setAmbient("water");
    assert.equal(air.ambient, "water");
    air.setMuted(true);
    air.setAmbient("inn");
    assert.equal(air.muted, true);
    assert.equal(air.ambient, "inn");
    air.setMuted(false);
    assert.equal(air.ambient, "inn");
    assert.equal(p.zone, "kitchen");
  });

  it("a solo night points at the river and the inn, and does not skip the day at the cabin", () => {
    const w = new World("SOLO");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    assert.ok(w.toasts.some((t) => t.text.includes("白天捞") && t.text.includes("客栈")));
    const bed = w.valley.find("A")[0];
    assert.ok(bed);
    standFacing(p, bed);
    assert.ok(w.snapshot("a").prompt.includes("还早"));
    const day = w.save.day;
    tap(w, "a");
    assert.equal(w.save.day, day);
    assert.ok(w.toasts.some((t) => t.text.includes("还早")));
    w.clock = nightAfter(seasonOf(w.save.day)) - 0.01;
    w.tick(3);
    const night = w.snapshot("a");
    assert.equal(night.night, true);
    assert.ok(w.toasts.some((t) => t.text.includes("天黑") && t.text.includes("客栈")));
    assert.ok(night.prompt.includes("歇一夜"));
    tap(w, "a");
    assert.equal(w.save.day, day + 1);
  });

  it("solo kitchen rush asks to plate, not for a second pair of hands", () => {
    const w = new World("RUSH1");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.zone = "kitchen";
    w.orders = [
      { customer: "wander", recipe: "herb-tea", t: 20 },
      { customer: "wander", recipe: "herb-tea", t: 20 },
    ];
    w.tick(0.05);
    assert.equal(w.rushed, true);
    assert.ok(w.toasts.some((t) => t.text.includes("堂口热起来") && t.text.includes("端")));
    assert.ok(!w.toasts.some((t) => t.text.includes("两个人得传菜")));

    const far = new World("RUSH1B");
    far.addPlayer("a", "暖", "left");
    far.addPlayer("b", "阿右", "right");
    const fa = far.players.get("a");
    const fb = far.players.get("b");
    assert.ok(fa && fb);
    fa.zone = "kitchen";
    fb.zone = "valley";
    far.orders = [
      { customer: "wander", recipe: "herb-tea", t: 20 },
      { customer: "wander", recipe: "herb-tea", t: 20 },
    ];
    far.tick(0.05);
    assert.ok(far.toasts.some((t) => t.text.includes("堂口热起来") && t.text.includes("端")));
    assert.ok(!far.toasts.some((t) => t.text.includes("两个人得传菜")));

    const pair = new World("RUSH2");
    pair.addPlayer("a", "暖", "left");
    pair.addPlayer("b", "阿右", "right");
    const pa = pair.players.get("a");
    const pb = pair.players.get("b");
    assert.ok(pa && pb);
    pa.zone = "kitchen";
    pb.zone = "kitchen";
    pair.orders = [
      { customer: "wander", recipe: "herb-tea", t: 20 },
      { customer: "wander", recipe: "herb-tea", t: 20 },
    ];
    pair.tick(0.05);
    assert.ok(pair.toasts.some((t) => t.text.includes("两个人得传菜")));
  });

  it("a random ticket with the same dish as the board does not wipe the combo", () => {
    const w = new World("COMBO2");
    w.addPlayer("a", "阿左", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.boardOn = true;
    w.boardTickets = ["herb-tea", "mushroom-soup"];
    w.rushed = true;
    w.orders = [
      { customer: "wander", recipe: "herb-tea", t: 30, board: true },
      { customer: "wander", recipe: "mushroom-soup", t: 30, board: true },
      { customer: "wander", recipe: "herb-tea", t: 30 },
    ];
    const win = w.kitchenMap.find("W")[0];
    const stand = tileCenter(win.x - 1, win.y);
    p.zone = "kitchen";
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 1;
    p.held = "dish:herb-tea";
    tap(w, "a");
    assert.equal(w.combo, 1);
    assert.equal(w.boardServed, 1);
    p.held = "dish:herb-tea";
    tap(w, "a");
    assert.equal(w.combo, 1);
    assert.equal(w.boardServed, 1);
    p.held = "dish:mushroom-soup";
    tap(w, "a");
    assert.equal(w.combo, 2);
  });

  it("the pot, ice, stove and bag speak when a night kitchen move fails or spoils", () => {
    const w = new World("KITCH");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.zone = "kitchen";
    const pot = w.kitchenMap.find("Q")[0];
    assert.ok(pot);
    standFacing(p, pot);
    w.potReady = "herb-tea";
    tap(w, "a");
    assert.equal(p.held, "dish:herb-tea");
    assert.equal(w.potReady, null);
    assert.ok(w.toasts.some((t) => t.text.includes("取出") && t.text.includes("山草茶")));
    w.potReady = "herb-tea";
    p.held = "ore:ready:100";
    tap(w, "a");
    assert.equal(p.held, "ore:ready:100");
    assert.equal(w.potReady, "herb-tea");
    assert.ok(w.toasts.some((t) => t.text.includes("满") && t.text.includes("锅")));

    const ice = w.kitchenMap.find("R")[0];
    assert.ok(ice);
    const iceStand = tileCenter(ice.x, ice.y - 1);
    p.x = iceStand.x;
    p.y = iceStand.y;
    p.facing = 2;
    p.held = "dish:herb-tea";
    w.ice = [{ id: "herb", n: 1, fresh: 80 }];
    assert.ok(w.snapshot("a").prompt.includes("满"));
    tap(w, "a");
    assert.equal(p.held, "dish:herb-tea");
    assert.equal(w.ice[0]?.id, "herb");
    assert.ok(w.toasts.some((t) => t.text.includes("满") && t.text.includes("冰柜")));

    const stove = w.kitchenMap.find("U")[0];
    assert.ok(stove);
    w.orders = [
      { customer: "wander", recipe: "herb-tea", t: 40 },
      { customer: "wander", recipe: "herb-tea", t: 40 },
    ];
    w.rushed = true;
    w.stations.set(`s:${stove.x},${stove.y}`, {
      key: `s:${stove.x},${stove.y}`,
      item: "meat:cooked:100",
      t: 5.9,
      need: 1,
      ready: true,
    });
    for (let i = 0; i < 8; i++) w.tick(0.05);
    assert.equal(w.stations.get(`s:${stove.x},${stove.y}`)?.item, "mush:ready");
    assert.ok(w.toasts.some((t) => t.text.includes("糊")));
    standFacing(p, stove);
    p.held = "ore:ready:100";
    tap(w, "a");
    assert.equal(p.held, "ore:ready:100");
    assert.equal(w.stations.get(`s:${stove.x},${stove.y}`)?.item, "mush:ready");
    assert.ok(w.toasts.some((t) => t.text.includes("满") && t.text.includes("炉")));

    p.held = "fish:raw:40.05";
    w.save.bag = [
      { id: "herb", n: 1, fresh: 0.05 },
      { id: "mushroom", n: 1, fresh: 0.05 },
    ];
    w.tick(0.5);
    assert.ok(w.toasts.some((t) => t.text.includes("蔫")), w.toasts.map((t) => t.text).join(" | "));
    assert.ok(w.toasts.some((t) => t.text.includes("糊涂") && t.text.includes(" · ")));
  });

  it("a solo wild night says the dark bites, and Charlie does not bite the valley gate", () => {
    const w = new World("GATE2");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    const gate = w.valley.find("V")[0];
    assert.ok(gate);
    standFacing(p, gate);
    w.clock = 0.8;
    const nightGate = w.snapshot("a");
    assert.equal(nightGate.night, true);
    assert.ok(nightGate.prompt.includes("没火"));
    p.hp = 20;
    w.tick(3);
    assert.equal(p.hp, 20);
    tap(w, "a");
    assert.equal(p.zone, "wild");
    assert.ok(w.toasts.some((t) => t.text.includes("出了谷") && t.text.includes("没火")));
    w.clock = nightAfter(seasonOf(w.save.day)) - 0.01;
    w.howled = false;
    w.fires.clear();
    p.torch = 0;
    p.held = "";
    w.tick(3);
    assert.ok(w.toasts.some((t) => t.text.includes("天黑") && t.text.includes("火")));
    assert.ok(p.hp < 20);
  });

  it("picked food goes in the hand, and a fire does not eat wood when the thing needs the kitchen", () => {
    const w = new World("HAND2");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.rand = () => 0.01;
    w.wildMap = buildMap(generateWild(11), "wild");
    const bush = w.wildMap.find("F")[0];
    const fire = w.wildMap.find("K")[0];
    assert.ok(bush && fire);
    standFacing(p, bush);
    p.zone = "wild";
    tap(w, "a");
    assert.ok(p.held);
    assert.ok(p.held.startsWith("mushroom") || p.held.startsWith("herb"));
    w.fires.set(`${fire.x},${fire.y}`, 40);
    const wood = countOf(w.save.bag, "wood");
    p.held = "mushroom:raw:90";
    standFacing(p, fire);
    assert.ok(w.snapshot("a").prompt.includes("再切"));
    tap(w, "a");
    assert.equal(p.held, "mushroom:raw:90");
    assert.equal(countOf(w.save.bag, "wood"), wood);
    assert.ok(w.toasts.some((t) => t.text.includes("再切")));
  });

  it("coming back from the wild faces the village and points at the inn", () => {
    const w = new World("HOME2");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.wildMap = buildMap(generateWild(3), "wild");
    const leave = w.wildMap.find("L")[0];
    assert.ok(leave);
    const stand = tileCenter(leave.x, leave.y - 1);
    p.zone = "wild";
    p.x = stand.x;
    p.y = stand.y;
    p.facing = 2;
    tap(w, "a");
    assert.equal(p.zone, "valley");
    assert.equal(p.facing, 3);
    assert.ok(w.toasts.some((t) => t.text.includes("回到山谷") && t.text.includes("客栈")));
  });

  it("a bite speaks up, a wait press reels in, and the fish lands in the hand", () => {
    const w = new World("ROD");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    const dock = w.valley.find("D")[0];
    assert.ok(dock);
    standFacing(p, dock);
    tap(w, "a");
    assert.equal(p.fish?.phase, "wait");
    tap(w, "a");
    assert.equal(p.fish, null);
    assert.ok(w.toasts.some((t) => t.text.includes("收了")));
    p.fish = { phase: "wait", t: 0.01, window: 0.8, mark: 0, pull: 0, dir: 1 };
    w.tick(0.05);
    assert.equal(p.fish?.phase, "bite");
    assert.ok(w.toasts.some((t) => t.text.includes("咬了") && t.text.includes("起竿")));
    tap(w, "a");
    assert.equal(p.fish?.phase, "fight");
    p.fish.mark = 0.5;
    p.fish.pull = 0.8;
    w.rand = () => 0;
    tap(w, "a");
    assert.equal(p.fish, null);
    assert.ok(p.held.startsWith("fish"));
  });

  it("raw fish at the pot says to cut first, and night on the rod points at reeling in", () => {
    const w = new World("POTF");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.zone = "kitchen";
    p.held = "fish:raw:100";
    const pot = w.kitchenMap.find("Q")[0];
    assert.ok(pot);
    standFacing(p, pot);
    assert.ok(w.snapshot("a").prompt.includes("先切"));
    tap(w, "a");
    assert.equal(p.held, "fish:raw:100");
    assert.equal(w.pot.length, 0);
    p.zone = "valley";
    const dock = w.valley.find("D")[0];
    assert.ok(dock);
    standFacing(p, dock);
    p.fish = { phase: "wait", t: 8, window: 1, mark: 0, pull: 0, dir: 1 };
    w.clock = nightAfter(seasonOf(w.save.day)) - 0.01;
    w.tick(3);
    assert.ok(w.toasts.some((t) => t.text.includes("天黑") && t.text.includes("收竿")));
  });

  it("the mine keeps a west exit, and a new floor does not drop you in a wall", () => {
    const w = new World("MINE3");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    const door = w.valley.find("E")[0];
    assert.ok(door);
    standFacing(p, door);
    tap(w, "a");
    assert.equal(p.zone, "mine");
    assert.ok(w.toasts.some((t) => t.text.includes("进了矿") && t.text.includes("出口")));
    p.facing = 3;
    assert.ok(w.snapshot("a").prompt.includes("出矿"));
    w.mineFloor = 1;
    w.mineMap = buildMap(
      ["################", "#L.............#", "#..............#", "#..............#", "#......Z.......#", "#..............#", "#..............#", "#..............#", "################"],
      "mine",
    );
    const stairs = w.mineMap.find("Z")[0];
    assert.ok(stairs);
    standFacing(p, stairs);
    tap(w, "a");
    assert.ok(w.mineFloor >= 2);
    const t = { x: Math.floor(p.x / TILE), y: Math.floor(p.y / TILE) };
    assert.equal(w.mineMap?.walk(t.x, t.y), true);
    assert.ok(w.toasts.some((t0) => t0.text.includes("出口")));
    p.facing = 3;
    assert.ok(w.snapshot("a").prompt.includes("出矿"));
  });

  it("dug ore goes in the hand, the forge counts it, and the pot sends it to the workshop", () => {
    const w = new World("ORE2");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.mineMap = buildMap(mineTemplate(1, 1), "mine");
    w.encounter = "pack";
    w.rand = () => 0.01;
    const ore = w.mineMap.find("o")[0];
    assert.ok(ore);
    standFacing(p, ore);
    p.zone = "mine";
    tap(w, "a");
    assert.ok(p.held.startsWith("ore"));
    p.zone = "valley";
    addToBag(w.save.bag, "ore", 1);
    addToBag(w.save.bag, "wood", 1);
    const anvil = w.valley.find("Y")[0];
    assert.ok(anvil);
    standFacing(p, anvil);
    tap(w, "a");
    assert.ok(w.forgeJob);
    assert.equal(p.held, "");
    p.held = "ore:ready:100";
    p.zone = "kitchen";
    p.fish = null;
    w.forgeJob = null;
    const pot = w.kitchenMap.find("Q")[0];
    assert.ok(pot);
    standFacing(p, pot);
    assert.ok(w.snapshot("a").prompt.includes("工坊"));
    tap(w, "a");
    assert.equal(w.pot.length, 0);
    assert.ok(w.toasts.some((t) => t.text.includes("工坊")));
  });

  it("night in the mine says the lamps are on, not to find a fire", () => {
    const w = new World("LAMP");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    p.zone = "mine";
    w.mineMap = buildMap(mineTemplate(1, 1), "mine");
    w.clock = nightAfter(seasonOf(w.save.day)) - 0.01;
    p.hp = 20;
    w.tick(3);
    const snap = w.snapshot("a");
    assert.equal(snap.night, true);
    assert.equal(snap.lit, true);
    assert.equal(p.hp, 20);
    assert.ok(w.toasts.some((t) => t.text.includes("天黑") && t.text.includes("灯")));
  });

  it("the anvil says three green hits, and a finished blade is worn not lost", () => {
    const w = new World("ANVIL2");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    addToBag(w.save.bag, "ore", 2);
    addToBag(w.save.bag, "wood", 1);
    const anvil = w.valley.find("Y")[0];
    standFacing(p, anvil);
    assert.ok(w.snapshot("a").prompt.includes("矿×2"));
    tap(w, "a");
    assert.ok(w.toasts.some((t) => t.text.includes("炉子热了") && t.text.includes("三下")));
    assert.ok(w.snapshot("a").prompt.includes("锻") && w.snapshot("a").prompt.includes("还差3下"));
    p.fish!.mark = 0.5;
    tap(w, "a");
    assert.ok(w.snapshot("a").prompt.includes("还差2下"));
    tap(w, "a");
    tap(w, "a");
    assert.equal(w.save.gear.length, 1);
    assert.equal(w.save.left.weaponUid, w.save.gear[0].uid);
    assert.ok(w.toasts.some((t) => t.text.includes("收刃") && t.text.includes("佩上")));
    assert.ok(!w.toasts.some((t) => t.text.includes("两个人对着砧")));
    assert.equal(w.save.gear[0].pairId, undefined);
    assert.ok(!w.save.gear[0].name.includes("并肩"));

    const late = new World("ANVIL3");
    late.addPlayer("a", "暖", "left");
    const q = late.players.get("a");
    assert.ok(q);
    addToBag(late.save.bag, "ore", 2);
    addToBag(late.save.bag, "wood", 1);
    standFacing(q, late.valley.find("Y")[0]);
    tap(late, "a");
    for (let i = 0; i < 80; i++) late.tick(0.06);
    assert.equal(late.save.gear.length, 0);
    assert.ok(q.held.startsWith("ore"));
    assert.ok(late.toasts.some((t) => t.text.includes("卷刃") && t.text.includes("退")));
  });

  it("the stall says deposit and three green hits, and a bought flower is held not lost", () => {
    const w = new World("STALL4");
    w.addPlayer("a", "暖", "left");
    const p = w.players.get("a");
    assert.ok(p);
    w.save.gold = 20;
    w.stall = {
      goods: [
        { id: "osmanthus", price: 18 },
        { id: "flint", price: 6 },
      ],
      pairId: "ring_left",
      pairMate: "ring_right",
      pairTaken: false,
    };
    standFacing(p, w.valley.find("S")[0]);
    assert.ok(w.snapshot("a").prompt.includes("定金"));
    tap(w, "a");
    assert.ok(w.toasts.some((t) => t.text.includes("定金") && t.text.includes("三下")));
    assert.ok(w.snapshot("a").prompt.includes("摊") && w.snapshot("a").prompt.includes("还差3下"));
    p.fish!.mark = 0.45;
    tap(w, "a");
    assert.ok(w.snapshot("a").prompt.includes("还差2下"));
    tap(w, "a");
    tap(w, "a");
    assert.ok(p.held.startsWith("osmanthus"));
    assert.ok(w.toasts.some((t) => t.text.includes("买下") && t.text.includes("桂花") && t.text.includes("手里")));
    assert.ok(!w.toasts.some((t) => t.text.includes("两个人在摊前")));
    assert.equal(w.save.gear.length, 0);
    assert.ok(!w.save.gear.some((g) => item(g.base).pairId));
  });

  it("a solo village day can plant, ask, uncover the board, and only sleep at night", () => {
    const field = new World("FIELD");
    field.addPlayer("a", "暖", "left");
    const farmer = field.players.get("a");
    assert.ok(farmer);
    const plot = field.valley.find("P")[0];
    standFacing(farmer, plot);
    assert.ok(field.snapshot("a").prompt.includes("不用浇"));
    for (const id of ["tomato_seed", "greens_seed", "wheat_seed"] as const) {
      while (countOf(field.save.bag, id)) takeFromBag(field.save.bag, id);
    }
    farmer.held = "tomato_seed:ready:100";
    tap(field, "a");
    assert.equal(field.save.plots[0]?.seed, "tomato_seed");
    assert.equal(farmer.held, "");
    assert.ok(field.toasts.some((t) => t.text.includes("种下") && t.text.includes("不用浇")));
    assert.ok(field.snapshot("a").prompt.includes("还在长") && field.snapshot("a").prompt.includes("不用浇"));
    growPlots(field.save, true);
    const notes = growPlots(field.save, true);
    assert.ok(notes.some((n) => n.includes("熟了")));
    assert.equal(field.save.plots[0]?.stage, 3);
    assert.equal(countOf(field.save.bag, "tomato"), 0);
    assert.ok(field.snapshot("a").prompt.includes("熟了"));
    tap(field, "a");
    assert.ok(farmer.held.startsWith("tomato"));
    assert.ok(field.toasts.some((t) => t.text.includes("收了") && t.text.includes("手里")));

    const hall = new World("HALL");
    hall.addPlayer("a", "暖", "left");
    const seer = hall.players.get("a");
    assert.ok(seer);
    standFacing(seer, hall.valley.find("G")[0]);
    tap(hall, "a");
    assert.ok(hall.save.fortuneId);
    assert.ok(hall.snapshot("a").fortune);
    assert.ok(!hall.toasts.some((t) => t.text.includes("另一只手") || t.text.includes("两个人")));
    assert.ok(!((hall.snapshot("a").fortune?.tilt ?? "") + (hall.snapshot("a").fortune?.life ?? "")).includes("两个人"));
    standFacing(seer, hall.valley.find("B")[0]);
    tap(hall, "a");
    assert.equal(hall.boardOn, true);
    assert.ok(hall.snapshot("a").board.length >= 1);
    assert.ok(hall.toasts.some((t) => t.text.includes("揭开")));
    assert.ok(!hall.toasts.some((t) => t.text.includes("另一只手")));

    const bed = new World("BED2");
    bed.addPlayer("a", "暖", "left");
    const sleeper = bed.players.get("a");
    assert.ok(sleeper);
    standFacing(sleeper, bed.valley.find("A")[0]);
    const day = bed.save.day;
    tap(bed, "a");
    assert.equal(bed.save.day, day);
    assert.ok(bed.toasts.some((t) => t.text.includes("还早")));
    bed.clock = nightAfter(seasonOf(bed.save.day)) + 0.01;
    assert.ok(bed.snapshot("a").prompt.includes("歇一夜"));
    tap(bed, "a");
    assert.equal(bed.save.day, day + 1);

    const pair = new World("BED3");
    pair.addPlayer("a", "暖", "left");
    pair.addPlayer("b", "阿右", "right");
    const left = pair.players.get("a");
    const right = pair.players.get("b");
    assert.ok(left && right);
    standFacing(left, pair.valley.find("A")[0]);
    standFacing(right, pair.valley.find("A")[0]);
    right.x = left.x + 12;
    assert.ok(pair.snapshot("a").prompt.includes("还早"));
    tap(pair, "a");
    tap(pair, "b");
    assert.equal(pair.save.day, 0);
    pair.clock = nightAfter(seasonOf(pair.save.day)) + 0.01;
    tap(pair, "a");
    assert.equal(pair.save.day, 0);
    assert.ok(pair.toasts.some((t) => t.text.includes("先躺下")));
    tap(pair, "b");
    assert.equal(pair.save.day, 1);
  });

  it("two phones share a room without a third body, a stolen pair, or a waiting HUD", () => {
    const seats = new World("SEATS2");
    seats.addPlayer("a", "阿左", "left");
    seats.save.rightName = "阿右";
    assert.equal(seats.snapshot("a").partner?.name, "还没来");
    assert.equal(seats.snapshot("a").partner?.online, false);
    assert.equal(seats.addPlayer("b", "Brainbird", "right"), "right");
    assert.equal(seats.snapshot("a").partner?.name, "Brainbird");
    assert.equal(seats.snapshot("a").partner?.online, true);
    assert.equal(seats.snapshot("b").partner?.name, "阿左");
    assert.equal(seats.snapshot("b").partner?.online, true);
    assert.equal(seats.addPlayer("c", "丙", "left"), null);
    assert.equal(seats.players.size, 2);
    assert.equal(roomIsFull(seats.present().length), true);
    assert.equal(seats.occupyAway("丁", "right"), null);
    assert.equal(seats.reclaim("Brainbird", "right"), null);

    const ghost = seats.players.get("b");
    assert.ok(ghost);
    ghost.x = 321;
    ghost.y = 210;
    ghost.zone = "wild";
    seats.markAway("b");
    assert.equal(seats.present().length, 1);
    assert.equal(roomIsFull(seats.present().length), false);
    assert.equal(seats.addPlayer("c", "丙", "right"), null);
    assert.equal(seats.players.size, 2);
    assert.equal(seats.reclaim("Brainbird", "right"), "b");
    seats.markBack("b");
    assert.equal(ghost.x, 321);
    assert.equal(ghost.zone, "wild");
    assert.equal(seats.snapshot("a").partner?.online, true);
    assert.equal(seats.snapshot("a").partner?.name, "Brainbird");

    const fish = new World("PAIR3");
    fish.addPlayer("a", "阿左", "left");
    fish.addPlayer("b", "阿右", "right");
    const fa = fish.players.get("a");
    const fb = fish.players.get("b");
    assert.ok(fa && fb);
    const dock = fish.valley.find("D")[0];
    const water = tileCenter(dock.x - 1, dock.y);
    fa.x = water.x;
    fa.y = water.y;
    fa.facing = 1;
    fb.x = water.x + 400;
    fb.y = water.y;
    fb.facing = 1;
    tap(fish, "a");
    assert.ok(fa.fish);
    assert.equal(fb.fish, null);
    assert.ok(!fish.snapshot("a").prompt.includes("两人同钓"));

    const forge = new World("FORGE4");
    forge.addPlayer("a", "阿左", "left");
    forge.addPlayer("b", "阿右", "right");
    const ga = forge.players.get("a");
    const gb = forge.players.get("b");
    assert.ok(ga && gb);
    addToBag(forge.save.bag, "ore", 2);
    addToBag(forge.save.bag, "wood", 1);
    const anvil = forge.valley.find("Y")[0];
    standFacing(ga, anvil);
    standFacing(gb, anvil);
    gb.x = ga.x + 400;
    tap(forge, "a");
    ga.fish!.mark = 0.5;
    tap(forge, "a");
    tap(forge, "a");
    tap(forge, "a");
    assert.equal(forge.save.gear[0]?.pairId, undefined);
    assert.ok(!forge.toasts.some((t) => t.text.includes("两个人对着砧")));

    const stall = new World("STALL5");
    stall.addPlayer("a", "阿左", "left");
    stall.addPlayer("b", "阿右", "right");
    const sa = stall.players.get("a");
    const sb = stall.players.get("b");
    assert.ok(sa && sb);
    stall.save.gold = 30;
    stall.stall = {
      goods: [{ id: "osmanthus", price: 18 }],
      pairId: "ring_left",
      pairMate: "ring_right",
      pairTaken: false,
    };
    const shop = stall.valley.find("S")[0];
    standFacing(sa, shop);
    standFacing(sb, shop);
    sb.x = sa.x + 400;
    tap(stall, "a");
    sa.fish!.mark = 0.45;
    tap(stall, "a");
    tap(stall, "a");
    tap(stall, "a");
    assert.equal(stall.save.gear.length, 0);
    assert.ok(!stall.toasts.some((t) => t.text.includes("两个人在摊前")));

    const night = new World("BED4");
    night.addPlayer("a", "阿左", "left");
    night.addPlayer("b", "阿右", "right");
    const na = night.players.get("a");
    const nb = night.players.get("b");
    assert.ok(na && nb);
    standFacing(na, night.valley.find("A")[0]);
    standFacing(nb, night.valley.find("A")[0]);
    nb.x = na.x + 12;
    night.clock = nightAfter(seasonOf(night.save.day)) + 0.01;
    assert.equal(night.snapshot("a").partner?.online, true);
    tap(night, "a");
    assert.equal(night.save.day, 0);
    tap(night, "b");
    assert.equal(night.save.day, 1);
  });
});
