# Story 001: Cover-coat people

> **Epic**: Two players
> **Status**: Complete
> **Layer**: Core
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003

## Acceptance Criteria

- [x] Valley actors use `char-warm` / `char-pine`
- [x] `Look.BODY = 128`, `FOOT`, `SHADOW_EAST`
- [x] No Wilson / Wanderer / Don't Starve face
- [x] People are not baked into the play bed

## Implementation Notes

Keep `actor_view.gd`. Do not add a second head style. Live sprites walk the packed `bed-valley.png`. Bed corridor lifts the cover pair so they are not painted into the sheet.

## Out of Scope

- New character pack

## QA Test Cases

- Manual: enter frame shows live sprites on the bed
- Tests lock actor sheets and BODY 128

## Test Evidence

existing actor locks in `godot/project.test.ts` + `production/qa/evidence/cover-coats-evidence.md`
**Status**: [x] Complete — Brainbird enter frame: 封面大衣人站在路上

## Dependencies

- Depends on: r1-painted-valley
- Unlocks: r1-move-do-shout

## Completion Notes
**Completed**: 2026-08-15
**Criteria**: 4/4 passing
**Deviations**: None. Lean: director/agent spawn skipped.
**Test Evidence**: Visual/Feel — `production/qa/evidence/cover-coats-evidence.md` + `godot/project.test.ts`
**Code Review**: Skipped — lean
