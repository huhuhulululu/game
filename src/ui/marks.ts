/** Small drawn marks for bag and book. Not one gold square. */

export type MarkKind = "fish" | "leaf" | "wood" | "stone" | "seed" | "flame" | "cook" | "map" | "goods";

export function itemMark(id: string): MarkKind {
  const base = id.split(":")[0];
  if (base.includes("fish")) return "fish";
  if (base === "torch") return "flame";
  if (base === "wood" || base.includes("blade")) return "wood";
  if (base === "ore" || base === "flint" || base === "gem") return "stone";
  if (base.endsWith("_seed")) return "seed";
  if (base === "herb" || base === "osmanthus" || base === "greens") return "leaf";
  if (
    base === "mush" ||
    base === "tea" ||
    base === "tomato" ||
    base === "wheat" ||
    base === "egg" ||
    base === "meat" ||
    base === "morsel" ||
    base === "mushroom"
  )
    return "cook";
  return "goods";
}

const PATHS: Record<MarkKind, string> = {
  fish: `<path d="M3 12c3-5 8-6 12-4 2 1 4 2 6 4-2 2-4 3-6 4-4 2-9 1-12-4z" fill="#6a8a9b"/><path d="M15 12a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0z" fill="#f4e7d2"/><path d="M3 12l-2-3v6z" fill="#4a6a78"/>`,
  leaf: `<path d="M12 21c-6-4-8-10-6-15 6-1 11 4 12 11-2 2-4 3-6 4z" fill="#3f6d5c"/><path d="M12 21c0-8 2-12 6-15" fill="none" stroke="#2a4a38" stroke-width="1.2"/>`,
  wood: `<path d="M6 4h12l2 16H4z" fill="#8a6238"/><path d="M8 8h8M7 13h10M9 18h6" fill="none" stroke="#5a3a22" stroke-width="1.2"/>`,
  stone: `<path d="M5 16 8 7h8l4 9-5 3H9z" fill="#7d8490"/><path d="M8 12l3-3 4 2" fill="none" stroke="#4a5058" stroke-width="1.1"/>`,
  seed: `<ellipse cx="12" cy="14" rx="4" ry="6" fill="#c45c26"/><path d="M12 8c2-4 6-4 7-1" fill="none" stroke="#3f6d5c" stroke-width="1.3"/>`,
  flame: `<path d="M12 21c-4 0-6-3-6-7 0-4 3-7 4-10 3 3 4 5 4 8 2-1 4 1 4 4 0 3-2 5-6 5z" fill="#c45c26"/><path d="M12 18c-1.6 0-2.4-1.2-2.4-2.6 0-1.4 1-2.6 1.6-3.8.8 1.2 1.2 2 1.2 3 .8-.4 1.6.4 1.6 1.6 0 1.2-.8 1.8-2 1.8z" fill="#f0c27a"/>`,
  cook: `<path d="M5 11h14l-1 8H6z" fill="#c45c26"/><path d="M8 11V8h8v3" fill="none" stroke="#8a3a16" stroke-width="1.4"/><ellipse cx="12" cy="11" rx="8" ry="2.2" fill="#e08a4f"/>`,
  map: `<path d="M4 6l5 2 6-3 5 2v13l-5-2-6 3-5-2z" fill="#3f6d5c"/><path d="M9 8v13M15 5v13" fill="none" stroke="#2a4a38" stroke-width="1.1"/>`,
  goods: `<path d="M7 9h10l1 11H6z" fill="#c9a06a"/><path d="M9 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="#8a6238" stroke-width="1.4"/>`,
};

export function markSvg(kind: MarkKind): string {
  return `<svg class="mark" viewBox="0 0 24 24" aria-hidden="true">${PATHS[kind]}</svg>`;
}

export function slipHtml(kind: MarkKind, title: string, note?: string, take?: string): string {
  const inner = `${markSvg(kind)}<b>${title}</b>${note ? `<span>${note}</span>` : ""}`;
  if (take) return `<button type="button" class="slip" data-take="${take}">${inner}</button>`;
  return `<div class="slip">${inner}</div>`;
}
