#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/public/art"
DST="$ROOT/godot/assets/art"
mkdir -p "$DST"
# Keep Godot's painted sheets in sync with public/art without requiring rsync.
cp -a "$SRC"/. "$DST"/
echo "synced $(find "$DST" -maxdepth 1 -type f ! -name '*.import' | wc -l) painted files"
