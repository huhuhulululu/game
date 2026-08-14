import type { Zone } from "../game/types";

export interface InputState {
  x: number;
  y: number;
  action: boolean;
  held: boolean;
  ping: boolean;
}

export interface ActorSnap {
  id: string;
  name: string;
  side: "left" | "right";
  x: number;
  y: number;
  zone: Zone;
  hp: number;
  maxHp: number;
  facing: number;
  held: string;
  fishing: string;
}

export interface EnemySnap {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hue: string;
  name: string;
}

export interface OrderSnap {
  name: string;
  recipe: string;
  left: number;
}

export interface WorldSnap {
  you: string;
  room: string;
  day: number;
  gold: number;
  bond: number;
  fortune: { title: string; life: string; tilt: string } | null;
  waitingFortune: ("left" | "right")[];
  bag: { id: string; n: number; name: string }[];
  plots: { seed?: string; stage: number }[];
  partner: { name: string; zone: Zone; online: boolean } | null;
  zone: Zone;
  tiles: string[];
  floor: number;
  encounter: string;
  actors: ActorSnap[];
  enemies: EnemySnap[];
  orders: OrderSnap[];
  toasts: string[];
  prompt: string;
  skills: { fish: number; cook: number; fight: number; forge: number };
}

export type ClientMsg =
  | { t: "hello"; room: string; name: string; prefer?: "left" | "right" }
  | { t: "input"; x: number; y: number; action: boolean; held: boolean; ping: boolean }
  | { t: "sleep" };

export type ServerMsg =
  | { t: "joined"; side: "left" | "right"; room: string }
  | { t: "snap"; snap: WorldSnap }
  | { t: "err"; text: string };
