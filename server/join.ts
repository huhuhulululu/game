/** Room hello rules, kept out of the Vite server so tests can call them. */

export function makeRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRTUVWXY23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function resolveHelloRoom(
  requested: string,
  existing: { has: (id: string) => boolean },
  make = makeRoomCode,
): { room: string; create: boolean } | { err: string } {
  const raw = (requested || "").trim().toUpperCase();
  if (!raw) return { room: make(), create: true };
  if (!existing.has(raw)) return { err: "没有这间山谷" };
  return { room: raw, create: false };
}

export function roomIsFull(presentCount: number): boolean {
  return presentCount >= 2;
}
