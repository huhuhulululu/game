# Story 018: Coat dusk

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

Live leftover after coat-in-paint: the playable coat is still a different draw language from the oil bed — anime-clean vs painterly dusk. Grade / composite the existing tan / pine sheets so the coat light matches the bed (umber / gold, not a cold anime key). Soften the hard cut into the path. Same face. Same walk / sit sheets. BODY stays 240.

## Acceptance Criteria

- [x] Existing `char-warm` / `char-pine` sheets take a warm dusk grade; same idle face; no new person
- [x] Hard cut softens into the path; contact shadow stays; BODY stays 240
- [x] Bed `dusk.gdshader` grade stays `0.0`; no full-screen orange grade; title couple not pasted
- [x] If the grade reads as a blob or worse, revert and say so
- [x] `bed-valley.png` not replaced; stickers stay off; no 魂; no look names in `src/`
- [x] Play-path + test locks; 017 Complete; 019 parked; two-phone Blocked

## Implementation Notes

Godot look only. Grade / composite on `person_mat`. Do not generate a new face or body. Do not rewrite coat PNGs. Do not recrop FAIL. Do not hang torn-off / OLD_INK. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / new HUD chrome
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome
- Another systems story
- Reopen coat-in-paint (017 stays Complete)

## QA Test Cases

- **AC-1**: Existing coats take a warm dusk grade; same face
  - Setup: `play_dusk.tscn` feeds Play with you + mate on the valley bed
  - Verify: `char-warm.png` / `char-pine.png` still sit; person material grade is warm umber/gold; edge is soft; BODY 240; no title couple
  - Pass condition: `PLAY_DUSK_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_dusk.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–017 Complete
- Unlocks: none. Stop new WORLD systems.

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6. Existing coats take a warm umber/gold grade on `person_mat`. Same idle face. Bed grade stays 0.0. Not a blob — same sheets.
**Deviations**: None. Lean: no new person, no rewritten coat PNG.
**Test Evidence**: Visual/Feel — `godot/project.test.ts` coat-dusk lock + `PLAY_DUSK_OK`. `PLAY_IN_OK` still holds.
**Code Review**: Skipped — lean
