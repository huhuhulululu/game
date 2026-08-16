extends Node
## Play.tscn sits a night bite. Dark stays in the snap.

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
const STICKER := [
	"prop-beast",
	"prop-bite",
	"prop-shadow",
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
	"#....K....L#",
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
	if not await _assert_wild():
		get_tree().quit(1)
		return
	if not await _assert_edge():
		get_tree().quit(1)
		return
	if not await _assert_hearth():
		get_tree().quit(1)
		return
	print("PLAY_BITE_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 180.0,
		"y": 72.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "",
		"ping": 0.0,
		"zone": "wild",
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
		"night": true,
		"dusk": false,
		"lit": false,
		"rush": false,
		"floor": 0,
		"biome": "林",
		"zone": "wild",
		"tiles": WILD_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 180.0, "y": 72.0},
		"prompt": "太暗了",
		"bag": [],
		"ice": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": [],
		"plots": [],
		"enemies": [],
		"revealed": [17],
		"visible": [17],
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


func _has_label(n: Node, needle: String) -> bool:
	if n is Label and str((n as Label).text).find(needle) >= 0:
		return true
	if n is Button and str((n as Button).text).find(needle) >= 0:
		return true
	for child in n.get_children():
		if _has_label(child, needle):
			return true
	return false


func _bed_night(bed: Sprite2D) -> bool:
	if bed == null or bed.material == null:
		return false
	var mat := bed.material as ShaderMaterial
	if mat == null or mat.shader == null:
		return false
	if str(mat.shader.resource_path).find("night.gdshader") < 0:
		return false
	return float(mat.get_shader_parameter("amount")) >= 0.99


func _no_fail(n: Node) -> bool:
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex:
			var path := str(tex.resource_path)
			for bad in FAIL:
				if path.find(str(bad)) >= 0:
					printerr("FAIL_PROP ", path)
					return false
			for bad in STICKER:
				if path.find(str(bad)) >= 0:
					printerr("BITE_STICKER ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _assert_wild() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	await _feed(_snap({
		"toasts": ["暖 被黑暗咬了一口"],
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var wild := zone_map.get_node_or_null("WildBed") as Sprite2D if zone_map else null
	var prompt: Label = play.get("_prompt")
	var toasts: VBoxContainer = play.get("_toasts")
	var ink: Label = play.get("_hud_ink")
	var foes = play.get("_foes")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_BITE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_BITE")
		return false
	if wild == null or str(wild.texture.resource_path).find("bed-wild.png") < 0:
		printerr("WILD_BED")
		return false
	if not _bed_night(wild):
		printerr("WILD_NOT_NIGHT")
		return false
	if _has_shader(zone_map, "fog.gdshader"):
		printerr("FEAR_VEIL")
		return false
	if prompt == null or str(prompt.text).find("太暗") < 0:
		printerr("BITE_PROMPT ", prompt.text if prompt else "")
		return false
	if toasts == null or not _has_label(toasts, "被黑暗咬了一口"):
		printerr("BITE_TOAST")
		return false
	if ink == null or str(ink.text).find("夜里") < 0:
		printerr("BITE_PLAQUE ", ink.text if ink else "")
		return false
	if foes is Array and (foes as Array).size() > 0:
		printerr("BITE_FOES ", (foes as Array).size())
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_BITE_WILD")
	return true


func _assert_edge() -> bool:
	await _feed(_snap({
		"zone": "valley",
		"biome": "",
		"tiles": [],
		"lit": true,
		"prompt": "出谷 · 夜里没火会咬人",
		"toasts": [],
		"actors": [_actor({"x": 290.0, "y": 342.0, "zone": "valley"})],
		"youAt": {"x": 290.0, "y": 342.0},
		"revealed": [],
		"visible": [],
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var bed := valley.get_node_or_null("Bed") as Sprite2D if valley else null
	var prompt: Label = play.get("_prompt")
	var toasts: VBoxContainer = play.get("_toasts")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_EDGE")
		return false
	if zone_map != null and zone_map.visible:
		printerr("WILD_ON_VILLAGE_BITE")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("EDGE_REPLACED_BED")
		return false
	if not _bed_night(bed):
		printerr("VALLEY_NOT_NIGHT")
		return false
	if _has_shader(valley, "fog.gdshader"):
		printerr("VILLAGE_FEAR_VEIL")
		return false
	if prompt == null or str(prompt.text).find("没火") < 0:
		printerr("EDGE_PROMPT ", prompt.text if prompt else "")
		return false
	if toasts != null and _has_label(toasts, "被黑暗咬了一口"):
		printerr("BITE_IN_VILLAGE")
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_BITE_EDGE")
	return true


func _assert_hearth() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"biome": "",
		"tiles": KITCHEN_ROWS,
		"lit": true,
		"prompt": "",
		"toasts": [],
		"actors": [_actor({"x": 108.0, "y": 108.0, "zone": "kitchen"})],
		"youAt": {"x": 108.0, "y": 108.0},
		"revealed": [],
		"visible": [],
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var kitchen := zone_map.get_node_or_null("KitchenBed") as Sprite2D if zone_map else null
	var toasts: VBoxContainer = play.get("_toasts")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_BITE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_BITE")
		return false
	if not _has_tex(zone_map, "bed-kitchen.png"):
		printerr("NO_KITCHEN_BED")
		return false
	if _has_tex(zone_map, "prop-hearth.png"):
		printerr("HUNG_HEARTH")
		return false
	if kitchen != null and _bed_night(kitchen):
		printerr("KITCHEN_NIGHT_GRADE")
		return false
	if world == null or world.modulate != Color(1, 1, 1):
		printerr("KITCHEN_DIM ", world.modulate if world else "")
		return false
	if toasts != null and _has_label(toasts, "被黑暗咬了一口"):
		printerr("BITE_IN_KITCHEN")
		return false
	if not _no_fail(zone_map):
		return false
	await _feed(_snap({
		"zone": "mine",
		"biome": "",
		"tiles": MINE_ROWS,
		"lit": true,
		"floor": 1,
		"prompt": "",
		"toasts": [],
		"actors": [_actor({"x": 108.0, "y": 108.0, "zone": "mine"})],
		"youAt": {"x": 108.0, "y": 108.0},
		"revealed": [],
		"visible": [],
	}))
	valley = play.get("_valley")
	zone_map = play.get("_zone_map")
	world = play.get("_world")
	var mine := zone_map.get_node_or_null("MineBed") as Sprite2D if zone_map else null
	toasts = play.get("_toasts")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_MINE_BITE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("MINE_HIDDEN_BITE")
		return false
	if mine != null and _bed_night(mine):
		printerr("MINE_NIGHT_GRADE")
		return false
	if world == null or world.modulate != Color(1, 1, 1):
		printerr("MINE_DIM ", world.modulate if world else "")
		return false
	if toasts != null and _has_label(toasts, "被黑暗咬了一口"):
		printerr("BITE_IN_MINE")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_BITE_HEARTH")
	return true
