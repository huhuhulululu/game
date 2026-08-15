# Story 001 — Valley painted bed

*Created: 2026-08-15*
*Last Updated: 2026-08-15*
*Status: Superseded — rebuild `r1-painted-valley` overturns incremental sticker-bed*
*Layer: Feature*
*Type: Visual/Feel*
*TR-ID: (none — Path D; law is the spec)*
*ADR Governing Implementation: `design/assets/specs/valley-assets.md` (no `docs/architecture/` ADR yet)*
*Manifest Version: 2026-08-15*

## Summary

Sit the valley as **one painted warm-dusk bed** (ASSET-001). Alternative: new magenta-key `#FF00FF` props (ASSET-002) with real `a=0` outside the form. Do **not** recrop FAIL PNGs.

## Acceptance Criteria

- [ ] No rectangular sticker box in the enter frame
- [ ] No leftover dusk RGB in transparent pixels
- [ ] Player is cover-coat people (`char-warm` / `char-pine`)
- [ ] No 魂
- [ ] No Don't Starve face
- [ ] FAIL files not overwritten: `prop-cover-tree`, `prop-cover-tree-b`, `prop-cover-lamp`, `prop-cover-shore`, `prop-cover-verge`, `prop-hut`, `prop-lodge`
- [ ] `cover-valley.png` read-only
- [ ] `npm test` stays green (update string locks if `valley_map.gd` stops using FAIL names)

## Out of Scope

- Recropping FAIL PNGs
- Overwriting `docs/WORLD.md`, `docs/CHARTER.md`
- Kitchen / mine / wild look
- HTML5 export unless a hook requires it
- Adding look in `src/`

## Test Evidence

Visual/Feel: `production/qa/evidence/valley-painted-bed-evidence.md` (after implement).  
Keep existing `godot/project.test.ts` look locks in spirit (no stall/anvil/pine on valley, no 魂).

## Dependencies

- [x] `design/art/art-bible.md`
- [x] `docs/asset-audit.md`
- [x] `design/assets/specs/valley-assets.md`

## Next

`/dev-story production/epics/p1-look/story-001-valley-painted-bed.md`
