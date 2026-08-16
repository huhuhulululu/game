import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VALLEY } from "../world/maps";
import { blit, blitFit, blitPatch, blitStand, blitWrap } from "./art";
import {
  cellFill,
  chimneyMouth,
  dockSheet,
  doorIsOpen,
  doorPaint,
  drawActor,
  drawAtlas,
  drawCell,
  drawHouseCluster,
  drawMeadow,
  drawPlot,
  houseClusters,
  isTallLook,
  fillClusters,
  plotClusters,
  plotIndex,
  setLookSeason,
  shade,
  tileLook,
  treeVariant,
  viewScale,
} from "./draw";
import type { ActorSnap } from "../sim/net";
import { itemMark, markSvg, slipHtml } from "../ui/marks";

function mockCtx() {
  const fills: string[] = [];
  const rects: number[][] = [];
  const ctx = {
    fills,
    rects,
    imageSmoothingEnabled: true,
    fillStyle: "",
    strokeStyle: "",
    font: "",
    textAlign: "left" as CanvasTextAlign,
    lineWidth: 1,
    fillRect(x: number, y: number, w: number, h: number) {
      fills.push(String(this.fillStyle));
      rects.push([x, y, w, h]);
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() {
      fills.push(String(this.fillStyle));
    },
    stroke() {},
    arc() {},
    ellipse() {},
    quadraticCurveTo() {},
    fillText() {},
    strokeRect() {},
    lineCap: "butt" as CanvasLineCap,
    lineJoin: "miter" as CanvasLineJoin,
    createRadialGradient() {
      return { addColorStop() {} };
    },
    createLinearGradient() {
      return { addColorStop() {} };
    },
    measureText(t: string) {
      return { width: t.length * 8 };
    },
    globalAlpha: 1,
    save() {},
    restore() {},
    translate() {},
    scale() {},
    rotate() {},
    clip() {},
    roundRect() {},
    drawImage() {},
  };
  return ctx as typeof ctx & CanvasRenderingContext2D;
}

describe("look", () => {
  it("bag marks are drawn things, not one gold square", () => {
    assert.equal(itemMark("herb"), "leaf");
    assert.equal(itemMark("fish_heavy"), "fish");
    assert.equal(itemMark("ore"), "stone");
    assert.equal(itemMark("tomato_seed"), "seed");
    assert.equal(itemMark("wood_blade"), "wood");
    assert.equal(itemMark("torch"), "flame");
    const svg = markSvg(itemMark("herb"));
    assert.ok(svg.includes("<path"));
    assert.ok(!svg.includes("rect"));
    const slip = slipHtml("leaf", "山草", "×3", "herb");
    assert.ok(slip.includes('class="slip"'));
    assert.ok(slip.includes("data-take=\"herb\""));
    assert.ok(!slip.includes("sheet-cell"));
    assert.ok(!slip.includes("sheet-grid"));
  });

  it("still paints trees, water, fire, plots, ore and houses as named things", () => {
    assert.equal(tileLook("T"), "tree");
    assert.equal(tileLook("t", "wild"), "tree");
    assert.equal(tileLook("~"), "water");
    assert.equal(tileLook("K"), "fire");
    assert.equal(tileLook("P"), "plot");
    assert.equal(tileLook("o", "mine"), "ore");
    assert.equal(tileLook("C", "valley"), "cabin");
    assert.equal(tileLook("C", "kitchen"), "cut");
    assert.equal(tileLook("U", "kitchen"), "stove");
    assert.equal(tileLook("R", "kitchen"), "icebox");
    assert.equal(tileLook("R", "wild"), "relic");
    assert.equal(tileLook("m", "wild"), "marsh");
    assert.equal(tileLook("E"), "mine-mouth");
    assert.equal(tileLook("Y"), "anvil");
    assert.equal(tileLook("A"), "lantern");
  });

  it("keeps atlas fills and shade for the live map", () => {
    assert.equal(cellFill("~", "valley"), "#2a4454");
    assert.ok(shade("#c45c26", 0.5).startsWith("rgb("));
  });

  it("still indexes valley plots in map order", () => {
    assert.ok(plotIndex(VALLEY, 12, 6) >= 0);
    assert.equal(plotIndex(VALLEY, 0, 0), -1);
  });

  it("draws a tree as layered crown and trunk, not one fillRect", () => {
    const g = mockCtx();
    drawCell(g, "T", 0, 0, "#1e2c22", 1000, "valley");
    assert.ok(g.fills.length >= 6);
    assert.ok(g.fills.some((c) => c.includes("5a3a22") || c.includes("3a2414")));
    assert.ok(g.fills.some((c) => c.includes("2a4a28") || c.includes("3f6d4a")));
  });

  it("draws moving water as more than a flat pool", () => {
    const g = mockCtx();
    drawCell(g, "~", 0, 0, "#2a4454", 800, "valley");
    assert.ok(g.rects.some((r) => r[2] >= 36));
    assert.ok(g.fills.some((c) => c.includes("1a5470") || c.includes("143e54")));
  });

  it("draws a person with a body, facing and a name plate", () => {
    const g = mockCtx();
    const a: ActorSnap = {
      id: "a",
      name: "暖",
      side: "left",
      x: 40,
      y: 40,
      zone: "valley",
      hp: 20,
      maxHp: 28,
      facing: 1,
      held: "torch",
      heldName: "火把",
      fishing: "",
      fishMark: 0,
      fishPull: 0,
      hunger: 80,
      torch: true,
      ping: 0,
    };
    drawActor(g, a, 0, 0, 0);
    assert.ok(g.fills.length >= 6);
    const yell = mockCtx();
    drawActor(yell, { ...a, ping: 1.6 }, 0, 0, 0);
    assert.ok(yell.fills.some((c) => c.includes("244,231,210")));
    const walk = mockCtx();
    drawActor(walk, { ...a, facing: 2 }, 0, 0, 400, true);
    assert.ok(walk.fills.length >= 6);
    const chop = mockCtx();
    drawActor(chop, { ...a, busy: "chop" }, 0, 0, 0);
    assert.ok(chop.fills.length >= 4);
    const sit = mockCtx();
    drawActor(sit, { ...a, busy: "sit" }, 0, 0, 0);
    assert.ok(sit.fills.length >= 4);
  });

  it("ore, stairs and lurkers still have a constructed fallback", () => {
    const ore = mockCtx();
    drawCell(ore, "o", 0, 0, "#7d8490", 0, "mine");
    assert.ok(ore.fills.length >= 3);
    const stairs = mockCtx();
    drawCell(stairs, "Z", 0, 0, "#7ec8d6", 0, "mine");
    assert.ok(stairs.fills.some((c) => c.includes("6a5a44") || c.includes("5a4a38")));
    const lurk = mockCtx();
    drawCell(lurk, "e", 0, 0, "#3a3344", 200, "mine");
    assert.ok(lurk.fills.length >= 4);
  });

  it("draws crop stages on a plot", () => {
    const g = mockCtx();
    drawPlot(g, 0, 0, 3, "柿子");
    assert.ok(g.fills.length >= 4);
  });

  it("builds shapes instead of stamping a pixel grid", () => {
    const g = mockCtx();
    drawCell(g, ".", 0, 0, "#3a4a34", 0, "valley");
    const dots = g.rects.filter((r) => r[2] <= 2 && r[3] <= 2).length;
    assert.ok(dots < 8);
  });

  it("fills a grass tile edge to edge so the grid line is gone", () => {
    const g = mockCtx();
    drawCell(g, ".", 0, 0, "#3a4a34", 0, "valley");
    assert.ok(g.rects.some((r) => r[2] >= 36 && r[3] >= 2));
  });

  it("joins valley plots into one field", () => {
    const fields = plotClusters(VALLEY);
    assert.ok(fields.some((f) => f.w === 4 && f.h === 3));
    const water = fillClusters(VALLEY, (ch) => ch === "~" || ch === "D");
    assert.ok(water.some((p) => p.w >= 8 && p.h >= 2));
  });

  it("marks trees and stalls tall so a person can walk behind them", () => {
    assert.equal(isTallLook("tree"), true);
    assert.equal(isTallLook("stall"), true);
    assert.equal(isTallLook("grass"), false);
  });

  it("joins the valley cabin and inn into one roof each", () => {
    const houses = houseClusters(VALLEY, "valley");
    const cabin = houses.find((h) => h.kind === "cabin");
    const inn = houses.find((h) => h.kind === "inn");
    assert.ok(cabin && cabin.w === 4 && cabin.h === 3);
    assert.ok(inn && inn.w === 4 && inn.h === 3);
    assert.ok(houses.some((h) => h.kind === "mine" && h.w === 2 && h.h === 2));
  });

  it("zooms the camera so a wide window does not leave a dead strip", () => {
    assert.ok(viewScale(1400, 800) > 1.6);
    assert.ok(viewScale(390, 844) > 1.1);
  });

  it("picks different crowns along a tree row", () => {
    setLookSeason("春");
    const names = [0, 36, 72, 108].map((x) => treeVariant(x, 36, false));
    assert.ok(new Set(names).size >= 2);
    assert.ok(names.some((n) => n === "tree" || n === "treeWide" || n === "treeTall"));
  });

  it("paints the atlas as paper washes instead of a cell grid", () => {
    const g = mockCtx();
    drawAtlas(g, VALLEY, "valley", 8, { x: 40, y: 40 }, null);
    assert.ok(g.fills.length >= 4);
    const tiny = g.rects.filter((r) => r[2] <= 4 && r[3] <= 4).length;
    assert.ok(tiny < 8);
    const quiet = mockCtx();
    drawAtlas(quiet, VALLEY, "valley", 8, { x: 40, y: 40 }, { x: 80, y: 80 });
    const lit = mockCtx();
    drawAtlas(lit, VALLEY, "valley", 8, { x: 40, y: 40 }, { x: 80, y: 80, ping: 1.6 });
    assert.ok(lit.fills.some((c) => c.includes("244,231,210")));
    assert.ok(!quiet.fills.some((c) => c.includes("244,231,210")));
  });

  it("does not stamp a bush on every valley wall cell", () => {
    const g = mockCtx();
    drawCell(g, "#", 0, 0, "#2a1c16", 0, "valley");
    assert.ok(!g.fills.some((c) => c.includes("5a3a22")));
    assert.ok(g.rects.filter((r) => r[2] <= 8 && r[3] >= 10).length === 0);
  });

  it("gives the two valley docks different sheets", () => {
    assert.notEqual(dockSheet(5 * 36, 10 * 36), dockSheet(12 * 36, 10 * 36));
    assert.ok(["dock", "dockB"].includes(dockSheet(5 * 36, 10 * 36)));
    assert.ok(["dock", "dockB"].includes(dockSheet(12 * 36, 10 * 36)));
  });

  it("trash, rock and the cutting board still have a constructed fallback", () => {
    const board = mockCtx();
    drawCell(board, "C", 0, 0, "#5a3224", 0, "kitchen");
    assert.ok(board.fills.length >= 2);
    const bin = mockCtx();
    drawCell(bin, "X", 0, 0, "#3a2020", 0, "kitchen");
    assert.ok(bin.fills.length >= 2);
    const stone = mockCtx();
    drawCell(stone, "b", 0, 0, "#5a5248", 0, "wild");
    assert.ok(stone.fills.length >= 2);
  });

  it("keeps cabin smoke and a door glow when the house sheet is missing", () => {
    const g = mockCtx();
    const cabin = houseClusters(VALLEY, "valley").find((h) => h.kind === "cabin");
    assert.ok(cabin);
    drawHouseCluster(g, cabin, 1000);
    assert.ok(g.fills.some((c) => c.includes("232,224,214") || c.includes("255,196,110") || c.includes("214,206,196")));
  });

  it("opens a house door only when someone is at the threshold", () => {
    const cabin = houseClusters(VALLEY, "valley").find((h) => h.kind === "cabin");
    assert.ok(cabin);
    const at = { x: cabin.doorX * 36 + 18, y: cabin.doorY * 36 + 18, zone: "valley" };
    assert.equal(doorIsOpen(cabin, [at], "valley"), true);
    assert.equal(doorIsOpen(cabin, [{ ...at, y: at.y + 120 }], "valley"), false);
    const inn = houseClusters(VALLEY, "valley").find((h) => h.kind === "inn");
    assert.ok(inn);
    assert.notEqual(chimneyMouth(cabin).x, chimneyMouth(inn).x);
    const painted = doorPaint(cabin);
    assert.ok(painted.x + painted.w / 2 < cabin.doorX * 36, "cabin door sits on the south face, left of map tile A");
    const innBox = doorPaint(inn);
    assert.ok(innBox.x + innBox.w / 2 < inn.x * 36 + (inn.w * 36) / 2, "inn door is on the left of the facade");
    assert.ok(chimneyMouth(cabin).x > cabin.x * 36 + cabin.w * 18, "cabin smoke leaves the right-hand pipe");
    assert.ok(chimneyMouth(inn).x > inn.x * 36 + inn.w * 18, "inn smoke leaves the right-hand chimney");
  });

  it("pot and pass still have a constructed fallback", () => {
    const pot = mockCtx();
    drawCell(pot, "Q", 0, 0, "#e7d3b4", 0, "kitchen");
    assert.ok(pot.fills.length >= 2);
    const window = mockCtx();
    drawCell(window, "W", 0, 0, "#f4e7d2", 0, "kitchen");
    assert.ok(window.fills.length >= 2);
  });

  it("falls back to constructed shapes when painted sheets are not loaded", () => {
    const g = mockCtx();
    assert.equal(blit(g, "tree", 0, 0, 10, 10), false);
    assert.equal(blitFit(g, "cabin", 0, 0, 144, 108), false);
    assert.equal(blitPatch(g, "grass", 0, 0, 36, 36, 3, 4), false);
    assert.equal(blitWrap(g, "grass", 0, 0, 36, 36), false);
    assert.equal(blitStand(g, "warmWalk", 0, 0, 46, 70), false);
    assert.equal(drawMeadow(g, 0, 0, 144, 108), false);
    drawCell(g, "T", 0, 0, "#1e2c22", 0, "valley");
    assert.ok(g.fills.some((c) => c.includes("5a3a22") || c.includes("2a4a28")));
  });
});
