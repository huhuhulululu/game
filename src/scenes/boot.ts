import type { GameContext } from "../game/types";
import { el } from "../ui/dom";

export function mountBoot(root: HTMLElement, ctx: GameContext): () => void {
  const scene = el("section", "scene boot scene-enter");
  scene.innerHTML = `
    <div class="boot-valley" aria-hidden="true">
      <img class="boot-grass" src="/art/tex-grass.png?v=look8" alt="" />
      <img class="boot-tree l" src="/art/prop-tree.png?v=look8" alt="" />
      <img class="boot-tree r" src="/art/prop-tree-wide.png?v=look8" alt="" />
      <img class="boot-cabin" src="/art/prop-cabin.png?v=look8" alt="" />
    </div>
    <div class="lantern" aria-hidden="true">
      <div class="lantern-hang"></div>
      <div class="lantern-body"></div>
      <div class="lantern-glow"></div>
    </div>
    <h1 class="brand">并肩山谷</h1>
    <div class="brand-en">a living valley for two phones</div>
    <div class="hint">两部 iPhone，同一座山</div>
  `;
  const go = () => {
    ctx.audio.unlock();
    ctx.audio.tone("soft");
    ctx.goto(ctx.save.leftName || ctx.myName ? "room" : "setup");
  };
  scene.addEventListener("pointerdown", go);
  root.append(scene);
  return () => scene.remove();
}
