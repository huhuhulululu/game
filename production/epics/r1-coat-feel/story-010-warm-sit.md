# Story 010: Warm sit

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

Live leftover after the warm step: `char-warm-sit.png` is still a standing stamp planted lower, not a sit of the idle tan coat. Pine sit is not a black-box. Paint a sit from the same idle face. If the sheet is a smear, a blob, or a different person, keep the current painted sit.

## Acceptance Criteria

- [ ] `char-warm-sit` is the idle tan-coat woman sitting, not a standing stamp; same face, same dusk light
- [ ] True a=0 outside the figure; no dusk-slab blob; no new person; BODY stays 192
- [ ] Pine sit stays unless it is a black-box; quiet HUD and four-beat walk stay; torn props stay off
- [ ] `bed-valley.png` not replaced; no 魂; no look names in `src/`
- [ ] Play-path + test locks. A smear or different face is thrown away — do not ship it

## Implementation Notes

Godot look only. Paint the warm sit from the existing idle pixels (same face, same coat). Magenta #FF00FF then cut to a=0. Do not invent a new face. Do not plant a hard torso seam. If the sheet is a blob or a different person, keep the current painted sit. Do not touch pine sit unless it is a black-box. Do not recrop FAIL. Do not hang hole / silk / torch / smith. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings
- Another systems story
- Reopen warm step (009 stays Complete)

## QA Test Cases

- **AC-1**: Warm sit is the same coat sitting
  - Setup: `play_sit.tscn` feeds a valley sit snap; sheets compared to idle
  - Verify: warm sit sheet in use; same face; pine sit not a plate; BODY 192; torn props off
  - Pass condition: `PLAY_SIT_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_sit.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel 001–009 Complete
- Unlocks: none. Stop new WORLD systems.
