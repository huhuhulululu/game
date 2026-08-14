import { resetSave } from "../game/save";
import type { GameContext } from "../game/types";
import { el } from "../ui/dom";

export function mountScrapbook(root: HTMLElement, ctx: GameContext): () => void {
  const scene = el("section", "scene scrapbook scene-enter");
  const memories = ctx.save.memories
    .map(
      (m, i) => `
      <article class="memory">
        <time>第 ${i + 1} 日 · ${ctx.save.days[i]?.title ?? ""}</time>
        <p>${m}</p>
      </article>`,
    )
    .join("");

  scene.innerHTML = `
    <div class="topbar">
      <button type="button" id="back">回房间</button>
      <button type="button" id="reset">重新开山</button>
    </div>
    <div class="kicker" style="margin-top:36px">回忆册</div>
    <h2>${ctx.save.innName}</h2>
    ${memories || `<p class="empty-book">还没有晚间。去把第一盏灯点上。</p>`}
  `;
  scene.querySelector("#back")?.addEventListener("click", () => ctx.goto("room"));
  scene.querySelector("#reset")?.addEventListener("click", () => {
    const next = resetSave();
    Object.assign(ctx.save, next);
    ctx.goto("setup");
  });
  root.append(scene);
  return () => scene.remove();
}
