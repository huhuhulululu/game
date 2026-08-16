# Epic: Coat walk and sit feel

> **Layer**: Feature
> **GDD**: `godot/docs/ART.md` + `docs/WORLD.md`
> **Architecture Module**: ActorView
> **Status**: In progress
> **Governing ADRs**: ADR-0003

## Overview

Onboarding, walk / sit, thin ear, place ear, painted night, and quiet HUD hold. Walk is a four-beat cycle on the existing walk / walk2 / stand sheets. Cover-coats sit at `Look.BODY = 192`. Night is a warm grade on the existing beds. The HUD is a small top-left plaque plus one bag line. Lamps already in the paint stay the light. Kitchen / mine stay hearth-lit. No new pack.

## Governing ADRs

| ADR | Decision Summary | Engine Risk |
|-----|-----------------|-------------|
| ADR-0003 | One painted dusk language; cover is the title lock | LOW |

## GDD Requirements

| TR-ID | Requirement | ADR Coverage |
|-------|-------------|--------------|
| TR-look-003 | Players are cover-coat people. No Wilson / Don't Starve face. | ADR-0003 ✅ |

## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | Walk and sit-to-stand | Visual/Feel | Complete | ADR-0003 |
| 002 | Thin audio | Integration | Complete | ADR-0002 |
| 003 | Place ear | Integration | Complete | ADR-0002 |
| 004 | Painted night | Visual/Feel | Complete | ADR-0003 |
| 005 | Quiet HUD | Visual/Feel | Complete | ADR-0003 |
| 006 | Coat walk cycle | Visual/Feel | In progress | ADR-0003 |
