extends Node

## 做 on the painted bed sleeps. Hearth sit uses the existing pose. No bed. No fire sticker.

const YOU := "p1"
const FAIL := [
	"prop-cover-tree",
	"prop-cover-tree-b",
	"prop-cover-lamp",
	"prop-cover-shore",
	"prop-cover-verge",
	"prop-hut",
	"prop-lodge",
	"prop-bed",
	"bed-sleep",
	"prop-fire",
	"prop-hearth",
	"prop-camp-pot",
]
const BED := Vector2(306.0, 270.0)
const HEARTH := Vector2(342.0, 270.0)
const SPAWN := Vector2(290.0, 342.0)


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
	if not await _assert_rest():
		get_tree().quit(1)
		return
	print("PLAY_REST_OK")
	get_tree().quit(0)


func _you(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": SPAWN.x,
		"y": SPAWN.y,
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
		"youAt": {"x": SPAWN.x, "y": SPAWN.y},
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


func _has_ink(n: Node, needle: String) -> bool:
	if n is Label and str((n as Label).text).find(needle) >= 0:
		return true
	for child in n.get_children():
		if _has_ink(child, needle):
			return true
	return false


func _no_fail(n: Node) -> bool:
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex:
			var path := str(tex.resource_path)
			for bad in FAIL:
				if path.find(str(bad)) >= 0:
					printerr("BED_OR_FIRE ", path)
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


func _assert_rest() -> bool:
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if zone_map != null and zone_map.visible:
		printerr("ZONE_MAP_ON_VALLEY")
		return false
	if Look.BODY < 220.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	var ink: Label = play.get("_prompt")
	if ink != null and str(ink.text).find("歇一夜") >= 0:
		printerr("SLEEP_AT_SPAWN ", ink.text)
		return false
	if not _no_fail(play):
		return false
	await _feed(_snap({
		"youAt": {"x": BED.x, "y": BED.y},
		"actors": [_you({"x": BED.x, "y": BED.y})],
	}))
	var bed := valley.get_node_or_null("Bed") as Sprite2D
	if bed == null or bed.texture == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("NO_VALLEY_BED")
		return false
	var bar: CanvasItem = play.get("_prompt_bar")
	ink = play.get("_prompt")
	if bar == null or not bar.visible or ink == null or str(ink.text).find("歇一夜") < 0:
		printerr("NO_SLEEP_SLIP ", ink.text if ink else "")
		return false
	if not await _do():
		return false
	await _feed(_snap({
		"night": true,
		"dusk": false,
		"day": 1,
		"prompt": "歇了一夜 · 春 · 晴。田还在长",
		"toasts": ["歇了一夜 · 春 · 晴。田还在长"],
		"youAt": {"x": BED.x, "y": BED.y},
		"actors": [_you({"x": BED.x, "y": BED.y})],
	}))
	ink = play.get("_prompt")
	if ink == null or str(ink.text).find("歇了一夜") < 0:
		printerr("NO_REST_SLIP ", ink.text if ink else "")
		return false
	if _has_tex(play, "prop-bed") or _has_tex(play, "bed-sleep"):
		printerr("BED_OR_FIRE")
		return false
	if not _no_fail(play):
		return false
	print("PLAY_SLEEP")
	await _feed(_snap({
		"night": true,
		"dusk": false,
		"prompt": "",
		"toasts": ["火边坐了一会儿"],
		"youAt": {"x": HEARTH.x, "y": HEARTH.y},
		"actors": [_you({
			"x": HEARTH.x,
			"y": HEARTH.y,
			"busy": "sit",
		})],
	}))
	await get_tree().create_timer(0.5).timeout
	if not _has_tex(play, "char-warm-sit.png"):
		printerr("NO_SIT_SHEET")
		return false
	if not _has_ink(play, "火边坐了一会儿"):
		printerr("NO_HEARTH_TOAST")
		return false
	if _has_tex(play, "prop-fire") or _has_tex(play, "prop-hearth") or _has_tex(play, "prop-camp-pot"):
		printerr("BED_OR_FIRE")
		return false
	if not _no_fail(play):
		return false
	print("PLAY_SIT")
	return true
