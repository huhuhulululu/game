extends Node
## Play.tscn sits a wild stumble. Forage stays in the snap.

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
	"prop-forage",
	"prop-flint",
	"prop-seed",
	"prop-tuft",
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
	if not await _assert_wild():
		get_tree().quit(1)
		return
	if not await _assert_trip():
		get_tree().quit(1)
		return
	if not await _assert_place():
		get_tree().quit(1)
		return
	print("PLAY_SCOUT_OK")
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


func _has_label(n: Node, needle: String) -> bool:
	if n is Label and str((n as Label).text).find(needle) >= 0:
		return true
	if n is Button and str((n as Button).text).find(needle) >= 0:
		return true
	for child in n.get_children():
		if _has_label(child, needle):
			return true
	return false


func _unread(c: Color) -> bool:
	return c.a >= 0.45 and c.r >= 0.45 and c.r > c.b


func _clear(c: Color) -> bool:
	return c.a < 0.05


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
					printerr("FORAGE_STICKER ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _assert_wild() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_SCOUT")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_SCOUT")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	var wash: Color = zone_map.call("wash_at", 5, 1)
	if not _unread(wash):
		printerr("UNREAD_NOT_DUSK ", wash)
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_SCOUT_WILD")
	return true


func _assert_trip() -> bool:
	await _feed(_snap({
		"revealed": [WALK_KEY, WALK_KEY + 1],
		"visible": [WALK_KEY],
		"toasts": ["暖 脚下绊到 · 山草"],
		"bag": [{"id": "herb", "n": 1, "name": "山草"}],
	}))
	var zone_map: Node2D = play.get("_zone_map")
	var toasts: VBoxContainer = play.get("_toasts")
	var bag: HBoxContainer = play.get("_bag")
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_TRIP")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("LOST_WILD_BED")
		return false
	var here: Color = zone_map.call("wash_at", 5, 1)
	if not _clear(here):
		printerr("WALK_STILL_WASH ", here)
		return false
	if toasts == null or not _has_label(toasts, "脚下绊到"):
		printerr("TRIP_TOAST")
		return false
	if bag == null or not _has_label(bag, "山草"):
		printerr("TRIP_BAG")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_SCOUT_TRIP")
	return true


func _assert_place() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"biome": "",
		"tiles": KITCHEN_ROWS,
		"prompt": "",
		"toasts": [],
		"bag": [],
		"actors": [_actor({"x": 108.0, "y": 108.0, "zone": "kitchen"})],
		"youAt": {"x": 108.0, "y": 108.0},
		"revealed": [],
		"visible": [],
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var toasts: VBoxContainer = play.get("_toasts")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_SCOUT")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_SCOUT")
		return false
	if not _has_tex(zone_map, "prop-hearth.png"):
		printerr("NO_HEARTH")
		return false
	if toasts != null and _has_label(toasts, "脚下绊到"):
		printerr("TRIP_IN_KITCHEN")
		return false
	if not _no_fail(zone_map):
		return false
	await _feed(_snap({
		"zone": "mine",
		"biome": "",
		"tiles": MINE_ROWS,
		"prompt": "",
		"toasts": [],
		"bag": [],
		"floor": 1,
		"actors": [_actor({"x": 108.0, "y": 108.0, "zone": "mine"})],
		"youAt": {"x": 108.0, "y": 108.0},
		"revealed": [],
		"visible": [],
	}))
	valley = play.get("_valley")
	zone_map = play.get("_zone_map")
	toasts = play.get("_toasts")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_MINE_SCOUT")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("MINE_HIDDEN_SCOUT")
		return false
	if toasts != null and _has_label(toasts, "脚下绊到"):
		printerr("TRIP_IN_MINE")
		return false
	if not _no_fail(zone_map):
		return false
	await _feed(_snap({
		"zone": "valley",
		"biome": "",
		"tiles": [],
		"prompt": "",
		"toasts": [],
		"bag": [],
		"actors": [_actor({"x": 290.0, "y": 342.0, "zone": "valley"})],
		"youAt": {"x": 290.0, "y": 342.0},
		"revealed": [],
		"visible": [],
	}))
	valley = play.get("_valley")
	zone_map = play.get("_zone_map")
	toasts = play.get("_toasts")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_SCOUT")
		return false
	if zone_map != null and zone_map.visible:
		printerr("WILD_ON_VILLAGE_SCOUT")
		return false
	if toasts != null and _has_label(toasts, "脚下绊到"):
		printerr("TRIP_IN_VILLAGE")
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_SCOUT_HEARTH")
	return true
