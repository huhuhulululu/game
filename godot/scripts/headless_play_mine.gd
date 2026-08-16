extends Node

## Play.tscn sits the mine bed and dusk veins. Not only a posed look shot.

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
const MINE_ROWS := [
	"################",
	"#L.............#",
	"#..o......e...#",
	"#..............#",
	"#...Y..Z.......#",
	"#..............#",
	"#...e......o..#",
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
	if not await _assert_mine():
		get_tree().quit(1)
		return
	print("PLAY_MINE_OK")
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
		"tiles": MINE_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 108.0, "y": 108.0},
		"prompt": "挖",
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


func _assert_mine() -> bool:
	await _feed(_snap({
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
		"prompt": "挖",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var place: Label = play.get("_hud_place")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_MINE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN_MINE")
		return false
	if str(play.get("_zone")) != "mine":
		printerr("ZONE_NOT_MINE ", play.get("_zone"))
		return false
	if not _has_tex(zone_map, "bed-mine.png"):
		printerr("NO_MINE_BED")
		return false
	if not _has_tex(zone_map, "prop-vein.png"):
		printerr("NO_VEIN")
		return false
	if not _has_tex(zone_map, "prop-steps.png"):
		printerr("NO_STEPS")
		return false
	if not _has_tex(zone_map, "prop-mouth.png"):
		printerr("NO_MOUTH")
		return false
	if not _has_tex(zone_map, "prop-cache.png"):
		printerr("NO_CACHE")
		return false
	if not _no_fail(zone_map):
		return false
	if place != null and place.text.find("矿") < 0:
		printerr("PLACE_MINE ", place.text)
		return false
	print("PLAY_MINE_BED")
	print("PLAY_MINE_ORE")
	return true
