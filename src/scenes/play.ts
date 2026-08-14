import type { GameContext } from "../game/types";
import { connectRoom } from "../net/client";
import type { WorldSnap } from "../sim/net";
import { consume, mountStick } from "../ui/stick";
import { TILE } from "../world/maps";
import { compass } from "../world/wild";
import { el } from "../ui/dom";

const CELL_FILL: Record<string, string> = {
  "#": "#2a1c16",
  T: "#243228",
  t: "#2a4a30",
  ".": "#3a4a34",
  ",": "#6a5a40",
  "~": "#2a4454",
  D: "#4a6a6a",
  P: "#5a4030",
  F: "#2f5a38",
  O: "#8a6a28",
  C: "#5a3224",
  N: "#5a3224",
  A: "#c45c26",
  I: "#c9a06a",
  E: "#4a3a4a",
  S: "#6a4a28",
  G: "#d4a24a",
  B: "#e6d0a6",
  Y: "#8a6a3c",
  "1": "#c45c3e",
  "2": "#e6c36a",
  "3": "#d4b46a",
  "4": "#5a8f62",
  "5": "#8aa4b5",
  "6": "#d4a24a",
  m: "#2a3a28",
  K: "#d47a3c",
  R: "#8a7a6a",
  H: "#1a1010",
  V: "#c9a06a",
  "^": "#4a4038",
  b: "#5a5248",
  n: "#3a2018",
  s: "#6a6a38",
  L: "#c9a06a",
  W: "#f4e7d2",
  X: "#3a2020",
  Q: "#e7d3b4",
  U: "#8a3a16",
  o: "#7d8490",
  e: "#3a3344",
  Z: "#7ec8d6",
};

