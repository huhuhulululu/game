# Story 015: Scout find

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (荒野 / 探路) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Walking unread wild tiles can show a `脚下绊到` toast from the snap; `scoutFind` stays in the server
- [x] Bag can show the tripped item from the snap; no new grass / stone / seed prop; no new loot table
- [x] Kitchen / mine / village do not trip forage; plaque unchanged
- [x] Play-path proof prints scout-find tokens through `play.tscn`
- [x] No 魂; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already trips forage while revealing wild tiles. Do not move those rules into Godot. Sit the walk and the toast. Do not add a grass or stone prop. Do not invent a loot table. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed. After this, wild set pieces and forage are closed. Do not invent more wild props.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Weather slices (wind / snow)
- New wild props
- New loot table
- 魂 / Wilson / Don't Starve chrome / Charlie / sticker box

## QA Test Cases

- **AC-1**: Play shows a wild stumble from the snap and keeps indoor places clear
  - Setup: `play_scout.tscn` feeds unread wild, a `脚下绊到` snap, then kitchen / mine / village
  - Verify: toast and bag from snap; no forage sticker; indoor / village have no trip; `bed-valley.png` untouched
  - Pass condition: `PLAY_SCOUT_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_scout.tscn` tokens
**Status**: [x] Complete — Play-path tokens + 134 tests

## Dependencies

- Depends on: r1-evening-places old camp
- Unlocks: 夜里没火被黑暗咬一口 only if this holds

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Integration — `PLAY_SCOUT_WILD` `PLAY_SCOUT_TRIP` `PLAY_SCOUT_HEARTH` `PLAY_SCOUT_OK`
**Code Review**: Skipped — lean
