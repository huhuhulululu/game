# Story 009: Painted fog

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (天气 / 雾) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Valley / wild beds sit soft dusk haze from snap `weather` fog
- [ ] Kitchen / mine stay clear; plaque stays `日 · 季 · 相 · 金` (no weather ring)
- [ ] Fog is warm paper mist on the bed, not a fear veil and not rain streaks
- [ ] Play-path proof prints painted-fog tokens through `play.tscn`
- [ ] No 魂; no Don't Starve overlay; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already rolls fog. Do not move those rules into Godot. Sit a warm dusk haze on the existing beds. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. After this slice, do not add more weather looks unless WORLD still has a hole.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Wind / snow look
- Weather HUD ring or plaque rewrite
- 魂 / Wilson / Don't Starve chrome / fear veil

## QA Test Cases

- **AC-1**: Play sits dusk haze on valley / wild and keeps indoor hearths clear
  - Setup: `play_fog.tscn` feeds clear, fog valley, fog kitchen, fog mine, fog wild
  - Verify: fog shader on outdoor beds; kitchen / mine clear; no rain streaks; `bed-valley.png` still the valley bed
  - Pass condition: `PLAY_FOG_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_fog.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places painted rain
- Unlocks: none (two-phone stays human)
