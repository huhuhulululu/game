import { createAudio } from "./game/audio";
import { loadSave, writeSave } from "./game/save";
import type { GameContext, SceneId } from "./game/types";
import { mountBoot } from "./scenes/boot";
import { mountLetter } from "./scenes/letter";
import { mountPlay } from "./scenes/play";
import { mountRoom } from "./scenes/room";
import { mountScrapbook } from "./scenes/scrapbook";
import { mountSetup } from "./scenes/setup";

export function start(root: HTMLElement): void {
  const audio = createAudio();
  const ctx: GameContext = {
    save: loadSave(),
    persist: () => writeSave(ctx.save),
    goto: (id) => show(id),
    lastResult: null,
    myName: "",
    roomCode: "",
    prefer: "",
    audio,
  };
  audio.setMuted(ctx.save.muted);

  let unmount = () => {};
  const show = (id: SceneId) => {
    unmount();
    if (id === "boot") unmount = mountBoot(root, ctx);
    if (id === "setup") unmount = mountSetup(root, ctx);
    if (id === "room") unmount = mountRoom(root, ctx);
    if (id === "play") unmount = mountPlay(root, ctx);
    if (id === "letter") unmount = mountLetter(root, ctx);
    if (id === "scrapbook") unmount = mountScrapbook(root, ctx);
  };
  show("boot");
}
