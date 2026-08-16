# Story 001: Farm, fortune, board, wild

> **Epic**: Village / wild look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (田 / 卦棚 / 黎明看板 / 荒野) + `godot/docs/ART.md`
**Requirement**: `TR-look-005`
**ADR Governing Implementation**: ADR-0003: One painted warm-dusk world
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] 田 sits young / ripe plants from snap `plots` (visible when planted)
- [x] 卦棚 and 黎明看板 sit on valley `Y` / `B` tiles
- [x] Wilderness uses one painted `bed-wild.png`, not hung pixel-ball trees
- [x] New props are magenta-key with real `a=0` (no leftover dusk RGB)
- [x] Play-path proof prints village / wild tokens through `play.tscn`
- [x] No FAIL cover props restuck; no 魂; no look names in `src/`

## Implementation Notes

Keep `CROP_YOUNG` / `CROP_RIPE` name strings. Sit new files (`prop-sprout`, `prop-ripe`, `prop-fortune`, `prop-dawn`) via `_sit_plot` (not `Look.hung`, not `_crop_at`). Do not recrop FAIL stickers. Do not hang `prop-cover-*` / hut / lodge / tuft mounds. Fog and live fire / gate stay.

## Out of Scope

- Restyle kitchen / mine tiles
- Recrop FAIL PNGs
- Hang stall / anvil / pine on the valley floor

## QA Test Cases

- **AC-1**: Play sits farm / fortune / board and the wild bed
  - Setup: `play_village.tscn` feeds snaps into `play.tscn`
  - Verify: sprout / ripe / fortune / dawn / `bed-wild`; no FAIL; no hung `prop-tree`
  - Pass condition: `PLAY_VILLAGE_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_village.tscn` tokens + `production/qa/evidence/village-wild-look-evidence.md`
**Status**: [x] Complete — Play-path tokens + 112 tests

## Dependencies

- Depends on: r1-first-evening
- Unlocks: later rest / stall look (not this slice)

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `PLAY_CROP_SIT` `PLAY_FORTUNE_SIT` `PLAY_DAWN_SIT` `PLAY_WILD_BED` `PLAY_VILLAGE_OK`
**Code Review**: Skipped — lean
