/** Light Don't Starve-style seasons. Four stretches of days, then it turns. */

export const SEASONS = ["春", "夏", "秋", "冬"] as const;
export type Season = (typeof SEASONS)[number];

export function seasonOf(day: number): Season {
  return SEASONS[Math.floor(Math.max(0, day) / 3) % 4];
}

export function nightAfter(season: Season): number {
  if (season === "冬") return 0.5;
  if (season === "夏") return 0.7;
  return 0.62;
}

export function fireLife(season: Season): number {
  if (season === "冬") return 52;
  if (season === "夏") return 100;
  return 80;
}

export function forageMul(season: Season): number {
  if (season === "冬") return 0.55;
  if (season === "春") return 1.15;
  return 1;
}

export function growBonus(season: Season): boolean {
  return season === "春" || season === "夏";
}
