# Epic: Coat walk and sit feel

> **Layer**: Feature
> **GDD**: `godot/docs/ART.md` + `docs/WORLD.md`
> **Architecture Module**: ActorView
> **Status**: In progress
> **Governing ADRs**: ADR-0003

## Overview

Onboarding, walk / sit, thin ear, place ear, painted night, quiet HUD, the coat walk cycle, quiet chrome, one paint, the warm step, the warm sit, the painted room card, the painted join face, quiet hands, the quiet log, the quiet name, the place-bed judgment, and the coat-in-paint hold. Cover-coats sit at `Look.BODY = 240` with real a=0, a contact shadow, and a warm dusk grade on the existing sheets. Warm walk is the same tan coat taking a step, not a sliding idle. A smeared sit is thrown away — the painted sit stays. The 开一间 card is dusk wood, not a parchment form. The 房间码 face is the same dusk wood slip. In-valley 做 / 喊 / 声 are small wood slips, not a stacked plaque box. The bottom prompt bar stays hidden until there is a real line. Your name is hidden; mate is quiet ink, not a boxed nametag. Kitchen / mine / wild already match the valley dusk — nothing replaced. The HUD is a small top-left plaque plus one short bag slip under the plaque. Load shows only the painted cover. Empty toast chrome stays off. No new pack.

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
| 010 | Warm sit | Visual/Feel | Complete | ADR-0003 |
| 011 | Painted room | Visual/Feel | Complete | ADR-0003 |
| 012 | Painted join | Visual/Feel | Complete | ADR-0003 |
| 013 | Quiet hands | Visual/Feel | Complete | ADR-0003 |
| 014 | Quiet log | Visual/Feel | Complete | ADR-0003 |
| 015 | Quiet name | Visual/Feel | Complete | ADR-0003 |
| 016 | Place beds | Visual/Feel | Complete | ADR-0003 |
| 017 | Coat in the paint | Visual/Feel | Complete | ADR-0003 |
| 018 | Coat dusk | Visual/Feel | In progress | ADR-0003 |
