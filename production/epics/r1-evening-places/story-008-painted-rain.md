# Story 008: Painted rain

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (天气 / 雨) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Valley / wild beds sit soft dusk rain from snap `weather` rain / storm
- [ ] Kitchen / mine stay dry; plaque stays `日 · 季 · 相 · 金` (no weather ring)
- [ ] Wild rain snap can show the server toast that the fire went out; Godot does not age fires
- [ ] Play-path proof prints painted-rain tokens through `play.tscn`
- [ ] No 魂; no Don't Starve overlay; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already rolls weather and puts wild fires out in the rain. Do not move those rules into Godot. Sit a warm dusk veil on the existing beds. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Fog / wind / snow look
- Weather HUD ring or plaque rewrite
- 魂 / Wilson / Don't Starve chrome

## QA Test Cases

- **AC-1**: Play sits dusk rain on valley / wild and keeps indoor hearths dry
  - Setup: `play_rain.tscn` feeds clear, rain valley, rain kitchen, rain mine, rain wild with the fire-out toast
  - Verify: rain shader on outdoor beds; kitchen / mine dry; `bed-valley.png` still the valley bed
  - Pass condition: `PLAY_RAIN_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_rain.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places campfire pot, r1-coat-feel painted night
- Unlocks: none (two-phone stays human)
