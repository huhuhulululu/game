import type { GameContext } from "../game/types";
import { el } from "../ui/dom";

export function mountRoom(root: HTMLElement, ctx: GameContext): () => void {
  const scene = el("section", "scene cover scene-enter");
  const existing = ctx.roomCode;
  const pine = ctx.prefer === "right";
  scene.innerHTML = `
    <div class="cover-sky" aria-hidden="true">
      <img class="cover-grass" src="/art/tex-grass.png?v=look8" alt="" />
      <i class="star" style="left:12%;top:18%"></i>
      <i class="star" style="left:28%;top:10%"></i>
      <i class="star" style="left:46%;top:22%"></i>
      <i class="star" style="left:62%;top:8%"></i>
      <i class="star" style="left:78%;top:16%"></i>
      <i class="star" style="left:88%;top:28%"></i>
      <div class="moon"></div>
      <img class="cover-tree l" src="/art/prop-pine.png?v=look8" alt="" />
      <img class="cover-tree r" src="/art/prop-tree-tall.png?v=look8" alt="" />
      <img class="cover-cabin" src="/art/prop-cabin.png?v=look8" alt="" />
      <img class="cover-inn" src="/art/prop-inn.png?v=look8" alt="" />
    </div>
    <div class="cover-panel">
      <div class="cover-plank">
        <div class="kicker">两部 iPhone · 同一夜</div>
        <h1 class="cover-title">并肩山谷</h1>
        <p class="cover-tag">一个人开间。进谷后再把四位码念给另一个人。</p>
        <label class="cover-name">
          <span>你的名字</span>
          <input id="my-name" maxlength="8" value="${ctx.myName || ctx.save.leftName}" placeholder="怎么称呼" />
        </label>
        <div class="sides" role="group" aria-label="你站哪边">
          <button type="button" class="chip ${pine ? "" : "on"}" data-side="warm">暖</button>
          <button type="button" class="chip ${pine ? "on" : ""}" data-side="pine">松</button>
        </div>
        <div class="cover-actions">
          <button class="solid-btn cover-btn" type="button" id="create">开一间</button>
          <button class="ghost-btn cover-btn" type="button" id="have-code">${existing ? "用房间码进去" : "我有房间码"}</button>
        </div>
        <div id="code-row" class="code-row ${existing ? "" : "hidden"}">
          <input id="room" maxlength="6" value="${existing}" placeholder="四位码" autocomplete="off" />
          <button class="solid-btn cover-btn" type="button" id="join">进去</button>
        </div>
      </div>
    </div>
  `;
  let prefer: "left" | "right" = pine ? "right" : "left";
  const name = () => (scene.querySelector("#my-name") as HTMLInputElement).value.trim() || "我";
  const room = () => (scene.querySelector("#room") as HTMLInputElement).value.trim().toUpperCase();
  scene.querySelectorAll("[data-side]").forEach((btn) => {
    btn.addEventListener("click", () => {
      prefer = (btn as HTMLElement).dataset.side === "pine" ? "right" : "left";
      scene.querySelectorAll("[data-side]").forEach((b) => b.classList.toggle("on", b === btn));
    });
  });
  scene.querySelector("#create")?.addEventListener("click", () => {
    ctx.myName = name();
    ctx.roomCode = "";
    ctx.prefer = prefer;
    ctx.save.innName = ctx.save.innName || "并肩山谷";
    ctx.persist();
    ctx.audio.tone("ok");
    ctx.goto("play");
  });
  scene.querySelector("#have-code")?.addEventListener("click", () => {
    const row = scene.querySelector("#code-row") as HTMLElement;
    row.classList.remove("hidden");
    (scene.querySelector("#room") as HTMLInputElement).focus();
  });
  scene.querySelector("#join")?.addEventListener("click", () => {
    const code = room();
    if (!code) return;
    ctx.myName = name();
    ctx.roomCode = code;
    ctx.prefer = prefer;
    ctx.persist();
    ctx.audio.tone("ok");
    ctx.goto("play");
  });
  root.append(scene);
  return () => scene.remove();
}
