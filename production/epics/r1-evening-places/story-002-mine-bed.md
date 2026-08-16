# Story 002: Mine bed

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (矿) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] Mine sits one painted `bed-mine.png`, not tiled `tex-stone` wallpaper
- [ ] Ore / stairs / chest / door sit new magenta-key props with real `a=0`
- [ ] Old ink mine pack stays on disk and is not hung in Play
- [ ] Play-path proof prints mine tokens through `play.tscn`
- [ ] No FAIL cover props; no 魂; no look names in `src/`

## Implementation Notes

Do not overwrite `prop-ore` / `prop-stairs` / `prop-door-open`. Sit new names. Keep `tex-stone.png` for mine walls (test lock). Do not recrop FAIL. Do not restyle kitchen.

## Out of Scope

- Kitchen restyle
- Forge / stall on the valley
- Sleep look
- Recrop FAIL PNGs

## QA Test Cases

- **AC-1**: Play sits the mine bed and dusk veins
  - Setup: `play_mine.tscn` feeds a mine snap into `play.tscn`
  - Verify: `bed-mine`, vein / steps / mouth; no `prop-stairs` / FAIL
  - Pass condition: `PLAY_MINE_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_mine.tscn` tokens + `production/qa/evidence/mine-bed-evidence.md`
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places kitchen
- Unlocks: later forge / stall look
