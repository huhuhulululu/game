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
  heldName: string;
  fishing: string;
  fishMark: number;
  fishPull: number;
  hunger: number;
  torch: boolean;
  ping: number;
  away?: boolean;
  busy?: "" | "chop" | "sit" | "fish" | "forge";
}

export interface EnemySnap {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hue: string;
  name: string;
  flash: number;
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
  weather: { id: string; name: string };
  waitingFortune: ("left" | "right")[];
  bag: { id: string; n: number; name: string; fresh?: number }[];
  ice: { id: string; n: number; name: string; fresh?: number }[];
  gear: string[];
  cookbook: string[];
  pot: string[];
  potReady: string;
  plots: { seed?: string; stage: number }[];
  partner: { name: string; zone: Zone; online: boolean; biome?: string; ping?: number; where?: string } | null;
  zone: Zone;
  tiles: string[];
  floor: number;
  encounter: string;
  clock: number;
  night: boolean;
  dusk: boolean;
  lit: boolean;
  rush: boolean;
  combo: number;
  revealed: number[];
  visible: number[];
  fires: number[];
  youAt: { x: number; y: number };
  partnerAt: { x: number; y: number; zone: Zone } | null;
  biome: string;
  season: string;
  hp: number;
  maxHp: number;
  hunger: number;
  mapRev: number;
  full: boolean;
  actors: ActorSnap[];
  enemies: EnemySnap[];
  orders: OrderSnap[];
  toasts: string[];
  prompt: string;
  skills: { fish: number; cook: number; fight: number; forge: number };
  album: { fish: number; fishMax: number; cook: number; cookMax: number; map: number };
  board: string[];
}

export type ClientMsg =
  | { t: "hello"; room: string; name: string; prefer?: "left" | "right" }
  | { t: "input"; x: number; y: number; action: boolean; held: boolean; ping: boolean }
  | { t: "sleep" }
  | { t: "take"; id: string };

export type ServerMsg =
  | { t: "joined"; side: "left" | "right"; room: string }
  | { t: "snap"; snap: WorldSnap }
  | { t: "err"; text: string };
