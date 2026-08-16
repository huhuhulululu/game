extends Node

## 做 at a painted door changes the bed. No door sticker.

const YOU := "p1"
const FAIL := [
	"prop-cover-tree",
	"prop-cover-tree-b",
	"prop-cover-lamp",
	"prop-cover-shore",
	"prop-cover-verge",
	"prop-hut",
	"prop-lodge",
	"prop-door-open",
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
const DOOR_KITCHEN := Vector2(810.0, 270.0)
const DOOR_MINE := Vector2(306.0, 90.0)


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
	if not await _assert_enter():
		get_tree().quit(1)
		return
	print("PLAY_ENTER_OK")
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
		"actors": [_you({})],
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
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _feed(s: Dictionary) -> void:
	play.call("_on_snap", s)
	await get_tree().process_frame
	await get_tree().process_frame
	await get_tree().process_frame


func _has_tex(n: Node, needle: String) -> bool:
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex and str(tex.resource_path).find(needle) >= 0:
			return true
	if n is TextureRect:
		var sheet: Texture2D = (n as TextureRect).texture
		if sheet and str(sheet.resource_path).find(needle) >= 0:
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
					printerr("DOOR_STICKER ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _find_btn(n: Node, label: String) -> Button:
	if n is Button and (n as Button).text == label:
		return n as Button
	for child in n.get_children():
		var hit := _find_btn(child, label)
		if hit:
			return hit
	return null


func _do() -> bool:
	var act := _find_btn(play, "做")
	if act == null:
		printerr("NO_WOOD_DO")
		return false
	act.button_down.emit()
	await get_tree().process_frame
	if not bool(play.get("_sent_act")):
		printerr("NO_DO")
		return false
	return true


func _assert_enter() -> bool:
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if not _has_tex(valley, "bed-valley.png"):
		printerr("NO_VALLEY_BED")
		return false
	if not _no_fail(play):
		return false
	if Look.BODY < 220.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	await _feed(_snap({
		"youAt": {"x": DOOR_KITCHEN.x, "y": DOOR_KITCHEN.y},
		"actors": [_you({"x": DOOR_KITCHEN.x, "y": DOOR_KITCHEN.y})],
	}))
	var bar: CanvasItem = play.get("_prompt_bar")
	var ink: Label = play.get("_prompt")
	if bar == null or not bar.visible or ink == null or str(ink.text).find("进厨房") < 0:
		printerr("NO_KITCHEN_SLIP ", ink.text if ink else "")
		return false
	if not await _do():
		return false
	await _feed(_snap({
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"prompt": "进厨房",
		"youAt": {"x": 108.0, "y": 234.0},
		"actors": [_you({"x": 108.0, "y": 234.0})],
	}))
	if valley.visible:
		printerr("VALLEY_STILL")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("NO_KITCHEN_MAP")
		return false
	if not _has_tex(zone_map, "bed-kitchen.png"):
		printerr("NO_KITCHEN_BED")
		return false
	if _has_tex(play, "prop-door-open"):
		printerr("DOOR_STICKER")
		return false
	if not _no_fail(play):
		return false
	print("PLAY_ENTER_KITCHEN")
	await _feed(_snap({
		"youAt": {"x": DOOR_MINE.x, "y": DOOR_MINE.y},
		"actors": [_you({"x": DOOR_MINE.x, "y": DOOR_MINE.y})],
	}))
	ink = play.get("_prompt")
	if ink == null or str(ink.text).find("进矿") < 0:
		printerr("NO_MINE_SLIP ", ink.text if ink else "")
		return false
	if not await _do():
		return false
	await _feed(_snap({
		"zone": "mine",
		"tiles": MINE_ROWS,
		"floor": 1,
		"prompt": "进矿",
		"youAt": {"x": 108.0, "y": 90.0},
		"actors": [_you({"x": 108.0, "y": 90.0})],
	}))
	if valley.visible:
		printerr("VALLEY_ON_MINE")
		return false
	if not _has_tex(zone_map, "bed-mine.png"):
		printerr("NO_MINE_BED")
		return false
	if _has_tex(play, "prop-door-open"):
		printerr("DOOR_STICKER")
		return false
	if not _no_fail(play):
		return false
	print("PLAY_ENTER_MINE")
	return true
