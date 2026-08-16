extends Node

## Your name is hidden. Mate is quiet ink. No boxed DST nametag.

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
	if not await _assert_names():
		get_tree().quit(1)
		return
	print("PLAY_NAME_OK")
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


func _mate(extra: Dictionary) -> Dictionary:
	var row := _you({
		"id": MATE,
		"name": "松",
		"side": "right",
		"x": 348.0,
	})
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


func _views(n: Node) -> Array:
	var out: Array = []
	if n is ActorView:
		out.append(n)
	for child in n.get_children():
		out.append_array(_views(child))
	return out


func _has_plaque_name(n: Node) -> bool:
	if n is Panel:
		var path := _style_path(n as Control, "panel")
		if path.find("tex-plaque.png") >= 0 and (n as Panel).size.x <= 90.0:
			return true
	for child in n.get_children():
		if _has_plaque_name(child):
			return true
	return false


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


func _assert_names() -> bool:
	await _feed(_snap({}))
	var rows: Array = _views(play)
	var you_view: ActorView = null
	var mate_view: ActorView = null
	for raw in rows:
		var view: ActorView = raw
		if view.actor_id == YOU:
			you_view = view
		elif view.actor_id == MATE:
			mate_view = view
	if you_view == null or mate_view == null:
		printerr("NO_COATS")
		return false
	if _has_plaque_name(you_view) or _has_plaque_name(mate_view):
		printerr("NAME_BOX")
		return false
	var you_ink: Label = you_view.get("_name")
	if you_ink != null and you_ink.visible:
		printerr("YOU_TAG")
		return false
	print("PLAY_NAME_YOU")
	var mate_ink: Label = mate_view.get("_name")
	if mate_ink == null or not mate_ink.visible:
		printerr("MATE_HIDDEN")
		return false
	if str(mate_ink.text).find("松") < 0:
		printerr("MATE_INK ", mate_ink.text)
		return false
	print("PLAY_NAME_MATE")
	var bar: Panel = play.get("_prompt_bar")
	if bar != null and bar.visible:
		printerr("EMPTY_LOG")
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
