# Story 018: Mine floors

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (矿 · 多层) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Floor 1 → floor 2 sits on the same `bed-mine.png`; place can say `矿 N层`; `downFloor` stays in the server
- [x] Lower floor may take a deeper dusk shade; one mine painting, not a new tileset
- [x] Kitchen / valley / wild stay as they are; encounter toast can sit from the snap
- [x] Play-path proof prints mine-floor tokens through `play.tscn`
- [x] No 魂; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already keeps mine layers and the encounter table. Do not move those rules into Godot. Sit floor 1 → floor 2 on the existing mine bed. Do not invent a new mine tileset. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed. Do not invent more wild props.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New mine tileset / four mine beds
- New sticker props
- Weather slices (wind / snow)
- New wild props
- 魂 / Wilson / Don't Starve chrome / sticker box

## QA Test Cases

- **AC-1**: Play sits floor 1 then floor 2 on one mine bed
  - Setup: `play_floor.tscn` feeds floor 1, floor 2, then kitchen / valley
  - Verify: place `矿 N层`; same `bed-mine.png`; deeper shade on floor 2; toast from snap; kitchen / valley untouched
  - Pass condition: `PLAY_FLOOR_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_floor.tscn` tokens
**Status**: [x] Complete — Play-path tokens + 137 tests

## Dependencies

- Depends on: r1-evening-places mine bed, seasons
- Unlocks: 火边 only if this holds

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Integration — `PLAY_FLOOR_ONE` `PLAY_FLOOR_TWO` `PLAY_FLOOR_HEARTH` `PLAY_FLOOR_OK`
**Code Review**: Skipped — lean
