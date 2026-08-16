# Epic: Valley as one painting

> **Layer**: Foundation
> **GDD**: `design/art/art-bible.md`, `design/assets/specs/valley-assets.md`
> **Architecture Module**: ValleyWorld
> **Status**: Complete
> **Governing ADRs**: ADR-0001, ADR-0003

## Overview

Tear out the sticker `ValleyMap`. Sit a packed `valley.tscn`: one `bed-valley.png`, a logic grid, live cover-coat people. This is the rebuild. Incremental recrop is forbidden.

## Governing ADRs

| ADR | Decision Summary | Engine Risk |
|-----|-----------------|-------------|
| ADR-0001 | Packed play/valley scenes | LOW |
| ADR-0003 | One opaque painted bed | LOW |

## GDD Requirements

| TR-ID | Requirement | ADR Coverage |
|-------|-------------|--------------|
| TR-look-001 | One painted bed | ADR-0003 ✅ |
| TR-look-002 | No dirty alpha / sticker box | ADR-0003 ✅ |
| TR-graph-001 | New scene graph | ADR-0001 ✅ |

## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | Packed valley, one bed | Visual/Feel | Complete | ADR-0001 |

## Definition of Done

- Sticker stamps gone from the play valley
- FAIL PNGs not overwritten
- Tests green, HTML5 exported
