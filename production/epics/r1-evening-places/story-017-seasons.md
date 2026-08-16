# Story 017: Seasons

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (春夏秋冬会转) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Plaque keeps `日 %s · %s · %s · 金 %s` and can show 春 / 夏 / 秋 / 冬 from the snap; `seasonOf` stays in the server
- [x] One painted `bed-valley.png` stays; winter is cooler paper, summer is warmer; not four beds
- [x] Kitchen / mine stay hearth-lit; no season HUD ring
- [x] Play-path proof prints season tokens through `play.tscn`
- [x] No 魂; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already turns the season every three days. Do not move those rules into Godot. Sit the wood plaque and a light paper tint on the existing beds. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed. Do not invent more wild props.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Four new valley beds
- Season HUD ring
- Weather slices (wind / snow)
- New wild props
- 魂 / Wilson / Don't Starve chrome / sticker box

## QA Test Cases

- **AC-1**: Play turns the plaque through four seasons on one bed
  - Setup: `play_sea.tscn` feeds 春 / 夏 / 秋 / 冬 snaps, then kitchen
  - Verify: plaque words; same `bed-valley.png`; summer warmer / winter cooler; kitchen has no season tint
  - Pass condition: `PLAY_SEA_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_sea.tscn` tokens
**Status**: [x] Complete — Play-path tokens + 136 tests

## Dependencies

- Depends on: r1-evening-places night bite
- Unlocks: 矿多层 only if this holds

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `PLAY_SEA_TURN` `PLAY_SEA_SUMMER` `PLAY_SEA_WINTER` `PLAY_SEA_HEARTH` `PLAY_SEA_OK`
**Code Review**: Skipped — lean
