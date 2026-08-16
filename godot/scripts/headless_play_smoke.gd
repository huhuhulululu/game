extends Node
## Smoke: title → 开一间 → valley bed → 做/喊 → kitchen → mine → sit.

const YOU := "p1"
const MATE := "p2"
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


var app: Node
var play: Node2D
var started := false


func _ready() -> void:
	app = (load("res://scripts/app.gd") as GDScript).new()
	add_child(app)


func _process(_dt: float) -> void:
	if started:
		return
	if app == null or app.get("_scene") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not await _assert_title():
		get_tree().quit(1)
		return
	if not await _assert_room():
		get_tree().quit(1)
		return
	if not await _assert_valley():
		get_tree().quit(1)
		return
	if not await _assert_do_shout():
		get_tree().quit(1)
		return
	if not await _assert_kitchen():
		get_tree().quit(1)
		return
	if not await _assert_mine():
		get_tree().quit(1)
		return
	if not await _assert_sit():
		get_tree().quit(1)
		return
	print("SMOKE_EVENING_OK")
	get_tree().quit(0)


func _you(extra: Dictionary) -> Dictionary:
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
		"away": false,
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _mate(extra: Dictionary) -> Dictionary:
	var row := {
		"id": MATE,
		"name": "松",
		"side": "right",
		"x": 348.0,
		"y": 342.0,
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
		"zone": "valley",
		"tiles": [],
		"actors": [_you({}), _mate({})],
		"youAt": {"x": 290.0, "y": 342.0},
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
		"partner": {"name": "松", "zone": "valley", "online": true, "where": "身旁"},
		"partnerAt": {"x": 348.0, "y": 342.0, "zone": "valley"},
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _feed(s: Dictionary) -> void:
	play.call("_on_snap", s)
	await get_tree().process_frame
	await get_tree().process_frame


func _ear() -> Node:
	return play.get("_ear") if play else null


func _heard() -> PackedStringArray:
	var ear := _ear()
	if ear == null:
		return PackedStringArray()
	return ear.get("last_heard")


func _has_tex(n: Node, needle: String) -> bool:
	if n is TextureRect:
		var t: Texture2D = (n as TextureRect).texture
		if t and str(t.resource_path).find(needle) >= 0:
			return true
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex and str(tex.resource_path).find(needle) >= 0:
			return true
	for child in n.get_children():
		if _has_tex(child, needle):
			return true
	return false


func _no_fail(n: Node) -> bool:
	if n is Sprite2D or n is TextureRect:
		var tex: Texture2D = n.get("texture")
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


func _find_btn(n: Node, label: String) -> BaseButton:
	if n is BaseButton and (n as BaseButton).text == label:
		return n
	for child in n.get_children():
		var hit := _find_btn(child, label)
		if hit:
			return hit
	return null


func _assert_title() -> bool:
	var boot: Node = app.get("_scene")
	if boot == null:
		printerr("NO_BOOT")
		return false
	if not _has_tex(boot, "cover-valley.png"):
		printerr("NO_COVER")
		return false
	if not _no_fail(boot):
		return false
	print("SMOKE_TITLE")
	return true


func _assert_room() -> bool:
	app.call("show_room")
	await get_tree().process_frame
	await get_tree().process_frame
	var room: Node = app.get("_scene")
	if room == null:
		printerr("NO_ROOM")
		return false
	if not _has_tex(room, "cover-valley.png"):
		printerr("ROOM_NO_COVER")
		return false
	if _find_btn(room, "开一间") == null:
		printerr("NO_OPEN")
		return false
	if not _no_fail(room):
		return false
	print("SMOKE_ROOM")
	return true


func _assert_valley() -> bool:
	play = preload("res://scenes/play.tscn").instantiate() as Node2D
	add_child(play)
	await get_tree().process_frame
	await get_tree().process_frame
	if play.get("_valley") == null or play.get("_ear") == null:
		printerr("PLAY_NOT_READY")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var ear := _ear()
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if zone_map != null and zone_map.visible:
		printerr("ZONE_ON_VALLEY")
		return false
	if not _has_tex(valley, "bed-valley.png"):
		printerr("NO_VALLEY_BED")
		return false
	if not _no_fail(valley):
		return false
	if ear == null or str(ear.get("ambient")) != "dusk" or not bool(ear.get("bed_on")):
		printerr("VALLEY_SILENT ", ear.get("ambient") if ear else "")
		return false
	print("SMOKE_VALLEY")
	return true


func _assert_do_shout() -> bool:
	var act := _find_btn(play, "做")
	var shout := _find_btn(play, "喊")
	if act == null or shout == null:
		printerr("NO_DO_SHOUT")
		return false
	act.emit_signal("button_down")
	await _feed(_snap({
		"actors": [_you({"busy": "chop"}), _mate({})],
	}))
	if not _heard().has("act"):
		printerr("NO_ACT ", _heard())
		return false
	print("SMOKE_DO")
	await _feed(_snap({}))
	shout.emit_signal("pressed")
	await _feed(_snap({
		"actors": [_you({}), _mate({"ping": 1.2})],
	}))
	if not _heard().has("shout"):
		printerr("NO_SHOUT ", _heard())
		return false
	print("SMOKE_SHOUT")
	return true


func _assert_kitchen() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_you({"x": 378.0, "y": 54.0})],
		"youAt": {"x": 378.0, "y": 54.0},
		"prompt": "切",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var ear := _ear()
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN")
		return false
	if str(play.get("_zone")) != "kitchen":
		printerr("ZONE_STUCK ", play.get("_zone"))
		return false
	if ear == null or str(ear.get("ambient")) == "dusk":
		printerr("KITCHEN_STILL_DUSK")
		return false
	if str(ear.get("ambient")) != "hearth" or not bool(ear.get("bed_on")):
		printerr("KITCHEN_SILENT ", ear.get("ambient") if ear else "")
		return false
	if not _no_fail(zone_map):
		return false
	print("SMOKE_KITCHEN")
	return true


func _assert_mine() -> bool:
	await _feed(_snap({
		"zone": "mine",
		"tiles": MINE_ROWS,
		"floor": 1,
		"actors": [_you({"x": 126.0, "y": 90.0})],
		"youAt": {"x": 126.0, "y": 90.0},
		"prompt": "挖",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var ear := _ear()
	if valley != null and valley.visible:
		printerr("VALLEY_ON_MINE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("MINE_HIDDEN")
		return false
	if str(play.get("_zone")) != "mine":
		printerr("ZONE_STUCK_MINE ", play.get("_zone"))
		return false
	if ear != null and str(ear.get("ambient")) == "dusk":
		printerr("MINE_STILL_DUSK")
		return false
	if ear != null and str(ear.get("ambient")) == "hearth":
		printerr("MINE_STILL_HEARTH")
		return false
	if not _heard().has("vein"):
		printerr("MINE_SILENT ", _heard())
		return false
	if not _no_fail(zone_map):
		return false
	print("SMOKE_MINE")
	return true


func _assert_sit() -> bool:
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var ear := _ear()
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_SIT")
		return false
	if ear == null or str(ear.get("ambient")) != "dusk":
		printerr("SIT_NO_DUSK ", ear.get("ambient") if ear else "")
		return false
	await _feed(_snap({
		"actors": [_you({"busy": "sit"}), _mate({"busy": "sit"})],
		"prompt": "歇一夜（田会自己长）",
	}))
	if not _heard().has("sit"):
		printerr("NO_SIT ", _heard())
		return false
	if not _has_tex(play, "bed-valley.png"):
		printerr("SIT_LOST_BED")
		return false
	print("SMOKE_SIT")
	return true
