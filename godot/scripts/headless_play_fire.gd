extends Node
## Play.tscn sits a camp pot on a lit wild fire. Haul goes in the pot.

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
	"prop-pot.png",
]
const WILD_ROWS := [
	"############",
	"#....K....L#",
	"#..........#",
	"#~~~,,,,~~~#",
	"############",
]
const FIRE_KEY := 17


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
	if not await _assert_fire():
		get_tree().quit(1)
		return
	if not await _assert_pot():
		get_tree().quit(1)
		return
	if not await _assert_cook():
		get_tree().quit(1)
		return
	print("PLAY_FIRE_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 180.0,
		"y": 72.0,
		"facing": 2,
		"held": "fish:raw:80",
		"heldName": "鱼",
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
		"biome": "林",
		"zone": "wild",
		"tiles": WILD_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 180.0, "y": 72.0},
		"prompt": "添火",
		"bag": [],
		"ice": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": [],
		"plots": [],
		"enemies": [],
		"revealed": [17, 18],
		"visible": [17, 18],
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
			for old in OLD_INK:
				if path.find(str(old)) >= 0:
					printerr("OLD_INK ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _assert_fire() -> bool:
	if not FileAccess.file_exists("res://assets/art/prop-camp-pot.png"):
		printerr("MISSING_CAMP_POT")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_FIRE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_FIRE")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	if _has_tex(zone_map, "prop-fire.png"):
		printerr("HUNG_FIRE")
		return false
	if _has_tex(zone_map, "prop-camp-pot.png"):
		printerr("HUNG_CAMP_POT")
		return false
	if _has_tex(zone_map, "prop-pot.png"):
		printerr("HUNG_OLD_POT")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_FIRE_BED")
	return true


func _assert_pot() -> bool:
	await _feed(_snap({
		"fires": [FIRE_KEY],
		"prompt": "烤",
	}))
	var zone_map: Node2D = play.get("_zone_map")
	if zone_map == null or _has_tex(zone_map, "prop-camp-pot.png"):
		printerr("HUNG_CAMP_POT")
		return false
	if _has_tex(zone_map, "prop-pot.png"):
		printerr("HUNG_OLD_POT_LIT")
		return false
	if _has_tex(zone_map, "prop-fire.png"):
		printerr("HUNG_FIRE")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_FIRE_POT")
	return true


func _assert_cook() -> bool:
	await _feed(_snap({
		"fires": [FIRE_KEY],
		"prompt": "烤",
		"toasts": ["暖 烤好了鱼"],
		"actors": [_actor({
			"held": "fish:cooked:80",
			"heldName": "烤鱼",
		})],
	}))
	var ink: Label = play.get("_hud_held")
	var prompt: Label = play.get("_prompt")
	var zone_map: Node2D = play.get("_zone_map")
	if prompt == null or str(prompt.text).find("烤") < 0:
		printerr("COOK_PROMPT ", prompt.text if prompt else "")
		return false
	if ink == null or str(ink.text).find("烤鱼") < 0:
		printerr("COOK_HELD ", ink.text if ink else "")
		return false
	if zone_map == null or _has_tex(zone_map, "prop-camp-pot.png"):
		printerr("HUNG_CAMP_POT_COOK")
		return false
	if _has_tex(zone_map, "prop-pot.png"):
		printerr("HUNG_OLD_POT_COOK")
		return false
	print("PLAY_FIRE_COOK")
	return true
