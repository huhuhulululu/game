import { start } from "./app";
import { loadArt } from "./scenes/art";
import "./styles.css";

loadArt();

const root = document.querySelector("#app");
if (!root) throw new Error("#app missing");
start(root as HTMLElement);

document.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
  },
  { passive: false },
);