export function mountPlay(root: HTMLElement, ctx: GameContext): () => void {
  const scene = el("section", "scene play-scene");
  const canvas = document.createElement("canvas");
  const hud = el("div", "live-hud");
  scene.append(canvas, hud);
  root.append(scene);
  const stick = mountStick(scene, ctx.myName || "我");
  const room = ctx.roomCode || "HOME";
  let snap: WorldSnap | null = null;
  let cam = { x: 0, y: 0 };
  let open: "" | "bag" | "book" | "map" = "";

  const net = connectRoom(
    room,
    ctx.myName || ctx.save.leftName || "我",
    ctx.prefer,
    (next) => {
      snap = next;
      ctx.roomCode = next.room;
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
    const bg =
      snap.zone === "mine"
        ? "#120e14"
        : snap.zone === "kitchen"
          ? "#1a120e"
          : snap.weather.id === "rain" || snap.weather.id === "storm"
            ? "#12161c"
            : snap.weather.id === "fog"
              ? "#1a1c1a"
              : "#141810";
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);

    const me = snap.actors.find((a) => a.id === snap!.you) ?? snap.actors[0];
    if (me) {
      cam.x += (me.x - cam.x) * 0.12;
      cam.y += (me.y - cam.y) * 0.12;
    }
    const ox = w / 2 - cam.x;
    const oy = h / 2 - cam.y - 20;
    const rows = snap.tiles;
    const mw = rows[0]?.length ?? 1;
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        const ch = rows[y][x];
        const key = y * mw + x;
        let fill = CELL_FILL[ch] ?? (snap.zone === "mine" ? "#2a2430" : "#3d4a36");
        if (snap.zone === "wild") {
          const seen = snap.revealed.includes(key);
          const vis = snap.visible.includes(key);
          if (!seen) fill = "#050403";
          else if (!vis) fill = shade(fill, 0.42);
        }
        g.fillStyle = fill;
        g.fillRect(ox + x * TILE, oy + y * TILE, TILE - 1, TILE - 1);
      }
    }
    if (snap.zone === "wild") {
      for (const key of snap.fires) {
        const x = key % mw;
        const y = Math.floor(key / mw);
        const cx = ox + x * TILE + TILE / 2;
        const cy = oy + y * TILE + TILE / 2;
        const glow = g.createRadialGradient(cx, cy, 4, cx, cy, 54);
        glow.addColorStop(0, "rgba(232,140,60,0.55)");
        glow.addColorStop(1, "rgba(232,140,60,0)");
        g.fillStyle = glow;
        g.beginPath();
        g.arc(cx, cy, 54, 0, Math.PI * 2);
        g.fill();
      }
    }
    for (const e of snap.enemies) {
      if (snap.zone === "wild") {
        const tx = Math.floor(e.x / TILE);
        const ty = Math.floor(e.y / TILE);
        if (!snap.visible.includes(ty * mw + tx)) continue;
      }
      g.fillStyle = e.hue;
      g.beginPath();
      g.arc(ox + e.x, oy + e.y, 11, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#f4e7d2";
      g.fillRect(ox + e.x - 12, oy + e.y - 18, 24 * (e.hp / e.maxHp), 3);
    }
    for (const a of snap.actors) {
      g.fillStyle = a.side === "left" ? "#c45c26" : "#3f6d5c";
      g.beginPath();
      g.arc(ox + a.x, oy + a.y, 12, 0, Math.PI * 2);
      g.fill();
      if (a.fishing === "bite") {
        g.strokeStyle = "#f4e7d2";
        g.strokeRect(ox + a.x - 16, oy + a.y - 16, 32, 32);
      }
      g.fillStyle = "#f4e7d2";
      g.font = "12px 'Noto Serif SC', serif";
      g.textAlign = "center";
      g.fillText(a.name, ox + a.x, oy + a.y - 18);
      if (a.held) g.fillText(a.held.split(":")[0], ox + a.x, oy + a.y + 22);
    }
    if (snap.weather.id === "rain" || snap.weather.id === "storm") {
      g.strokeStyle = "rgba(200,220,230,0.35)";
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
      g.fillStyle = "rgba(210,210,200,0.12)";
      g.fillRect(0, 0, w, h);
    }
    if (snap.dusk) {
      g.fillStyle = "rgba(80,40,16,0.18)";
      g.fillRect(0, 0, w, h);
    }
    if (snap.night) {
      g.fillStyle = snap.lit ? "rgba(8,6,12,0.28)" : "rgba(4,2,8,0.62)";
      g.fillRect(0, 0, w, h);
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
        if (!snap.revealed.includes(key)) continue;
        const ch = rows[y][x];
        let fill = CELL_FILL[ch] ?? "#3d4a36";
        if (!snap.visible.includes(key)) fill = shade(fill, 0.5);
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
    const phase = snap.night ? "夜" : snap.dusk ? "黄昏" : "昼";
    const place =
      snap.zone === "mine"
        ? `矿 ${snap.floor}层 · ${snap.encounter}`
        : snap.zone === "kitchen"
          ? snap.rush
            ? "厨房 · 堂口热"
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
      : "等另一部手机进来";
    hud.innerHTML = `
      <div class="live-top">
        <div>
          <b>${place}</b>
          <span>房间 ${snap.room}</span>
        </div>
        <div class="live-meta">${phase} · ${snap.weather.name} · 金 ${snap.gold} · 默契 ${snap.bond}</div>
      </div>
      <div class="partner ${partner?.online ? "on" : ""}">${partnerLine}</div>
      ${snap.fortune ? `<div class="fortune-chip">${snap.fortune.title} · ${snap.fortune.life}</div>` : ""}
      ${snap.pot.length || snap.potReady ? `<div class="fortune-chip">锅：${snap.potReady || snap.pot.join("、") || "空"}</div>` : ""}
      <div class="prompt">${snap.prompt}</div>
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
      <div class="bag-panel ${open === "book" ? "" : "hidden"}" id="book">${
        snap.cookbook.map((n) => `<span>${n}</span>`).join("") || "还没写出第一道"
      }</div>
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
          snap.fires.length,
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

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.floor(((n >> 16) & 255) * amt);
  const g = Math.floor(((n >> 8) & 255) * amt);
  const b = Math.floor((n & 255) * amt);
  return `rgb(${r},${g},${b})`;
}
