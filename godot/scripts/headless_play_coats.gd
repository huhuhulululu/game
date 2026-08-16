extends Node

## Play.tscn walks then sits the cover-coats. Same sheets. No new pack.

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
	if play == null or play.get("_valley") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not await _assert_walk():
		get_tree().quit(1)
		return
	if not await _assert_sit():
		get_tree().quit(1)
		return
	print("PLAY_COAT_OK")
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


func _body(id: String) -> Node2D:
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(id):
		return null
	return actors[id] as Node2D


func _assert_walk() -> bool:
	await _feed(_snap({}))
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if not _no_fail(valley):
		return false
	await _feed(_snap({
		"actors": [_you({"x": 338.0}), _mate({"x": 396.0})],
		"youAt": {"x": 338.0, "y": 342.0},
	}))
	await get_tree().create_timer(0.22).timeout
	if not _has_tex(play, "char-warm-walk"):
		printerr("NO_WARM_WALK")
		return false
	if not _has_tex(play, "char-pine-walk"):
		printerr("NO_PINE_WALK")
		return false
	var warm := _body(YOU)
	if warm == null or float(warm.get("_stride")) <= 0.0:
		printerr("NO_STRIDE")
		return false
	print("PLAY_COAT_WALK")
	return true


func _assert_sit() -> bool:
	await _feed(_snap({
		"actors": [_you({"busy": "sit", "x": 338.0}), _mate({"busy": "sit", "x": 396.0})],
		"youAt": {"x": 338.0, "y": 342.0},
		"prompt": "歇一夜（田会自己长）",
	}))
	await get_tree().create_timer(0.28).timeout
	if not _has_tex(play, "char-warm-sit"):
		printerr("NO_WARM_SIT")
		return false
	if not _has_tex(play, "char-pine-sit"):
		printerr("NO_PINE_SIT")
		return false
	var warm := _body(YOU)
	if warm == null or float(warm.get("_sit")) < 0.8:
		printerr("SIT_BLEND ", warm.get("_sit") if warm else "")
		return false
	print("PLAY_COAT_SIT")
	await _feed(_snap({
		"actors": [_you({"x": 338.0}), _mate({"x": 396.0})],
		"youAt": {"x": 338.0, "y": 342.0},
	}))
	await get_tree().create_timer(0.28).timeout
	if _has_tex(play, "char-warm-sit"):
		printerr("STILL_SIT")
		return false
	if warm == null or float(warm.get("_sit")) > 0.25:
		printerr("STAND_BLEND ", warm.get("_sit") if warm else "")
		return false
	return true
