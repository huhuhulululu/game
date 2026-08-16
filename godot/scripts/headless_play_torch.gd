extends Node
## Play.tscn sits a lantern-stick in the coat hand on the wild path.

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
const WALK_KEY := 17


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
	if not await _assert_hand():
		get_tree().quit(1)
		return
	if not await _assert_path():
		get_tree().quit(1)
		return
	if not await _assert_hearth():
		get_tree().quit(1)
		return
	print("PLAY_TORCH_OK")
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
		"torch": false,
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
		"night": false,
		"dusk": true,
		"lit": true,
		"rush": false,
		"floor": 0,
		"biome": "林",
		"zone": "wild",
		"tiles": WILD_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 180.0, "y": 72.0},
		"prompt": "搓火把",
		"bag": [],
		"ice": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": [],
		"plots": [],
		"enemies": [],
		"revealed": [WALK_KEY],
		"visible": [WALK_KEY],
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


func _has_visible_tex(n: Node, needle: String) -> bool:
	if n is Sprite2D:
		var s := n as Sprite2D
		var tex: Texture2D = s.texture
		if s.visible and tex and str(tex.resource_path).find(needle) >= 0:
			return true
	if not (n is CanvasItem) or (n as CanvasItem).visible:
		for child in n.get_children():
			if _has_visible_tex(child, needle):
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


func _bed_night(bed: Sprite2D) -> bool:
	if bed == null or bed.material == null:
		return false
	var mat := bed.material as ShaderMaterial
	if mat == null or mat.shader == null:
		return false
	if str(mat.shader.resource_path).find("night.gdshader") < 0:
		return false
	return float(mat.get_shader_parameter("amount")) >= 0.99


func _night_shade(bed: Sprite2D) -> Color:
	if bed == null or bed.material == null:
		return Color(0, 0, 0, 0)
	var mat := bed.material as ShaderMaterial
	if mat == null:
		return Color(0, 0, 0, 0)
	return mat.get_shader_parameter("night")


func _assert_hand() -> bool:
	if not FileAccess.file_exists("res://assets/art/prop-torch.png"):
		printerr("MISSING_LAMP_STICK")
		return false
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	await _feed(_snap({
		"actors": [_actor({
			"held": "torch",
			"heldName": "火把",
			"torch": true,
		})],
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var ink: Label = play.get("_hud_held")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_TORCH")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_TORCH")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	if _has_visible_tex(zone_map, "prop-torch.png"):
		printerr("STICK_ON_BED")
		return false
	if world == null or not _has_visible_tex(world, "prop-torch.png"):
		printerr("NO_LAMP_STICK")
		return false
	if ink == null or str(ink.text).find("火把") < 0:
		printerr("HELD_INK ", ink.text if ink else "")
		return false
	if not _no_fail(world) or not _no_fail(zone_map):
		return false
	print("PLAY_TORCH_HAND")
	return true


func _assert_path() -> bool:
	await _feed(_snap({
		"night": true,
		"dusk": false,
		"lit": true,
		"prompt": "",
		"actors": [_actor({
			"held": "torch",
			"heldName": "火把",
			"torch": true,
		})],
	}))
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var wild := zone_map.get_node_or_null("WildBed") as Sprite2D if zone_map else null
	var ink: Label = play.get("_hud_ink")
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_NIGHT_TORCH")
		return false
	if wild == null or str(wild.texture.resource_path).find("bed-wild.png") < 0:
		printerr("WILD_BED_NIGHT")
		return false
	if not _bed_night(wild):
		printerr("PATH_NOT_NIGHT")
		return false
	var shade := _night_shade(wild)
	if shade.r < 0.70 or shade.g < 0.60:
		printerr("PATH_WILD_SHADE ", shade)
		return false
	if world == null or not _has_visible_tex(world, "prop-torch.png"):
		printerr("LAMP_GONE_NIGHT")
		return false
	if ink == null or str(ink.text).find("夜里") < 0:
		printerr("NIGHT_PLAQUE ", ink.text if ink else "")
		return false
	if str(ink.text).find("日 ") < 0:
		printerr("PLAQUE_LOST ", ink.text if ink else "")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_TORCH_PATH")
	return true


func _assert_hearth() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"biome": "",
		"night": true,
		"dusk": false,
		"lit": true,
		"tiles": KITCHEN_ROWS,
		"prompt": "",
		"actors": [_actor({
			"x": 108.0,
			"y": 108.0,
			"held": "torch",
			"heldName": "火把",
			"torch": true,
			"zone": "kitchen",
		})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var kitchen := zone_map.get_node_or_null("KitchenBed") as Sprite2D if zone_map else null
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_TORCH")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_TORCH")
		return false
	if kitchen == null or str(kitchen.texture.resource_path).find("bed-kitchen.png") < 0:
		printerr("KITCHEN_BED")
		return false
	if _bed_night(kitchen):
		printerr("KITCHEN_NIGHT_GRADE")
		return false
	if not _has_tex(zone_map, "prop-hearth.png"):
		printerr("NO_HEARTH")
		return false
	if _has_visible_tex(zone_map, "prop-torch.png"):
		printerr("STICK_ON_HEARTH")
		return false
	if world != null and _has_visible_tex(world, "prop-torch.png"):
		printerr("STICK_IN_KITCHEN")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_TORCH_HEARTH")
	return true
