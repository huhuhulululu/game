extends Node
## Play.tscn hears thin 做 / 喊 / sit plus a dusk bed. Same painted world.

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
	if not await _assert_dusk():
		get_tree().quit(1)
		return
	if not await _assert_act():
		get_tree().quit(1)
		return
	if not await _assert_shout():
		get_tree().quit(1)
		return
	if not await _assert_sit():
		get_tree().quit(1)
		return
	print("PLAY_EAR_OK")
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


func _btn(label: String) -> BaseButton:
	return _find_btn(play, label)


func _find_btn(n: Node, label: String) -> BaseButton:
	if n is BaseButton and (n as BaseButton).text == label:
		return n
	for child in n.get_children():
		var hit := _find_btn(child, label)
		if hit:
			return hit
	return null


func _assert_dusk() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_BED")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if not _no_fail(valley):
		return false
	var ear := _ear()
	if ear == null or str(ear.get("ambient")) != "dusk" or not bool(ear.get("bed_on")):
		printerr("DUSK_OFF ", ear.get("ambient") if ear else "", " ", ear.get("bed_on") if ear else "")
		return false
	ear.set_muted(true)
	if not bool(ear.get("muted")) or bool(ear.get("bed_on")):
		printerr("MUTE_BED")
		return false
	if str(ear.get("ambient")) != "dusk":
		printerr("MUTE_LOST_DUSK")
		return false
	ear.set_muted(false)
	if bool(ear.get("muted")) or not bool(ear.get("bed_on")):
		printerr("UNMUTE_BED")
		return false
	await _feed(_snap({"zone": "kitchen"}))
	if str(ear.get("ambient")) != "" or bool(ear.get("bed_on")):
		printerr("KITCHEN_BED")
		return false
	await _feed(_snap({}))
	if str(ear.get("ambient")) != "dusk" or not bool(ear.get("bed_on")):
		printerr("DUSK_BACK")
		return false
	print("PLAY_EAR_DUSK")
	return true


func _assert_act() -> bool:
	await _feed(_snap({}))
	var act := _btn("做")
	if act == null:
		printerr("NO_ACT_BTN")
		return false
	act.emit_signal("button_down")
	await _feed(_snap({
		"actors": [_you({"busy": "chop"}), _mate({})],
	}))
	if not _heard().has("act"):
		printerr("NO_ACT_TONE ", _heard())
		return false
	print("PLAY_EAR_ACT")
	return true


func _assert_shout() -> bool:
	await _feed(_snap({}))
	var shout := _btn("喊")
	if shout == null:
		printerr("NO_SHOUT_BTN")
		return false
	shout.emit_signal("pressed")
	await _feed(_snap({
		"actors": [_you({}), _mate({"ping": 1.2})],
	}))
	if not _heard().has("shout"):
		printerr("NO_SHOUT_TONE ", _heard())
		return false
	print("PLAY_EAR_SHOUT")
	return true


func _assert_sit() -> bool:
	await _feed(_snap({}))
	await _feed(_snap({
		"actors": [_you({"busy": "sit"}), _mate({"busy": "sit"})],
		"prompt": "歇一夜（田会自己长）",
	}))
	if not _heard().has("sit"):
		printerr("NO_SIT_TONE ", _heard())
		return false
	print("PLAY_EAR_SIT")
	return true
