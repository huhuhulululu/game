# Story 010: Painted path

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (探险 / 走过去才亮) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Unread wild sits a heavier dusk wash on the painted `bed-wild`; walking lifts tiles from snap `revealed` / `visible`
- [x] Mate-shared tiles from the snap sit as written path (server already merges vision)
- [x] Kitchen / mine / village stay fully painted; no black ring; plaque unchanged
- [x] Play-path proof prints painted-path tokens through `play.tscn`
- [x] No 魂; no Wilson map chrome; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already writes explored tiles and shares them when mates are near. Do not move those rules into Godot. Sit a warm dusk wash on unread wild. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Weather slices (wind / snow)
- 虫洞 / 丝巢 / 燧石火把 look
- 魂 / Wilson / Don't Starve chrome / fear veil

## QA Test Cases

- **AC-1**: Play lifts a dusk wash as the wild path is written
  - Setup: `play_path.tscn` feeds unread wild, a walked snap, a shared snap, then kitchen
  - Verify: unread wash is warm paper not black; walked tiles lift; kitchen is clear; `bed-wild` stays
  - Pass condition: `PLAY_PATH_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_path.tscn` tokens
**Status**: [x] Complete — Play-path tokens + 129 tests

## Dependencies

- Depends on: r1-village-wild, r1-evening-places painted fog
- Unlocks: wild set pieces only if this holds

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `PLAY_PATH_DARK` `PLAY_PATH_WALK` `PLAY_PATH_SHARE` `PLAY_PATH_KNOWN` `PLAY_PATH_OK`
**Code Review**: Skipped — lean
