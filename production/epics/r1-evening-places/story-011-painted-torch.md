# Story 011: Painted torch

> **Epic**: Evening places look
> **Status**: In progress
> **Layer**: Feature
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-16

## Context

**GDD**: `docs/WORLD.md` (探险 / 燧石火把) + `godot/docs/ART.md`
**Requirement**: `TR-look-006`
**ADR Governing Implementation**: ADR-0003
**Engine**: Godot 4.4.1 | **Risk**: LOW

## Acceptance Criteria

- [ ] A magenta-key lantern-stick sits in the cover-coat hand on the wild path from snap `torch` / held `torch`
- [ ] Night wild with snap `lit` keeps the valley night shade; kitchen / mine stay hearth-lit and do not hang the stick
- [ ] Village lamps stay in the painting; plaque stays `日 · 季 · 相 · 金`
- [ ] Play-path proof prints painted-torch tokens through `play.tscn`
- [ ] No 魂; no Wilson torch; no FAIL restick; `bed-valley.png` not replaced; no look names in `src/`

## Implementation Notes

Server already crafts flint + wood + grass at a lit fire, burns the held light, and writes night vision. Do not move those rules into Godot. Sit one small painted lantern-stick. Do not recrop FAIL. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Weather look stays closed.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- Weather slices (wind / snow)
- 虫洞 / 丝巢 look
- 魂 / Wilson / Don't Starve chrome / fear veil / HUD ring

## QA Test Cases

- **AC-1**: Play sits a lantern-stick in the coat hand and keeps indoor hearths
  - Setup: `play_torch.tscn` feeds dusk wild with a held torch, night wild `lit`, then kitchen
  - Verify: stick is on the coat, not a sticker box; night shade is valley night; kitchen has no stick; `bed-valley.png` untouched
  - Pass condition: `PLAY_TORCH_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_torch.tscn` tokens
**Status**: [ ] In progress

## Dependencies

- Depends on: r1-evening-places painted path
- Unlocks: 虫洞 then 丝巢 only if this holds
