#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if ! command -v godot >/dev/null 2>&1; then
  echo "godot not on PATH" >&2
  exit 2
fi
"$ROOT/godot/tools/install_templates.sh"
"$ROOT/godot/tools/sync_art.sh"
mkdir -p "$ROOT/godot/export/web"
godot --headless --path "$ROOT/godot" --import
godot --headless --path "$ROOT/godot" --export-release Web "$ROOT/godot/export/web/index.html"
if [[ ! -f "$ROOT/godot/export/web/index.html" ]]; then
  echo "export did not write index.html" >&2
  exit 1
fi
ls -lh "$ROOT/godot/export/web"
