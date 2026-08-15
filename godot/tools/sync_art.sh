#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/public/art"
DST="$ROOT/godot/assets/art"
mkdir -p "$DST"
# public/art is the old canvas dump. Never overlay it onto Godot-painted files.
if [[ -d "$SRC" ]] && compgen -G "$SRC/*" > /dev/null; then
	echo "public/art is the old canvas dump; keeping godot/assets/art"
else
	echo "no public/art sheet dump; keeping godot/assets/art"
fi
