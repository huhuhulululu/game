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
  assert.match(charter, /开间/);
  assert.match(charter, /进谷/);
  assert.match(charter, /钓矿厨出谷砧摊田卦睡/);
  assert.match(charter, /双人规则/);
  assert.match(charter, /薄声音/);
  assert.match(charter, /P0 网页一晚在 Godot 上成立/);
  assert.match(charter, /观感打磨 \+ 两机实玩/);
  assert.match(charter, /然后才 iOS/);
  assert.doesNotMatch(charter, /Capacitor/);
  assert.doesNotMatch(charter, /正在迁/);
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
  assert.ok(existsSync("godot/assets/art/bed-valley.png"));
  assert.ok(existsSync("godot/scenes/valley.tscn"));
  assert.ok(existsSync("godot/scenes/play.tscn"));
  assert.ok(existsSync("godot/scripts/valley_world.gd"));
  assert.ok(existsSync("godot/scripts/valley_logic.gd"));
  assert.ok(!existsSync("godot/scripts/valley_map.gd"));
  const bedPng = readFileSync("godot/assets/art/bed-valley.png");
  assert.equal(bedPng[0], 0x89);
  assert.equal(bedPng.readUInt32BE(16), 1224);
  assert.equal(bedPng.readUInt32BE(20), 612);
  const app = readFileSync("godot/scripts/app.gd", "utf8");
  assert.match(app, /scenes\/play\.tscn/);
  const playScene = readFileSync("godot/scenes/play.tscn", "utf8");
  assert.match(playScene, /scripts\/play\.gd/);
  const valleyScene = readFileSync("godot/scenes/valley.tscn", "utf8");
  assert.match(valleyScene, /bed-valley\.png/);
  assert.match(valleyScene, /valley_world\.gd/);
  assert.match(valleyScene, /valley_logic\.gd/);
  assert.doesNotMatch(valleyScene, /prop-cover-|prop-hut|prop-lodge/);
  assert.ok(existsSync("godot/assets/art/ground-valley.png"));
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /kai\.ttf/);
  assert.match(look, /multiply\.ttf/);
  assert.match(look, /tex-plaque/);
  assert.match(look, /contact\(/);
  assert.match(look, /sit_frac/);
  assert.match(look, /person_mat/);
  assert.match(look, /const BODY := 128/);
  assert.match(look, /const FOOT := 0\.979/);
  assert.match(look, /SHADOW_EAST/);
  assert.match(look, /func air_mat/);
  assert.match(look, /func air_layer/);
  assert.match(look, /air\.gdshader/);
  assert.match(look, /Sprite2D/);
  assert.ok(existsSync("godot/shaders/air.gdshader"));
  assert.ok(existsSync("godot/docs/ART.md"));
  const artDoc = readFileSync("godot/docs/ART.md", "utf8");
  assert.match(artDoc, /色温/);
  assert.match(artDoc, /西 \/ 左|西\/左/);
  assert.match(artDoc, /描边/);
  assert.match(artDoc, /脚影/);
  assert.match(artDoc, /禁止混包/);
  assert.match(artDoc, /SHADOW_EAST/);
  assert.match(artDoc, /没有精神值/);
  assert.doesNotMatch(artDoc, /Kenney|itch\.io/);
  assert.match(look, /name_box/);
  assert.match(look, /func slip_box/);
  assert.match(look, /func chip_button/);
  assert.match(look, /tex-slip/);
  assert.match(look, /AXIS_STRETCH_MODE_TILE_FIT/);
  assert.doesNotMatch(look, /func slip_box\(\)[\s\S]{0,400}tex-plaque/);
  assert.ok(existsSync("godot/assets/art/tex-slip.png"));
  const paintSlip = readFileSync("tools/paint_hud_slip.py", "utf8");
  assert.match(paintSlip, /prop-cabin/);
  assert.match(paintSlip, /tex-paper/);
  assert.match(paintSlip, /tex-slip/);
  assert.match(paintSlip, /HUD wood/);
  assert.match(paintSlip, /tex-plaque/);
  assert.match(paintSlip, /640, 80/);
  assert.match(paintSlip, /360, 180/);
  assert.doesNotMatch(paintSlip, /floor-valley|cover-valley|ground-valley/);
  assert.doesNotMatch(paintSlip, /Wilson|Don't Starve|Dont Starve/i);
  assert.match(look, /set_shader_parameter\("grade", 0\.0\)/);
  assert.match(look, /VALLEY_DUSK/);
  assert.match(look, /1\.0, 1\.0, 1\.0/);
  assert.doesNotMatch(look, /SystemFont/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /_clamp_cam/);
  assert.match(play, /_cam_locked/);
  assert.match(play, /%s×%s/);
  assert.match(play, /1\.0, 1\.0, 1\.0/);
  assert.match(play, /VALLEY_DUSK/);
  assert.match(play, /air_layer/);
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /饿/);
  assert.doesNotMatch(play, /魂/);
  assert.doesNotMatch(play, /sanity|Sanity/);
  assert.doesNotMatch(play, /s\.get\("hp"/);
  assert.doesNotMatch(play, /s\.get\("hunger"/);
  assert.ok(existsSync("godot/fonts/multiply.ttf"));
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.match(actor, /CanvasLayer/);
  assert.match(actor, /_place_name/);
  assert.match(actor, /person_mat/);
  assert.match(actor, /Look\.BODY/);
  assert.match(actor, /Look\.FOOT/);
  assert.match(actor, /Look\.BODY - 28/);
  assert.match(actor, /SHADOW_EAST/);
  assert.doesNotMatch(actor, /var h := 48/);
  const lookShot = readFileSync("godot/scripts/headless_look.gd", "utf8");
  assert.match(lookShot, /cabin-pair/);
  assert.match(lookShot, /set_moving/);
  assert.match(lookShot, /chip_button/);
  assert.match(lookShot, /slip_box/);
  assert.match(lookShot, /VALLEY_DUSK/);
  assert.match(lookShot, /air_layer/);
  assert.match(lookShot, /山谷/);
  assert.match(lookShot, /日 0 · 春 · 白天 · 金 20/);
  assert.match(lookShot, /_shot\("fish"\)/);
  assert.match(lookShot, /busy": "fish"/);
  assert.doesNotMatch(lookShot, /魂|饿/);
  const boot = readFileSync("godot/scripts/boot.gd", "utf8");
  assert.match(boot, /cover-valley/);
  assert.doesNotMatch(boot, /prop-cabin|prop-inn|Wanderer/);
  const room = readFileSync("godot/scripts/room.gd", "utf8");
  assert.match(room, /cover-valley/);
  assert.doesNotMatch(room, /char-warm|char-pine|Wanderer/);
  const valley = readFileSync("godot/scripts/valley_world.gd", "utf8");
  const logic = readFileSync("godot/scripts/valley_logic.gd", "utf8");
  const playSrc = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(valley, /bed-valley\.png/);
  assert.match(valley, /VALLEY_DUSK/);
  assert.match(valley, /class_name ValleyWorld/);
  assert.match(logic, /class_name ValleyLogic/);
  assert.match(logic, /show_crops/);
  assert.match(playSrc, /scenes\/valley\.tscn/);
  assert.match(playSrc, /ValleyWorld/);
  assert.doesNotMatch(valley, /prop-cover-tree|prop-cover-lamp|prop-cover-shore|prop-cover-verge|prop-hut|prop-lodge/);
  assert.doesNotMatch(logic, /prop-cover-tree|prop-cover-lamp|prop-cover-shore|prop-cover-verge|prop-hut|prop-lodge/);
  assert.doesNotMatch(logic, /Look\.hung/);
  assert.doesNotMatch(playSrc, /prop-cover-tree|prop-hut\.png|prop-lodge\.png/);
  assert.match(playSrc, /_tiles\.is_empty\(\) or _zone == "valley"/);
  assert.doesNotMatch(valley, /prop-mine\.png/);
  assert.doesNotMatch(valley, /prop-stall\.png/);
  assert.doesNotMatch(valley, /prop-anvil\.png/);
  assert.doesNotMatch(valley, /prop-altar\.png/);
  assert.doesNotMatch(valley, /prop-board\.png/);
  assert.doesNotMatch(valley, /prop-pine\.png/);
  assert.doesNotMatch(valley, /prop-tree-gold/);
  assert.doesNotMatch(valley, /prop-tree\.png/);
  assert.doesNotMatch(valley, /prop-dock\.png/);
  assert.doesNotMatch(valley, /prop-gate\.png/);
  assert.doesNotMatch(logic, /prop-stall\.png|prop-anvil\.png|prop-pine\.png|prop-tree\.png/);
  const unify = readFileSync("tools/unify_dusk.py", "utf8");
  assert.match(unify, /cover-valley/);
  assert.match(unify, /quiet_scrub/);
  assert.doesNotMatch(unify, /scrub_inn/);
  assert.match(unify, /prop-hut/);
  assert.match(unify, /prop-lodge/);
  assert.match(unify, /prop-cover-tree/);
  assert.match(unify, /prop-cover-lamp/);
  assert.match(unify, /prop-cover-shore/);
  assert.match(unify, /Does not touch the cover/);
  assert.match(unify, /60, 310, 260, 550/);
  assert.match(unify, /840, 190, 1180, 510/);
  assert.match(unify, /0, 168, 90, 338/);
  assert.match(unify, /0, 140, 100, 308/);
  assert.match(unify, /0, 48, 150, 328/);
  assert.match(unify, /705, 255, 885, 465/);
  assert.match(unify, /0, 140, 140, 340/);
  assert.match(unify, /TREE_DENSE/);
  assert.match(unify, /HUT_POLY/);
  assert.match(unify, /LODGE_POLY/);
  assert.match(unify, /1195, 105, 1280, 190/);
  assert.match(unify, /cut_tree/);
  assert.match(unify, /918, 298, 972, 372/);
  assert.match(unify, /1008, 548, 1148, 668/);
  assert.match(unify, /fade_bank/);
  assert.match(unify, /cut_house/);
  assert.match(unify, /eat_gold_sky/);
  assert.match(unify, /kill_haze/);
  assert.doesNotMatch(unify, /Wilson|Don't Starve|Dont Starve/i);
  assert.ok(existsSync("godot/assets/art/prop-cover-tree.png"));
  assert.ok(existsSync("godot/assets/art/prop-cover-tree-b.png"));
  assert.ok(existsSync("godot/assets/art/prop-cover-lamp.png"));
  assert.ok(existsSync("godot/assets/art/prop-cover-shore.png"));
  assert.ok(existsSync("godot/assets/art/prop-cover-verge.png"));
  assert.ok(existsSync("godot/assets/art/prop-hut.png"));
  assert.ok(existsSync("godot/assets/art/prop-lodge.png"));
  const oneLang = readFileSync("tools/paint_one_language.py", "utf8");
  assert.match(oneLang, /Does not touch the cover/);
  assert.match(oneLang, /prop-tree/);
  assert.match(oneLang, /prop-cabin/);
  assert.match(oneLang, /tex-paper/);
  assert.match(oneLang, /prop-bush/);
  assert.match(oneLang, /prop-tuft/);
  assert.match(oneLang, /prop-rock/);
  assert.match(oneLang, /prop-board/);
  assert.match(oneLang, /prop-stall/);
  assert.match(oneLang, /prop-fire/);
  assert.match(oneLang, /prop-gate/);
  assert.doesNotMatch(oneLang, /cover-valley/);
  assert.doesNotMatch(oneLang, /Wilson|Don't Starve|Dont Starve/i);
  const sitMain = readFileSync("tools/paint_valley_sit.py", "utf8");
  assert.match(sitMain, /Roofs are unify_dusk/);
  assert.doesNotMatch(sitMain, /save\(paint_house\("hut"\)/);
  const bedPaint = readFileSync("tools/paint_valley_bed.py", "utf8");
  assert.match(bedPaint, /Does not touch the cover/);
  assert.match(bedPaint, /bed-valley/);
  assert.match(bedPaint, /CROP_Y0 = 302/);
  assert.match(bedPaint, /PATH_LO, PATH_HI/);
  assert.match(bedPaint, /valley-path-fill/);
  assert.match(bedPaint, /CORRIDOR_X0, CORRIDOR_X1/);
  assert.ok(existsSync("tools/ref/valley-path-fill.png"));
  assert.doesNotMatch(bedPaint, /save\(.*cover-valley/);
  assert.doesNotMatch(bedPaint, /resize\(\(x1 - x0/);
  assert.doesNotMatch(valley, /floor-valley|ground-valley|_bend\(/);
  assert.doesNotMatch(valley, /band-river|band-path|band-meadow/);
  const floorPaint = readFileSync("tools/paint_valley_sit.py", "utf8");
  assert.match(floorPaint, /308\.0 \+ fx \* 82\.0/);
  assert.match(floorPaint, /0\.36, 0\.38, 0\.28/);
  assert.match(floorPaint, /1\.00, 0\.98, 0\.88/);
  assert.match(floorPaint, /Do not move the path or creek/);
  assert.match(floorPaint, /short wet lip|thin wet lip/);
  assert.doesNotMatch(floorPaint, /g \/ np\.maximum\(g\.max/);
  assert.ok(existsSync("godot/assets/art/floor-valley.png"));
  assert.doesNotMatch(valley, /_tile\(/);
  assert.doesNotMatch(valley, /prop-cabin|prop-inn/);
  assert.doesNotMatch(play, /modulate = Color\(1, 1, 1, 0\.55\)/);
  const scripts = ["boot.gd", "room.gd", "play.gd", "look.gd", "valley_world.gd", "valley_logic.gd", "actor_view.gd", "ear.gd"]
    .map((n) => readFileSync(`godot/scripts/${n}`, "utf8"))
    .join("\n");
  assert.doesNotMatch(scripts, /Wanderer|Wilson|Don't Starve|Dont Starve/i);
  const inn = readFileSync("godot/assets/art/prop-inn.png");
  assert.ok(!inn.includes("Wanderer") && !inn.includes("WANDERER") && !inn.includes("Good Ale"));
  assert.ok(existsSync("godot/assets/art/prop-anvil.png"));
  assert.ok(existsSync("godot/assets/art/prop-altar.png"));
  const sync = readFileSync("godot/tools/sync_art.sh", "utf8");
  assert.match(sync, /keeping godot\/assets\/art/);
  assert.doesNotMatch(sync, /cp -a/);
  const paint = readFileSync("tools/paint_look.py", "utf8");
  assert.match(paint, /trim_empty_feet/);
  assert.match(paint, /def finish_sit_props/);
  assert.match(paint, /Does not write cover-valley/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  const sit = readFileSync("tools/sit_chars.py", "utf8");
  assert.match(sit, /char-warm-ref/);
  assert.match(sit, /FOOT_Y/);
  assert.match(sit, /BAN/);
  assert.doesNotMatch(sit, /SRCS\[.*= .*walk-raw/);
  const warmWalk = readFileSync("godot/assets/art/char-warm-walk.png");
  assert.ok(!warmWalk.includes("Wilson") && !warmWalk.includes("WANDERER"));
});

test("Godot client plays fish, mine and kitchen from the same snap", () => {
  assert.ok(existsSync("godot/scripts/zone_map.gd"));
  assert.ok(existsSync("godot/scripts/headless_loop.gd"));
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /toasts/);
  assert.match(play, /send_take/);
  assert.match(play, /_bag_sig/);
  assert.match(play, /chip_button/);
  assert.match(play, /slip_box/);
  assert.match(play, /_prompt_bar/);
  assert.match(play, /580, 64/);
  assert.doesNotMatch(play, /StyleBoxFlat/);
  assert.doesNotMatch(play, /wood_button\(label/);
  assert.match(play, /_ink_n/);
  assert.match(play, /_paint_fish/);
  assert.match(play, /_fish_mark\.position\.x = 16 \+ 528\.0 \* mark/);
  assert.match(play, /_valley\.visible = zone == "valley"/);
  assert.match(play, /_zone_map\.visible = indoor/);
  assert.match(play, /Look\.MOSS/);
  assert.match(play, /_tiles = \[\]/);
  assert.match(play, /show_fog/);
  assert.match(play, /biome/);
  assert.match(play, /fires/);
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.match(actor, /fishMark|fish_mark/);
  assert.match(actor, /char-%s-fish/);
  assert.match(actor, /Look\.MOSS/);
  assert.match(actor, /_bar_pull/);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /const MOSS/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /ch == "#"/);
  assert.match(zone, /func _wall/);
  assert.match(zone, /tex-wood\.png/);
  assert.match(zone, /tex-stone\.png/);
  assert.match(zone, /show_fog/);
  assert.match(zone, /ch == "F"/);
  assert.match(zone, /ch == "J"/);
  assert.doesNotMatch(zone, /ColorRect\.new\(\)[\s\S]{0,80}ch == "#"/);
  const net = readFileSync("godot/scripts/net.gd", "utf8");
  assert.match(net, /revealed/);
  const world = readFileSync("src/sim/world.ts", "utf8");
  assert.match(world, /先面向要做的事/);
  assert.match(world, /先面向树、火或能砍的/);
  assert.match(world, /手里没有能切的/);
  assert.doesNotMatch(world, /if \(!p\.input\.held\) return;/);
  const loop = readFileSync("godot/scripts/headless_loop.gd", "utf8");
  assert.match(loop, /FISH_OK/);
  assert.match(loop, /ORE_OK/);
  assert.match(loop, /PLATE_OK/);
  assert.ok(existsSync("godot/scripts/headless_cover_loop.gd"));
  const coverLoop = readFileSync("godot/scripts/headless_cover_loop.gd", "utf8");
  assert.match(coverLoop, /COVER_LOOP_OK/);
  assert.match(coverLoop, /show_room|开一间/);
  assert.match(coverLoop, /SHOW_ROOM/);
  assert.match(coverLoop, /24000/);
  assert.match(coverLoop, /NEED_PREP/);
  assert.match(coverLoop, /_take_cook/);
  assert.match(coverLoop, /take_cool/);
  assert.match(coverLoop, /herb", "osmanthus", "greens", "tomato", "mushroom", "fish"/);
  assert.match(coverLoop, /if ore_ok:/);
  assert.match(coverLoop, /PLAY_ZONE_VALLEY/);
  assert.match(coverLoop, /PLAY_ZONE_MINE/);
  assert.match(coverLoop, /PLAY_ZONE_KITCHEN/);
  assert.match(coverLoop, /PLAY_FISH_MARK/);
  assert.match(coverLoop, /_note_play/);
  assert.ok(existsSync("godot/scripts/headless_play_evening.gd"));
  assert.ok(existsSync("godot/scenes/play_evening.tscn"));
  const playEveningScene = readFileSync("godot/scenes/play_evening.tscn", "utf8");
  assert.match(playEveningScene, /headless_play_evening\.gd/);
  const playEvening = readFileSync("godot/scripts/headless_play_evening.gd", "utf8");
  assert.match(playEvening, /scenes\/play\.tscn/);
  assert.match(playEvening, /_on_snap/);
  assert.match(playEvening, /PLAY_ZONE_VALLEY/);
  assert.match(playEvening, /PLAY_ZONE_MINE/);
  assert.match(playEvening, /PLAY_ZONE_KITCHEN/);
  assert.match(playEvening, /PLAY_FISH_MARK/);
  assert.match(playEvening, /PLAY_EVENING_OK/);
  assert.match(playEvening, /bed-valley\.png/);
  assert.match(playEvening, /fishMark/);
  assert.match(playEvening, /_fish_mark/);
  assert.match(playEvening, /528\.0 \* mark/);
  assert.doesNotMatch(playEvening, /魂|Wilson|Don't Starve|Dont Starve/i);
  assert.match(loop, /if ore_ok:/);
  assert.match(loop, /send_acc/);
  assert.match(loop, /quit\(0\)[\s\S]{0,20}return/);
  assert.ok(existsSync("godot/scripts/headless_rest_loop.gd"));
  const rest = readFileSync("godot/scripts/headless_rest_loop.gd", "utf8");
  assert.match(rest, /WILD_OK/);
  assert.match(rest, /FORGE_OK/);
  assert.match(rest, /STALL_OK/);
  assert.doesNotMatch(rest, /Wilson|Don't Starve|Dont Starve/i);
  assert.ok(existsSync("godot/scripts/headless_village_loop.gd"));
  const village = readFileSync("godot/scripts/headless_village_loop.gd", "utf8");
  assert.match(village, /FIELD_OK/);
  assert.match(village, /FORTUNE_OK/);
  assert.match(village, /BOARD_OK/);
  assert.match(village, /DAY_REST_NO/);
  assert.match(village, /SLEEP_OK/);
  assert.match(village, /HARVEST_OK/);
  assert.match(village, /show_crops/);
  assert.doesNotMatch(village, /Wilson|Don't Starve|Dont Starve/i);
  assert.doesNotMatch(village, /waitingFortune|另一部手机/);
});

test("Godot village shows crops, fortune and the dawn board from the same snap", () => {
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /_paint_signs/);
  assert.match(play, /_paint_crops/);
  assert.match(play, /show_crops/);
  assert.match(play, /今晚/);
  assert.match(play, /fortune/);
  assert.match(play, /熟了/);
  assert.doesNotMatch(play, /waitingFortune/);
  assert.doesNotMatch(play, /另一部手机|必须两/);
  const valley = readFileSync("godot/scripts/valley_logic.gd", "utf8");
  assert.match(valley, /show_crops/);
  assert.match(valley, /prop-tuft|prop-bush/);
  assert.match(valley, /_sit_plot/);
  assert.match(valley, /prop-sprout\.png/);
  assert.match(valley, /prop-ripe\.png/);
  assert.match(valley, /prop-fortune\.png/);
  assert.match(valley, /prop-dawn\.png/);
  assert.doesNotMatch(valley, /Look\.hung/);
  assert.doesNotMatch(valley, /add_child\(_crop_at/);
  assert.doesNotMatch(valley, /prop-cabin|prop-inn/);
  assert.match(play, /_zone == "valley"/);
  assert.match(play, /_atlas\.visible = false/);
  const world = readFileSync("src/sim/world.ts", "utf8");
  assert.match(world, /没有种。田不用浇/);
  assert.match(world, /也得对着铺/);
  assert.match(world, /还早。天黑再歇/);
  assert.match(world, /一个人能问|问今日/);
});

test("Village and wild sit one dusk language through Play", () => {
  for (const name of ["prop-sprout.png", "prop-ripe.png", "prop-fortune.png", "prop-dawn.png", "bed-wild.png"]) {
    assert.ok(existsSync(`godot/assets/art/${name}`));
  }
  const paint = readFileSync("tools/paint_village_look.py", "utf8");
  assert.match(paint, /Does not touch the cover/);
  assert.match(paint, /key_magenta/);
  assert.match(paint, /real a=0/);
  assert.match(paint, /prop-sprout/);
  assert.match(paint, /prop-ripe/);
  assert.match(paint, /prop-fortune/);
  assert.match(paint, /prop-dawn/);
  assert.match(paint, /bed-wild/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  assert.doesNotMatch(paint, /Wilson|Don't Starve|Dont Starve|魂/i);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /bed-wild\.png/);
  assert.match(zone, /_sit_wild_bed/);
  assert.match(zone, /ch == "F"/);
  assert.match(zone, /ch == "J"/);
  assert.doesNotMatch(zone, /prop-tree\.png/);
  assert.doesNotMatch(zone, /prop-cover-|prop-hut|prop-lodge/);
  assert.ok(existsSync("godot/scripts/headless_play_village.gd"));
  assert.ok(existsSync("godot/scenes/play_village.tscn"));
  const playVillage = readFileSync("godot/scripts/headless_play_village.gd", "utf8");
  assert.match(playVillage, /scenes\/play\.tscn/);
  assert.match(playVillage, /PLAY_CROP_SIT/);
  assert.match(playVillage, /PLAY_FORTUNE_SIT/);
  assert.match(playVillage, /PLAY_DAWN_SIT/);
  assert.match(playVillage, /PLAY_WILD_BED/);
  assert.match(playVillage, /PLAY_VILLAGE_OK/);
  assert.match(playVillage, /prop-sprout\.png/);
  assert.match(playVillage, /bed-wild\.png/);
  assert.doesNotMatch(playVillage, /魂|Wilson|Don't Starve|Dont Starve/i);
  const playVillageScene = readFileSync("godot/scenes/play_village.tscn", "utf8");
  assert.match(playVillageScene, /headless_play_village\.gd/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /bed-wild|prop-sprout|prop-fortune|prop-dawn/);
  }
});

test("Kitchen sits one dusk bed and stations through Play", () => {
  for (const name of [
    "bed-kitchen.png",
    "prop-hearth.png",
    "prop-chop.png",
    "prop-oven.png",
    "prop-serve.png",
    "prop-cool.png",
    "prop-bin.png",
    "prop-shelf.png",
    "prop-way.png",
  ]) {
    assert.ok(existsSync(`godot/assets/art/${name}`));
  }
  const paint = readFileSync("tools/paint_kitchen_look.py", "utf8");
  assert.match(paint, /Does not touch the cover/);
  assert.match(paint, /key_magenta/);
  assert.match(paint, /real a=0/);
  assert.match(paint, /bed-kitchen/);
  assert.match(paint, /prop-hearth/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  assert.doesNotMatch(paint, /Wilson|Don't Starve|Dont Starve|魂/i);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /bed-kitchen\.png/);
  assert.match(zone, /_sit_kitchen_bed/);
  assert.doesNotMatch(zone, /prop-hearth\.png/);
  assert.doesNotMatch(zone, /prop-chop\.png/);
  assert.match(zone, /tex-wood\.png/);
  assert.doesNotMatch(zone, /prop-pot\.png/);
  assert.doesNotMatch(zone, /prop-cut\.png/);
  assert.doesNotMatch(zone, /prop-cover-|prop-hut|prop-lodge/);
  assert.ok(existsSync("godot/scripts/headless_play_kitchen.gd"));
  assert.ok(existsSync("godot/scenes/play_kitchen.tscn"));
  const playKitchen = readFileSync("godot/scripts/headless_play_kitchen.gd", "utf8");
  assert.match(playKitchen, /scenes\/play\.tscn/);
  assert.match(playKitchen, /PLAY_KITCHEN_BED/);
  assert.match(playKitchen, /PLAY_KITCHEN_POT/);
  assert.match(playKitchen, /PLAY_KITCHEN_OK/);
  assert.match(playKitchen, /bed-kitchen\.png/);
  assert.match(playKitchen, /prop-hearth\.png/);
  assert.doesNotMatch(playKitchen, /魂|Wilson|Don't Starve|Dont Starve/i);
  const playKitchenScene = readFileSync("godot/scenes/play_kitchen.tscn", "utf8");
  assert.match(playKitchenScene, /headless_play_kitchen\.gd/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /bed-kitchen|prop-hearth|prop-chop|prop-oven/);
  }
});

test("Mine sits one dusk bed and veins through Play", () => {
  for (const name of ["bed-mine.png", "prop-vein.png", "prop-steps.png", "prop-cache.png", "prop-mouth.png"]) {
    assert.ok(existsSync(`godot/assets/art/${name}`));
  }
  const paint = readFileSync("tools/paint_mine_look.py", "utf8");
  assert.match(paint, /Does not touch the cover/);
  assert.match(paint, /key_magenta/);
  assert.match(paint, /real a=0/);
  assert.match(paint, /bed-mine/);
  assert.match(paint, /prop-vein/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  assert.doesNotMatch(paint, /Wilson|Don't Starve|Dont Starve|魂/i);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /bed-mine\.png/);
  assert.match(zone, /_sit_mine_bed/);
  assert.doesNotMatch(zone, /prop-vein\.png/);
  assert.doesNotMatch(zone, /prop-steps\.png/);
  assert.match(zone, /tex-stone\.png/);
  assert.doesNotMatch(zone, /prop-stairs\.png/);
  assert.doesNotMatch(zone, /prop-door-open\.png/);
  assert.doesNotMatch(zone, /prop-cover-|prop-hut|prop-lodge/);
  assert.ok(existsSync("godot/scripts/headless_play_mine.gd"));
  assert.ok(existsSync("godot/scenes/play_mine.tscn"));
  const playMine = readFileSync("godot/scripts/headless_play_mine.gd", "utf8");
  assert.match(playMine, /scenes\/play\.tscn/);
  assert.match(playMine, /PLAY_MINE_BED/);
  assert.match(playMine, /PLAY_MINE_ORE/);
  assert.match(playMine, /PLAY_MINE_OK/);
  assert.match(playMine, /bed-mine\.png/);
  assert.match(playMine, /prop-vein\.png/);
  assert.doesNotMatch(playMine, /魂|Wilson|Don't Starve|Dont Starve/i);
  const playMineScene = readFileSync("godot/scenes/play_mine.tscn", "utf8");
  assert.match(playMineScene, /headless_play_mine\.gd/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /bed-mine|prop-vein|prop-steps|prop-cache|prop-mouth/);
  }
});

test("Forge and stall sit one dusk language through Play", () => {
  for (const name of ["prop-smith.png", "prop-booth.png"]) {
    assert.ok(existsSync(`godot/assets/art/${name}`));
  }
  const paint = readFileSync("tools/paint_forge_look.py", "utf8");
  assert.match(paint, /Does not touch the cover/);
  assert.match(paint, /key_magenta/);
  assert.match(paint, /real a=0/);
  assert.match(paint, /prop-smith/);
  assert.match(paint, /prop-booth/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  assert.doesNotMatch(paint, /Wilson|Don't Starve|Dont Starve|魂/i);
  const logic = readFileSync("godot/scripts/valley_logic.gd", "utf8");
  assert.match(logic, /prop-smith\.png/);
  assert.match(logic, /prop-booth\.png/);
  assert.match(logic, /_first_tile\("Y"\)/);
  assert.match(logic, /_first_tile\("S"\)/);
  assert.match(logic, /_first_tile\("G"\)/);
  assert.match(logic, /prop-fortune\.png/);
  assert.match(logic, /_sit_plot/);
  assert.doesNotMatch(logic, /Look\.hung/);
  assert.doesNotMatch(logic, /prop-anvil\.png/);
  assert.doesNotMatch(logic, /prop-stall\.png/);
  assert.doesNotMatch(logic, /prop-cover-|prop-hut|prop-lodge/);
  const valley = readFileSync("godot/scripts/valley_world.gd", "utf8");
  assert.doesNotMatch(valley, /prop-anvil\.png/);
  assert.doesNotMatch(valley, /prop-stall\.png/);
  assert.ok(existsSync("godot/scripts/headless_play_forge.gd"));
  assert.ok(existsSync("godot/scenes/play_forge.tscn"));
  const playForge = readFileSync("godot/scripts/headless_play_forge.gd", "utf8");
  assert.match(playForge, /scenes\/play\.tscn/);
  assert.match(playForge, /PLAY_FORGE_SIT/);
  assert.match(playForge, /PLAY_STALL_SIT/);
  assert.match(playForge, /PLAY_FORGE_OK/);
  assert.match(playForge, /prop-smith\.png/);
  assert.match(playForge, /prop-booth\.png/);
  assert.doesNotMatch(playForge, /魂|Wilson|Don't Starve|Dont Starve/i);
  const playForgeScene = readFileSync("godot/scenes/play_forge.tscn", "utf8");
  assert.match(playForgeScene, /headless_play_forge\.gd/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /prop-smith|prop-booth/);
  }
});

test("Sleep sits the cover-coat pose on the valley bed through Play", () => {
  assert.ok(existsSync("godot/assets/art/char-warm-sit.png"));
  assert.ok(existsSync("godot/assets/art/char-pine-sit.png"));
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.match(actor, /busy == "sit"/);
  assert.match(actor, /char-%s-sit/);
  assert.doesNotMatch(actor, /魂|Wilson|Don't Starve|Dont Starve/i);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /busy.*sit|_fish_hud\.visible = fight/);
  assert.doesNotMatch(play, /zone == "sleep"|bed-sleep|prop-bed/);
  assert.doesNotMatch(play, /魂|Wilson|Don't Starve|Dont Starve/i);
  const logic = readFileSync("godot/scripts/valley_logic.gd", "utf8");
  assert.match(logic, /36, 32/);
  assert.match(logic, /40, 42/);
  assert.doesNotMatch(logic, /Look\.hung/);
  assert.ok(existsSync("godot/scripts/headless_play_sleep.gd"));
  assert.ok(existsSync("godot/scenes/play_sleep.tscn"));
  const playSleep = readFileSync("godot/scripts/headless_play_sleep.gd", "utf8");
  assert.match(playSleep, /scenes\/play\.tscn/);
  assert.match(playSleep, /PLAY_SLEEP_SIT/);
  assert.match(playSleep, /PLAY_SLEEP_VALLEY/);
  assert.match(playSleep, /PLAY_SLEEP_OK/);
  assert.match(playSleep, /char-warm-sit\.png/);
  assert.match(playSleep, /bed-valley\.png/);
  assert.match(playSleep, /busy": "sit"/);
  assert.doesNotMatch(playSleep, /魂|Wilson|Don't Starve|Dont Starve/i);
  const playSleepScene = readFileSync("godot/scenes/play_sleep.tscn", "utf8");
  assert.match(playSleepScene, /headless_play_sleep\.gd/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /bed-sleep|prop-bed|char-warm-sit/);
  }
});

test("Cover-coats ease a walk stride and sit-to-stand", () => {
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.match(actor, /_stride/);
  assert.match(actor, /_sit/);
  assert.match(actor, /move_toward/);
  assert.match(actor, /0\.18/);
  assert.match(actor, /0\.22/);
  assert.match(actor, /Look\.FOOT/);
  assert.doesNotMatch(actor, /Wilson|Don't Starve|Dont Starve|Wanderer/i);
  assert.ok(existsSync("godot/scripts/headless_play_coats.gd"));
  assert.ok(existsSync("godot/scenes/play_coats.tscn"));
  const coats = readFileSync("godot/scripts/headless_play_coats.gd", "utf8");
  assert.match(coats, /scenes\/play\.tscn/);
  assert.match(coats, /PLAY_COAT_WALK/);
  assert.match(coats, /PLAY_COAT_SIT/);
  assert.match(coats, /PLAY_COAT_OK/);
  assert.match(coats, /char-warm-walk/);
  assert.match(coats, /char-warm-sit/);
  assert.doesNotMatch(coats, /魂|Wilson|Don't Starve|Dont Starve/i);
  const scene = readFileSync("godot/scenes/play_coats.tscn", "utf8");
  assert.match(scene, /headless_play_coats\.gd/);
  const sit = readFileSync("tools/sit_chars.py", "utf8");
  assert.match(sit, /BAN/);
  assert.doesNotMatch(sit, /SRCS\[.*= .*walk-raw/);
});

test("Cover-coat people walk and act on the painted bed", () => {
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.match(actor, /char-%s/);
  assert.match(actor, /warm" if warm else "pine/);
  assert.match(actor, /const BODY := 128|Look\.BODY/);
  assert.match(actor, /Look\.FOOT/);
  assert.match(actor, /SHADOW_EAST/);
  assert.doesNotMatch(actor, /Wilson|Don't Starve|Dont Starve|Wanderer/i);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /const BODY := 128/);
  assert.match(look, /const FOOT := 0\.979/);
  assert.match(look, /const SHADOW_EAST/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /Net\.send_input/);
  assert.match(play, /wood_button\("做"/);
  assert.match(play, /wood_button\("喊"/);
  assert.match(play, /_valley\.size_px/);
  assert.match(play, /_valley\.visible = zone == "valley"/);
  assert.match(play, /_paint_fish/);
  assert.match(play, /_show_zone/);
  assert.match(play, /zone_map/);
  assert.doesNotMatch(play, /prop-cover-|prop-hut|prop-lodge/);
  const bedPaint = readFileSync("tools/paint_valley_bed.py", "utf8");
  assert.match(bedPaint, /Hard-replace the pair|landscape corridor|valley-path-fill/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /bed-valley/);
  }
});

test("Godot two phones share a shout, a map, and a seat", () => {
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /_paint_mate/);
  assert.match(play, /断线了，人还在原地/);
  assert.match(play, /还没来/);
  assert.match(play, /partnerAt/);
  assert.match(play, /_atlas_flash/);
  assert.match(play, /mate_ping|partner.*ping/);
  assert.doesNotMatch(play, /等另一部|空等|waitingFortune/);
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.match(actor, /ping_glow/);
  assert.match(actor, /away/);
  assert.match(actor, /ping > 0/);
  assert.doesNotMatch(actor, /Wilson|Don't Starve|Dont Starve/i);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /ping_glow/);
  assert.match(look, /ping_tex/);
  assert.match(look, /0\.96, 0\.90, 0\.78/);
  const world = readFileSync("src/sim/world.ts", "utf8");
  assert.match(world, /away: this\.away\.has/);
  assert.match(world, /present\(\)/);
  assert.match(world, /reclaim\(/);
  assert.match(world, /this\.near\(/);
});

test("Play shows kitchen rush as two coats, only in the kitchen", () => {
  assert.ok(existsSync("godot/scripts/headless_play_rush.gd"));
  assert.ok(existsSync("godot/scenes/play_rush.tscn"));
  const rush = readFileSync("godot/scripts/headless_play_rush.gd", "utf8");
  assert.match(rush, /scenes\/play\.tscn/);
  assert.match(rush, /PLAY_RUSH_HOT/);
  assert.match(rush, /PLAY_RUSH_DO/);
  assert.match(rush, /PLAY_RUSH_ONLY/);
  assert.match(rush, /PLAY_RUSH_OK/);
  assert.match(rush, /堂口热/);
  assert.match(rush, /char-warm-chop/);
  assert.match(rush, /char-pine-chop/);
  assert.match(rush, /bed-kitchen\.png/);
  assert.match(rush, /prop-hearth\.png/);
  assert.match(rush, /prop-chop\.png/);
  assert.match(rush, /prop-oven\.png/);
  assert.match(rush, /prop-serve\.png/);
  assert.doesNotMatch(rush, /魂|Wilson|Don't Starve|Dont Starve/i);
  const scene = readFileSync("godot/scenes/play_rush.tscn", "utf8");
  assert.match(scene, /headless_play_rush\.gd/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /厨房 · 堂口热/);
  assert.match(play, /_paint_orders/);
  assert.match(play, /zone != "kitchen"/);
  assert.match(play, /slip_box/);
  assert.doesNotMatch(play, /combo|bond|pair\+|成对\+|魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_rush|PLAY_RUSH_HOT|char-warm-chop/);
  }
});

test("Play shows pair hands as two coats, not a bonus stat", () => {
  assert.ok(existsSync("godot/scripts/headless_play_hands.gd"));
  assert.ok(existsSync("godot/scenes/play_hands.tscn"));
  const hands = readFileSync("godot/scripts/headless_play_hands.gd", "utf8");
  assert.match(hands, /scenes\/play\.tscn/);
  assert.match(hands, /PLAY_PAIR_FISH/);
  assert.match(hands, /PLAY_PAIR_FORGE/);
  assert.match(hands, /PLAY_PAIR_STALL/);
  assert.match(hands, /PLAY_PAIR_SLEEP/);
  assert.match(hands, /PLAY_HANDS_OK/);
  assert.match(hands, /两人同钓/);
  assert.match(hands, /char-warm-fish/);
  assert.match(hands, /char-warm-forge/);
  assert.match(hands, /char-warm-sit/);
  assert.match(hands, /90\.0/);
  assert.doesNotMatch(hands, /魂|Wilson|Don't Starve|Dont Starve/i);
  const scene = readFileSync("godot/scenes/play_hands.tscn", "utf8");
  assert.match(scene, /headless_play_hands\.gd/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /两人|一起|等她/);
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /bond|pair\+|成对\+|魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_hands|PLAY_PAIR_FISH|char-warm-forge/);
  }
});

test("Play shows a shared valley without a second phone", () => {
  assert.ok(existsSync("godot/scripts/headless_play_together.gd"));
  assert.ok(existsSync("godot/scenes/play_together.tscn"));
  const together = readFileSync("godot/scripts/headless_play_together.gd", "utf8");
  assert.match(together, /scenes\/play\.tscn/);
  assert.match(together, /PLAY_PAIR_COATS/);
  assert.match(together, /PLAY_SHOUT_LIT/);
  assert.match(together, /PLAY_SEAT_KEEP/);
  assert.match(together, /PLAY_TOGETHER_OK/);
  assert.match(together, /char-warm/);
  assert.match(together, /char-pine/);
  assert.match(together, /身旁/);
  assert.match(together, /断线了，人还在原地/);
  assert.match(together, /revealed/);
  assert.doesNotMatch(together, /魂|Wilson|Don't Starve|Dont Starve/i);
  const playTogetherScene = readFileSync("godot/scenes/play_together.tscn", "utf8");
  assert.match(playTogetherScene, /headless_play_together\.gd/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /tone\("act"\)/);
  assert.match(play, /tone\("shout"\)/);
  const ear = readFileSync("godot/scripts/ear.gd", "utf8");
  assert.match(ear, /"act"/);
  assert.match(ear, /"shout"/);
  assert.match(ear, /"sit"/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_together|PLAY_PAIR_COATS|char-warm-sit/);
  }
});

test("Play shows spoil ticks and the kitchen icebox", () => {
  assert.ok(existsSync("godot/scripts/headless_play_spoil.gd"));
  assert.ok(existsSync("godot/scenes/play_spoil.tscn"));
  assert.ok(existsSync("godot/assets/art/prop-cool.png"));
  const spoil = readFileSync("godot/scripts/headless_play_spoil.gd", "utf8");
  assert.match(spoil, /scenes\/play\.tscn/);
  assert.match(spoil, /PLAY_SPOIL_COOL/);
  assert.match(spoil, /PLAY_SPOIL_WILT/);
  assert.match(spoil, /PLAY_SPOIL_ICE/);
  assert.match(spoil, /PLAY_SPOIL_OK/);
  assert.match(spoil, /prop-cool\.png/);
  assert.match(spoil, /蔫了/);
  assert.match(spoil, /还行/);
  assert.match(spoil, /冰柜/);
  assert.doesNotMatch(spoil, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_spoil.tscn", "utf8");
  assert.match(scene, /headless_play_spoil\.gd/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /_spoil_word/);
  assert.match(play, /_paint_ice/);
  assert.match(play, /蔫了/);
  assert.match(play, /还行/);
  assert.match(play, /坏了/);
  assert.match(play, /冰柜/);
  assert.doesNotMatch(play, /魂/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.doesNotMatch(zone, /prop-cool\.png/);
  assert.doesNotMatch(zone, /prop-icebox\.png/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_spoil|PLAY_SPOIL_WILT|_spoil_word|_paint_ice/);
  }
});

test("Play sits a camp pot on a lit wild fire", () => {
  assert.ok(existsSync("godot/scripts/headless_play_fire.gd"));
  assert.ok(existsSync("godot/scenes/play_fire.tscn"));
  assert.ok(existsSync("godot/assets/art/prop-camp-pot.png"));
  assert.ok(existsSync("tools/paint_camp_look.py"));
  const paint = readFileSync("tools/paint_camp_look.py", "utf8");
  assert.match(paint, /Does not touch the cover/);
  assert.match(paint, /key_magenta/);
  assert.match(paint, /real a=0/);
  assert.match(paint, /prop-camp-pot/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  assert.doesNotMatch(paint, /bed-valley/);
  assert.doesNotMatch(paint, /Wilson|Don't Starve|Dont Starve|魂/i);
  const firePlay = readFileSync("godot/scripts/headless_play_fire.gd", "utf8");
  assert.match(firePlay, /scenes\/play\.tscn/);
  assert.match(firePlay, /PLAY_FIRE_BED/);
  assert.match(firePlay, /PLAY_FIRE_POT/);
  assert.match(firePlay, /PLAY_FIRE_COOK/);
  assert.match(firePlay, /PLAY_FIRE_OK/);
  assert.match(firePlay, /prop-camp-pot\.png/);
  assert.match(firePlay, /prop-fire\.png/);
  assert.match(firePlay, /烤鱼/);
  assert.doesNotMatch(firePlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_fire.tscn", "utf8");
  assert.match(scene, /headless_play_fire\.gd/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.doesNotMatch(zone, /prop-camp-pot\.png/);
  assert.doesNotMatch(zone, /prop-fire\.png/);
  assert.doesNotMatch(zone, /lamp := ColorRect/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_fire|PLAY_FIRE_POT|prop-camp-pot/);
  }
});

test("Play sits dusk rain on valley and wild, not a weather ring", () => {
  assert.ok(existsSync("godot/scripts/headless_play_rain.gd"));
  assert.ok(existsSync("godot/scenes/play_rain.tscn"));
  assert.ok(existsSync("godot/shaders/rain.gdshader"));
  const rainPlay = readFileSync("godot/scripts/headless_play_rain.gd", "utf8");
  assert.match(rainPlay, /scenes\/play\.tscn/);
  assert.match(rainPlay, /PLAY_RAIN_CLEAR/);
  assert.match(rainPlay, /PLAY_RAIN_VALLEY/);
  assert.match(rainPlay, /PLAY_RAIN_HEARTH/);
  assert.match(rainPlay, /PLAY_RAIN_MINE/);
  assert.match(rainPlay, /PLAY_RAIN_WILD/);
  assert.match(rainPlay, /PLAY_RAIN_OK/);
  assert.match(rainPlay, /bed-valley\.png/);
  assert.match(rainPlay, /rain\.gdshader/);
  assert.match(rainPlay, /雨把火浇灭了/);
  assert.doesNotMatch(rainPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_rain.tscn", "utf8");
  assert.match(scene, /headless_play_rain\.gd/);
  const shader = readFileSync("godot/shaders/rain.gdshader", "utf8");
  assert.match(shader, /painted bed/);
  assert.match(shader, /0\.82, 0\.74, 0\.62/);
  assert.match(shader, /0\.42, 0\.32, 0\.22/);
  assert.doesNotMatch(shader, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /rain_mat/);
  assert.match(look, /RAIN_DROP := Color\(0\.82, 0\.74, 0\.62\)/);
  assert.match(look, /RAIN_WET := Color\(0\.42, 0\.32, 0\.22\)/);
  assert.match(look, /set_shader_parameter\("grade", 0\.0\)/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /set_rain/);
  assert.match(play, /Never a weather ring/);
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /魂/);
  const valley = readFileSync("godot/scripts/valley_world.gd", "utf8");
  assert.match(valley, /func set_rain/);
  assert.match(valley, /bed-valley\.png/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /func set_rain/);
  assert.match(zone, /_zone != "wild"/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_rain|PLAY_RAIN_VALLEY|rain_mat/);
  }
});

test("Play lifts a dusk wash as the wild path is written", () => {
  assert.ok(existsSync("godot/scripts/headless_play_path.gd"));
  assert.ok(existsSync("godot/scenes/play_path.tscn"));
  const pathPlay = readFileSync("godot/scripts/headless_play_path.gd", "utf8");
  assert.match(pathPlay, /scenes\/play\.tscn/);
  assert.match(pathPlay, /PLAY_PATH_DARK/);
  assert.match(pathPlay, /PLAY_PATH_WALK/);
  assert.match(pathPlay, /PLAY_PATH_SHARE/);
  assert.match(pathPlay, /PLAY_PATH_KNOWN/);
  assert.match(pathPlay, /PLAY_PATH_OK/);
  assert.match(pathPlay, /bed-wild\.png/);
  assert.match(pathPlay, /wash_at/);
  assert.doesNotMatch(pathPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_path.tscn", "utf8");
  assert.match(scene, /headless_play_path\.gd/);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /PATH_UNREAD := Color\(0\.56, 0\.42, 0\.28, 0\.58\)/);
  assert.match(look, /PATH_MEMORY := Color\(0\.68, 0\.54, 0\.36, 0\.20\)/);
  assert.match(look, /set_shader_parameter\("grade", 0\.0\)/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /Look\.PATH_UNREAD/);
  assert.match(zone, /Look\.PATH_MEMORY/);
  assert.match(zone, /func wash_at/);
  assert.match(zone, /heavier dusk wash/);
  assert.match(zone, /TEXTURE_FILTER_LINEAR/);
  assert.doesNotMatch(zone, /0\.12, 0\.08, 0\.05/);
  assert.doesNotMatch(zone, /TEXTURE_FILTER_NEAREST/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /show_fog/);
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_path|PLAY_PATH_WALK|PATH_UNREAD|wash_at/);
  }
});

test("Play sits a lantern-stick in the coat hand on the night path", () => {
  assert.ok(existsSync("godot/scripts/headless_play_torch.gd"));
  assert.ok(existsSync("godot/scenes/play_torch.tscn"));
  assert.ok(existsSync("godot/assets/art/prop-torch.png"));
  assert.ok(existsSync("tools/paint_torch_look.py"));
  const paint = readFileSync("tools/paint_torch_look.py", "utf8");
  assert.match(paint, /Does not touch the cover/);
  assert.match(paint, /key_magenta/);
  assert.match(paint, /real a=0/);
  assert.match(paint, /prop-torch/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  assert.doesNotMatch(paint, /bed-valley/);
  assert.doesNotMatch(paint, /Wilson|Don't Starve|Dont Starve|魂/i);
  const torchPlay = readFileSync("godot/scripts/headless_play_torch.gd", "utf8");
  assert.match(torchPlay, /scenes\/play\.tscn/);
  assert.match(torchPlay, /PLAY_TORCH_HAND/);
  assert.match(torchPlay, /PLAY_TORCH_PATH/);
  assert.match(torchPlay, /PLAY_TORCH_HEARTH/);
  assert.match(torchPlay, /PLAY_TORCH_OK/);
  assert.match(torchPlay, /prop-torch\.png/);
  assert.match(torchPlay, /搓火把/);
  assert.match(torchPlay, /火把/);
  assert.doesNotMatch(torchPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_torch.tscn", "utf8");
  assert.match(scene, /headless_play_torch\.gd/);
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.doesNotMatch(actor, /prop-torch\.png/);
  assert.match(actor, /LampStick/);
  assert.match(actor, /Look\.BODY - 28/);
  assert.doesNotMatch(actor, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_torch|PLAY_TORCH_HAND|prop-torch|paint_torch/);
  }
});

test("Play sits two dusk wells on the wild bed", () => {
  assert.ok(existsSync("godot/scripts/headless_play_hole.gd"));
  assert.ok(existsSync("godot/scenes/play_hole.tscn"));
  assert.ok(existsSync("godot/assets/art/prop-hole.png"));
  assert.ok(existsSync("tools/paint_hole_look.py"));
  const paint = readFileSync("tools/paint_hole_look.py", "utf8");
  assert.match(paint, /Does not touch the cover/);
  assert.match(paint, /key_magenta/);
  assert.match(paint, /real a=0/);
  assert.match(paint, /prop-hole/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  assert.doesNotMatch(paint, /bed-valley/);
  assert.doesNotMatch(paint, /Wilson|Don't Starve|Dont Starve|魂|tentacle/i);
  const holePlay = readFileSync("godot/scripts/headless_play_hole.gd", "utf8");
  assert.match(holePlay, /scenes\/play\.tscn/);
  assert.match(holePlay, /PLAY_HOLE_WILD/);
  assert.match(holePlay, /PLAY_HOLE_PAIR/);
  assert.match(holePlay, /PLAY_HOLE_HEARTH/);
  assert.match(holePlay, /PLAY_HOLE_OK/);
  assert.match(holePlay, /prop-hole\.png/);
  assert.match(holePlay, /钻洞/);
  assert.match(holePlay, /钻进了洞的另一头/);
  assert.doesNotMatch(holePlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity|tentacle/i);
  const scene = readFileSync("godot/scenes/play_hole.tscn", "utf8");
  assert.match(scene, /headless_play_hole\.gd/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.doesNotMatch(zone, /prop-hole\.png/);
  assert.doesNotMatch(zone, /EarthMouth/);
  assert.doesNotMatch(zone, /Warm umber mouth/);
  assert.doesNotMatch(zone, /0\.08, 0\.06, 0\.04/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_hole|PLAY_HOLE_WILD|prop-hole|paint_hole/);
  }
});

test("Play sits 火边 from the snap, not a fire ring", () => {
  assert.ok(existsSync("godot/scripts/headless_play_side.gd"));
  assert.ok(existsSync("godot/scenes/play_side.tscn"));
  assert.ok(!existsSync("godot/assets/art/prop-fireside.png"));
  assert.ok(!existsSync("tools/paint_side_look.py"));
  const sidePlay = readFileSync("godot/scripts/headless_play_side.gd", "utf8");
  assert.match(sidePlay, /scenes\/play\.tscn/);
  assert.match(sidePlay, /PLAY_SIDE_FIRE/);
  assert.match(sidePlay, /PLAY_SIDE_LAMP/);
  assert.match(sidePlay, /PLAY_SIDE_ALONE/);
  assert.match(sidePlay, /PLAY_SIDE_OK/);
  assert.match(sidePlay, /火边坐了一会儿/);
  assert.match(sidePlay, /char-warm-sit/);
  assert.match(sidePlay, /prop-fire\.png/);
  assert.match(sidePlay, /prop-hearth\.png/);
  assert.match(sidePlay, /bed-valley\.png/);
  assert.doesNotMatch(sidePlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_side.tscn", "utf8");
  assert.match(scene, /headless_play_side\.gd/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.match(play, /Hunger stays in the sim/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /_hud_bond/);
  assert.doesNotMatch(play, /魂/);
  const story = readFileSync("production/epics/r1-evening-places/story-019-fireside.md", "utf8");
  assert.match(story, /\*\*Status\*\*:\s*In progress/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_side|PLAY_SIDE_FIRE|prop-fireside|paint_side/);
  }
});

test("Play sits mine floor 1 then floor 2 on one mine bed", () => {
  assert.ok(existsSync("godot/scripts/headless_play_floor.gd"));
  assert.ok(existsSync("godot/scenes/play_floor.tscn"));
  assert.ok(existsSync("godot/assets/art/bed-mine.png"));
  assert.ok(!existsSync("godot/assets/art/bed-mine-2.png"));
  assert.ok(!existsSync("tools/paint_floor_look.py"));
  const floorPlay = readFileSync("godot/scripts/headless_play_floor.gd", "utf8");
  assert.match(floorPlay, /scenes\/play\.tscn/);
  assert.match(floorPlay, /PLAY_FLOOR_ONE/);
  assert.match(floorPlay, /PLAY_FLOOR_TWO/);
  assert.match(floorPlay, /PLAY_FLOOR_HEARTH/);
  assert.match(floorPlay, /PLAY_FLOOR_OK/);
  assert.match(floorPlay, /矿 1层/);
  assert.match(floorPlay, /矿 2层/);
  assert.match(floorPlay, /bed-mine\.png/);
  assert.match(floorPlay, /bed-valley\.png/);
  assert.match(floorPlay, /这一层矿脉很响/);
  assert.doesNotMatch(floorPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_floor.tscn", "utf8");
  assert.match(scene, /headless_play_floor\.gd/);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /func mine_paper/);
  assert.match(look, /One mine painting\. Lower floors a deeper dusk\. Not a new bed\./);
  assert.match(look, /set_shader_parameter\("grade", 0\.0\)/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /func set_mine_depth/);
  assert.match(zone, /bed-mine\.png/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /set_mine_depth/);
  assert.match(play, /矿 %s层/);
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /_hud_season/);
  assert.doesNotMatch(play, /魂/);
  const story = readFileSync("production/epics/r1-evening-places/story-018-mine-floors.md", "utf8");
  assert.match(story, /\*\*Status\*\*:\s*Complete/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts", "src/world/maps.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_floor|PLAY_FLOOR_ONE|mine_paper|paint_floor/);
  }
});

test("Play turns 春夏秋冬 on one dusk bed, not four beds", () => {
  assert.ok(existsSync("godot/scripts/headless_play_sea.gd"));
  assert.ok(existsSync("godot/scenes/play_sea.tscn"));
  assert.ok(!existsSync("godot/assets/art/bed-valley-winter.png"));
  assert.ok(!existsSync("tools/paint_sea_look.py"));
  const seaPlay = readFileSync("godot/scripts/headless_play_sea.gd", "utf8");
  assert.match(seaPlay, /scenes\/play\.tscn/);
  assert.match(seaPlay, /PLAY_SEA_TURN/);
  assert.match(seaPlay, /PLAY_SEA_SUMMER/);
  assert.match(seaPlay, /PLAY_SEA_WINTER/);
  assert.match(seaPlay, /PLAY_SEA_HEARTH/);
  assert.match(seaPlay, /PLAY_SEA_OK/);
  assert.match(seaPlay, /春夏秋冬/);
  assert.match(seaPlay, /bed-valley\.png/);
  assert.doesNotMatch(seaPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_sea.tscn", "utf8");
  assert.match(scene, /headless_play_sea\.gd/);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /func season_paper/);
  assert.match(look, /One dusk language\. Winter cooler paper, summer warmer\. Not four beds\./);
  assert.match(look, /set_shader_parameter\("grade", 0\.0\)/);
  const world = readFileSync("godot/scripts/valley_world.gd", "utf8");
  assert.match(world, /func set_season/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /func set_season/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /_valley\.set_season/);
  assert.match(play, /_zone_map\.set_season/);
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.match(play, /Never purple night/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /_hud_season/);
  assert.doesNotMatch(play, /魂/);
  const story = readFileSync("production/epics/r1-evening-places/story-017-seasons.md", "utf8");
  assert.match(story, /\*\*Status\*\*:\s*Complete/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts", "src/game/season.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_sea|PLAY_SEA_TURN|season_paper|paint_sea/);
  }
});

test("Play sits a night bite from the snap, not a fear veil", () => {
  assert.ok(existsSync("godot/scripts/headless_play_bite.gd"));
  assert.ok(existsSync("godot/scenes/play_bite.tscn"));
  assert.ok(!existsSync("godot/assets/art/prop-bite.png"));
  assert.ok(!existsSync("tools/paint_bite_look.py"));
  const bitePlay = readFileSync("godot/scripts/headless_play_bite.gd", "utf8");
  assert.match(bitePlay, /scenes\/play\.tscn/);
  assert.match(bitePlay, /PLAY_BITE_WILD/);
  assert.match(bitePlay, /PLAY_BITE_EDGE/);
  assert.match(bitePlay, /PLAY_BITE_HEARTH/);
  assert.match(bitePlay, /PLAY_BITE_OK/);
  assert.match(bitePlay, /被黑暗咬了一口/);
  assert.match(bitePlay, /太暗了/);
  assert.match(bitePlay, /出谷 · 夜里没火会咬人/);
  assert.match(bitePlay, /night\.gdshader/);
  assert.doesNotMatch(bitePlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_bite.tscn", "utf8");
  assert.match(scene, /headless_play_bite\.gd/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.match(play, /Never purple night/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_bite|PLAY_BITE_WILD|prop-bite|paint_bite/);
  }
});

test("Play sits a wild stumble from the snap, not a forage sticker", () => {
  assert.ok(existsSync("godot/scripts/headless_play_scout.gd"));
  assert.ok(existsSync("godot/scenes/play_scout.tscn"));
  assert.ok(!existsSync("godot/assets/art/prop-forage.png"));
  assert.ok(!existsSync("tools/paint_scout_look.py"));
  const scoutPlay = readFileSync("godot/scripts/headless_play_scout.gd", "utf8");
  assert.match(scoutPlay, /scenes\/play\.tscn/);
  assert.match(scoutPlay, /PLAY_SCOUT_WILD/);
  assert.match(scoutPlay, /PLAY_SCOUT_TRIP/);
  assert.match(scoutPlay, /PLAY_SCOUT_HEARTH/);
  assert.match(scoutPlay, /PLAY_SCOUT_OK/);
  assert.match(scoutPlay, /脚下绊到/);
  assert.match(scoutPlay, /山草/);
  assert.match(scoutPlay, /wash_at/);
  assert.doesNotMatch(scoutPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_scout.tscn", "utf8");
  assert.match(scene, /headless_play_scout\.gd/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.doesNotMatch(zone, /prop-forage|prop-scout|脚下绊到/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_scout|PLAY_SCOUT_WILD|prop-forage|paint_scout/);
  }
});

test("Play sits an old camp search on the wild bed", () => {
  assert.ok(existsSync("godot/scripts/headless_play_camp.gd"));
  assert.ok(existsSync("godot/scenes/play_camp.tscn"));
  assert.ok(!existsSync("godot/assets/art/prop-camp-loot.png"));
  assert.ok(!existsSync("tools/paint_old_camp_look.py"));
  const campPlay = readFileSync("godot/scripts/headless_play_camp.gd", "utf8");
  assert.match(campPlay, /scenes\/play\.tscn/);
  assert.match(campPlay, /PLAY_CAMP_WILD/);
  assert.match(campPlay, /PLAY_CAMP_LOOT/);
  assert.match(campPlay, /PLAY_CAMP_PAIR/);
  assert.match(campPlay, /PLAY_CAMP_HEARTH/);
  assert.match(campPlay, /PLAY_CAMP_OK/);
  assert.match(campPlay, /搜旧营/);
  assert.match(campPlay, /并肩搜旧营/);
  assert.match(campPlay, /翻出一点存货/);
  assert.match(campPlay, /两个人的东西/);
  assert.match(campPlay, /旧营被翻过了/);
  assert.match(campPlay, /prop-fire\.png/);
  assert.match(campPlay, /prop-rock\.png/);
  assert.doesNotMatch(campPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity|chest/i);
  const scene = readFileSync("godot/scenes/play_camp.tscn", "utf8");
  assert.match(scene, /headless_play_camp\.gd/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /Old camp is fire and rock/);
  assert.match(zone, /Not a chest/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.match(play, /prompt\.find\("搜"\)/);
  assert.match(play, /prompt\.find\("并肩"\)/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_camp|PLAY_CAMP_WILD|prop-camp-loot|paint_old_camp/);
  }
});

test("Play sits one dusk nest on the wild bed", () => {
  assert.ok(existsSync("godot/scripts/headless_play_silk.gd"));
  assert.ok(existsSync("godot/scenes/play_silk.tscn"));
  assert.ok(existsSync("godot/assets/art/prop-silk.png"));
  assert.ok(existsSync("tools/paint_silk_look.py"));
  const paint = readFileSync("tools/paint_silk_look.py", "utf8");
  assert.match(paint, /Does not touch the cover/);
  assert.match(paint, /key_magenta/);
  assert.match(paint, /real a=0/);
  assert.match(paint, /prop-silk/);
  assert.doesNotMatch(paint, /save\(.*cover-valley/);
  assert.doesNotMatch(paint, /bed-valley/);
  assert.doesNotMatch(paint, /Wilson|Don't Starve|Dont Starve|魂|spider|tentacle/i);
  const silkPlay = readFileSync("godot/scripts/headless_play_silk.gd", "utf8");
  assert.match(silkPlay, /scenes\/play\.tscn/);
  assert.match(silkPlay, /PLAY_SILK_WILD/);
  assert.match(silkPlay, /PLAY_SILK_SWING/);
  assert.match(silkPlay, /PLAY_SILK_HEARTH/);
  assert.match(silkPlay, /PLAY_SILK_OK/);
  assert.match(silkPlay, /prop-silk\.png/);
  assert.match(silkPlay, /挥/);
  assert.doesNotMatch(silkPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity|spider|tentacle/i);
  const scene = readFileSync("godot/scenes/play_silk.tscn", "utf8");
  assert.match(scene, /headless_play_silk\.gd/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.doesNotMatch(zone, /prop-silk\.png/);
  assert.doesNotMatch(zone, /SilkNest/);
  assert.doesNotMatch(zone, /Paper silk and umber twigs/);
  assert.doesNotMatch(zone, /prop-beast\.png/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /魂/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_silk|PLAY_SILK_WILD|prop-silk|paint_silk/);
  }
});

test("Play sits dusk haze on valley and wild, not a fear veil", () => {
  assert.ok(existsSync("godot/scripts/headless_play_fog.gd"));
  assert.ok(existsSync("godot/scenes/play_fog.tscn"));
  assert.ok(existsSync("godot/shaders/fog.gdshader"));
  const fogPlay = readFileSync("godot/scripts/headless_play_fog.gd", "utf8");
  assert.match(fogPlay, /scenes\/play\.tscn/);
  assert.match(fogPlay, /PLAY_FOG_CLEAR/);
  assert.match(fogPlay, /PLAY_FOG_VALLEY/);
  assert.match(fogPlay, /PLAY_FOG_HEARTH/);
  assert.match(fogPlay, /PLAY_FOG_MINE/);
  assert.match(fogPlay, /PLAY_FOG_WILD/);
  assert.match(fogPlay, /PLAY_FOG_OK/);
  assert.match(fogPlay, /bed-valley\.png/);
  assert.match(fogPlay, /fog\.gdshader/);
  assert.doesNotMatch(fogPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_fog.tscn", "utf8");
  assert.match(scene, /headless_play_fog\.gd/);
  const shader = readFileSync("godot/shaders/fog.gdshader", "utf8");
  assert.match(shader, /painted bed/);
  assert.match(shader, /0\.86, 0\.78, 0\.64/);
  assert.match(shader, /0\.62, 0\.54, 0\.40/);
  assert.doesNotMatch(shader, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /fog_mat/);
  assert.match(look, /FOG_MIST := Color\(0\.86, 0\.78, 0\.64\)/);
  assert.match(look, /FOG_SHADE := Color\(0\.62, 0\.54, 0\.40\)/);
  assert.match(look, /set_shader_parameter\("grade", 0\.0\)/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /set_fog/);
  assert.match(play, /Never a weather ring/);
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /_hud_weather/);
  assert.doesNotMatch(play, /魂/);
  const valley = readFileSync("godot/scripts/valley_world.gd", "utf8");
  assert.match(valley, /func set_fog/);
  assert.match(valley, /bed-valley\.png/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /func set_fog/);
  assert.match(zone, /_zone != "wild"/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_fog|PLAY_FOG_VALLEY|fog_mat/);
  }
});

test("Play dims the painted bed at night and keeps indoor hearths", () => {
  assert.ok(existsSync("godot/scripts/headless_play_night.gd"));
  assert.ok(existsSync("godot/scenes/play_night.tscn"));
  assert.ok(existsSync("godot/shaders/night.gdshader"));
  const nightPlay = readFileSync("godot/scripts/headless_play_night.gd", "utf8");
  assert.match(nightPlay, /scenes\/play\.tscn/);
  assert.match(nightPlay, /PLAY_NIGHT_DUSK/);
  assert.match(nightPlay, /PLAY_NIGHT_VALLEY/);
  assert.match(nightPlay, /PLAY_NIGHT_HEARTH/);
  assert.match(nightPlay, /PLAY_NIGHT_MINE/);
  assert.match(nightPlay, /PLAY_NIGHT_WILD/);
  assert.match(nightPlay, /PLAY_NIGHT_OK/);
  assert.match(nightPlay, /bed-valley\.png/);
  assert.match(nightPlay, /bed-mine\.png/);
  assert.match(nightPlay, /night\.gdshader/);
  assert.match(nightPlay, /夜里/);
  assert.doesNotMatch(nightPlay, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const scene = readFileSync("godot/scenes/play_night.tscn", "utf8");
  assert.match(scene, /headless_play_night\.gd/);
  const shader = readFileSync("godot/shaders/night.gdshader", "utf8");
  assert.match(shader, /painted bed/);
  assert.match(shader, /0\.78, 0\.68, 0\.52/);
  assert.doesNotMatch(shader, /魂|Wilson|Don't Starve|Dont Starve|Charlie|sanity/i);
  const look = readFileSync("godot/scripts/look.gd", "utf8");
  assert.match(look, /night_mat/);
  assert.match(look, /NIGHT := Color\(0\.78, 0\.68, 0\.52\)/);
  assert.match(look, /NIGHT_WILD := Color\(0\.46, 0\.38, 0\.28\)/);
  assert.match(look, /set_shader_parameter\("grade", 0\.0\)/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /set_night/);
  assert.match(play, /0\.78, 0\.68, 0\.52/);
  assert.match(play, /0\.46, 0\.38, 0\.28/);
  assert.match(play, /Never purple night/);
  assert.match(play, /VALLEY_DUSK/);
  assert.doesNotMatch(play, /魂/);
  assert.doesNotMatch(play, /sanity|Sanity/);
  const valley = readFileSync("godot/scripts/valley_world.gd", "utf8");
  assert.match(valley, /func set_night/);
  assert.match(valley, /bed-valley\.png/);
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /func set_night/);
  assert.match(zone, /WildBed/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_night|PLAY_NIGHT_VALLEY|night_mat/);
  }
});

test("Play smokes title, room, valley, do, shout, kitchen, mine, sit", () => {
  assert.ok(existsSync("godot/scripts/headless_play_smoke.gd"));
  assert.ok(existsSync("godot/scenes/play_smoke.tscn"));
  assert.ok(existsSync("production/qa/evidence/smoke-evening.md"));
  const smoke = readFileSync("godot/scripts/headless_play_smoke.gd", "utf8");
  assert.match(smoke, /SMOKE_TITLE/);
  assert.match(smoke, /SMOKE_ROOM/);
  assert.match(smoke, /SMOKE_VALLEY/);
  assert.match(smoke, /SMOKE_DO/);
  assert.match(smoke, /SMOKE_SHOUT/);
  assert.match(smoke, /SMOKE_KITCHEN/);
  assert.match(smoke, /SMOKE_MINE/);
  assert.match(smoke, /SMOKE_SIT/);
  assert.match(smoke, /SMOKE_EVENING_OK/);
  assert.match(smoke, /开一间/);
  assert.match(smoke, /bed-valley\.png/);
  assert.match(smoke, /cover-valley\.png/);
  assert.doesNotMatch(smoke, /魂|Wilson|Don't Starve|Dont Starve/i);
  const scene = readFileSync("godot/scenes/play_smoke.tscn", "utf8");
  assert.match(scene, /headless_play_smoke\.gd/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_smoke|SMOKE_EVENING_OK/);
  }
});

test("Play hears kitchen hearth, chop, and a mine vein", () => {
  assert.ok(existsSync("godot/scripts/headless_play_place.gd"));
  assert.ok(existsSync("godot/scenes/play_place.tscn"));
  const place = readFileSync("godot/scripts/headless_play_place.gd", "utf8");
  assert.match(place, /scenes\/play\.tscn/);
  assert.match(place, /PLAY_PLACE_HEARTH/);
  assert.match(place, /PLAY_PLACE_CHOP/);
  assert.match(place, /PLAY_PLACE_VEIN/);
  assert.match(place, /PLAY_PLACE_OK/);
  assert.match(place, /bed-kitchen\.png/);
  assert.match(place, /bed-mine\.png/);
  assert.match(place, /bed-valley\.png/);
  assert.match(place, /set_muted/);
  assert.doesNotMatch(place, /魂|Wilson|Don't Starve|Dont Starve/i);
  const scene = readFileSync("godot/scenes/play_place.tscn", "utf8");
  assert.match(scene, /headless_play_place\.gd/);
  const ear = readFileSync("godot/scripts/ear.gd", "utf8");
  assert.match(ear, /hearth/);
  assert.match(ear, /"chop"/);
  assert.match(ear, /"vein"/);
  assert.match(ear, /_near_vein/);
  assert.match(ear, /square/);
  assert.doesNotMatch(ear, /Net\.send|send_input|send_take/);
  assert.doesNotMatch(ear, /魂|Wilson|Don't Starve|Dont Starve/i);
  assert.ok(!existsSync("godot/assets/art/hearth.wav"));
  assert.ok(!existsSync("godot/assets/art/chop.wav"));
  assert.ok(!existsSync("godot/assets/art/vein.wav"));
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_place|PLAY_PLACE_HEARTH|_near_vein/);
  }
});

test("Play hears thin act, shout, sit, and a dusk bed", () => {
  assert.ok(existsSync("godot/scripts/headless_play_ear.gd"));
  assert.ok(existsSync("godot/scenes/play_ear.tscn"));
  const earPlay = readFileSync("godot/scripts/headless_play_ear.gd", "utf8");
  assert.match(earPlay, /scenes\/play\.tscn/);
  assert.match(earPlay, /PLAY_EAR_DUSK/);
  assert.match(earPlay, /PLAY_EAR_ACT/);
  assert.match(earPlay, /PLAY_EAR_SHOUT/);
  assert.match(earPlay, /PLAY_EAR_SIT/);
  assert.match(earPlay, /PLAY_EAR_OK/);
  assert.match(earPlay, /bed-valley\.png/);
  assert.match(earPlay, /set_muted/);
  assert.doesNotMatch(earPlay, /魂|Wilson|Don't Starve|Dont Starve/i);
  const scene = readFileSync("godot/scenes/play_ear.tscn", "utf8");
  assert.match(scene, /headless_play_ear\.gd/);
  const ear = readFileSync("godot/scripts/ear.gd", "utf8");
  assert.match(ear, /pick_ambient/);
  assert.match(ear, /dusk/);
  assert.match(ear, /_make_bed/);
  assert.match(ear, /bed_on/);
  assert.match(ear, /"act"/);
  assert.match(ear, /"shout"/);
  assert.match(ear, /"sit"/);
  assert.doesNotMatch(ear, /Net\.send|send_input|send_take/);
  assert.doesNotMatch(ear, /魂|Wilson|Don't Starve|Dont Starve/i);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /tone\("act"\)/);
  assert.match(play, /tone\("shout"\)/);
  assert.doesNotMatch(play, /send_.*mute|muted.*send/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_ear|PLAY_EAR_DUSK|_make_bed/);
  }
});

test("Godot ear is five thin sounds and one mute that does not change the world", () => {
  assert.ok(existsSync("godot/scripts/ear.gd"));
  const ear = readFileSync("godot/scripts/ear.gd", "utf8");
  assert.match(ear, /class_name ValleyEar/);
  assert.match(ear, /step/);
  assert.match(ear, /shore/);
  assert.match(ear, /fire/);
  assert.match(ear, /door/);
  assert.match(ear, /green/);
  assert.match(ear, /act/);
  assert.match(ear, /shout/);
  assert.match(ear, /sit/);
  assert.match(ear, /dusk/);
  assert.match(ear, /muted/);
  assert.match(ear, /unlock/);
  assert.match(ear, /0\.38/);
  assert.match(ear, /0\.72/);
  assert.match(ear, /does not touch the world|不改规则|does not change the world/);
  assert.doesNotMatch(ear, /Net\.send|send_input|send_take/);
  assert.doesNotMatch(ear, /Wilson|Don't Starve|Dont Starve/i);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.match(play, /ValleyEar/);
  assert.match(play, /_ear\.hear/);
  assert.match(play, /_toggle_mute/);
  assert.match(play, /"声"/);
  assert.match(play, /"静"/);
  assert.doesNotMatch(play, /send_.*mute|muted.*send/);
  assert.doesNotMatch(play, /Wilson|Don't Starve|Dont Starve/i);
});

test("Godot evening walk is fish, pot, then a night rest", () => {
  assert.ok(existsSync("godot/scripts/headless_evening_loop.gd"));
  const evening = readFileSync("godot/scripts/headless_evening_loop.gd", "utf8");
  assert.match(evening, /FISH_OK/);
  assert.match(evening, /COOK_OK/);
  assert.match(evening, /DAY_REST_NO/);
  assert.match(evening, /SLEEP_OK/);
  assert.match(evening, /EVENING_OK/);
  assert.match(evening, /get_ticks_msec/);
  assert.doesNotMatch(evening, /Wilson|Don't Starve|Dont Starve/i);
});

test("Play tears generated stickers off the painted beds", () => {
  assert.ok(existsSync("production/epics/r1-evening-places/story-020-strip-stickers.md"));
  const story = readFileSync("production/epics/r1-evening-places/story-020-strip-stickers.md", "utf8");
  assert.match(story, /\*\*Status\*\*:\s*In progress/);
  assert.doesNotMatch(story, /魂/);
  for (const name of [
    "bed-valley.png",
    "bed-wild.png",
    "bed-kitchen.png",
    "bed-mine.png",
    "prop-hole.png",
    "prop-silk.png",
    "prop-torch.png",
    "prop-camp-pot.png",
    "prop-smith.png",
    "prop-booth.png",
  ]) {
    assert.ok(existsSync(`godot/assets/art/${name}`));
  }
  const zone = readFileSync("godot/scripts/zone_map.gd", "utf8");
  assert.match(zone, /bed-wild\.png/);
  assert.match(zone, /bed-kitchen\.png/);
  assert.match(zone, /bed-mine\.png/);
  assert.match(zone, /Do not hang/);
  for (const needle of [
    "prop-hole.png",
    "prop-silk.png",
    "prop-camp-pot.png",
    "prop-hearth.png",
    "prop-chop.png",
    "prop-vein.png",
    "prop-fire.png",
    "prop-smith.png",
    "EarthMouth",
    "SilkNest",
    "CampPot",
  ]) {
    assert.doesNotMatch(zone, new RegExp(needle.replace(".", "\\.")));
  }
  const logic = readFileSync("godot/scripts/valley_logic.gd", "utf8");
  assert.match(logic, /_sit_plot/);
  assert.match(logic, /Do not hang/);
  const actor = readFileSync("godot/scripts/actor_view.gd", "utf8");
  assert.doesNotMatch(actor, /prop-torch\.png/);
  assert.match(actor, /LampStick/);
  const play = readFileSync("godot/scripts/play.gd", "utf8");
  assert.doesNotMatch(play, /prop-beast\.png/);
  assert.match(play, /日 %s · %s · %s · 金 %s/);
  assert.doesNotMatch(play, /魂/);
  const kitchen = readFileSync("godot/scripts/headless_play_kitchen.gd", "utf8");
  assert.match(kitchen, /HUNG_HEARTH/);
  const hole = readFileSync("godot/scripts/headless_play_hole.gd", "utf8");
  assert.match(hole, /HUNG_WELL/);
  const silk = readFileSync("godot/scripts/headless_play_silk.gd", "utf8");
  assert.match(silk, /HUNG_NEST/);
  const torch = readFileSync("godot/scripts/headless_play_torch.gd", "utf8");
  assert.match(torch, /HUNG_LAMP_STICK/);
  const srcFiles = ["src/sim/world.ts", "src/scenes/look.test.ts"];
  for (const p of srcFiles) {
    const src = readFileSync(p, "utf8");
    assert.doesNotMatch(src, /play_strip|HUNG_HEARTH|prop-hole|paint_strip/);
  }
});
