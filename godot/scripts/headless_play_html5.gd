extends Node

## HTML5 hands: walk and 做 actually fire. No joystick chrome.

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
	if not await _assert_hands():
		get_tree().quit(1)
		return
	print("PLAY_HANDS_OK")
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
		"actors": [_you({}), _you({
			"id": MATE,
			"name": "松",
			"side": "right",
			"x": 348.0,
		})],
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


func _find_btn(n: Node, label: String) -> Button:
	if n is Button and (n as Button).text == label:
		return n as Button
	for child in n.get_children():
		var hit := _find_btn(child, label)
		if hit:
			return hit
	return null


func _find_named(n: Node, label: String) -> Node:
	if n.name == label:
		return n
	for child in n.get_children():
		var hit := _find_named(child, label)
		if hit:
			return hit
	return null


func _press_key(code: Key, down: bool) -> void:
	var key := InputEventKey.new()
	key.pressed = down
	key.keycode = code
	key.physical_keycode = code
	Input.parse_input_event(key)
	get_viewport().push_input(key)


func _click_world(pos: Vector2) -> void:
	var down := InputEventMouseButton.new()
	down.button_index = MOUSE_BUTTON_LEFT
	down.pressed = true
	down.position = pos
	down.global_position = pos
	get_viewport().push_input(down)
	var up := down.duplicate()
	up.pressed = false
	get_viewport().push_input(up)


func _assert_hands() -> bool:
	await _feed(_snap({}))
	await get_tree().create_timer(0.22).timeout
	await _feed(_snap({}))
	if not _has_tex(play, "char-warm"):
		printerr("NO_WARM_COAT")
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _no_fail(play):
		return false
	if Look.BODY < 220.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	var cam: Camera2D = play.get("_cam")
	if cam == null or cam.zoom.x < 2.05 or cam.zoom.x > 2.40:
		printerr("CAM_ZOOM ", cam.zoom if cam else Vector2.ZERO)
		return false
	var pad := _find_named(play, "StickPad")
	if pad == null:
		printerr("NO_STICK")
		return false
	if pad is TextureRect or _has_tex(pad, "joy") or _has_tex(pad, "stick"):
		printerr("JOYSTICK_CHROME")
		return false
	_press_key(KEY_D, true)
	await get_tree().process_frame
	await get_tree().process_frame
	var sent: Vector2 = play.get("_sent_move")
	if sent.x < 0.4:
		printerr("NO_WASD ", sent)
		_press_key(KEY_D, false)
		return false
	_press_key(KEY_D, false)
	await get_tree().process_frame
	_click_world(Vector2(900, 360))
	await get_tree().process_frame
	await get_tree().process_frame
	if not bool(play.get("_walk_on")):
		printerr("NO_CLICK_WALK")
		return false
	sent = play.get("_sent_move")
	if sent.length() < 0.4:
		printerr("NO_CLICK_MOVE ", sent)
		return false
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(YOU):
		printerr("NO_ACTOR")
		return false
	var body: ActorView = actors[YOU] as ActorView
	var before := body.position
	await _feed(_snap({
		"youAt": {"x": 330.0, "y": 342.0},
		"actors": [_you({"x": 330.0}), _you({
			"id": MATE,
			"name": "松",
			"side": "right",
			"x": 388.0,
		})],
	}))
	if body.position.distance_to(before) < 8.0:
		printerr("COAT_STILL ", body.position)
		return false
	print("PLAY_HANDS_MOVE")
	var act := _find_btn(play, "做")
	var shout := _find_btn(play, "喊")
	if act == null or shout == null:
		printerr("NO_WOOD_SLIPS")
		return false
	act.button_down.emit()
	await get_tree().process_frame
	await get_tree().process_frame
	if not bool(play.get("_sent_act")):
		printerr("NO_DO")
		return false
	print("PLAY_HANDS_DO")
	return true
