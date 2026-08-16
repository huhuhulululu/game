extends Node

## Play.tscn sits real coat alpha and one painted place language.

const YOU := "p1"
const FAIL := [
	"prop-cover-tree",
	"prop-cover-tree-b",
	"prop-cover-lamp",
	"prop-cover-shore",
	"prop-cover-verge",
	"prop-hut",
	"prop-lodge",
]
const TORN := [
	"prop-hole.png",
	"prop-silk.png",
	"prop-torch.png",
	"prop-camp-pot.png",
	"prop-smith.png",
	"prop-booth.png",
	"prop-hearth.png",
	"prop-chop.png",
	"prop-oven.png",
	"prop-serve.png",
	"prop-cool.png",
	"prop-bin.png",
	"prop-shelf.png",
	"prop-way.png",
	"prop-vein.png",
	"prop-steps.png",
	"prop-cache.png",
	"prop-mouth.png",
	"prop-fire.png",
	"prop-rock.png",
	"prop-dock.png",
	"prop-ore.png",
	"prop-gate.png",
	"prop-beast.png",
]
const OLD_INK := [
	"prop-pot.png",
	"prop-cut.png",
	"prop-stove.png",
	"prop-pass.png",
	"prop-icebox.png",
	"prop-pantry.png",
	"prop-trash.png",
	"prop-door-open.png",
]
const KITCHEN_ROWS := [
	"################",
	"#12345....Q...X#",
	"#..............#",
	"#C..........U..#",
	"#C..........U..#",
	"#..............#",
	"#L.............#",
	"#6.....R.....W.#",
	"################",
]
const MINE_ROWS := [
	"################",
	"#L.............#",
	"#..o.......e...#",
	"#..............#",
	"#...Y..Z.......#",
	"#..............#",
	"#...e.......o..#",
	"#..............#",
	"################",
]
const WILD_ROWS := [
	"############",
	"#T..F...J.L#",
	"#..........#",
	"#~~~,,,,~~~#",
	"############",
]


var play: Node2D
var started := false


func _ready() -> void:
	play = preload("res://scenes/play.tscn").instantiate() as Node2D
	add_child(play)


