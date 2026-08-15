extends Node2D

## Valley, two painted people, stick / 做 / 喊. Authority stays on the server.

var _world: Node2D
var _actors: Dictionary = {}
var _cam: Camera2D
var _hud_place: Label
var _hud_room: Label
var _hud_ink: Label
var _prompt: Label
var _stick_v := Vector2.ZERO
var _act := false
var _held := false
var _ping := false
var _stick_down := false
var _stick_origin := Vector2.ZERO
var _last_pos: Dictionary = {}


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_world = Node2D.new()
	_world.y_sort_enabled = true
	add_child(_world)
	var valley := ValleyMap.new()
	_world.add_child(valley)
	_cam = Camera2D.new()
	_cam.zoom = Vector2(1.85, 1.85)
	_cam.position_smoothing_enabled = true
	_cam.position_smoothing_speed = 6
	add_child(_cam)
	_cam.make_current()
	_hud()
	if not Net.snap_got.is_connected(_on_snap):
		Net.snap_got.connect(_on_snap)
	if Net.last_snap.size() > 0:
		_on_snap(Net.last_snap)


func _hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var card := Panel.new()
	card.position = Vector2(16, 16)
	card.size = Vector2(280, 92)
	card.add_theme_stylebox_override("panel", Look.wood_box())
	layer.add_child(card)
	_hud_place = Look.ink_label("山谷", 22)
	_hud_place.position = Vector2(16, 10)
	card.add_child(_hud_place)
	_hud_room = Look.ink_label("", 13, Look.GOLD)
	_hud_room.position = Vector2(150, 16)
	card.add_child(_hud_room)
	_hud_ink = Look.ink_label("", 13)
	_hud_ink.position = Vector2(16, 52)
	_hud_ink.size = Vector2(248, 28)
	card.add_child(_hud_ink)
	_prompt = Look.ink_label("", 16)
	_prompt.position = Vector2(400, 640)
	_prompt.size = Vector2(480, 32)
	_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	layer.add_child(_prompt)
	var act := Look.wood_button("做", 88)
	act.position = Vector2(1160, 600)
	act.button_down.connect(func() -> void: _act = true; _held = true)
	act.button_up.connect(func() -> void: _held = false)
	layer.add_child(act)
	var shout := Look.wood_button("喊", 72)
	shout.position = Vector2(1070, 560)
	shout.pressed.connect(func() -> void: _ping = true)
	layer.add_child(shout)
	var pad := Panel.new()
	pad.position = Vector2(36, 560)
	pad.size = Vector2(120, 120)
	pad.modulate = Color(1, 1, 1, 0.55)
	pad.add_theme_stylebox_override("panel", Look.wood_box())
	pad.gui_input.connect(_on_pad)
	layer.add_child(pad)


func _on_pad(e: InputEvent) -> void:
	if e is InputEventMouseButton:
		_stick_down = e.pressed
		_stick_origin = e.position
		if not e.pressed:
			_stick_v = Vector2.ZERO
	elif e is InputEventMouseMotion and _stick_down:
		var d: Vector2 = (e.position - _stick_origin) / 48.0
		if d.length() > 1.0:
			d = d.normalized()
		_stick_v = d
	elif e is InputEventScreenTouch:
		_stick_down = e.pressed
		_stick_origin = e.position
		if not e.pressed:
			_stick_v = Vector2.ZERO
	elif e is InputEventScreenDrag:
		var d2: Vector2 = (e.position - _stick_origin) / 48.0
		if d2.length() > 1.0:
			d2 = d2.normalized()
		_stick_v = d2


func _unhandled_input(e: InputEvent) -> void:
	if e.is_action_pressed("act"):
		_act = true
		_held = true
	if e.is_action_released("act"):
		_held = false
	if e.is_action_pressed("shout"):
		_ping = true


func _keys() -> Vector2:
	var v := Vector2.ZERO
	if Input.is_action_pressed("move_left"):
		v.x -= 1
	if Input.is_action_pressed("move_right"):
		v.x += 1
	if Input.is_action_pressed("move_up"):
		v.y -= 1
	if Input.is_action_pressed("move_down"):
		v.y += 1
	if v.length() > 1.0:
		v = v.normalized()
	return v


func _process(_dt: float) -> void:
	var v := _keys()
	if v == Vector2.ZERO:
		v = _stick_v
	Net.send_input(v.x, v.y, _act, _held, _ping)
	_act = false
	_ping = false


func _on_snap(s: Dictionary) -> void:
	_hud_place.text = _place(str(s.get("zone", "valley")), bool(s.get("rush", false)))
	_hud_room.text = "房间 %s" % str(s.get("room", Net.room))
	var phase := "夜里" if bool(s.get("night", false)) else ("黄昏" if bool(s.get("dusk", false)) else "白天")
	_hud_ink.text = "%s · %s · %s" % [str(s.get("season", "春")), phase, str((s.get("weather", {}) as Dictionary).get("name", ""))]
	_prompt.text = str(s.get("prompt", ""))
	var you: Dictionary = s.get("youAt", {})
	if you.size() > 0:
		_cam.position = Vector2(float(you.get("x", 0)), float(you.get("y", 0)))
	_world.modulate = Color(0.55, 0.58, 0.7) if bool(s.get("night", false)) else Color.WHITE
	var seen := {}
	for raw in s.get("actors", []):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var a: Dictionary = raw
		var id := str(a.get("id", ""))
		seen[id] = true
		if not _actors.has(id):
			var view := ActorView.new()
			view.actor_id = id
			_world.add_child(view)
			_actors[id] = view
		var node: ActorView = _actors[id]
		var prev: Vector2 = _last_pos.get(id, node.position)
		var next := Vector2(float(a.get("x", 0)), float(a.get("y", 0)))
		node.set_moving(prev.distance_to(next) > 0.4)
		node.apply(a, Time.get_ticks_msec() / 1000.0)
		_last_pos[id] = next
	for id in _actors.keys():
		if not seen.has(id):
			(_actors[id] as Node).queue_free()
			_actors.erase(id)


func _place(z: String, rush: bool) -> String:
	if z == "kitchen":
		return "厨房 · 堂口热" if rush else "厨房"
	if z == "mine":
		return "矿里"
	if z == "wild":
		return "荒野"
	return "山谷"
