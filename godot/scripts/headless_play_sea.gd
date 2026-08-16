extends Node
## Play.tscn turns the plaque through four seasons. One painted bed stays.

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
	if not await _assert_turn():
		get_tree().quit(1)
		return
	if not await _assert_summer():
		get_tree().quit(1)
		return
	if not await _assert_winter():
		get_tree().quit(1)
		return
	if not await _assert_hearth():
		get_tree().quit(1)
		return
	print("PLAY_SEA_OK")
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
		"zone": "valley",
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


func _bed() -> Sprite2D:
	var valley: Node2D = play.get("_valley")
	if valley == null:
		return null
	return valley.get_node_or_null("Bed") as Sprite2D


func _assert_turn() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	var plots: Array = []
	for i in 12:
		if i == 2:
			plots.append({"seed": "greens_seed", "stage": 3})
		else:
			plots.append({"seed": "", "stage": 0})
	var rows := [
		{"day": 0, "season": "春", "word": "春"},
		{"day": 3, "season": "夏", "word": "夏"},
		{"day": 6, "season": "秋", "word": "秋"},
		{"day": 9, "season": "冬", "word": "冬"},
	]
	for row in rows:
		await _feed(_snap({
			"day": int(row["day"]),
			"season": str(row["season"]),
			"plots": plots if str(row["season"]) == "春" else [],
		}))
		var valley: Node2D = play.get("_valley")
		var bed := _bed()
		var ink: Label = play.get("_hud_ink")
		if valley == null or not valley.visible:
			printerr("VALLEY_HIDDEN_SEA")
			return false
		if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
			printerr("SEA_REPLACED_BED")
			return false
		if ink == null or str(ink.text).find(str(row["word"])) < 0:
			printerr("SEA_PLAQUE ", ink.text if ink else "", row["word"])
			return false
		if ink.text.find("日") < 0 or ink.text.find("金") < 0:
			printerr("SEA_PLAQUE_RING ", ink.text)
			return false
		if not _no_fail(valley):
			return false
	print("PLAY_SEA_TURN")
	return true


func _assert_summer() -> bool:
	await _feed(_snap({
		"day": 3,
		"season": "夏",
		"dusk": true,
		"night": false,
	}))
	var bed := _bed()
	var ink: Label = play.get("_hud_ink")
	var world: Node2D = play.get("_world")
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("SUMMER_BED")
		return false
	if bed.material != null:
		printerr("SUMMER_NIGHT_MAT")
		return false
	if bed.modulate.b > 0.90 or bed.modulate.r < 0.98:
		printerr("SUMMER_NOT_WARM ", bed.modulate)
		return false
	if ink == null or str(ink.text).find("夏") < 0:
		printerr("SUMMER_PLAQUE ", ink.text if ink else "")
		return false
	if world != null and world.modulate.r < 0.98:
		printerr("SUMMER_WORLD_DIM ", world.modulate)
		return false
	print("PLAY_SEA_SUMMER")
	return true


func _assert_winter() -> bool:
	await _feed(_snap({
		"day": 9,
		"season": "冬",
		"dusk": false,
		"night": true,
	}))
	var bed := _bed()
	var ink: Label = play.get("_hud_ink")
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("WINTER_BED")
		return false
	if bed.material == null:
		printerr("WINTER_NO_NIGHT")
		return false
	var mat := bed.material as ShaderMaterial
	if mat == null or mat.shader == null or str(mat.shader.resource_path).find("night.gdshader") < 0:
		printerr("WINTER_NOT_NIGHT")
		return false
	var night: Color = mat.get_shader_parameter("night")
	if night.r > 0.76 or night.b > night.r:
		printerr("WINTER_NIGHT_SHADE ", night)
		return false
	if ink == null or str(ink.text).find("冬") < 0 or str(ink.text).find("夜里") < 0:
		printerr("WINTER_PLAQUE ", ink.text if ink else "")
		return false
	print("PLAY_SEA_WINTER")
	return true


func _assert_hearth() -> bool:
	await _feed(_snap({
		"day": 9,
		"season": "冬",
		"night": true,
		"dusk": false,
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_actor({"x": 108.0, "y": 108.0, "zone": "kitchen"})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var kitchen := zone_map.get_node_or_null("KitchenBed") as Sprite2D if zone_map else null
	var ink: Label = play.get("_hud_ink")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_SEA")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_SEA")
		return false
	if not _has_tex(zone_map, "prop-hearth.png"):
		printerr("NO_HEARTH")
		return false
	if kitchen != null and kitchen.modulate.r < 0.98:
		printerr("KITCHEN_SEA_TINT ", kitchen.modulate)
		return false
	if world == null or world.modulate != Color(1, 1, 1):
		printerr("KITCHEN_DIM ", world.modulate if world else "")
		return false
	if ink == null or str(ink.text).find("冬") < 0:
		printerr("KITCHEN_PLAQUE ", ink.text if ink else "")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_SEA_HEARTH")
	return true
