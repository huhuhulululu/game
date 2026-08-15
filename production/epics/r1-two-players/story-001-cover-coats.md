# Story 001: Cover-coat people

> **Epic**: Two players
> **Status**: Ready
> **Layer**: Core
> **Type**: Visual/Feel
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**Requirement**: `TR-look-003`
**ADR Governing Implementation**: ADR-0003

## Acceptance Criteria

- [ ] Valley actors use `char-warm` / `char-pine`
- [ ] `Look.BODY = 128`, `FOOT`, `SHADOW_EAST`
- [ ] No Wilson / Wanderer / Don't Starve face
- [ ] People are not baked into the play bed

## Implementation Notes

Keep `actor_view.gd`. Do not add a second head style.

## Out of Scope

- New character pack

## QA Test Cases

- Manual: enter frame shows live sprites on the bed
- Tests already lock actor sheets and BODY 128

## Test Evidence

existing actor locks in `godot/project.test.ts`
**Status**: [x] P0

## Dependencies

- Depends on: r1-painted-valley
- Unlocks: r1-move-do-shout
