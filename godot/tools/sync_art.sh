#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/public/art"
DST="$ROOT/godot/assets/art"
mkdir -p "$DST"
# Old canvas sheets live in public/art when present. Do not wipe Godot-painted files.
if [[ -d "$SRC" ]] && compgen -G "$SRC/*" > /dev/null; then
	cp -a "$SRC"/. "$DST"/
	echo "synced $(find "$DST" -maxdepth 1 -type f ! -name '*.import' | wc -l) painted files"
else
	echo "no public/art sheet dump; keeping godot/assets/art"
fi
