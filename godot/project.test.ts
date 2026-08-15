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

test("Godot HTML5 export is what phones open", () => {
  assert.ok(existsSync("godot/export/web/index.html"));
  const html = readFileSync("godot/export/web/index.html", "utf8");
  assert.match(html, /并肩山谷/);
  assert.match(html, /<canvas/);
  assert.match(html, /Engine/);
  assert.doesNotMatch(html, /\$GODOT_/);
  assert.ok(existsSync("godot/export/web/index.wasm"));
  assert.ok(existsSync("godot/export/web/index.pck"));
  assert.ok(existsSync("godot/export/web/index.js"));
});

test("Valley look is one dusk illustration, not DST stickers", () => {
  assert.ok(existsSync("godot/fonts/kai.ttf"));
  assert.ok(existsSync("godot/assets/art/cover-valley.png"));
  assert.ok(existsSync("godot/assets/art/ground-valley.png"));
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /kai\.ttf/);
  assert.match(look, /tex-plaque/);
  assert.doesNotMatch(look, /SystemFont/);
  const boot = readFileSync("godot/scripts/boot.gd", "utf8");
  assert.match(boot, /cover-valley/);
  assert.doesNotMatch(boot, /prop-cabin|prop-inn|Wanderer/);
  const room = readFileSync("godot/scripts/room.gd", "utf8");
  assert.match(room, /cover-valley/);
  assert.doesNotMatch(room, /char-warm|char-pine|Wanderer/);
  const valley = readFileSync("godot/scripts/valley_map.gd", "utf8");
  assert.match(valley, /ground-valley/);
  assert.doesNotMatch(valley, /_tile\(/);
  const scripts = ["boot.gd", "room.gd", "play.gd", "look.gd", "valley_map.gd", "actor_view.gd"]
    .map((n) => readFileSync(`godot/scripts/${n}`, "utf8"))
    .join("\n");
  assert.doesNotMatch(scripts, /Wanderer|Wilson|Don't Starve|Dont Starve/i);
  const inn = readFileSync("godot/assets/art/prop-inn.png");
  assert.ok(!inn.includes("Wanderer") && !inn.includes("WANDERER") && !inn.includes("Good Ale"));
  assert.ok(existsSync("godot/assets/art/prop-anvil.png"));
  assert.ok(existsSync("godot/assets/art/prop-altar.png"));
});

test("Godot client plays fish, mine and kitchen from the same snap", () => {
  assert.ok(existsSync("godot/scripts/zone_map.gd"));
  assert.ok(existsSync("godot/scripts/headless_loop.gd"));
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /toasts/);
  assert.match(play, /send_take/);
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.match(actor, /fishMark|fish_mark/);
  assert.match(actor, /char-%s-fish/);
  const loop = readFileSync("godot/scripts/headless_loop.gd", "utf8");
  assert.match(loop, /FISH_OK/);
  assert.match(loop, /ORE_OK/);
  assert.match(loop, /PLATE_OK/);
});
