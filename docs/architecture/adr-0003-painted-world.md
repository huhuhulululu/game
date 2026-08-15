# ADR-0003: One painted warm-dusk world

## Status

Accepted

## Date

2026-08-15

## Last Verified

2026-08-15

## Decision Makers

Brainbird (custody). Lean Path D rebuild.

## Summary

The play valley sits on one opaque painted bed (`bed-valley.png`) in the cover language. FAIL sticker PNGs stay on disk and are not used. Players are cover-coat people. HUD is wood/paper. No 魂. No Don't Starve face.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Godot 4.4.1 |
| **Domain** | Rendering |
| **Knowledge Risk** | LOW |
| **References Consulted** | `godot/docs/ART.md`, `design/art/art-bible.md`, `docs/asset-audit.md` |
| **Post-Cutoff APIs Used** | None |
| **Verification Required** | Bed is RGB (or clean RGBA). No leftover dusk in `a=0`. No sticker names in the valley scene. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0001 |
| **Enables** | Foundation painted-valley story |
| **Blocks** | None |
| **Ordering Note** | Path A. Path B magenta-key only if the bed cannot land houses. |

## Context

### Problem Statement

Cover crops (`prop-cover-*`, `prop-hut`, `prop-lodge`) FAIL audit: leftover dusk RGB in every transparent pixel and opaque edge boxes.

### Current State

Those files stayed on disk. Play no longer stamps them.

### Constraints

- `cover-valley.png` is read-only
- Do not recrop FAIL files
- No second art pack
- `Look.VALLEY_DUSK = Color(1,1,1)`, shader `grade` 0.0

### Requirements

- No rectangular sticker box in the enter frame
- No leftover dusk RGB in transparent pixels
- Hut and lodge feet in the paint
- Enter-frame trees painted in
- Players `char-warm` / `char-pine`

## Decision

Derive `godot/assets/art/bed-valley.png` from the cover (1224×612 RGB). Crop title calligraphy off the play sheet. Lift baked 暖/松 and 点灯进谷 so live sprites walk the path. Sit that sheet as the only valley backdrop.

### Implementation Guidelines

- Tool: `tools/paint_valley_bed.py` reads cover, writes only `bed-valley.png`
- Linear filter. No orange grade
- Do not sit FAIL names
- Title/room still show the untouched cover

## Alternatives Considered

### Alternative 1: Stretch cover as the bed

- **Description**: Camera crops to the valley; people walk on title art
- **Rejection Reason**: Spec forbids title text and baked figures on the play bed. Cover stays the title lock.

### Alternative 2: Recrop FAIL props

- **Rejection Reason**: Failed three times. Forbidden.

### Alternative 3: Path B magenta-key

- **Rejection Reason**: Not needed if Path A lands the houses in the bed.

## Consequences

### Positive

- One language in the enter camera
- Audit leftover-alpha rule is vacuously passed (opaque RGB)

### Negative

- Bed is a derived paint; inpaint of the path must not smear coats

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Ghost people in the bed | Medium | Live sprites double | Hard-fill path, no Telea hole |
| Lodge outside enter frame | Medium | Houses feel far | Bed still contains them; camera can walk |

## Performance Implications

One 1224×612 RGB sheet. Under the HTML5 2D budget.

## Migration Plan

1. Write `bed-valley.png` without touching the cover
2. Sit it on `ValleyWorld`
3. Stop loading FAIL props

**Rollback plan**: do not restore sticker stamps.

## Validation Criteria

- [ ] `bed-valley.png` is 1224×612 RGB
- [ ] Cover hash unchanged
- [ ] FAIL PNG hashes unchanged
- [ ] Valley scripts do not mention FAIL filenames
- [ ] No 魂 / Wilson in play scripts

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| art-bible.md | Valley | One painted bed | ASSET-001 Path A |
| ART.md | Language | Cover dusk, no DST face | Bed + coat people + wood HUD |
| CHARTER.md | No 魂 | HUD unchanged | Plaque copy stays |
