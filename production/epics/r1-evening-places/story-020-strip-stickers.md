# Story 020: Strip stickers

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

Tonight's generated props sat on the painted beds. The live look is 垃圾. Tear them off the play. Do not replace them. Do not generate new art.

## Acceptance Criteria

- [ ] Godot play does not hang `prop-hole`, `prop-silk`, `prop-torch`, `prop-camp-pot`, `prop-smith`, `prop-booth`, or any other small generated prop on `bed-valley` / `bed-wild` / `bed-kitchen` / `bed-mine`
- [ ] Painted beds, cover-coat players, and wood HUD stay; server rules / toasts / prompts stay
- [ ] No FAIL recrop; `bed-valley.png` not replaced; no new art; no 魂
- [ ] Play-paths and `godot/project.test.ts` require absence of those hung textures
- [ ] No look names in `src/`

## Implementation Notes

Stop hanging stickers in `zone_map.gd`, `valley_logic.gd`, `actor_view.gd`, and `play.gd`. Leave the PNG files on disk. Do not recrop FAIL. Do not replace `bed-valley.png`. Do not generate replacement art. Water / mud washes, rain / fog / night on the beds, and indoor wood / stone walls stay. Fireside (`story-019`) stays parked. Two-phone stays Blocked / human. Weather look stays closed.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New sticker props / replacement art
- Finish fireside (`story-019`)
- Weather slices (wind / snow)
- 魂 / Wilson / Don't Starve chrome / sticker box

## QA Test Cases

- **AC-1**: Play sits painted beds without generated stickers
  - Setup: village / kitchen / mine / forge / fire / hole / silk / torch play-paths
  - Verify: beds and coats sit; named props are not hung; toasts / prompts still print from the snap
  - Pass condition: `PLAY_*_OK` tokens and test locks

## Test Evidence

**Story Type**: Integration
**Required evidence**: `godot/project.test.ts` + play-path tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places 001–018 (Complete). 019 stays parked.
- Unlocks: none. Stop new WORLD systems.
