# Story 001: Same snap, three places

> **Epic**: First evening — fish / mine / kitchen
> **Status**: Ready
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**Requirement**: `TR-play-002`
**ADR Governing Implementation**: ADR-0002

## Acceptance Criteria

- [ ] Play still swaps valley / mine / kitchen from snap `zone`
- [ ] Fish mark HUD still paints
- [ ] Headless evening / cover loops still pass their OK tokens
- [ ] No look added in `src/`

## Implementation Notes

Keep `zone_map.gd` and snap handlers. Valley hide/show uses `ValleyWorld`.

## Out of Scope

- Restyling kitchen/mine tiles
- Wild look

## QA Test Cases

- Existing fish/mine/kitchen + evening loop tests

## Test Evidence

`godot/project.test.ts`, `headless_*_loop.gd`
**Status**: [x] P0 — must stay green

## Dependencies

- Depends on: r1-move-do-shout
- Unlocks: later village / wild look
