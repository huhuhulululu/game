/**
 * Weighted weather, same idea as Stardew's daily weather table
 * and Minecraft's clear/rain/thunder states.
 * Spring-ish weights (public Stardew wiki ballpark): sun heavy, rain common, storm rare.
 */

export interface WeatherDef {
  id: string;
  name: string;
  w: number;
  fish: number;
  mine: number;
  cook: number;
  grow: number;
  pair: number;
  sky: string;
}

export const WEATHERS: WeatherDef[] = [
  { id: "clear", name: "晴", w: 46, fish: 0, mine: 0, cook: 0, grow: 0, pair: 0, sky: "#141810" },
  { id: "rain", name: "雨", w: 22, fish: 14, mine: -4, cook: 2, grow: 1, pair: 0, sky: "#12161c" },
  { id: "storm", name: "雷雨", w: 8, fish: -6, mine: 12, cook: -4, grow: 1, pair: 0, sky: "#0e1016" },
  { id: "fog", name: "雾", w: 14, fish: 4, mine: 2, cook: 2, grow: 0, pair: 10, sky: "#1a1c1a" },
  { id: "wind", name: "风", w: 10, fish: 6, mine: 0, cook: 0, grow: 0, pair: 0, sky: "#161814" },
];

export function weatherById(id: string | undefined): WeatherDef {
  return WEATHERS.find((w) => w.id === id) ?? WEATHERS[0];
}

export function rollWeather(rand: () => number, prev?: string): WeatherDef {
  const pool = WEATHERS.map((w) => ({ ...w, w: w.id === prev ? w.w + 8 : w.w }));
  const total = pool.reduce((s, w) => s + w.w, 0);
  let r = rand() * total;
  for (const row of pool) {
    r -= row.w;
    if (r <= 0) return weatherById(row.id);
  }
  return WEATHERS[0];
}
