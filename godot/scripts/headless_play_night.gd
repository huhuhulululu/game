extends Node
## Play.tscn turns dusk into night on the painted bed. Lamps already in the paint.

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
const WILD_ROWS := [
	"############",
	"#T..F...J.L#",
	"#..........#",
	"#~~~,,,,~~~#",
	"############",
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
	if not await _assert_dusk():
		get_tree().quit(1)
		return
	if not await _assert_valley_night():
		get_tree().quit(1)
		return
	if not await _assert_kitchen_night():
		get_tree().quit(1)
		return
	if not await _assert_mine_night():
		get_tree().quit(1)
		return
	if not await _assert_wild_night():
		get_tree().quit(1)
		return
	print("PLAY_NIGHT_OK")
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
		"away": false,
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
		"bag": [],
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


func _no_fail(n: Node) -> bool:
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex:
			var path := str(tex.resource_path)
			for bad in FAIL:
				if path.find(str(bad)) >= 0:
					printerr("FAIL_PROP ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _bed_night(bed: Sprite2D) -> bool:
	if bed == null or bed.material == null:
		return false
	var mat := bed.material as ShaderMaterial
	if mat == null or mat.shader == null:
		return false
	if str(mat.shader.resource_path).find("night.gdshader") < 0:
		return false
	return float(mat.get_shader_parameter("amount")) >= 0.99


func _assert_dusk() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_BED")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var bed := valley.get_node_or_null("Bed") as Sprite2D if valley else null
	var ink: Label = play.get("_hud_ink")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_DUSK")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("DUSK_BED")
		return false
	if _bed_night(bed):
		printerr("DUSK_HAS_NIGHT")
		return false
	if ink == null or str(ink.text).find("黄昏") < 0:
		printerr("DUSK_PLAQUE ", ink.text if ink else "")
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_NIGHT_DUSK")
	return true


func _assert_valley_night() -> bool:
	await _feed(_snap({
		"night": true,
		"dusk": false,
	}))
	var valley: Node2D = play.get("_valley")
	var bed := valley.get_node_or_null("Bed") as Sprite2D if valley else null
	var ink: Label = play.get("_hud_ink")
	var world: Node2D = play.get("_world")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_NIGHT")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("NIGHT_REPLACED_BED")
		return false
	if not _bed_night(bed):
		printerr("VALLEY_NOT_NIGHT")
		return false
	if ink == null or str(ink.text).find("夜里") < 0:
		printerr("NIGHT_PLAQUE ", ink.text if ink else "")
		return false
	if world != null and world.modulate.r < 0.98:
		printerr("VALLEY_WORLD_DIM ", world.modulate)
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_NIGHT_VALLEY")
	return true


func _assert_kitchen_night() -> bool:
	await _feed(_snap({
		"night": true,
		"dusk": false,
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var kitchen := zone_map.get_node_or_null("KitchenBed") as Sprite2D if zone_map else null
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_NIGHT")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_NIGHT")
		return false
	if kitchen != null and _bed_night(kitchen):
		printerr("KITCHEN_NIGHT_GRADE")
		return false
	if world == null or world.modulate != Color(1, 1, 1):
		printerr("KITCHEN_DIM ", world.modulate if world else "")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_NIGHT_HEARTH")
	return true


func _assert_mine_night() -> bool:
	await _feed(_snap({
		"night": true,
		"dusk": false,
		"floor": 1,
		"zone": "mine",
		"tiles": MINE_ROWS,
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var mine := zone_map.get_node_or_null("MineBed") as Sprite2D if zone_map else null
	if valley != null and valley.visible:
		printerr("VALLEY_ON_MINE_NIGHT")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("MINE_HIDDEN_NIGHT")
		return false
	if mine == null or str(mine.texture.resource_path).find("bed-mine.png") < 0:
		printerr("MINE_BED")
		return false
	if _bed_night(mine):
		printerr("MINE_NIGHT_GRADE")
		return false
	if world == null or world.modulate != Color(1, 1, 1):
		printerr("MINE_DIM ", world.modulate if world else "")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_NIGHT_MINE")
	return true


func _assert_wild_night() -> bool:
	await _feed(_snap({
		"night": true,
		"dusk": false,
		"lit": false,
		"zone": "wild",
		"tiles": WILD_ROWS,
		"actors": [_actor({"x": 72.0, "y": 72.0})],
		"youAt": {"x": 72.0, "y": 72.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var wild := zone_map.get_node_or_null("WildBed") as Sprite2D if zone_map else null
	if valley != null and valley.visible:
		printerr("VALLEY_ON_WILD_NIGHT")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_NIGHT")
		return false
	if wild == null or str(wild.texture.resource_path).find("bed-wild.png") < 0:
		printerr("WILD_BED")
		return false
	if not _bed_night(wild):
		printerr("WILD_NOT_NIGHT")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_NIGHT_WILD")
	return true
