#!/usr/bin/env bash
set -euo pipefail
VER="${GODOT_TEMPLATE_VERSION:-4.4.1.stable}"
TPL="${GODOT_TEMPLATE_DIR:-$HOME/.local/share/godot/export_templates/$VER}"
mkdir -p "$TPL"
if [[ -f "$TPL/web_nothreads_release.zip" ]]; then
  echo "templates already at $TPL"
  exit 0
fi
TPZ="${GODOT_TEMPLATE_TPZ:-/tmp/godot-tpl/templates.tpz}"
URL="${GODOT_TEMPLATE_URL:-https://github.com/godotengine/godot-builds/releases/download/4.4.1-stable/Godot_v4.4.1-stable_export_templates.tpz}"
if [[ ! -f "$TPZ" ]]; then
  mkdir -p "$(dirname "$TPZ")"
  curl -L --retry 4 --retry-delay 4 -C - -o "$TPZ" "$URL"
fi
unzip -o -j "$TPZ" \
  templates/web_nothreads_debug.zip \
  templates/web_nothreads_release.zip \
  templates/web_debug.zip \
  templates/web_release.zip \
  -d "$TPL"
echo "installed web templates to $TPL"
