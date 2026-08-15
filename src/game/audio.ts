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

export function createAudio() {
  let ctx: AudioContext | null = null;
  let muted = false;
  let drone: { stop: () => void } | null = null;

  const alive = () => typeof AudioContext !== "undefined";

  const ensure = () => {
    if (!alive()) return null;
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
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

  const startDrone = () => {
    if (muted || drone) return;
    const ac = ensure();
    if (!ac) return;
    const master = ac.createGain();
    master.gain.value = 0.016;
    master.connect(ac.destination);
    const notes = [196, 247, 294, 392];
    const oscs = notes.map((n) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = n;
      g.gain.value = 0.18;
      o.connect(g);
      g.connect(master);
      o.start();
      return o;
    });
    drone = {
      stop: () => {
        oscs.forEach((o) => o.stop());
        drone = null;
      },
    };
  };

  return {
    get muted() {
      return muted;
    },
    setMuted(v: boolean) {
      muted = v;
      if (v) drone?.stop();
      else startDrone();
    },
    tone,
    unlock: () => {
      ensure();
      startDrone();
    },
  };
}
