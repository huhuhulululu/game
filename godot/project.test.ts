import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("Godot 4 project is the playable client", () => {
  const proj = readFileSync("godot/project.godot", "utf8");
  assert.match(proj, /config\/features=PackedStringArray\("4\.3"/);
  assert.match(proj, /default_texture_filter=1/);
  assert.match(proj, /run\/main_scene="res:\/\/scenes\/main\.tscn"/);
  assert.ok(existsSync("godot/scenes/main.tscn"));
  assert.ok(existsSync("godot/scripts/net.gd"));
  assert.ok(existsSync("godot/assets/art/char-warm.png"));
  assert.ok(existsSync("godot/assets/art/char-pine.png"));
  assert.ok(existsSync("godot/assets/art/tex-grass.png"));
  const charter = readFileSync("docs/CHARTER.md", "utf8");
  assert.match(charter, /引擎已定为 Godot 4/);
  assert.match(charter, /不再等网页打磨/);
  assert.match(charter, /不用 Unity/);
  assert.doesNotMatch(charter, /Capacitor/);
});
