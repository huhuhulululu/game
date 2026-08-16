extends Node
## Play.tscn sits two dusk wells on the wild bed. Hop stays in the snap.

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
	"#H...K....H#",
	"#..........#",
	"#~~~,,,,~~~#",
	"############",
]
const LEFT_KEY := 13
const RIGHT_KEY := 22


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
	if not await _assert_pair():
		get_tree().quit(1)
		return
	if not await _assert_hearth():
		get_tree().quit(1)
		return
	print("PLAY_HOLE_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 54.0,
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
		"night": false,
		"dusk": true,
		"lit": true,
		"rush": false,
		"floor": 0,
		"biome": "林",
		"zone": "wild",
		"tiles": WILD_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 54.0, "y": 72.0},
		"prompt": "钻洞",
		"bag": [],
		"ice": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": [],
		"plots": [],
		"enemies": [],
		"revealed": [LEFT_KEY, RIGHT_KEY],
		"visible": [LEFT_KEY, RIGHT_KEY],
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
	return _count_tex(n, needle) > 0


func _count_tex(n: Node, needle: String) -> int:
	var hit := 0
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex and str(tex.resource_path).find(needle) >= 0:
			hit += 1
	for child in n.get_children():
		hit += _count_tex(child, needle)
	return hit


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


func _assert_wild() -> bool:
	if not FileAccess.file_exists("res://assets/art/prop-hole.png"):
		printerr("MISSING_WELL")
		return false
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var prompt: Label = play.get("_prompt")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_HOLE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_HOLE")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	if _count_tex(zone_map, "prop-hole.png") != 2:
		printerr("WELL_COUNT ", _count_tex(zone_map, "prop-hole.png"))
		return false
	if prompt == null or str(prompt.text).find("钻洞") < 0:
		printerr("HOLE_PROMPT ", prompt.text if prompt else "")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_HOLE_WILD")
	return true


func _assert_pair() -> bool:
	await _feed(_snap({
		"toasts": ["暖 钻进了洞的另一头"],
		"actors": [
			_actor({}),
			{
				"id": "p2",
				"name": "松",
				"side": "right",
				"x": 360.0,
				"y": 72.0,
				"facing": 2,
				"held": "",
				"heldName": "",
				"fishing": "off",
				"busy": "",
				"ping": 0.0,
				"zone": "wild",
			},
		],
		"partner": {"name": "松", "online": true, "where": "身旁"},
		"partnerAt": {"x": 360.0, "y": 72.0, "zone": "wild"},
	}))
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var prompt: Label = play.get("_prompt")
	if zone_map == null or _count_tex(zone_map, "prop-hole.png") != 2:
		printerr("PAIR_WELLS ", _count_tex(zone_map, "prop-hole.png") if zone_map else -1)
		return false
	if world == null or not _has_tex(world, "char-warm") or not _has_tex(world, "char-pine"):
		printerr("PAIR_COATS")
		return false
	if prompt == null or str(prompt.text).find("钻洞") < 0:
		printerr("PAIR_PROMPT ", prompt.text if prompt else "")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_HOLE_PAIR")
	return true


func _assert_hearth() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"biome": "",
		"tiles": KITCHEN_ROWS,
		"prompt": "",
		"toasts": [],
		"actors": [_actor({"x": 108.0, "y": 108.0, "zone": "kitchen"})],
		"youAt": {"x": 108.0, "y": 108.0},
		"revealed": [],
		"visible": [],
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_HOLE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_HOLE")
		return false
	if not _has_tex(zone_map, "prop-hearth.png"):
		printerr("NO_HEARTH")
		return false
	if _has_tex(zone_map, "prop-hole.png"):
		printerr("WELL_IN_KITCHEN")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_HOLE_HEARTH")
	return true
