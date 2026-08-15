import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VALLEY } from "../world/maps";
import { blit, blitFit, blitPatch } from "./art";
import { cellFill, drawActor, drawCell, drawPlot, houseClusters, plotIndex, shade, tileLook, viewScale } from "./draw";
import type { ActorSnap } from "../sim/net";

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
    drawImage() {},
  };
  return ctx as typeof ctx & CanvasRenderingContext2D;
}

describe("look", () => {
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

  it("falls back to constructed shapes when painted sheets are not loaded", () => {
    const g = mockCtx();
    assert.equal(blit(g, "tree", 0, 0, 10, 10), false);
    assert.equal(blitFit(g, "cabin", 0, 0, 144, 108), false);
    assert.equal(blitPatch(g, "grass", 0, 0, 36, 36, 3, 4), false);
    drawCell(g, "T", 0, 0, "#1e2c22", 0, "valley");
    assert.ok(g.fills.some((c) => c.includes("5a3a22") || c.includes("2a4a28")));
  });
});
