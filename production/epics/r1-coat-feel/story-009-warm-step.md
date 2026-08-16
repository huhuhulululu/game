# Story 009: Warm step

> **Epic**: Coat walk and sit feel
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `godot/docs/ART.md` + `docs/CHARTER.md`
**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

Live leftover after one paint: warm walk / walk2 sit on the painted idle. That reads as a sliding stamp. Pine walk already holds. Paint a real four-beat warm step from the same tan-coat idle.

## Acceptance Criteria

- [ ] `char-warm-walk` / `char-warm-walk2` are a real step, not a copy of idle; same face, same tan coat, same dusk light
- [ ] True a=0 outside the figure; no dusk-slab blob; no new person; BODY stays 192
- [ ] Pine walk still holds; quiet HUD and four-beat filenames stay; torn props stay off
- [ ] `bed-valley.png` not replaced; no 魂; no look names in `src/`
- [ ] Play-path + test locks. A blob or different face is thrown away — do not ship it

## Implementation Notes

Godot look only. Paint the warm step from the existing idle pixels (same face, same coat). Magenta #FF00FF then cut to a=0. Do not invent a new face. Do not plant a hard torso seam. If the sheet is a blob or a different person, drop it back to idle. Do not break pine walk. Do not recrop FAIL. Do not hang hole / silk / torch / smith. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings
- Another systems story
- Reopen one-paint (008 stays Complete)

## QA Test Cases

- **AC-1**: Warm walk is a real step on the same coat
  - Setup: `play_step.tscn` feeds a valley move; sheets compared to idle
  - Verify: warm walk ≠ idle; head matches idle; pine walk still a step; BODY 192; torn props off
  - Pass condition: `PLAY_STEP_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_step.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel 001–008 Complete
- Unlocks: none. Stop new WORLD systems.
