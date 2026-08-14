/**
 * Don't Starve Together ocean-fish weight (public wiki).
 * weight = rand * (max - min) + min
 * Heavy ≈ above 70% of the range (Crabby Hermit threshold).
 * @see https://dontstarve.wiki.gg/wiki/Weight
 */

import { FISH } from "./tables";

export type FishGrade = "common" | "thick" | "heavy";

export interface FishCatch {
  species: string;
  name: string;
  weight: number;
  grade: FishGrade;
  bagId: string;
  record: boolean;
}

export function gradeOf(weight: number, min: number, max: number): FishGrade {
  const span = Math.max(0.01, max - min);
  const pct = (weight - min) / span;
  if (pct >= 0.7) return "heavy";
  if (pct >= 0.5) return "thick";
  return "common";
}

export function bagIdFor(species: string, grade: FishGrade): string {
  if (species === "silver") return grade === "heavy" ? "rare_fish_heavy" : "rare_fish";
  if (grade === "heavy") return "fish_heavy";
  if (grade === "thick") return "fish_thick";
  return "fish";
}

export function rollCatch(
  species: string,
  rand: () => number,
  best: number | undefined,
): FishCatch {
  const def = FISH.find((f) => f.id === species) ?? FISH[0];
  const min = def.minW;
  const max = def.maxW;
  const weight = Math.round((rand() * (max - min) + min) * 10) / 10;
  const grade = gradeOf(weight, min, max);
  return {
    species,
    name: def.name,
    weight,
    grade,
    bagId: bagIdFor(species, grade),
    record: best === undefined || weight > best,
  };
}

export function gradeName(grade: FishGrade): string {
  if (grade === "heavy") return "沉重";
  if (grade === "thick") return "厚实";
  return "普通";
}
