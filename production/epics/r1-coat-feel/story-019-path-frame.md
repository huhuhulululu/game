# Story 019: Path frame

> **Epic**: Coat walk and sit feel
> **Status**: Complete
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `godot/docs/ART.md` + `docs/CHARTER.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

Live leftover after the dusk grade: the playable coat still reads as a postage stamp on a mural. Camera / framing only. Follow the coat so they sit in the painted path, not a tiny figure in a huge empty bed. BODY stays 240. Do not generate art.

This is coat-feel 019. Evening-places fireside 019 stays parked.

## Acceptance Criteria

- [x] Valley camera follows the coat into a path frame; they sit on the painted path, not a mural stamp
- [x] BODY stays 240; same idle face; same walk / sit sheets
- [x] No new art; title couple not pasted; `bed-valley.png` not replaced; no hung props
- [x] If framing crops the painting into a mess, revert and say so
- [x] Stickers off; no 魂; no look names in `src/`; no HUD chrome
- [x] Play-path + test locks; 018 Complete; fireside 019 parked; two-phone Blocked

## Implementation Notes

Godot look only. Zoom and look-at. Do not generate a new face. Do not rewrite coat PNGs. Do not recrop FAIL. Do not hang torn-off / OLD_INK. Do not replace `bed-valley.png`. Do not unpark fireside. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / new HUD chrome
- Finish fireside (`r1-evening-places/story-019-fireside.md`)
- 魂 / Wilson / Don't Starve chrome
- Another systems story
- Reopen coat dusk (018 stays Complete)

## QA Test Cases

- **AC-1**: Camera sits the coat in the path
  - Setup: `play_frame.tscn` feeds Play on the valley bed
  - Verify: valley zoom is a path frame; camera follows you, not the bed center; same `char-warm.png`; BODY 240; no title couple
  - Pass condition: `PLAY_FRAME_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_frame.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–018 Complete
- Unlocks: none. Stop new WORLD systems.

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6. Valley zoom 2.18 follows the coat; look sits above the feet. Same idle face. Same bed. Painting stayed readable — hut, path, heads intact. Not reverted.
**Deviations**: None. Lean: camera / framing only. No new person. No bed replace.
**Test Evidence**: Visual/Feel — `godot/project.test.ts` path-frame lock + `PLAY_FRAME_OK`. `PLAY_DUSK_OK` `PLAY_IN_OK` `PLAY_NAME_OK` still hold.
**Code Review**: Skipped — lean
