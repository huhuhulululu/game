#!/usr/bin/env python3
"""Tighten only anvil, altar, and ground. Do not rerun the full paint pipeline."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from paint_look import finish_anvil_altar, paint_ground, save  # noqa: E402


def main() -> None:
    finish_anvil_altar()
    save(paint_ground(), "ground-valley.png")
    print("tightened")


if __name__ == "__main__":
    main()