func _process(_dt: float) -> void:
	if started:
		return
	if play == null or play.get("_valley") == null or play.get("_zone_map") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not await _assert_coat():
		get_tree().quit(1)
		return
	if not await _assert_bed():
		get_tree().quit(1)
		return
	print("PLAY_PAINT_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 290.0,
		"y": 342.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "",
		"ping": 0.0,
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _snap(extra: Dictionary) -> Dictionary:
	var row := {
		"you": YOU,
		"room": "TEST",
		"day": 0,
		"gold": 20,
		"season": "春",
		"night": false,
		"dusk": true,
		"lit": true,
		"rush": false,
		"floor": 0,
		"biome": "",
		"zone": "valley",
		"tiles": [],
		"actors": [_actor({})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "",
		"bag": [{"id": "wood", "n": 1, "name": "青木"}],
		"ice": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": [],
		"plots": [],
		"enemies": [],
		"revealed": [],
		"visible": [],
		"fires": [],
		"board": [],
		"fortune": {},
		"partner": {},
		"partnerAt": {},
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _feed(s: Dictionary) -> void:
	play.call("_on_snap", s)
	await get_tree().process_frame
	await get_tree().process_frame


func _has_tex(n: Node, needle: String) -> bool:
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex and str(tex.resource_path).find(needle) >= 0:
			return true
	for child in n.get_children():
		if _has_tex(child, needle):
			return true
	return false


func _no_fail(n: Node) -> bool:
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex:
			var path := str(tex.resource_path)
			for bad in FAIL:
				if path.find(str(bad)) >= 0:
					printerr("FAIL_PROP ", path)
					return false
			for torn in TORN:
				if path.find(str(torn)) >= 0:
					printerr("HUNG_TORN ", path)
					return false
			for old in OLD_INK:
				if path.find(str(old)) >= 0:
					printerr("OLD_INK ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _png(name: String) -> Image:
	var path := "res://assets/art/" + name
	var tex := load(path) as Texture2D
	if tex != null:
		var from_tex := tex.get_image()
		if from_tex != null:
			return from_tex
	return Image.load_from_file(path)


func _real_alpha(name: String) -> bool:
	var img := _png(name)
	if img == null:
		printerr("NO_COAT_FILE ", name)
		return false
	if img.get_pixel(2, 2).a > 0.03 or img.get_pixel(img.get_width() - 3, 2).a > 0.03:
		printerr("COAT_PLATE ", name)
		return false
	if img.get_pixel(2, img.get_height() - 3).a > 0.03:
		printerr("COAT_PLATE_FOOT ", name)
		return false
	return true


func _no_slab(name: String) -> bool:
	var img := _png(name)
	if img == null:
		printerr("NO_WALK_FILE ", name)
		return false
	var h := img.get_height()
	var w := img.get_width()
	var col := w - 8
	var n := 0
	var y := 0
	while y < h:
		if img.get_pixel(col, y).a > 0.08:
			n += 1
		y += 1
	if n > int(0.88 * float(h)):
		printerr("WALK_SLAB ", name, " ", n)
		return false
	return true


func _assert_coat() -> bool:
	await _feed(_snap({}))
	if not _real_alpha("char-warm.png"):
		return false
	if not _real_alpha("char-pine.png"):
		return false
	if not _real_alpha("char-warm-walk.png"):
		return false
	if not _real_alpha("char-warm-walk2.png"):
		return false
	if not _real_alpha("char-pine-walk.png"):
		return false
	if not _real_alpha("char-warm-sit.png"):
		return false
	if not _no_slab("char-warm-walk.png"):
		return false
	if not _no_slab("char-warm-walk2.png"):
		return false
	var valley: Node2D = play.get("_valley")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if not _has_tex(valley, "bed-valley.png"):
		printerr("NO_VALLEY_BED")
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _no_fail(play):
		return false
	if not _has_tex(play, "char-warm"):
		printerr("NO_WARM_COAT")
		return false
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(YOU):
		printerr("NO_ACTOR")
		return false
	var body: Node2D = actors[YOU] as Node2D
	var sprite: Sprite2D = body.get("_sprite") as Sprite2D
	if sprite == null or sprite.texture == null:
		printerr("NO_SPRITE")
		return false
	var coat_h := float(sprite.texture.get_height()) * sprite.scale.y
	if abs(coat_h - Look.BODY) > 1.0 or Look.BODY < 180.0:
		printerr("COAT_STAMP ", coat_h, " BODY ", Look.BODY)
		return false
	var plaque: Panel = play.get("_plaque")
	if plaque == null or plaque.size.x > 280.0 or plaque.size.y > 80.0:
		printerr("PLAQUE_LOST")
		return false
	print("PLAY_PAINT_COAT")
	return true


func _assert_bed() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var zone_map: Node2D = play.get("_zone_map")
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN_KITCHEN")
		return false
	if not _has_tex(zone_map, "bed-kitchen.png"):
		printerr("NO_KITCHEN_BED")
		return false
	if _has_tex(zone_map, "prop-hearth.png") or _has_tex(zone_map, "prop-chop.png"):
		printerr("HUNG_KITCHEN_PROP")
		return false
	if not _no_fail(zone_map):
		return false
	await _feed(_snap({
		"zone": "mine",
		"floor": 1,
		"tiles": MINE_ROWS,
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	if not _has_tex(play.get("_zone_map"), "bed-mine.png"):
		printerr("NO_MINE_BED")
		return false
	if _has_tex(play.get("_zone_map"), "prop-vein.png") or _has_tex(play.get("_zone_map"), "prop-smith.png"):
		printerr("HUNG_MINE_PROP")
		return false
	if not _no_fail(play.get("_zone_map")):
		return false
	await _feed(_snap({
		"zone": "wild",
		"tiles": WILD_ROWS,
		"actors": [_actor({"x": 72.0, "y": 72.0})],
		"youAt": {"x": 72.0, "y": 72.0},
	}))
	if not _has_tex(play.get("_zone_map"), "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	if _has_tex(play.get("_zone_map"), "prop-hole.png") or _has_tex(play.get("_zone_map"), "prop-torch.png"):
		printerr("HUNG_WILD_PROP")
		return false
	if _has_tex(play.get("_zone_map"), "prop-beast.png") or _has_tex(play.get("_zone_map"), "prop-booth.png"):
		printerr("HUNG_WILD_PROP")
		return false
	if not _no_fail(play.get("_zone_map")):
		return false
	if Look.BODY < 180.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	print("PLAY_PAINT_BED")
	return true
