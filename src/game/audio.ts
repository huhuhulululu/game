import type { AmbientKind } from "./feel";

export type ToneKind =
  | "tap"
  | "chop"
  | "sizzle"
  | "serve"
  | "ok"
  | "soft"
  | "water"
  | "hit"
  | "drop"
  | "level"
  | "step"
  | "shore"
  | "fire"
  | "door"
  | "green"
  | "night"
  | "ready"
  | "dark"
  | "bite";

const FADE = 0.85;
const BED_GAIN: Record<Exclude<AmbientKind, "">, number> = {
  day: 0.018,
  water: 0.024,
  night: 0.012,
  inn: 0.02,
};

function noiseLoop(ac: AudioContext, seconds: number): AudioBufferSourceNode {
  const n = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    last = last * 0.97 + (Math.random() * 2 - 1) * 0.03;
    d[i] = last;
  }
  const fade = Math.min(2048, n >> 3);
  for (let i = 0; i < fade; i++) {
    const a = i / fade;
    d[i] *= a;
    d[n - 1 - i] *= a;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

function startBed(ac: AudioContext, kind: Exclude<AmbientKind, "">): { kind: Exclude<AmbientKind, "">; fadeOut: () => void } {
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, ac.currentTime);
  master.gain.exponentialRampToValueAtTime(BED_GAIN[kind], ac.currentTime + FADE);
  master.connect(ac.destination);
  const stoppers: Array<() => void> = [];

  const addNoise = (seconds: number, type: BiquadFilterType, freq: number, q: number, vol: number) => {
    const src = noiseLoop(ac, seconds);
    const f = ac.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ac.createGain();
    g.gain.value = vol;
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start();
    stoppers.push(() => src.stop());
  };
  const addTone = (freq: number, vol: number) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(master);
    o.start();
    stoppers.push(() => o.stop());
  };

  if (kind === "day") {
    addNoise(2.4, "bandpass", 1800, 0.6, 0.55);
    addTone(392, 0.1);
    addTone(523, 0.05);
  } else if (kind === "water") {
    addNoise(1.8, "bandpass", 520, 0.8, 0.9);
    addNoise(2.6, "lowpass", 280, 0.5, 0.4);
    addTone(196, 0.07);
  } else if (kind === "night") {
    addNoise(3.2, "lowpass", 420, 0.5, 0.7);
    addTone(82, 0.14);
    addTone(110, 0.07);
  } else {
    addNoise(2.0, "lowpass", 240, 0.4, 0.55);
    addTone(130, 0.12);
    addTone(196, 0.06);
  }

  return {
    kind,
    fadeOut: () => {
      master.gain.cancelScheduledValues(ac.currentTime);
      const now = Math.max(master.gain.value, 0.0001);
      master.gain.setValueAtTime(now, ac.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + FADE);
      setTimeout(() => {
        for (const stop of stoppers) {
          try {
            stop();
          } catch {
            /* already stopped */
          }
        }
        try {
          master.disconnect();
        } catch {
          /* already gone */
        }
      }, FADE * 1000 + 40);
    },
  };
}

export function createAudio() {
  let ctx: AudioContext | null = null;
  let muted = false;
  let wanted: AmbientKind = "";
  let bed: { kind: Exclude<AmbientKind, "">; fadeOut: () => void } | null = null;

  const alive = () => typeof AudioContext !== "undefined";

  const ensure = () => {
    if (!alive()) return null;
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const apply = () => {
    const next = muted ? "" : wanted;
    if ((bed?.kind ?? "") === next) return;
    bed?.fadeOut();
    bed = null;
    if (!next) return;
    const ac = ensure();
    if (!ac) return;
    bed = startBed(ac, next);
  };

  const beep = (freq: number, dur: number, type: OscillatorType, gain = 0.04) => {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + dur);
  };

  const tone = (kind: ToneKind) => {
    if (muted) return;
    if (kind === "tap") beep(520, 0.06, "triangle", 0.03);
    if (kind === "chop") beep(180, 0.08, "square", 0.035);
    if (kind === "sizzle") beep(240, 0.16, "sawtooth", 0.02);
    if (kind === "serve") {
      beep(523, 0.12, "sine", 0.04);
      setTimeout(() => beep(659, 0.16, "sine", 0.035), 80);
    }
    if (kind === "ok") beep(660, 0.1, "sine", 0.04);
    if (kind === "soft") beep(392, 0.18, "sine", 0.025);
    if (kind === "water") beep(310, 0.2, "sine", 0.02);
    if (kind === "hit") beep(140, 0.07, "square", 0.04);
    if (kind === "drop") beep(740, 0.09, "triangle", 0.03);
    if (kind === "level") {
      beep(523, 0.1, "sine", 0.04);
      setTimeout(() => beep(784, 0.16, "sine", 0.04), 90);
    }
    if (kind === "step") beep(96, 0.045, "sine", 0.016);
    if (kind === "shore") {
      beep(260, 0.2, "sine", 0.012);
      setTimeout(() => beep(190, 0.16, "sine", 0.01), 70);
    }
    if (kind === "fire") beep(72, 0.09, "sawtooth", 0.01);
    if (kind === "door") {
      beep(170, 0.12, "triangle", 0.02);
      setTimeout(() => beep(128, 0.14, "sine", 0.016), 90);
    }
    if (kind === "green") beep(698, 0.07, "sine", 0.022);
    if (kind === "night") {
      beep(110, 0.28, "sine", 0.02);
      setTimeout(() => beep(82, 0.36, "sine", 0.016), 120);
    }
    if (kind === "ready") {
      beep(392, 0.08, "triangle", 0.028);
      setTimeout(() => beep(523, 0.12, "sine", 0.024), 70);
    }
    if (kind === "dark") beep(64, 0.14, "sawtooth", 0.03);
    if (kind === "bite") {
      beep(480, 0.07, "square", 0.028);
      setTimeout(() => beep(360, 0.08, "sine", 0.02), 50);
    }
  };

  return {
    get muted() {
      return muted;
    },
    get ambient() {
      return wanted;
    },
    setMuted(v: boolean) {
      muted = v;
      apply();
    },
    setAmbient(kind: AmbientKind) {
      wanted = kind;
      apply();
    },
    tone,
    unlock: () => {
      ensure();
      apply();
    },
  };
}
