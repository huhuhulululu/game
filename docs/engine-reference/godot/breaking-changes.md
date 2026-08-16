# Godot — Breaking Changes

Last verified: 2026-08-15 | Engine: Godot 4.4.1 (do not apply 4.5 / 4.6)

This project is pinned to **4.4.1**. The only migration that matters is **4.3 → 4.4**.
4.5 and 4.6 tables below are out of scope — do not upgrade.

Official source: https://docs.godotengine.org/en/4.4/tutorials/migrating/upgrading_to_godot_4.4.html

## 4.3 → 4.4 (this project — MEDIUM RISK)

### Core

| Change | GDScript | Notes |
|--------|----------|-------|
| `FileAccess.store_*` return `bool` (was `void`) | Compatible | `store_8/16/32/64`, `store_buffer`, `store_csv_line`, `store_double`, `store_float`, `store_half`, `store_line`, `store_pascal_string`, `store_real`, `store_string`, `store_var` |
| `FileAccess.open_encrypted` adds optional `iv` | Compatible | |
| `OS.execute_with_pipe` adds optional `blocking` | Compatible | |
| `OS.read_string_from_stdin` adds `buffer_size` | Breaking if called | Default in 4.3 was 1024 |
| `RegEx.compile` / `create_from_string` add optional `show_error` | Compatible | |
| `Semaphore.post` adds optional `count` | Compatible | |
| `TranslationServer.standardize_locale` adds optional `add_defaults` | Compatible | |
| `Curve` now enforces `min_value` / `max_value` | Behavior | Points outside `[0, 1]` need an explicit range |

### Rendering / particles / shaders

| Change | GDScript | Notes |
|--------|----------|-------|
| `RenderingDevice.draw_list_begin` drops many params; adds `breadcrumb` | Partial | Low-level RD only |
| Shader `get/set_default_texture_parameter` uses `Texture` (was `Texture2D`) | Compatible in GDScript | Use `Texture` in shader params |
| `VisualShaderNodeCubemap.cube_map` is `TextureLayered` | Compatible in GDScript | |
| `VisualShaderNodeTexture2DArray.texture_array` is `TextureLayered` | Compatible in GDScript | |
| `VisualShaderNodeVec4Constant` input is `Vector4` | Behavior | Recreate constants if broken |
| CPU/GPU Particles 2D/3D `.restart()` adds optional `keep_seed` | Compatible | |
| `RenderingServer.multimesh_allocate_data` adds `use_indirect` | Compatible | |

### GUI / navigation / editor

| Change | GDScript | Notes |
|--------|----------|-------|
| `RichTextLabel.push_meta` adds optional `tooltip` | Compatible | |
| `RichTextLabel.set_table_column_expand` adds `shrink` | Compatible | |
| `GraphEdit.connect_node` adds `keep_alive` | Compatible | |
| `GraphEdit.frame_rect_changed` `new_rect` is `Rect2` | Breaking | Was `Vector2` |
| `NavigationServer2D/3D.query_path` adds optional `callback` | Compatible | |
| Editor importer / translation parser plugin APIs | Editor only | `_get_import_flags` removed; `_parse_file` return type changed |

### Behavior (4.4)

- CSG uses Manifold; non-manifold CSG meshes are no longer supported. This 2D project does not use CSG.
- Android sensor events are off by default. Not this ship path (HTML5 first).

## 4.4 → 4.5 / 4.5 → 4.6 — OUT OF SCOPE

Do not upgrade. Do not use `@abstract`, variadic GDScript, Shader Baker, Jolt-as-default, D3D12-as-default, or glow-before-tonemap as if they were this project's engine.

Kept only so agents do not confuse the old CCGS 4.6 snapshot with the pin:

| Version | Why we ignore it |
|---------|------------------|
| 4.5 | Accessibility / SMAA / Shader Baker / `@abstract` — not installed |
| 4.6 | Jolt default, glow order, D3D12 default — not installed |
