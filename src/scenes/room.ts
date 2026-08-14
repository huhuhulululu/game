import type { GameContext } from "../game/types";
import { el } from "../ui/dom";

export function mountRoom(root: HTMLElement, ctx: GameContext): () => void {
  const scene = el("section", "scene setup scene-enter");
  const existing = ctx.roomCode;
  scene.innerHTML = `
    <div class="kicker">两部 iPhone</div>
    <h2 style="letter-spacing:.16em;margin:10px 0 0">进同一座山谷</h2>
    <p class="hint" style="text-align:center;margin:18px 12px 0;line-height:1.8;letter-spacing:.06em">
      一个人开间，进谷后把屏幕上的四位房间码念给另一个人。<br/>各看各的屏幕，想去河边或矿里都可以。
    </p>
    <div class="setup-grid" style="max-width:640px">
      <label class="field wide">
        <span>你的名字</span>
        <input id="my-name" maxlength="8" value="${ctx.myName || ctx.save.leftName}" placeholder="怎么称呼你" />
      </label>
      <label class="field">
        <span>房间码</span>
        <input id="room" maxlength="6" value="${existing}" placeholder="例如 7K3P" style="text-transform:uppercase" />
      </label>
      <label class="field">
        <span>你站哪边</span>
        <input id="side" maxlength="2" value="${ctx.prefer === "right" ? "松" : "暖"}" placeholder="暖 或 松" />
      </label>
    </div>
    <div class="actions">
      <button class="ghost-btn" type="button" id="create">开一间</button>
      <button class="solid-btn" type="button" id="join">进去</button>
    </div>
  `;
  const name = () => (scene.querySelector("#my-name") as HTMLInputElement).value.trim() || "我";
  const room = () => (scene.querySelector("#room") as HTMLInputElement).value.trim().toUpperCase();
  const prefer = () => ((scene.querySelector("#side") as HTMLInputElement).value.includes("松") ? "right" : "left") as "left" | "right";
  scene.querySelector("#create")?.addEventListener("click", () => {
    ctx.myName = name();
    ctx.roomCode = "";
    ctx.prefer = prefer();
    ctx.save.innName = ctx.save.innName || "并肩山谷";
    ctx.persist();
    ctx.audio.tone("ok");
    ctx.goto("play");
  });
  scene.querySelector("#join")?.addEventListener("click", () => {
    const code = room();
    if (!code) return;
    ctx.myName = name();
    ctx.roomCode = code;
    ctx.prefer = prefer();
    ctx.persist();
    ctx.audio.tone("ok");
    ctx.goto("play");
  });
  root.append(scene);
  return () => scene.remove();
}
