extends Node
## Play.tscn lifts a dusk wash as the wild path is written. Indoor places stay painted.

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
const SHARE_KEY := 21


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
	if not await _assert_dark():
		get_tree().quit(1)
		return
	if not await _assert_walk():
		get_tree().quit(1)
		return
	if not await _assert_share():
		get_tree().quit(1)
		return
	if not await _assert_known():
		get_tree().quit(1)
		return
	print("PLAY_PATH_OK")
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


func _unread(c: Color) -> bool:
	return c.a >= 0.45 and c.r >= 0.45 and c.r > c.b


func _memory(c: Color) -> bool:
	return c.a >= 0.10 and c.a <= 0.32 and c.r >= 0.50 and c.r > c.b


func _clear(c: Color) -> bool:
	return c.a < 0.05


func _assert_dark() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-wild.png"):
		printerr("MISSING_WILD_BED")
		return false
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_DARK")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_DARK")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	var wash: Color = zone_map.call("wash_at", 5, 1)
	if not _unread(wash):
		printerr("UNREAD_NOT_DUSK ", wash)
		return false
	if wash.r < 0.40 or wash.a > 0.80:
		printerr("BLACK_RING ", wash)
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_PATH_DARK")
	return true


func _assert_walk() -> bool:
	await _feed(_snap({
		"revealed": [WALK_KEY, WALK_KEY + 1],
		"visible": [WALK_KEY],
	}))
	var zone_map: Node2D = play.get("_zone_map")
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_WALK")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("LOST_WILD_BED")
		return false
	var here: Color = zone_map.call("wash_at", 5, 1)
	var next: Color = zone_map.call("wash_at", 6, 1)
	var far: Color = zone_map.call("wash_at", 2, 1)
	if not _clear(here):
		printerr("WALK_STILL_WASH ", here)
		return false
	if not _memory(next):
		printerr("WALK_NO_MEMORY ", next)
		return false
	if not _unread(far):
		printerr("FAR_LIFTED ", far)
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_PATH_WALK")
	return true


func _assert_share() -> bool:
	await _feed(_snap({
		"revealed": [WALK_KEY, WALK_KEY + 1, SHARE_KEY],
		"visible": [WALK_KEY],
		"actors": [
			_actor({}),
			{
				"id": "p2",
				"name": "松",
				"side": "right",
				"x": 324.0,
				"y": 72.0,
				"facing": 2,
				"held": "",
				"heldName": "",
				"fishing": "off",
				"busy": "",
				"ping": 0.0,
			},
		],
		"partner": {"name": "松", "online": true, "where": "身旁"},
		"partnerAt": {"x": 324.0, "y": 72.0, "zone": "wild"},
	}))
	var zone_map: Node2D = play.get("_zone_map")
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_SHARE")
		return false
	var fog_sig := str(zone_map.get("_fog_sig"))
	if fog_sig.find(str(SHARE_KEY)) < 0:
		printerr("SHARE_SIG ", fog_sig)
		return false
	var shared: Color = zone_map.call("wash_at", 9, 1)
	if _unread(shared):
		printerr("SHARE_STILL_UNREAD ", shared)
		return false
	if not _memory(shared) and not _clear(shared):
		printerr("SHARE_WASH ", shared)
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_PATH_SHARE")
	return true


func _assert_known() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"biome": "",
		"tiles": KITCHEN_ROWS,
		"revealed": [],
		"visible": [],
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_PATH")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_PATH")
		return false
	var wash: Color = zone_map.call("wash_at", 1, 1)
	if not _clear(wash):
		printerr("KITCHEN_WASH ", wash)
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_PATH_KNOWN")
	return true
