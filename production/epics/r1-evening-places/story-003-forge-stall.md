# Story 003: Forge and stall

> **Epic**: Evening places look
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (工坊 / 摊位) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [x] 砧 sits `prop-smith.png` on valley `Y`; 摊 sits `prop-booth.png` on valley `S`
- [x] New names (not `prop-anvil.png` / `prop-stall.png` on valley scripts)
- [x] Magenta-key with real `a=0`
- [x] 卦棚 stays on `G` (not stacked on the forge); dawn stays on `B`
- [x] Play-path proof prints forge / stall tokens through `play.tscn`
- [x] No FAIL restick; no 魂; no Don't Starve face; no look names in `src/`

## Implementation Notes

Packed-bed tests forbid `prop-anvil.png` / `prop-stall.png` on valley scripts. Sit new files via `_sit_plot`. ART: 宁肯少，也不要摊、砧 hung as a second language. Do not recrop FAIL. Do not restyle kitchen / mine.

## Out of Scope

- Kitchen / mine beds
- Sleep look
- Recrop FAIL PNGs

## QA Test Cases

- **AC-1**: Play sits dusk forge and stall on the valley
  - Setup: `play_forge.tscn` feeds a valley snap into `play.tscn`
  - Verify: smith / booth; fortune still on G; no anvil / stall / FAIL
  - Pass condition: `PLAY_FORGE_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_forge.tscn` tokens + `production/qa/evidence/forge-stall-evidence.md`
**Status**: [x] Complete — Play-path tokens + 115 tests

## Dependencies

- Depends on: r1-village-wild
- Unlocks: sleep look

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6 passing
**Deviations**: Fortune sit moved from `Y` to `G` so the forge can occupy `Y`. Dawn stays on `B`. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `PLAY_FORGE_SIT` `PLAY_STALL_SIT` `PLAY_FORGE_OK`
**Code Review**: Skipped — lean
