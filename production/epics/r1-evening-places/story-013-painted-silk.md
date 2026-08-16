# Story 013: Painted silk

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (荒野 / 丝巢) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] One magenta-key dusk nest sits on wild `n`; the painted `bed-wild` stays
- [ ] Prompt `挥` can show from the snap; harvest stays in the server; no cartoon bugs
- [ ] Kitchen / mine / village stay clear of the nest; plaque unchanged
- [ ] Play-path proof prints painted-silk tokens through `play.tscn`
- [ ] No 魂; no spider den; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already marks nest tiles and handles 挥. Do not move those rules into Godot. Sit one small nest of umber twigs and paper silk. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed. After this, do not invent more wild props.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Weather slices (wind / snow)
- New wild props after this slice
- 魂 / Wilson / Don't Starve chrome / spider den / cartoon bugs / sticker box

## QA Test Cases

- **AC-1**: Play sits one dusk nest on the wild bed and keeps indoor hearths
  - Setup: `play_silk.tscn` feeds wild with one `n` tile and `挥`, then kitchen
  - Verify: nest sits; no beast sheet; kitchen has none; `bed-wild` stays; `bed-valley.png` untouched
  - Pass condition: `PLAY_SILK_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_silk.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places painted wormhole
- Unlocks: none in this epic (wild set pieces close)
