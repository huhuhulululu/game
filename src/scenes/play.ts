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
  drawField,
  drawFringe,
  drawGround,
  doorIsOpen,
  drawHouseCluster,
  drawLamp,
  drawLane,
  drawMeadow,
  drawNightVignette,
  drawPlot,
  drawPool,
  fillClusters,
  setLookSeason,
  drawSky,
  drawAtlas,
  houseClusters,
  isHouseLook,
  isTallLook,
  plotClusters,
  plotIndex,
  tileLook,
  viewScale,
} from "./draw";
import { el } from "../ui/dom";
import { loadArt } from "./art";
import { emptyFeel, tickFeel } from "../game/feel";

export function mountPlay(root: HTMLElement, ctx: GameContext): () => void {
  loadArt();
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
  const gait = new Map<string, { x: number; y: number; heat: number }>();
  let feel = emptyFeel();

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
        else if (top.includes("天黑") || top.includes("出锅") || top.includes("写入菜单")) {
          /* night / pot-ready live on feel */
        } else if (top.includes("黑暗咬")) ctx.audio.tone("dark");
        else if (top.includes("咬") || top.includes("倒")) ctx.audio.tone("hit");
        else if (top.includes("上了") || top.includes("写入")) ctx.audio.tone("serve");
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
    const world = snap;
    g.imageSmoothingEnabled = true;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    setLookSeason(snap.season);
    drawSky(g, w, h, snap.night, snap.dusk, snap.zone, snap.weather.id);

    const me = snap.actors.find((a) => a.id === snap!.you) ?? snap.actors[0];
    if (me) {
      cam.x += (me.x - cam.x) * 0.14;
      cam.y += (me.y - cam.y) * 0.14;
    }
    const scale = viewScale(w, h);
    g.setTransform(
      dpr * scale,
      0,
      0,
      dpr * scale,
      dpr * (w / 2 - cam.x * scale),
      dpr * (h / 2 - cam.y * scale),
    );
    const rows = snap.tiles;
    const mw = rows[0]?.length ?? 1;
    const mh = rows.length;
    const now = Date.now();
    const left = cam.x - w / (2 * scale);
    const top = cam.y - h / (2 * scale);
    const x0 = Math.floor(left / TILE) - 1;
    const y0 = Math.floor(top / TILE) - 1;
    const x1 = Math.ceil((left + w / scale) / TILE) + 1;
    const y1 = Math.ceil((top + h / scale) / TILE) + 1;
    const lamps: { x: number; y: number; r: number; a: number }[] = [];
    const sprites: { y: number; draw: () => void }[] = [];
    const padCh = snap.zone === "mine" ? "#" : snap.zone === "kitchen" ? "." : ".";
    const at = (tx: number, ty: number) => (ty >= 0 && ty < mh && tx >= 0 && tx < mw ? rows[ty][tx] : padCh);
    const crops: { x: number; y: number; i: number }[] = [];
    const meadow =
      snap.zone !== "kitchen" &&
      snap.zone !== "mine" &&
      drawMeadow(g, x0 * TILE, y0 * TILE, (x1 - x0 + 1) * TILE, (y1 - y0 + 1) * TILE);
    let waterSheet = false;
    let pathSheet = false;
    for (const pool of fillClusters(rows, (ch) => ch === "~" || ch === "D")) {
      if (drawPool(g, pool)) waterSheet = true;
    }
    for (const lane of fillClusters(rows, (ch) => ch === ",")) {
      if (drawLane(g, lane)) pathSheet = true;
    }
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const inside = y >= 0 && y < mh && x >= 0 && x < mw;
        const ch = inside ? rows[y][x] : padCh;
        const px = x * TILE;
        const py = y * TILE;
        const near = { n: at(x, y - 1), s: at(x, y + 1), e: at(x + 1, y), w: at(x - 1, y) };
        if (!inside) {
          if (!meadow) drawGround(g, padCh, px, py, now, snap.zone);
          continue;
        }
        const key = y * mw + x;
        let hidden = false;
        let dim = false;
        if (snap.zone === "wild") {
          if (!fogSeen.has(key)) hidden = true;
          else if (!fogVis.has(key)) dim = true;
        }
        const look = tileLook(ch, snap.zone);
        const tall = isTallLook(look);
        const fill = cellFill(ch, snap.zone);
        const skip = { grass: meadow, water: waterSheet, path: pathSheet };
        if (look === "grass" && meadow) {
          /* meadow already covers this cell */
        } else if (look === "wall" && meadow && snap.zone === "valley") {
          /* meadow already covers the map frame */
        } else if (tall) drawCell(g, ch, px, py, fill, now, snap.zone, near, "ground", skip);
        else drawCell(g, ch, px, py, fill, now, snap.zone, near, "all", skip);
        if (!hidden) drawFringe(g, ch, near, px, py, snap.zone, now);
        if (hidden) {
          g.fillStyle = "rgba(6,10,16,0.78)";
          g.fillRect(px, py, TILE, TILE);
        } else if (dim) {
          g.fillStyle = "rgba(10,14,22,0.38)";
          g.fillRect(px, py, TILE, TILE);
        }
        if (!hidden && ch === "P") crops.push({ x: px, y: py, i: plotIndex(rows, x, y) });
        if (!hidden && (ch === "K" || ch === "A" || ch === "I")) {
          lamps.push({ x: px + TILE / 2, y: py + TILE / 2, r: ch === "K" ? 58 : 44, a: ch === "K" ? 0.4 : 0.28 });
        }
        if (!hidden && tall && !isHouseLook(look)) {
          sprites.push({
            y: py + TILE,
            draw: () => drawCell(g, ch, px, py, fill, now, world.zone, near, "prop", skip),
          });
        }
      }
    }
    for (const field of plotClusters(rows)) {
      if (snap.zone === "wild") {
        const key = field.y * mw + field.x;
        if (!fogSeen.has(key)) continue;
      }
      drawField(g, field);
    }
    for (const crop of crops) {
      const plot = snap.plots[crop.i];
      if (plot) drawPlot(g, crop.x, crop.y, plot.stage, plot.seed, false);
    }
    for (const house of houseClusters(rows, snap.zone)) {
      if (snap.zone === "wild") {
        const key = house.y * mw + house.x;
        if (!fogSeen.has(key)) continue;
      }
      const folks = snap.actors;
      const here = snap.zone;
      sprites.push({
        y: (house.y + house.h) * TILE,
        draw: () => drawHouseCluster(g, house, now, doorIsOpen(house, folks, here)),
      });
    }
    if (snap.zone === "wild") {
      for (const key of snap.fires) {
        const x = key % mw;
        const y = Math.floor(key / mw);
        lamps.push({ x: x * TILE + TILE / 2, y: y * TILE + TILE / 2, r: 56, a: 0.4 });
      }
    }
    for (const lamp of lamps) drawLamp(g, lamp.x, lamp.y, lamp.r, lamp.a);
    for (const e of snap.enemies) {
      if (snap.zone === "wild") {
        const tx = Math.floor(e.x / TILE);
        const ty = Math.floor(e.y / TILE);
        if (!fogVis.has(ty * mw + tx)) continue;
      }
      sprites.push({ y: e.y, draw: () => drawEnemy(g, e, 0, 0, now) });
    }
    for (const a of snap.actors) {
      sprites.push({
        y: a.y,
        draw: () => {
          const prev = gait.get(a.id);
          const dist = prev ? Math.hypot(a.x - prev.x, a.y - prev.y) : 0;
          const heat = dist > 0.32 ? 1 : Math.max(0, (prev?.heat ?? 0) - 0.08);
          gait.set(a.id, { x: a.x, y: a.y, heat });
          drawActor(g, a, 0, 0, now, heat > 0.15);
          if (a.fishing !== "fight") return;
          const x = a.x;
          const y = a.y + 28;
          g.fillStyle = "rgba(40,28,16,0.82)";
          g.fillRect(x - 30, y, 60, 10);
          g.fillStyle = "#3f6d5c";
          g.fillRect(x - 30 + 60 * 0.38, y + 1, 60 * 0.34, 8);
          g.fillStyle = "#f4e7d2";
          g.fillRect(x - 30 + 60 * a.fishMark - 1, y - 2, 3, 14);
          g.fillStyle = "#c9a06a";
          g.fillRect(x - 30, y + 12, 60 * Math.max(0, Math.min(1, a.fishPull)), 3);
        },
      });
    }
    sprites.sort((left, right) => left.y - right.y);
    for (const sprite of sprites) sprite.draw();
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    if (!atlas || !snap) return;
    const rows = snap.tiles;
    const mw = rows[0]?.length ?? 1;
    const mh = rows.length;
    const cell = Math.max(5, Math.min(10, Math.floor(240 / mw)));
    atlas.width = mw * cell;
    atlas.height = mh * cell;
    const g = atlas.getContext("2d");
    if (!g) return;
    drawAtlas(
      g,
      rows,
      snap.zone,
      cell,
      snap.youAt,
      snap.partnerAt && snap.partnerAt.zone === snap.zone ? snap.partnerAt : null,
      snap.zone === "wild" ? { seen: fogSeen, vis: fogVis } : undefined,
      snap.fires,
    );
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
        : "";
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
        ${partnerLine ? `<div class="partner ${partner?.online ? "on" : ""}">${partnerLine}</div>` : ""}
      </div>
      <div class="hud-stack">
        ${snap.fortune ? `<div class="fortune-chip">${snap.fortune.title} · ${snap.fortune.life}</div>` : ""}
        ${snap.board.length ? `<div class="fortune-chip">今晚 ${snap.board.join("、")}</div>` : ""}
        ${snap.pot.length || snap.potReady ? `<div class="fortune-chip">锅：${snap.potReady || snap.pot.join("、") || "空"}</div>` : ""}
        ${snap.ice.length ? `<div class="fortune-chip">冰柜 ${snap.ice.map((s) => s.name + "×" + s.n).join("、")}</div>` : ""}
        <div class="toasts">${snap.toasts.map((t) => `<p>${t}</p>`).join("")}</div>
      </div>
      ${snap.prompt ? `<div class="prompt-toast">${snap.prompt}</div>` : ""}
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
      <button class="bag-toggle book-toggle" type="button" id="book-btn">鉴</button>
      <button class="bag-toggle map-toggle" type="button" id="map-btn">图</button>
      <button class="bag-toggle mute-toggle" type="button" id="mute-btn">${ctx.audio.muted ? "静" : "声"}</button>
      <div class="sheet ${open === "bag" ? "" : "hidden"}" id="bag">
        <header>袋</header>
        <div class="sheet-grid">
          ${
            snap.bag
              .map((s) => `<button type="button" class="sheet-cell" data-take="${s.id}"><i class="ico item"></i><b>${s.name}</b><span>×${s.n}</span></button>`)
              .join("") || `<div class="sheet-empty">空</div>`
          }
        </div>
        ${snap.gear.length ? `<footer>${snap.gear.join(" · ")}</footer>` : ""}
      </div>
      <div class="sheet ${open === "book" ? "" : "hidden"}" id="book">
        <header>图鉴</header>
        <div class="sheet-grid stats">
          <div class="sheet-cell"><i class="ico fish"></i><b>鱼</b><span>${snap.album.fish}/${snap.album.fishMax}</span></div>
          <div class="sheet-cell"><i class="ico cook"></i><b>菜</b><span>${snap.album.cook}/${snap.album.cookMax}</span></div>
          <div class="sheet-cell"><i class="ico map"></i><b>图</b><span>${snap.album.map}%</span></div>
        </div>
        <div class="sheet-grid">
          ${snap.cookbook.map((n) => `<div class="sheet-cell"><i class="ico cook"></i><b>${n}</b></div>`).join("") || `<div class="sheet-empty">还没写出第一道</div>`}
        </div>
      </div>
      <div class="sheet ${open === "map" ? "" : "hidden"}" id="map">
        <header>图</header>
        <p>${
          snap.zone === "wild"
            ? `已照亮 ${snap.revealed.length} 处 · ${snap.night ? (snap.lit ? "火还在" : "别停在黑里") : "趁天光走远一点"}`
            : snap.zone === "mine"
              ? `矿 ${snap.floor}层。柿色是你，松色是她。`
              : "柿色是你，松色是她。出谷之后，荒野才会一点点亮起来。"
        }</p>
        <canvas id="atlas"></canvas>
      </div>
    `;
    const toggle = (id: "bag" | "book" | "map") => {
      open = open === id ? "" : id;
      paintHud();
    };
    hud.querySelector("#bag-btn")?.addEventListener("click", () => toggle("bag"));
    hud.querySelector("#book-btn")?.addEventListener("click", () => toggle("book"));
    hud.querySelector("#map-btn")?.addEventListener("click", () => toggle("map"));
    hud.querySelector("#mute-btn")?.addEventListener("click", () => {
      ctx.save.muted = !ctx.save.muted;
      ctx.audio.setMuted(ctx.save.muted);
      ctx.persist();
      paintHud();
    });
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
    if (snap) {
      const heard = tickFeel(feel, snap, performance.now());
      feel = heard.next;
      if (!ctx.audio.muted) for (const s of heard.sounds) ctx.audio.tone(s);
    }
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
          ctx.audio.muted,
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
