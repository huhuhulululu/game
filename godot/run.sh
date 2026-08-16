#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! command -v godot >/dev/null 2>&1; then
  echo "godot not on PATH" >&2
  exit 2
fi
"$ROOT/godot/tools/export_web.sh"
godot --headless --path "$ROOT/godot" --script res://scripts/headless_walk.gd
godot --headless --path "$ROOT/godot" --script res://scripts/headless_loop.gd
