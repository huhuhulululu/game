# Epic: Coat walk and sit feel

> **Layer**: Feature
> **GDD**: `godot/docs/ART.md` + `docs/WORLD.md`
> **Architecture Module**: ActorView
> **Status**: In progress
> **Governing ADRs**: ADR-0003

## Overview

Onboarding, walk / sit, thin ear, place ear, painted night, quiet HUD, the coat walk cycle, quiet chrome, one paint, the warm step, and the warm sit hold. Cover-coats sit at `Look.BODY = 192` with real a=0. Warm walk is the same tan coat taking a step, not a sliding idle. A smeared sit is thrown away — the painted sit stays. Kitchen / mine / wild read as the same dusk painting. The HUD is a small top-left plaque plus one bag line. Load shows only the painted cover. Empty toast chrome stays off. No new pack.

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
| 006 | Coat walk cycle | Visual/Feel | Complete | ADR-0003 |
| 007 | Quiet chrome | Visual/Feel | Complete | ADR-0003 |
| 008 | One paint | Visual/Feel | Complete | ADR-0003 |
| 009 | Warm step | Visual/Feel | Complete | ADR-0003 |
| 010 | Warm sit | Visual/Feel | In progress | ADR-0003 |
