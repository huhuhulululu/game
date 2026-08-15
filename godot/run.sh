#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! command -v godot >/dev/null 2>&1; then
  echo "godot not on PATH" >&2
  exit 2
fi
"$ROOT/godot/tools/sync_art.sh"
godot --headless --path "$ROOT/godot" --import
godot --headless --path "$ROOT/godot" --script res://scripts/headless_walk.gd
