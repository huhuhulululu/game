# Story 012: Painted wormhole

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (荒野 / 虫洞) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Two magenta-key dusk wells sit on wild `H` tiles; the painted `bed-wild` stays
- [x] Pair snap can stand both coats at a hole (one may wait); hop and shared vision stay in the server
- [x] Kitchen / mine / village stay clear of the well; plaque unchanged
- [x] Play-path proof prints painted-hole tokens through `play.tscn`
- [x] No 魂; no tentacle mouth; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already hops a pair of wild `H` tiles and writes vision after the hop. Do not move those rules into Godot. Sit two warm umber earth mouths. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Weather slices (wind / snow)
- 丝巢 look
- 魂 / Wilson / Don't Starve chrome / tentacle mouth / sticker box

## QA Test Cases

- **AC-1**: Play sits two dusk wells on the wild bed and keeps indoor hearths
  - Setup: `play_hole.tscn` feeds wild with two `H` tiles, a pair at the holes, then kitchen
  - Verify: two wells sit; kitchen has none; `bed-wild` stays; `bed-valley.png` untouched
  - Pass condition: `PLAY_HOLE_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_hole.tscn` tokens
**Status**: [x] Complete — Play-path tokens + 131 tests

## Dependencies

- Depends on: r1-evening-places painted torch
- Unlocks: 丝巢 only if this holds

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `PLAY_HOLE_WILD` `PLAY_HOLE_PAIR` `PLAY_HOLE_HEARTH` `PLAY_HOLE_OK`
**Code Review**: Skipped — lean
