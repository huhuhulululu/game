# Godot Engine — Version Reference

Last verified: 2026-08-15

| Field | Value |
|-------|-------|
| **Engine Version** | Godot 4.4.1 |
| **Language** | GDScript |
| **Release line** | 4.4 (mid 2025) |
| **Project Pinned** | 2026-08-15 |
| **Last Docs Verified** | 2026-08-15 |
| **LLM Knowledge Cutoff** | May 2025 |
| **Risk Level** | MEDIUM — 4.4 sits on the edge of training data (~4.3). Verify APIs against this folder and the 4.3→4.4 migration guide. |
| **Export first** | HTML5 (`godot/export/web/`). iOS later from the same project. |
| **Do not upgrade** | Do not move this project to Godot 4.5 or 4.6. `project.godot` features string stays `"4.3"` because tests lock it. |

## Knowledge Gap Warning

Training data likely covers Godot up to ~4.3. This project is **4.4.1**. Read `breaking-changes.md` (4.3→4.4) and `deprecated-apis.md` before suggesting APIs. Do not apply 4.5/4.6 defaults (Jolt as default 3D, D3D12 default, Shader Baker, `@abstract`, variadic GDScript) to this repo.

## Post-Cutoff Version Timeline (context only)

| Version | This project? | Risk | Notes |
|---------|---------------|------|-------|
| 4.4 | **Pinned (4.4.1)** | MEDIUM | FileAccess `store_*` returns `bool`. Shader texture params use `Texture`. Jolt is optional, not default. |
| 4.5 | No | HIGH | Do not upgrade. |
| 4.6 | No | HIGH | Upstream CCGS snapshot only. Do not treat as the engine. |

## Verified Sources

- Official 4.4 docs: https://docs.godotengine.org/en/4.4/
- 4.3→4.4 migration: https://docs.godotengine.org/en/4.4/tutorials/migrating/upgrading_to_godot_4.4.html
- FileAccess 4.4: https://docs.godotengine.org/en/4.4/classes/class_fileaccess.html

## This repo

Playable client is `godot/` (2D CanvasItem, GL Compatibility). Authority sim is Node / WebSocket. TypeScript in `src/` is reference only.
