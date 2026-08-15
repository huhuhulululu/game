#!/usr/bin/env python3
"""One dusk. Play roofs are the cover buildings. Does not touch the cover."""

from __future__ import annotations

import importlib.util
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "godot" / "assets" / "art"


def _look() -> object:
    spec = importlib.util.spec_from_file_location("paint_look", ROOT / "tools" / "paint_look.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def sit_cover_houses() -> None:
    look = _look()
    hut = look.soften_sit(Image.open(ART / "prop-cabin.png"), 0.24)
    hut.save(ART / "prop-hut.png")
    print("wrote prop-hut.png from cover cabin", hut.size)
    lodge = look.soften_sit(look.scrub_inn(Image.open(ART / "prop-inn.png")), 0.22)
    lodge.save(ART / "prop-lodge.png")
    print("wrote prop-lodge.png from cover inn", lodge.size)
    raw = (ART / "prop-lodge.png").read_bytes()
    if b"Wanderer" in raw or b"WANDERER" in raw or b"Good Ale" in raw:
        raise SystemExit("English inn sign still on the play lodge")


def main() -> None:
    sit_cover_houses()


if __name__ == "__main__":
    main()
