# Story 004: Painted night

> **Epic**: Coat walk and sit feel
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (夜里) + `godot/docs/ART.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Server snap `night` / `dusk` still drives the plaque and the bed
- [ ] Valley / wild beds dim toward a warm night; painted lanterns stay the light
- [ ] Kitchen / mine stay hearth-lit at night
- [ ] Play-path proof prints painted-night tokens through `play.tscn`
- [ ] No new art pack; no 魂; no fear chrome; no FAIL restick; `bed-valley.png` not replaced

## Implementation Notes

Dusk becomes night on the existing beds. Do not hang a second lamp pack. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New lantern / night art pack
- 魂 / sanity meter / fear chrome

## QA Test Cases

- **AC-1**: Play dims the painted bed at night and keeps indoor hearths
  - Setup: `play_night.tscn` feeds dusk, night valley, night kitchen, night wild
  - Verify: bed grade + plaque 夜里; kitchen stays lit; no FAIL restick
  - Pass condition: `PLAY_NIGHT_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_night.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel place-ear, r1-painted-valley
- Unlocks: none (two-phone stays human)
