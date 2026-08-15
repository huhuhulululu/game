import type { GameContext } from "../game/types";
import { el } from "../ui/dom";

export function mountSetup(root: HTMLElement, ctx: GameContext): () => void {
  const scene = el("section", "scene setup scene-enter");
  scene.innerHTML = `
    <div class="cover-sky setup-sky" aria-hidden="true">
      <img class="cover-grass" src="/art/tex-grass.png?v=look8" alt="" />
      <img class="cover-cabin" src="/art/prop-cabin.png?v=look8" alt="" />
    </div>
    <div class="cover-plank setup-plank">
    <div class="kicker">先把名字写下</div>
    <h2 style="letter-spacing:.18em;margin:10px 0 0">这是只有你们两个人的山谷</h2>
    <div class="setup-grid">
      <label class="field">
        <span>你的名字</span>
        <input id="my-name" maxlength="8" placeholder="怎么称呼你" value="${ctx.myName || ctx.save.leftName}" />
      </label>
      <label class="field">
        <span>对方的名字（可先空着）</span>
        <input id="other-name" maxlength="8" placeholder="等另一部手机进来" value="${ctx.save.rightName}" />
      </label>
      <label class="field wide">
        <span>这座山谷叫什么</span>
        <input id="inn-name" maxlength="10" placeholder="并肩山谷" value="${ctx.save.innName}" />
      </label>
    </div>
    <p class="hint" style="text-align:center;margin-top:28px;letter-spacing:.08em;line-height:1.8">
      一人一机。开间后把房间码给对方。<br/>电脑上：WASD 或方向键移动，空格做，H 喊一声。
    </p>
    <div class="actions">
      <button class="solid-btn cover-btn" type="button" id="enter">下一步</button>
    </div>
    </div>
  `;
  scene.querySelector("#enter")?.addEventListener("click", () => {
    const me = (scene.querySelector("#my-name") as HTMLInputElement).value.trim() || "我";
    const other = (scene.querySelector("#other-name") as HTMLInputElement).value.trim();
    const inn = (scene.querySelector("#inn-name") as HTMLInputElement).value.trim() || "并肩山谷";
    ctx.myName = me;
    ctx.save.leftName = me;
    ctx.save.rightName = other;
    ctx.save.innName = inn;
    ctx.persist();
    ctx.audio.tone("ok");
    ctx.goto("room");
  });
  root.append(scene);
  return () => scene.remove();
}
