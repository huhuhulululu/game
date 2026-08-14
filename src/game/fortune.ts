export interface Fortune {
  id: string;
  title: string;
  life: string;
  tilt: string;
  fish: number;
  mine: number;
  cook: number;
  pair: number;
  split: number;
}

export const FORTUNES: Fortune[] = [
  {
    id: "water",
    title: "宜近水",
    life: "今天谁先把手机放下，谁先被河声原谅。",
    tilt: "鱼更肯咬。矿里安静一点。",
    fish: 16,
    mine: -4,
    cook: 0,
    pair: 0,
    split: 0,
  },
  {
    id: "together",
    title: "宜同路",
    life: "适合并肩走一段。不适合各生闷气。",
    tilt: "离得近时，掉落和经验都偏心。",
    fish: 4,
    mine: 4,
    cook: 2,
    pair: 12,
    split: -6,
  },
  {
    id: "split",
    title: "宜分头",
    life: "各做各的，回来再说话，往往更准。",
    tilt: "不在同一处时，田和客人会热闹一点。",
    fish: 4,
    mine: 6,
    cook: 4,
    pair: -4,
    split: 12,
  },
  {
    id: "kitchen",
    title: "宜入厨",
    life: "今晚谁翻锅，谁就有权决定放多少盐。",
    tilt: "客人心情好，方子也更容易从闲话里掉出来。",
    fish: 0,
    mine: 0,
    cook: 16,
    pair: 4,
    split: 0,
  },
  {
    id: "ore",
    title: "宜入山",
    life: "有些话在灯下说不清，在矿道里反而短。",
    tilt: "遭遇更杂，矿和装备的骰子偏大。",
    fish: -2,
    mine: 16,
    cook: 0,
    pair: 2,
    split: 2,
  },
  {
    id: "rest",
    title: "宜早歇",
    life: "不是懒。是把明天留成明天。",
    tilt: "打得少一点，睡一晚田会长完。",
    fish: 2,
    mine: -6,
    cook: 2,
    pair: 6,
    split: 0,
  },
  {
    id: "joke",
    title: "口彩",
    life: "今日忌争谁洗碗。宜争谁先把灯点上。",
    tilt: "什么都不保证。只保证签是给你们两个人的。",
    fish: 6,
    mine: 6,
    cook: 6,
    pair: 6,
    split: 6,
  },
];

export function fortuneById(id: string | null | undefined): Fortune | null {
  if (!id) return null;
  return FORTUNES.find((f) => f.id === id) ?? null;
}

export function rollFortune(rand: () => number): Fortune {
  return FORTUNES[Math.floor(rand() * FORTUNES.length)] ?? FORTUNES[0];
}
