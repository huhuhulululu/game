import type { InputState } from "../sim/net";

export function mountStick(root: HTMLElement, name: string): { input: InputState; destroy: () => void } {
  const input: InputState = { x: 0, y: 0, action: false, held: false, ping: false };
  const wrap = document.createElement("div");
  wrap.className = "solo-sticks";
  wrap.innerHTML = `
    <div class="stick-side stick-left">
      <div class="stick-name">${name}</div>
      <div class="stick-pad" data-kind="pad"><div class="stick-knob"></div></div>
    </div>
    <div class="stick-side stick-right">
      <button class="stick-act ghost-mini" data-kind="ping" type="button">喊</button>
      <button class="stick-act" data-kind="act" type="button">做</button>
    </div>
  `;
  root.append(wrap);
  const pad = wrap.querySelector(".stick-pad") as HTMLElement;
  const knob = wrap.querySelector(".stick-knob") as HTMLElement;
  const pointers = new Map<number, "pad" | "act" | "ping">();

  const apply = (cx: number, cy: number) => {
    const r = pad.getBoundingClientRect();
    const x = (cx - (r.left + r.width / 2)) / (r.width / 2);
    const y = (cy - (r.top + r.height / 2)) / (r.height / 2);
    const mag = Math.hypot(x, y) || 1;
    input.x = mag > 1 ? x / mag : x;
    input.y = mag > 1 ? y / mag : y;
    knob.style.transform = `translate(${input.x * 22}px, ${input.y * 22}px)`;
  };

  const down = (e: PointerEvent) => {
    const t = e.target as HTMLElement;
    const kind = (t.closest("[data-kind]") as HTMLElement | null)?.dataset.kind as "pad" | "act" | "ping" | undefined;
    if (!kind) return;
    pointers.set(e.pointerId, kind);
    if (kind === "pad") apply(e.clientX, e.clientY);
    if (kind === "act") {
      input.action = true;
      input.held = true;
    }
    if (kind === "ping") input.ping = true;
  };
  const move = (e: PointerEvent) => {
    if (pointers.get(e.pointerId) === "pad") apply(e.clientX, e.clientY);
  };
  const up = (e: PointerEvent) => {
    const kind = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);
    if (kind === "pad") {
      input.x = 0;
      input.y = 0;
      knob.style.transform = "translate(0,0)";
    }
    if (kind === "act") input.held = false;
  };

  wrap.addEventListener("pointerdown", down);
  wrap.addEventListener("pointermove", move);
  wrap.addEventListener("pointerup", up);
  wrap.addEventListener("pointercancel", up);

  const keys = new Set<string>();
  const onKey = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    if (e.type === "keydown") keys.add(e.key);
    else keys.delete(e.key);
    input.x = (keys.has("d") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("a") || keys.has("ArrowLeft") ? 1 : 0);
    input.y = (keys.has("s") || keys.has("ArrowDown") ? 1 : 0) - (keys.has("w") || keys.has("ArrowUp") ? 1 : 0);
    const act = keys.has(" ") || keys.has("j") || keys.has("J");
    if (e.type === "keydown" && act) input.action = true;
    input.held = act;
    if (e.type === "keydown" && (e.key === "h" || e.key === "H")) input.ping = true;
  };
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);

  return {
    input,
    destroy: () => {
      wrap.remove();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    },
  };
}

export function consume(input: InputState, key: "action" | "ping"): boolean {
  if (!input[key]) return false;
  input[key] = false;
  return true;
}
