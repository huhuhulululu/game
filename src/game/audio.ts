export function createAudio() {
  let ctx: AudioContext | null = null;
  let muted = false;
  let drone: { stop: () => void } | null = null;

  const ensure = () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const beep = (freq: number, dur: number, type: OscillatorType, gain = 0.04) => {
    if (muted) return;
    const ac = ensure();
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

  const tone = (
    kind: "tap" | "chop" | "sizzle" | "serve" | "ok" | "soft" | "water" | "hit" | "drop" | "level",
  ) => {
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
  };

  const startDrone = () => {
    if (muted || drone) return;
    const ac = ensure();
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
