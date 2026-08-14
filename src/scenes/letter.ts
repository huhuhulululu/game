import { todayGuest } from "../game/content";
import type { GameContext } from "../game/types";
import { el } from "../ui/dom";

export function mountLetter(root: HTMLElement, ctx: GameContext): () => void {
  const guest = todayGuest(Math.max(0, ctx.save.day - 1));
  const result = ctx.lastResult;
  const scene = el("section", "scene letter scene-enter");
  scene.innerHTML = `
    <div class="kicker">歇下之后</div>
    <h2>${guest.name}</h2>
    <div class="letter-card">
      ${guest.lines.map((l) => `<p>${l}</p>`).join("")}
      <p style="color:var(--gold-soft);margin-top:18px">「${guest.letter}」</p>
      <div class="letter-meta">
        <span>${result?.detail ?? "山谷还在"}</span>
        <span>默契 ${ctx.save.bond}</span>
      </div>
    </div>
    <div class="actions">
      <button class="solid-btn" type="button" id="back">回到房间</button>
    </div>
  `;
  scene.querySelector("#back")?.addEventListener("click", () => {
    ctx.audio.tone("soft");
    ctx.goto("room");
  });
  root.append(scene);
  return () => scene.remove();
}
