extends Node

## Empty bottom bar stays off. A real line is one small wood slip.

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
const TORN := [
	"prop-hole.png",
	"prop-silk.png",
	"prop-torch.png",
	"prop-camp-pot.png",
	"prop-smith.png",
	"prop-booth.png",
	"prop-beast.png",
]


var play: Node2D
var started := false


func _ready() -> void:
	play = preload("res://scenes/play.tscn").instantiate() as Node2D
	add_child(play)


func _process(_dt: float) -> void:
	if started:
		return
	if play == null or play.get("_valley") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not await _assert_empty():
		get_tree().quit(1)
		return
	if not await _assert_line():
		get_tree().quit(1)
		return
	print("PLAY_LOG_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
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
		"actors": [_actor({})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "",
		"bag": [{"id": "wood", "n": 1, "name": "青木"}],
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


func _style_path(n: Control, kind: String) -> String:
	var sb := n.get_theme_stylebox(kind)
	if sb is StyleBoxTexture:
		var tex: Texture2D = (sb as StyleBoxTexture).texture
		if tex:
			return str(tex.resource_path)
	return ""


func _find_btn(n: Node, label: String) -> Button:
	if n is Button and (n as Button).text == label:
		return n as Button
	for child in n.get_children():
		var hit := _find_btn(child, label)
		if hit:
			return hit
	return null


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
			for torn in TORN:
				if path.find(str(torn)) >= 0:
					printerr("HUNG_TORN ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _assert_empty() -> bool:
	await _feed(_snap({
		"prompt": "",
		"toasts": [],
	}))
	var bar: Panel = play.get("_prompt_bar")
	if bar == null:
		printerr("NO_PROMPT_BAR")
		return false
	if bar.visible:
		printerr("EMPTY_LOG")
		return false
	if bar.size.x >= 500.0:
		printerr("RESERVED_LOG ", bar.size)
		return false
	print("PLAY_LOG_EMPTY")
	return true


func _assert_line() -> bool:
	await _feed(_snap({
		"prompt": "歇",
	}))
	var bar: Panel = play.get("_prompt_bar")
	var line: Label = play.get("_prompt")
	if bar == null or not bar.visible:
		printerr("LINE_HIDDEN")
		return false
	if line == null or str(line.text).strip_edges() != "歇":
		printerr("NO_INK")
		return false
	if _style_path(bar, "panel").find("tex-slip.png") < 0:
		printerr("LINE_NOT_SLIP ", _style_path(bar, "panel"))
		return false
	if bar.size.x >= 500.0 or bar.size.y >= 56.0:
		printerr("DST_LOG ", bar.size)
		return false
	print("PLAY_LOG_LINE")
	await _feed(_snap({
		"prompt": "",
	}))
	if bar.visible:
		printerr("LOG_LEFT")
		return false
	var act := _find_btn(play, "做")
	if act == null or _style_path(act, "normal").find("tex-slip.png") < 0:
		printerr("HAND_LOST")
		return false
	var plaque: Panel = play.get("_plaque")
	if plaque == null or plaque.size.x > 280.0:
		printerr("PLAQUE_LOST")
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _no_fail(play):
		return false
	if Look.BODY < 180.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	return true
