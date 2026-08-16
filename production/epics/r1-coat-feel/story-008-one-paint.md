# Story 008: One paint

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

Live leftover after quiet chrome: coat sheets still sit on a black / dusk plate, and kitchen / mine / wild beds do not read as the same warm-dusk illustration. Torn-off generated props stay off.

## Acceptance Criteria

- [x] `char-warm` / `char-pine` walk and sit sheets have true a=0 outside the figure; no black or dusk-RGB quad
- [x] A blob walk sheet is dropped back to the last painted idle; no new face; BODY stays 192
- [x] `bed-kitchen` / `bed-mine` / `bed-wild` read as one cover-language painting; `bed-valley.png` not replaced unless broken
- [x] hole / silk / torch / smith / booth / camp-pot / beast stay off the play; quiet HUD and four-beat walk stay
- [x] Play-path + test locks; no look names in `src/`; no 魂

## Implementation Notes

Godot look only. Cut plates to a=0 (magenta-key or a true alpha pass). Reuse existing painted coats. A blob walk sheet drops back to the last painted idle — do not plant a step, do not invent a face. Paint kitchen / mine / wild from `bed-valley.png` chips as one scene. Never `cover.crop`. No sticker props on the bed. Do not generate a new character. Do not recrop FAIL. Do not hang torn-off props. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings
- Another systems story

## QA Test Cases

- **AC-1**: Coats have real alpha; place beds are one paint
  - Setup: `play_paint.tscn` feeds valley / kitchen / mine / wild snaps
  - Verify: coat corners a=0; no dusk slab on walk; beds are painted scenes; torn props stay off
  - Pass condition: `PLAY_PAINT_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_paint.tscn` tokens
**Status**: [x] Complete

## Dependencies

- Depends on: r1-coat-feel 001–007 Complete
- Unlocks: none. Stop new WORLD systems.
