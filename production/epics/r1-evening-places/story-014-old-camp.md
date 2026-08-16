# Story 014: Old camp

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (荒野 / 旧营) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0002
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] Wild `J` keeps the existing fire + rock sit; no new remnant prop
- [x] Prompt `搜旧营` / `并肩搜旧营` and loot toasts show from the snap; `lootCamp` stays in the server
- [x] Kitchen / mine / village stay clear of the camp sit; plaque unchanged
- [x] Play-path proof prints old-camp tokens through `play.tscn`
- [x] No 魂; no Wilson camp; no DST chest; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already searches a camp once and rolls better when the pair is near. Do not move those rules into Godot. Do not invent a loot table. Fire and rock already mark the camp — do not add a prop. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed. Do not invent more wild props.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Weather slices (wind / snow)
- New wild props
- New loot table
- 魂 / Wilson / Don't Starve chrome / DST chest / sticker box

## QA Test Cases

- **AC-1**: Play sits the old camp and shows a search from the snap
  - Setup: `play_camp.tscn` feeds wild `J` with `搜旧营`, a pair search, then kitchen
  - Verify: fire + rock stay; toasts from snap; kitchen has no camp; `bed-valley.png` untouched
  - Pass condition: `PLAY_CAMP_OK` and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + `play_camp.tscn` tokens
**Status**: [x] Complete — Play-path tokens + 133 tests

## Dependencies

- Depends on: r1-evening-places painted silk
- Unlocks: 探路脚下绊到草石 only if this holds

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Integration — `PLAY_CAMP_WILD` `PLAY_CAMP_LOOT` `PLAY_CAMP_PAIR` `PLAY_CAMP_HEARTH` `PLAY_CAMP_OK`
**Code Review**: Skipped — lean
