# Story 005: Quiet HUD

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

Live playtest: the HUD reads as Don't Starve inventory chrome, and the cover-coats sit too small and flat on the painted bed.

## Acceptance Criteria

- [x] Bag is at most a few wood slips or one bag line — not eight identical wood-framed chips striping the painting
- [x] Info plaque (山谷 / 日 · 季 · 相 · 金) stays small, top-left; no 魂; no HUD rings
- [x] Existing `char-warm` / `char-pine` scale up so they sit in the path like people, not a pasted stamp; no new character; title couple not pasted into the valley
- [x] Torn-off props stay off the beds; `bed-valley.png` not replaced
- [x] Play-path + test locks; no look names in `src/`

## Implementation Notes

Godot look only. Collapse `_paint_bag` / `_paint_ice` to one slip each. Shrink the plaque. Scale `Look.BODY` on the existing coat sheets. Do not generate art. Do not recrop FAIL. Do not hang torn-off props. Do not replace `bed-valley.png`. Two-phone stays Blocked / human. Do not start a WORLD system.

## Out of Scope

- Two-iPhone playtest (`r1-togetherness/story-003-two-phone.md`)
- Recrop FAIL PNGs
- Replace `bed-valley.png`
- New character / title-couple paste
- New sticker props
- Finish fireside (`story-019`)
- 魂 / Wilson / Don't Starve chrome / HUD rings

## QA Test Cases

- **AC-1**: Play sits a quiet plaque and one bag line; coats read as people
  - Setup: `play_hud.tscn` feeds eight bag rows, kitchen ice, then valley coats
  - Verify: one bag slip; small top-left plaque; coat height uses the larger BODY; no hung stickers
  - Pass condition: `PLAY_HUD_OK` and test locks

## Test Evidence

**Story Type**: Visual/Feel
**Required evidence**: `godot/project.test.ts` + `play_hud.tscn` tokens
**Status**: [x] Complete — `PLAY_HUD_OK` + 140 tests

## Dependencies

- Depends on: r1-coat-feel 001–004 Complete; r1-evening-places 020 Complete
- Unlocks: none. Stop new WORLD systems.

## Completion Notes
**Completed**: 2026-08-16
**Criteria**: 5/5 passing
**Deviations**: None. Lean: QL-TEST-COVERAGE skipped. LP-CODE-REVIEW skipped (no chat gates).
**Test Evidence**: Visual/Feel — `godot/project.test.ts` quiet-hud lock + `PLAY_HUD_OK`
**Code Review**: Skipped — lean

