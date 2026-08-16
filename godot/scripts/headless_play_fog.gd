extends Node
## Play.tscn sits soft dusk haze on valley / wild beds. Indoor hearths stay clear.

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
	"#....K....L#",
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
	if not await _assert_clear():
		get_tree().quit(1)
		return
	if not await _assert_valley():
		get_tree().quit(1)
		return
	if not await _assert_kitchen():
		get_tree().quit(1)
		return
	if not await _assert_mine():
		get_tree().quit(1)
		return
	if not await _assert_wild():
		get_tree().quit(1)
		return
	print("PLAY_FOG_OK")
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


func _has_shader(n: Node, needle: String) -> bool:
	if n is Sprite2D:
		var spr := n as Sprite2D
		if spr.visible and spr.material is ShaderMaterial:
			var mat := spr.material as ShaderMaterial
			if mat.shader and str(mat.shader.resource_path).find(needle) >= 0:
				return true
	for child in n.get_children():
		if _has_shader(child, needle):
			return true
	return false


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
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _assert_clear() -> bool:
	if not FileAccess.file_exists("res://shaders/fog.gdshader"):
		printerr("MISSING_FOG_SHADER")
		return false
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_BED")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var bed := valley.get_node_or_null("Bed") as Sprite2D if valley else null
	var ink: Label = play.get("_hud_ink")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_CLEAR")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("CLEAR_BED")
		return false
	if _has_shader(valley, "fog.gdshader"):
		printerr("FOG_ON_CLEAR")
		return false
	if ink == null or str(ink.text).find("黄昏") < 0:
		printerr("CLEAR_PLAQUE ", ink.text if ink else "")
		return false
	if ink != null and str(ink.text).find("雾") >= 0:
		printerr("WEATHER_RING ", ink.text)
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_FOG_CLEAR")
	return true


func _assert_valley() -> bool:
	await _feed(_snap({
		"weather": {"id": "fog", "name": "雾"},
	}))
	var valley: Node2D = play.get("_valley")
	var bed := valley.get_node_or_null("Bed") as Sprite2D if valley else null
	var ink: Label = play.get("_hud_ink")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_FOG")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("FOG_REPLACED_BED")
		return false
	if not _has_shader(valley, "fog.gdshader"):
		printerr("VALLEY_CLEAR")
		return false
	if _has_shader(valley, "rain.gdshader"):
		printerr("RAIN_ON_FOG")
		return false
	if ink == null or str(ink.text).find("黄昏") < 0:
		printerr("FOG_PLAQUE ", ink.text if ink else "")
		return false
	if ink != null and str(ink.text).find("雾") >= 0:
		printerr("WEATHER_RING_VALLEY ", ink.text)
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_FOG_VALLEY")
	return true


func _assert_kitchen() -> bool:
	await _feed(_snap({
		"weather": {"id": "fog", "name": "雾"},
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_FOG")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_FOG")
		return false
	if _has_shader(zone_map, "fog.gdshader") or (valley != null and _has_shader(valley, "fog.gdshader")):
		printerr("KITCHEN_HAZE")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_FOG_HEARTH")
	return true


func _assert_mine() -> bool:
	await _feed(_snap({
		"weather": {"id": "fog", "name": "雾"},
		"floor": 1,
		"zone": "mine",
		"tiles": MINE_ROWS,
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_MINE_FOG")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("MINE_HIDDEN_FOG")
		return false
	if not _has_tex(zone_map, "bed-mine.png"):
		printerr("MINE_BED")
		return false
	if _has_shader(zone_map, "fog.gdshader") or (valley != null and _has_shader(valley, "fog.gdshader")):
		printerr("MINE_HAZE")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_FOG_MINE")
	return true


func _assert_wild() -> bool:
	await _feed(_snap({
		"weather": {"id": "fog", "name": "雾"},
		"zone": "wild",
		"tiles": WILD_ROWS,
		"revealed": [17, 18],
		"visible": [17, 18],
		"actors": [_actor({"x": 180.0, "y": 72.0})],
		"youAt": {"x": 180.0, "y": 72.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_WILD_FOG")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_FOG")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("WILD_BED")
		return false
	if not _has_shader(zone_map, "fog.gdshader"):
		printerr("WILD_CLEAR")
		return false
	if _has_shader(zone_map, "rain.gdshader"):
		printerr("RAIN_ON_WILD_FOG")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_FOG_WILD")
	return true
