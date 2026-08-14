import { start } from "./app";
import "./styles.css";

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
