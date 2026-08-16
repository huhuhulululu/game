# Story 006: Coat walk cycle

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

Live playtest after quiet HUD: the cover-coats are the right size, but walk is two stamps flickering. Use the existing walk / walk2 / stand sheets as a cycle. Do not generate a new character.

## Acceptance Criteria

- [ ] Walk is a four-beat cycle on existing `char-warm` / `char-pine` walk, walk2, and stand sheets — not a two-frame flicker
- [ ] `Look.BODY` stays 192; `Look.FOOT` stays 0.979; quiet HUD stays the small plaque + one bag slip
- [ ] No new character; title couple not pasted into the valley; face is not DST
- [ ] Torn-off props stay off the beds; `bed-valley.png` not replaced; no 魂
- [ ] Play-path + test locks; no look names in `src/`

## Implementation Notes

Godot look only. Cycle the existing front / side / back walk sheets with the matching stand as the passing beat. Keep the local stride. Do not generate art. Do not recrop FAIL. Do not hang torn-off props. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings

## QA Test Cases

- **AC-1**: Play walks a four-beat cycle on the existing coats
  - Setup: `play_walk.tscn` feeds a valley move on the cover-coats
  - Verify: walk, stand, walk2 in order; BODY 192; quiet plaque + one bag slip; no hung stickers
  - Pass condition: `PLAY_WALK_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_walk.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel 001–005 Complete
- Unlocks: none. Stop new WORLD systems.
