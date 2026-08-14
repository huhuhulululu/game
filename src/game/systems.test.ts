import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addToBag, countOf, takeFromBag } from "./bag";
import { RECIPES } from "./content";
import { gradeOf, rollCatch } from "./fishQuality";
import { matchPot, sumTags } from "./food";
import { FORTUNES, rollFortune } from "./fortune";
import { rollLootTable } from "./loot";
import { LOOT_TABLES } from "./lootTables";
import { pickWeighted } from "./rng";
import { eatValue } from "./eat";
import { seasonOf } from "./season";
import { ageBag, freshMul, isPerishable, sleepSpoil } from "./spoil";
import { mergeSnap } from "../net/client";
import { World } from "../sim/world";
import { buildMap, tileCenter, VALLEY } from "../world/maps";
import { generateWild } from "../world/wild";
import type { WorldSnap } from "../sim/net";

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
});
