# Story 001: Same snap, three places

> **Epic**: First evening — fish / mine / kitchen
> **Status**: In Progress
> **Layer**: Feature
> **Type**: Integration
> **Manifest Version**: 2026-08-15
> **Last Updated**: 2026-08-15

## Context

**Requirement**: `TR-play-002`
**ADR Governing Implementation**: ADR-0002

## Acceptance Criteria

- [x] Play still swaps valley / mine / kitchen from snap `zone`
- [x] Fish mark HUD still paints
- [ ] Headless evening / cover loops still pass their OK tokens
- [x] No look added in `src/`

## Implementation Notes

Keep `zone_map.gd` and snap handlers. Valley hide/show uses `ValleyWorld`. First slice on the painted bed: walk + 做 / fish pose. Mine and kitchen stay the same snap; do not restyle their tiles. Do not hang props on the bed.

## Out of Scope

- Restyling kitchen/mine tiles
- Wild look

## QA Test Cases

- Existing fish/mine/kitchen + evening loop tests
- Headless look `fish` shot: live coats 做/钓 on `bed-valley.png`

## Test Evidence

`godot/project.test.ts`, `headless_*_loop.gd`, `production/qa/evidence/first-evening-bed-slice-evidence.md`
**Status**: [ ] In Progress — bed walk+do / fish slice; evening loop runtime still to run

## Dependencies

- Depends on: r1-move-do-shout
- Unlocks: later village / wild look
