import type { GameContext } from "../game/types";
import { connectRoom } from "../net/client";
import type { WorldSnap } from "../sim/net";
import { consume, mountStick } from "../ui/stick";
import { TILE } from "../world/maps";
import { compass } from "../world/wild";
import {
  cellFill,
  drawActor,
  drawCell,
  drawEnemy,
  drawLamp,
  drawNightVignette,
  drawPlot,
  drawSky,
  plotIndex,
  shade,
} from "./draw";
import { el } from "../ui/dom";

export function mountPlay(root: HTMLElement, ctx: GameContext): () => void {
  const scene = el("section", "scene play-scene");
  const canvas = document.createElement("canvas");
  const hud = el("div", "live-hud");
  scene.append(canvas, hud);
  root.append(scene);
  const stick = mountStick(scene, ctx.myName || "我");
  const room = ctx.roomCode;
  let snap: WorldSnap | null = null;
  let cam = { x: 0, y: 0 };
  let open: "" | "bag" | "book" | "map" = "";
  let fogSeen = new Set<number>();
  let fogVis = new Set<number>();
  let persistAt = 0;
  let lastToast = "";

  const net = connectRoom(
    room,
    ctx.myName || ctx.save.leftName || "我",
    ctx.prefer,
    (next) => {
      snap = next;
      ctx.roomCode = next.room;
      fogSeen = new Set(next.revealed);
      fogVis = new Set(next.visible);
      const top = next.toasts[0] ?? "";
      if (top && top !== lastToast) {
        lastToast = top;
        if (top.includes("钓") || top.includes("水")) ctx.audio.tone("water");
        else if (top.includes("砍") || top.includes("砸") || top.includes("挖")) ctx.audio.tone("chop");
        else if (top.includes("咬") || top.includes("倒")) ctx.audio.tone("hit");
        else if (top.includes("上了") || top.includes("出锅") || top.includes("写入")) ctx.audio.tone("serve");
        else if (top.includes("糊") || top.includes("堂口") || top.includes("烤")) ctx.audio.tone("sizzle");
        else if (top.includes("火") || top.includes("旧营") || top.includes("喊") || top.includes("躺") || top.includes("雨"))
          ctx.audio.tone("soft");
        else ctx.audio.tone("drop");
      }
      if (Date.now() - persistAt > 4000) {
        persistAt = Date.now();
        ctx.save.gold = next.gold;
        ctx.save.bond = next.bond;
        ctx.save.day = next.day;
        ctx.save.bag = next.bag.map((s) => ({ id: s.id, n: s.n, fresh: s.fresh }));
        ctx.persist();
      }
    },
    (text) => {
      hud.querySelector(".err")?.remove();
      const e = el("div", "err", text);
      hud.append(e);
    },
  );

  const paint = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = scene.clientWidth;
    const h = scene.clientHeight;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    const g = canvas.getContext("2d");
    if (!g || !snap) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.imageSmoothingEnabled = false;
    drawSky(g, w, h, snap.night, snap.dusk, snap.zone, snap.weather.id);

    const me = snap.actors.find((a) => a.id === snap!.you) ?? snap.actors[0];
    if (me) {
      cam.x += (me.x - cam.x) * 0.12;
      cam.y += (me.y - cam.y) * 0.12;
    }
    const ox = w / 2 - cam.x;
    const oy = h / 2 - cam.y - 20;
    const rows = snap.tiles;
    const mw = rows[0]?.length ?? 1;
    const now = Date.now();
    const lamps: { x: number; y: number; r: number; a: number }[] = [];
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        const ch = rows[y][x];
        const key = y * mw + x;
        const fill = cellFill(ch, snap.zone);
        let hidden = false;
        let dim = false;
        if (snap.zone === "wild") {
          const seen = fogSeen.has(key);
          const vis = fogVis.has(key);
          if (!seen) hidden = true;
          else if (!vis) dim = true;
        }
        const px = ox + x * TILE;
        const py = oy + y * TILE;
        if (hidden) {
          drawCell(g, ch, px, py, fill, now, snap.zone);
          g.fillStyle = "rgba(6,10,16,0.78)";
          g.fillRect(px, py, TILE - 1, TILE - 1);
        } else {
          drawCell(g, ch, px, py, dim ? shade(fill, 0.55) : fill, now, snap.zone);
          if (dim) {
            g.fillStyle = "rgba(10,14,22,0.38)";
            g.fillRect(px, py, TILE - 1, TILE - 1);
          }
          if (ch === "P") {
            const i = plotIndex(rows, x, y);
            const plot = snap.plots[i];
            if (plot) drawPlot(g, px, py, plot.stage, plot.seed);
          }
          if (ch === "K" || ch === "A" || ch === "I") {
            lamps.push({ x: px + TILE / 2, y: py + TILE / 2, r: ch === "K" ? 58 : 44, a: ch === "K" ? 0.4 : 0.28 });
          }
        }
      }
    }
    if (snap.zone === "wild") {
      for (const key of snap.fires) {
        const x = key % mw;
        const y = Math.floor(key / mw);
        lamps.push({ x: ox + x * TILE + TILE / 2, y: oy + y * TILE + TILE / 2, r: 56, a: 0.4 });
      }
    }
    for (const lamp of lamps) drawLamp(g, lamp.x, lamp.y, lamp.r, lamp.a);
    for (const e of snap.enemies) {
      if (snap.zone === "wild") {
        const tx = Math.floor(e.x / TILE);
        const ty = Math.floor(e.y / TILE);
        if (!fogVis.has(ty * mw + tx)) continue;
      }
      drawEnemy(g, e, ox, oy, now);
    }
    for (const a of snap.actors) {
      drawActor(g, a, ox, oy, now);
      if (a.fishing === "fight") {
        const x = ox + a.x;
        const y = oy + a.y + 28;
        g.fillStyle = "rgba(40,28,16,0.82)";
        g.fillRect(x - 30, y, 60, 10);
        g.fillStyle = "#3f6d5c";
        g.fillRect(x - 30 + 60 * 0.38, y + 1, 60 * 0.34, 8);
        g.fillStyle = "#f4e7d2";
        g.fillRect(x - 30 + 60 * a.fishMark - 1, y - 2, 3, 14);
        g.fillStyle = "#c9a06a";
        g.fillRect(x - 30, y + 12, 60 * Math.max(0, Math.min(1, a.fishPull)), 3);
      }
    }
    if (snap.weather.id === "rain" || snap.weather.id === "storm") {
      g.strokeStyle = "rgba(200,220,230,0.28)";
      g.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        const x = (i * 47 + Date.now() / 8) % w;
        const y = (i * 89 + Date.now() / 5) % h;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x - 4, y + 14);
        g.stroke();
      }
    }
    if (snap.weather.id === "fog") {
      const mist = g.createLinearGradient(0, 0, 0, h);
      mist.addColorStop(0, "rgba(210,214,200,0.04)");
      mist.addColorStop(0.55, "rgba(210,214,200,0.16)");
      mist.addColorStop(1, "rgba(180,190,176,0.22)");
      g.fillStyle = mist;
      g.fillRect(0, 0, w, h);
    }
    if (snap.season === "冬" && snap.zone !== "kitchen" && snap.zone !== "mine") {
      g.fillStyle = "rgba(230,230,235,0.7)";
      for (let i = 0; i < 28; i++) {
        const x = (i * 53 + now / 12) % w;
        const y = (i * 71 + now / 9) % h;
        g.fillRect(x, y, 2, 2);
      }
    }
    if (snap.weather.id === "storm" && Math.sin(now / 180) > 0.97) {
      g.fillStyle = "rgba(240,240,255,0.14)";
      g.fillRect(0, 0, w, h);
    }
    if (snap.dusk && snap.zone === "valley") {
      g.fillStyle = "rgba(196,92,38,0.08)";
      g.fillRect(0, 0, w, h);
    }
    if (snap.night && snap.zone !== "kitchen" && snap.zone !== "mine") {
      drawNightVignette(g, w, h, snap.lit);
    }
  };

  const paintAtlas = () => {
    const atlas = hud.querySelector("#atlas") as HTMLCanvasElement | null;
    if (!atlas || !snap || snap.zone !== "wild") return;
    const rows = snap.tiles;
    const mw = rows[0]?.length ?? 1;
    const mh = rows.length;
    const cell = Math.max(3, Math.min(6, Math.floor(220 / mw)));
    atlas.width = mw * cell;
    atlas.height = mh * cell;
    const g = atlas.getContext("2d");
    if (!g) return;
    g.fillStyle = "#050403";
    g.fillRect(0, 0, atlas.width, atlas.height);
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        const key = y * mw + x;
        if (!fogSeen.has(key)) continue;
        const ch = rows[y][x];
        let fill = cellFill(ch, "wild");
        if (!fogVis.has(key)) fill = shade(fill, 0.5);
        if (snap.fires.includes(key)) fill = "#e08a4f";
        g.fillStyle = fill;
        g.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    const you = snap.youAt;
    g.fillStyle = "#c45c26";
    g.fillRect(Math.floor(you.x / TILE) * cell - 1, Math.floor(you.y / TILE) * cell - 1, cell + 2, cell + 2);
    if (snap.partnerAt && snap.partnerAt.zone === "wild") {
      g.fillStyle = snap.partner?.ping ? "#f4e7d2" : "#3f6d5c";
      g.fillRect(
        Math.floor(snap.partnerAt.x / TILE) * cell - 1,
        Math.floor(snap.partnerAt.y / TILE) * cell - 1,
        cell + 2,
        cell + 2,
      );
    }
  };

  const paintHud = () => {
    if (!snap) return;
    const partner = snap.partner;
    const phase = snap.night ? "夜里" : snap.dusk ? "黄昏" : "白天";
    const hp = Math.max(0, Math.min(100, (snap.hp / snap.maxHp) * 100));
    const hg = Math.max(0, Math.min(100, snap.hunger));
    const place =
      snap.zone === "mine"
        ? `矿 ${snap.floor}层 · ${snap.encounter}`
        : snap.zone === "kitchen"
          ? snap.rush
            ? `厨房 · 堂口热${snap.combo > 1 ? " · 连×" + snap.combo : ""}`
            : snap.combo > 1
              ? `厨房 · 连×${snap.combo}`
              : "厨房"
          : snap.zone === "wild"
            ? `荒野${snap.biome ? " · " + snap.biome : ""}`
            : "山谷";
    const partnerLine = partner?.online
      ? `${partner.name} 在${placeOf(partner.zone)}${partner.biome ? "·" + partner.biome : ""}${
          snap.zone === "wild" && snap.partnerAt?.zone === "wild"
            ? " · " + compass(snap.partnerAt.x - snap.youAt.x, snap.partnerAt.y - snap.youAt.y)
            : ""
        }`
      : partner?.name && partner.name !== "还没来"
        ? `${partner.name} 断线了，人还在原地`
        : "等另一部手机进来";
    hud.innerHTML = `
      <div class="hud-card">
        <div class="hud-place">
          <b>${place}</b>
          <span class="code-chip">房间 ${snap.room}</span>
        </div>
        <div class="bars">
          <div class="bar hp" title="血"><i style="width:${hp}%"></i></div>
          <div class="bar hunger" title="饿"><i style="width:${hg}%"></i></div>
        </div>
        <div class="hud-chips">
          <span>${snap.season}</span>
          <span>${phase}</span>
          <span>${snap.weather.name}</span>
          <span>金 ${snap.gold}</span>
          <span>默契 ${snap.bond}</span>
        </div>
        <div class="partner ${partner?.online ? "on" : ""}">${partnerLine}</div>
      </div>
      ${snap.fortune ? `<div class="fortune-chip">${snap.fortune.title} · ${snap.fortune.life}</div>` : ""}
      ${snap.board.length ? `<div class="fortune-chip">今晚 ${snap.board.join("、")}</div>` : ""}
      ${snap.pot.length || snap.potReady ? `<div class="fortune-chip">锅：${snap.potReady || snap.pot.join("、") || "空"}</div>` : ""}
      ${snap.ice.length ? `<div class="fortune-chip">冰柜 ${snap.ice.map((s) => s.name + "×" + s.n).join("、")}</div>` : ""}
      ${snap.prompt ? `<div class="prompt-toast">${snap.prompt}</div>` : ""}
      <div class="toasts">${snap.toasts.map((t) => `<p>${t}</p>`).join("")}</div>
      ${
        snap.orders.length
          ? `<div class="tickets ${snap.rush ? "rush" : ""}">${snap.orders
              .map(
                (o) =>
                  `<div class="ticket"><b>${o.recipe}</b><small>${o.name}</small><div class="bar"><i style="width:${Math.min(100, o.left * 2.4)}%"></i></div></div>`,
              )
              .join("")}</div>`
          : ""
      }
      <button class="bag-toggle" type="button" id="bag-btn">袋</button>
      <button class="bag-toggle book-toggle" type="button" id="book-btn">菜单</button>
      <button class="bag-toggle map-toggle" type="button" id="map-btn">图</button>
      <div class="bag-panel ${open === "bag" ? "" : "hidden"}" id="bag">${
        snap.bag.map((s) => `<button type="button" data-take="${s.id}">${s.name}×${s.n}</button>`).join("") || "空"
      }${snap.gear.length ? `<span>${snap.gear.join(" · ")}</span>` : ""}</div>
      <div class="bag-panel ${open === "book" ? "" : "hidden"}" id="book">
        <p class="album">鱼 ${snap.album.fish}/${snap.album.fishMax} · 菜 ${snap.album.cook}/${snap.album.cookMax} · 图 ${snap.album.map}%</p>
        ${snap.cookbook.map((n) => `<span>${n}</span>`).join("") || "还没写出第一道"}
      </div>
      <div class="bag-panel map-panel ${open === "map" ? "" : "hidden"}" id="map">
        ${
          snap.zone === "wild"
            ? `<p>已照亮 ${snap.revealed.length} 格 · ${snap.night ? (snap.lit ? "火还在" : "别停在黑里") : "趁天光走远一点"}</p><canvas id="atlas"></canvas>`
            : "<p>出谷之后，地图才会一点点亮起来。两人走近，会把看见的路写进彼此的图里。</p>"
        }
      </div>
    `;
    const toggle = (id: "bag" | "book" | "map") => {
      open = open === id ? "" : id;
      paintHud();
    };
    hud.querySelector("#bag-btn")?.addEventListener("click", () => toggle("bag"));
    hud.querySelector("#book-btn")?.addEventListener("click", () => toggle("book"));
    hud.querySelector("#map-btn")?.addEventListener("click", () => toggle("map"));
    hud.querySelectorAll("[data-take]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.take;
        if (id) net.send({ t: "take", id });
      });
    });
    paintAtlas();
  };

  let lastHud = "";
  const loop = () => {
    net.send({
      t: "input",
      x: stick.input.x,
      y: stick.input.y,
      action: consume(stick.input, "action"),
      held: stick.input.held,
      ping: consume(stick.input, "ping"),
    });
    paint();
    const key = snap
      ? JSON.stringify([
          snap.toasts,
          snap.prompt,
          snap.gold,
          snap.partner,
          snap.fortune,
          snap.bag,
          snap.orders,
          snap.weather,
          snap.pot,
          snap.cookbook,
          snap.night,
          snap.dusk,
          snap.lit,
          snap.rush,
          snap.revealed.length,
          snap.visible.length,
          snap.biome,
          snap.season,
          snap.hp,
          snap.hunger,
          snap.fires.length,
          snap.ice.length,
          snap.album,
          snap.combo,
          snap.board,
          snap.actors.map((a) => [a.fishing, a.fishPull, a.ping]),
        ])
      : "";
    if (key !== lastHud) {
      lastHud = key;
      paintHud();
    } else if (open === "map") {
      paintAtlas();
    }
    raf = requestAnimationFrame(loop);
  };
  let raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    net.close();
    stick.destroy();
    scene.remove();
  };
}

function placeOf(z: string): string {
  if (z === "mine") return "矿里";
  if (z === "kitchen") return "厨房";
  if (z === "wild") return "荒野";
  return "山谷";
}
