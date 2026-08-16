extends Node
## Play.tscn hears kitchen hearth / chop and a mine vein. Same painted world.

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
	if play == null or play.get("_valley") == null or play.get("_ear") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not await _assert_hearth():
		get_tree().quit(1)
		return
	if not await _assert_chop():
		get_tree().quit(1)
		return
	if not await _assert_vein():
		get_tree().quit(1)
		return
	print("PLAY_PLACE_OK")
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
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 108.0, "y": 108.0},
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


func _ear() -> Node:
	return play.get("_ear")


func _heard() -> PackedStringArray:
	var ear := _ear()
	if ear == null:
		return PackedStringArray()
	return ear.get("last_heard")


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


func _assert_hearth() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-kitchen.png"):
		printerr("MISSING_KITCHEN_BED")
		return false
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	await _feed(_snap({
		"actors": [_actor({"x": 378.0, "y": 54.0})],
		"youAt": {"x": 378.0, "y": 54.0},
		"prompt": "入锅",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var ear := _ear()
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN")
		return false
	if not _no_fail(zone_map):
		return false
	if ear == null or str(ear.get("ambient")) != "hearth" or not bool(ear.get("bed_on")):
		printerr("HEARTH_OFF ", ear.get("ambient") if ear else "", " ", ear.get("bed_on") if ear else "")
		return false
	if not _heard().has("fire"):
		printerr("NO_HEARTH_CRACKLE ", _heard())
		return false
	ear.set_muted(true)
	if bool(ear.get("bed_on")):
		printerr("MUTE_HEARTH")
		return false
	ear.set_muted(false)
	if not bool(ear.get("bed_on")):
		printerr("UNMUTE_HEARTH")
		return false
	print("PLAY_PLACE_HEARTH")
	return true


func _assert_chop() -> bool:
	await _feed(_snap({
		"actors": [_actor({"x": 54.0, "y": 126.0})],
		"youAt": {"x": 54.0, "y": 126.0},
		"prompt": "切",
	}))
	await _feed(_snap({
		"actors": [_actor({"x": 54.0, "y": 126.0, "busy": "chop"})],
		"youAt": {"x": 54.0, "y": 126.0},
		"prompt": "切着",
	}))
	if not _heard().has("chop"):
		printerr("NO_CHOP_TONE ", _heard())
		return false
	print("PLAY_PLACE_CHOP")
	return true


func _assert_vein() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-mine.png"):
		printerr("MISSING_MINE_BED")
		return false
	await _feed(_snap({
		"zone": "mine",
		"tiles": MINE_ROWS,
		"floor": 1,
		"actors": [_actor({"x": 126.0, "y": 90.0})],
		"youAt": {"x": 126.0, "y": 90.0},
		"prompt": "挖",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_MINE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN_MINE")
		return false
	if not _no_fail(zone_map):
		return false
	if not _heard().has("vein"):
		printerr("NO_VEIN_TONE ", _heard())
		return false
	print("PLAY_PLACE_VEIN")
	return true
