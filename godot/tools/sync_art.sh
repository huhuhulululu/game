#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p "$ROOT/godot/assets/art"
rsync -a --delete "$ROOT/public/art/" "$ROOT/godot/assets/art/"
echo "synced $(ls "$ROOT/godot/assets/art" | wc -l) painted files"
