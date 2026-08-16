# Visual Entity & Screen Inventory

> Generated: 2026-08-15
> Scope: **valley look only** (P1). Not a full-game inventory.
> Sources: `design/art/art-bible.md`, `godot/docs/ART.md`, `docs/asset-audit.md`, `design/gdd/game-concept.md`, `godot/scripts/valley_world.gd`

## Entities

| # | Name | Type | Description | Source | Status |
|---|------|------|-------------|--------|--------|
| 1 | Valley painted bed | Environment | One warm-dusk sheet: land, path, creek, hut, lodge, enter-frame trees. Not restuck crops. | art-bible §5, asset-audit FAIL | Needed |
| 2 | Magenta-key valley props (alt) | Environment | New `#FF00FF` keyed sheets only if the bed cannot hold houses. Not recrops of FAIL PNGs. | art-bible §8, this spec | Needed (alt) |
| 3 | 暖 | Character | Camel coat, bag. Existing `char-warm-*`. Cover-coat person. | art-bible §4 | Done (reuse) |
| 4 | 松 | Character | Olive jacket. Existing `char-pine-*`. Cover-coat person. | art-bible §4 | Done (reuse) |
| 5 | Cover lock | Environment | `cover-valley.png` 1280×720 RGB. Title / boot only. Read-only. | ART.md, audit PASS | Done |
| 6 | HUD wood | UI | `tex-slip` / `tex-plaque`. No 魂. | art-bible §6 | Done (reuse) |

## UI Screens

| # | Screen Name | Description | Source | Status |
|---|-------------|-------------|--------|--------|
| 1 | Title / boot | Cover as splash. No character collage. | art-bible §6 | Done |
| 2 | Room | Cover, room code. | art-bible §6 | Done |
| 3 | Valley HUD | `日 · 春 · 白天 · 金`. No 魂, no 饿 number. | art-bible §6 | Done (reuse) |

## HUD Elements

| # | Element | Description | Source | Status |
|---|---------|-------------|--------|--------|
| 1 | Day slip | Wood slip, words only | art-bible §6 | Done |
| 2 | 做 / 喊 | Wood chips | art-bible §6 | Done |

## Audio

| # | Name | Type | Description | Source | Status |
|---|------|------|-------------|--------|--------|
| 1 | Valley air | Ambient | Existing thin ear. Out of this spec. | CHARTER P0 | Done |

## Do not inventory (this spec)

Kitchen, mine, wild, stall, anvil, pixel-ball trees, FAIL cover crops (`prop-cover-*`, `prop-hut`, `prop-lodge`). Those crops stay on disk; do not recrop; do not list them as Needed production art.
