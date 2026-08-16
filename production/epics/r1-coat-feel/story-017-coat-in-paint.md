# Story 017: Coat in the paint

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

Live leftover after 开一间: the title and valley bed are one painting, but the playable coat reads as a flat stamp with no contact shadow. A long bag strip still stripes the art. Your name still sits on the coat. Sit the existing tan / pine coats in the painting. Same idle face. Hide your nametag for real. One short bag slip under the plaque.

## Acceptance Criteria

- [ ] Your nametag is hidden for real (`PLAY_NAME_YOU`); mate is ink only
- [ ] Bag is one short slip under the plaque, not a long stripe across the painting
- [ ] Existing tan / pine coats sit on the path with a contact shadow; scale reads as people (BODY may go above 192); same painted idle face
- [ ] No new person generated; title couple not pasted; no props hung
- [ ] `bed-valley.png` not replaced; stickers stay off; no 魂; no look names in `src/`
- [ ] Play-path + test locks; 015 Complete; 016 Complete; 019 parked; two-phone Blocked

## Implementation Notes

Godot look only. Hide your name even when the snap `you` field is thin. Shorten the bag slip and sit it under the plaque. Keep the existing coat sheets. Plant a contact shadow on the path. If a generated shadow is a blob, throw it away. Do not generate a new face. Do not recrop FAIL. Do not hang torn-off / OLD_INK. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system. Do not change `src/sim/world.ts`.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props / new HUD chrome stories
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings / action wheel
- Another systems story
- Reopen place beds (016 stays Complete — replaced nothing)
- Reopen quiet name (015 stays Complete)

## QA Test Cases

- **AC-1**: Name hidden, bag short, coats sit in the paint
  - Setup: `play_in_paint.tscn` feeds Play with you + mate + an eight-item bag
  - Verify: your name hidden; mate ink; bag width under the plaque; contact shadow on the path; same `char-warm` / `char-pine` idle; no title couple
  - Pass condition: `PLAY_IN_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_in_paint.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-coat-feel 001–016 Complete
- Unlocks: none. Stop new WORLD systems.
