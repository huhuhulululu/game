extends Node
## Play.tscn sits mine floor 1 then floor 2. One mine painting stays.

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
const OLD_INK := [
	"prop-ore.png",
	"prop-stairs.png",
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
const FLOOR1_ROWS := [
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
const FLOOR2_ROWS := [
	"################",
	"#L.............#",
	"#..o....e..e...#",
	"#..............#",
	"#...Y..Z.......#",
	"#..............#",
	"#...o.......o..#",
	"#..............#",
	"################",
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
	if not await _assert_one():
		get_tree().quit(1)
		return
	if not await _assert_two():
		get_tree().quit(1)
		return
	if not await _assert_hearth():
		get_tree().quit(1)
		return
	print("PLAY_FLOOR_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 108.0,
		"y": 108.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "",
		"ping": 0.0,
		"zone": "mine",
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
		"floor": 1,
		"biome": "",
		"zone": "mine",
		"tiles": FLOOR1_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 108.0, "y": 108.0},
		"prompt": "挖",
		"bag": [],
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
		"weather": {"id": "clear", "name": "晴"},
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


func _has_label(n: Node, needle: String) -> bool:
	if n is Label and str((n as Label).text).find(needle) >= 0:
		return true
	for child in n.get_children():
		if _has_label(child, needle):
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
			for old in OLD_INK:
				if path.find(str(old)) >= 0:
					printerr("OLD_INK ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _mine_bed() -> Sprite2D:
	var zone_map: Node2D = play.get("_zone_map")
	if zone_map == null:
		return null
	return zone_map.get_node_or_null("MineBed") as Sprite2D


func _assert_one() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-mine.png"):
		printerr("MISSING_MINE_BED")
		return false
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var bed := _mine_bed()
	var place: Label = play.get("_hud_place")
	var ink: Label = play.get("_hud_ink")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_FLOOR1")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("MINE_HIDDEN_FLOOR1")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-mine.png") < 0:
		printerr("FLOOR1_BED")
		return false
	if bed.modulate.r < 0.98:
		printerr("FLOOR1_TINT ", bed.modulate)
		return false
	if place == null or str(place.text).find("矿 1层") < 0:
		printerr("FLOOR1_PLACE ", place.text if place else "")
		return false
	if ink == null or ink.text.find("日") < 0 or ink.text.find("金") < 0:
		printerr("FLOOR1_PLAQUE ", ink.text if ink else "")
		return false
	if not _has_tex(zone_map, "prop-vein.png"):
		printerr("NO_VEIN")
		return false
	if not _has_tex(zone_map, "prop-steps.png"):
		printerr("NO_STEPS")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_FLOOR_ONE")
	return true


func _assert_two() -> bool:
	await _feed(_snap({
		"floor": 2,
		"tiles": FLOOR2_ROWS,
		"toasts": ["这一层矿脉很响", "出口在西。"],
		"prompt": "挖",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var bed := _mine_bed()
	var place: Label = play.get("_hud_place")
	var toasts: VBoxContainer = play.get("_toasts")
	var world: Node2D = play.get("_world")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_FLOOR2")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("MINE_HIDDEN_FLOOR2")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-mine.png") < 0:
		printerr("FLOOR2_REPLACED_BED")
		return false
	if bed.modulate.r > 0.96 or bed.modulate.r < 0.84 or bed.modulate.b > bed.modulate.r:
		printerr("FLOOR2_SHADE ", bed.modulate)
		return false
	if place == null or str(place.text).find("矿 2层") < 0:
		printerr("FLOOR2_PLACE ", place.text if place else "")
		return false
	if toasts == null or not _has_label(toasts, "矿脉很响"):
		printerr("FLOOR2_TOAST")
		return false
	if world == null or world.modulate != Color(1, 1, 1):
		printerr("MINE_WORLD_DIM ", world.modulate if world else "")
		return false
	if not _has_tex(zone_map, "bed-mine.png"):
		printerr("NO_MINE_BED_TWO")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_FLOOR_TWO")
	return true


func _assert_hearth() -> bool:
	await _feed(_snap({
		"floor": 0,
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"toasts": [],
		"prompt": "",
		"actors": [_actor({"x": 108.0, "y": 108.0, "zone": "kitchen"})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var kitchen := zone_map.get_node_or_null("KitchenBed") as Sprite2D if zone_map else null
	var place: Label = play.get("_hud_place")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_FLOOR")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_FLOOR")
		return false
	if not _has_tex(zone_map, "prop-hearth.png"):
		printerr("NO_HEARTH")
		return false
	if kitchen != null and kitchen.modulate.r < 0.98:
		printerr("KITCHEN_MINE_TINT ", kitchen.modulate)
		return false
	if world == null or world.modulate != Color(1, 1, 1):
		printerr("KITCHEN_DIM ", world.modulate if world else "")
		return false
	if place == null or str(place.text).find("厨房") < 0:
		printerr("KITCHEN_PLACE ", place.text if place else "")
		return false
	if not _no_fail(zone_map):
		return false
	await _feed(_snap({
		"floor": 0,
		"zone": "valley",
		"tiles": [],
		"toasts": [],
		"prompt": "",
		"actors": [_actor({"x": 290.0, "y": 342.0, "zone": "valley"})],
		"youAt": {"x": 290.0, "y": 342.0},
	}))
	valley = play.get("_valley")
	zone_map = play.get("_zone_map")
	var bed := valley.get_node_or_null("Bed") as Sprite2D if valley else null
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_FLOOR")
		return false
	if zone_map != null and zone_map.visible:
		printerr("MINE_ON_VALLEY_FLOOR")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("VALLEY_REPLACED_BED")
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_FLOOR_HEARTH")
	return true
