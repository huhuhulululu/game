# Story 016: Place beds

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

008 already repainted kitchen / mine / wild from valley chips in the same warm-dusk cabin-timber language. Open those three beds and the valley bed. Replace only if one still reads as tiled fill, collage, or a different pack. If they already match, do not replace.

## Acceptance Criteria

- [x] Kitchen / mine / wild / valley opened and judged against one dusk language
- [x] No bed replaced — they already match; valley is not broken
- [x] No props hung on the beds; no recrop; no new face
- [x] HUD / hands / log / name stay as they are
- [x] `bed-valley.png` not replaced; no 魂; no look names in `src/`
- [x] 015 stays Complete; 019 stays parked

## Implementation Notes

Judgment only. Kitchen, mine, and wild are 008 valley-chip paintings, not a second pack. Valley is the lock. Do not generate a replacement. Do not hang FAIL / torn-off / OLD_INK. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / new HUD chrome
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome
- Another systems story
- Reopen quiet name (015 stays Complete)

## QA Test Cases

- **AC-1**: Place beds already match; nothing replaced
  - Setup: story lock + existing bed sizes
  - Verify: kitchen 576×324, mine 576×324, wild 864×576, valley 1224×612; painter still refuses valley / cover crop
  - Pass condition: test locks; evidence says replaced nothing

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `production/qa/evidence/place-beds-evidence.md`
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–015 Complete; r1-coat-feel 008 one-paint
- Unlocks: none. Stop new WORLD systems.

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 6/6. Opened kitchen / mine / wild / valley. Same dusk language. Replaced nothing.
**Deviations**: None. Lean: no new painter, no new play scene.
**Test Evidence**: Visual/Feel — `godot/project.test.ts` place-beds lock
**Code Review**: Skipped — lean
