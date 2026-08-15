import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VALLEY } from "../world/maps";
import { cellFill, drawActor, drawCell, drawPlot, plotIndex, shade, tileLook } from "./draw";
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
    fillText() {},
    strokeRect() {},
    createRadialGradient() {
      return { addColorStop() {} };
    },
    createLinearGradient() {
      return { addColorStop() {} };
    },
    measureText(t: string) {
      return { width: t.length * 8 };
    },
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
    assert.ok(g.rects.length >= 6);
    assert.ok(g.fills.some((c) => c.includes("5a3a22") || c.includes("3a2414")));
    assert.ok(g.fills.some((c) => c.includes("2a4a28") || c.includes("3f6d4a")));
  });

  it("draws moving water as more than a flat pool", () => {
    const g = mockCtx();
    drawCell(g, "~", 0, 0, "#2a4454", 800, "valley");
    assert.ok(g.rects.length >= 5);
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
    assert.ok(g.rects.length >= 6);
  });

  it("draws crop stages on a plot", () => {
    const g = mockCtx();
    drawPlot(g, 0, 0, 3, "柿子");
    assert.ok(g.rects.length >= 4);
  });
});
