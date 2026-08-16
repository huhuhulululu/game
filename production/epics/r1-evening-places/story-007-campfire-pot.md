# Story 007: Campfire pot

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (营火) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Lit wild fires sit a magenta-key camp pot on the existing `prop-fire` (haul → pot)
- [x] Play shows 烤 / 烤鱼 from the server snap; no kitchen Crock on the wild
- [x] Old ink `prop-pot` stays on disk and is not hung
- [x] Play-path proof prints campfire-pot tokens through `play.tscn`
- [x] No 魂; no Don't Starve face; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already cooks at a lit fire. Do not move those rules into Godot. Sit a small camp pot, not the old kitchen pot sheet. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Hang `prop-pot.png`
- Weather / rain look
- 魂 / Wilson / Don't Starve chrome

## QA Test Cases

- **AC-1**: Play sits a camp pot on a lit wild fire
  - Setup: `play_fire.tscn` feeds a wild fire, then a 烤 snap
  - Verify: `prop-fire` + `prop-camp-pot`; held 烤鱼; no old pot sheet
  - Pass condition: `PLAY_FIRE_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_fire.tscn` tokens
**Status**: [x] Complete — Play-path tokens + 126 tests

## Dependencies

- Depends on: r1-village-wild, r1-evening-places kitchen
- Unlocks: none (two-phone stays human)

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `PLAY_FIRE_BED` `PLAY_FIRE_POT` `PLAY_FIRE_COOK` `PLAY_FIRE_OK`
**Code Review**: Skipped — lean
