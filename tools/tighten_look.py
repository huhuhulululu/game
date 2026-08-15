#!/usr/bin/env python3
"""Tighten only anvil, altar, and ground. Do not rerun the full paint pipeline."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from paint_look import finish_sit_props  # noqa: E402


def main() -> None:
    finish_sit_props()
    print("tightened")


if __name__ == "__main__":
    main()
