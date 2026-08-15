extends Node2D

## Valley / mine / kitchen. Authority stays on the server.

var _world: Node2D
var _valley: ValleyMap
var _zone_map: ZoneMap
var _actors: Dictionary = {}
var _foes: Array[Node2D] = []
var _cam: Camera2D
var _hud_place: Label
var _hud_room: Label
var _hud_ink: Label
var _hud_held: Label
var _hud_pot: Label
var _prompt: Label
var _toasts: VBoxContainer
var _bag: HBoxContainer
var _orders: VBoxContainer
var _stick_v := Vector2.ZERO
var _act := false
var _held := false
var _ping := false
var _stick_down := false
var _stick_origin := Vector2.ZERO
var _last_pos: Dictionary = {}
var _tiles: Array = []
var _zone := "valley"
var _you_held := ""


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_world = Node2D.new()
	_world.y_sort_enabled = true
	add_child(_world)
	_valley = ValleyMap.new()
	_world.add_child(_valley)
	_zone_map = ZoneMap.new()
	_zone_map.visible = false
	_world.add_child(_zone_map)
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
	card.size = Vector2(320, 128)
	card.add_theme_stylebox_override("panel", Look.plaque_box())
	layer.add_child(card)
	_hud_place = Look.ink_label("山谷", 22)
	_hud_place.position = Vector2(16, 8)
	card.add_child(_hud_place)
	_hud_room = Look.ink_label("", 13, Look.GOLD)
	_hud_room.position = Vector2(168, 14)
	card.add_child(_hud_room)
	_hud_ink = Look.ink_label("", 13)
	_hud_ink.position = Vector2(16, 42)
	_hud_ink.size = Vector2(288, 22)
	card.add_child(_hud_ink)
	_hud_held = Look.ink_label("手里空着", 14, Look.GOLD)
	_hud_held.position = Vector2(16, 66)
	_hud_held.size = Vector2(288, 22)
	card.add_child(_hud_held)
	_hud_pot = Look.ink_label("", 13)
	_hud_pot.position = Vector2(16, 90)
	_hud_pot.size = Vector2(288, 22)
	card.add_child(_hud_pot)
	_bag = HBoxContainer.new()
	_bag.position = Vector2(16, 152)
	_bag.add_theme_constant_override("separation", 8)
	layer.add_child(_bag)
	_toasts = VBoxContainer.new()
	_toasts.position = Vector2(900, 16)
	_toasts.size = Vector2(360, 220)
	_toasts.add_theme_constant_override("separation", 6)
	layer.add_child(_toasts)
	_orders = VBoxContainer.new()
	_orders.position = Vector2(900, 250)
	_orders.size = Vector2(360, 160)
	layer.add_child(_orders)
	var plaque := Panel.new()
	plaque.position = Vector2(360, 620)
	plaque.size = Vector2(560, 44)
	plaque.add_theme_stylebox_override("panel", Look.plaque_box())
	layer.add_child(plaque)
	_prompt = Look.ink_label("", 18)
	_prompt.position = Vector2(12, 8)
	_prompt.size = Vector2(536, 28)
	_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	plaque.add_child(_prompt)
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
	pad.add_theme_stylebox_override("panel", Look.plaque_box())
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
	var zone := str(s.get("zone", "valley"))
	_hud_place.text = _place(zone, bool(s.get("rush", false)), int(s.get("floor", 0)))
	_hud_room.text = "房间 %s" % str(s.get("room", Net.room))
	var phase := "夜里" if bool(s.get("night", false)) else ("黄昏" if bool(s.get("dusk", false)) else "白天")
	var weather: Dictionary = s.get("weather", {}) if typeof(s.get("weather", {})) == TYPE_DICTIONARY else {}
	_hud_ink.text = "%s · %s · %s · 金 %s" % [str(s.get("season", "春")), phase, str(weather.get("name", "")), str(s.get("gold", 0))]
	_prompt.text = str(s.get("prompt", ""))
	var you_held := _you_held_name(s)
	_you_held = _you_held_id(s)
	_hud_held.text = "手里 · %s" % you_held if you_held != "" else "手里空着"
	var pot: Array = s.get("pot", [])
	var ready := str(s.get("potReady", ""))
	if ready != "":
		_hud_pot.text = "锅 · %s 好了" % ready
	elif pot.size() > 0:
		_hud_pot.text = "锅 · %s" % "、".join(pot)
	else:
		_hud_pot.text = ""
	_paint_toasts(s.get("toasts", []))
	_paint_bag(s.get("bag", []))
	_paint_orders(s.get("orders", []))
	var rows: Array = s.get("tiles", [])
	if rows.size() > 0:
		_tiles = rows
	_show_zone(zone, _tiles)
	var you: Dictionary = s.get("youAt", {})
	_cam.zoom = Vector2(2.45, 2.45) if zone == "kitchen" or zone == "mine" else Vector2(1.85, 1.85)
	if you.size() > 0:
		_cam.position = _clamp_cam(Vector2(float(you.get("x", 0)), float(you.get("y", 0))))
	# One notch of dusk. Let the painting keep its own light. Never purple night.
	if bool(s.get("night", false)) and zone != "kitchen" and zone != "mine":
		_world.modulate = Color(0.78, 0.68, 0.52)
	elif bool(s.get("dusk", false)):
		_world.modulate = Color(1.0, 1.0, 0.97)
	else:
		_world.modulate = Color(1.0, 1.0, 1.0)
	_paint_people(s)
	_paint_foes(s.get("enemies", []))


func _you_held_name(s: Dictionary) -> String:
	var me := _me(s)
	if me.is_empty():
		return ""
	return str(me.get("heldName", ""))


func _you_held_id(s: Dictionary) -> String:
	var me := _me(s)
	if me.is_empty():
		return ""
	return str(me.get("held", "")).split(":")[0]


func _me(s: Dictionary) -> Dictionary:
	var you := str(s.get("you", Net.you_id))
	for raw in s.get("actors", []):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var a: Dictionary = raw
		if str(a.get("id", "")) == you:
			return a
	return {}


func _show_zone(zone: String, rows: Array) -> void:
	_zone = zone
	var indoor := zone == "mine" or zone == "kitchen" or zone == "wild"
	_valley.visible = zone == "valley"
	_zone_map.visible = indoor
	if indoor and rows.size() > 0:
		_zone_map.show_map(zone, rows)


func _paint_people(s: Dictionary) -> void:
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


func _paint_foes(raws: Array) -> void:
	while _foes.size() > raws.size():
		var old: Node2D = _foes.pop_back()
		old.queue_free()
	while _foes.size() < raws.size():
		var n := Sprite2D.new()
		n.texture = load("res://assets/art/prop-beast.png") as Texture2D
		n.centered = true
		n.texture_filter = TEXTURE_FILTER_LINEAR
		n.material = Look.dusk_mat(0.08)
		_world.add_child(n)
		_foes.append(n)
	for i in raws.size():
		if typeof(raws[i]) != TYPE_DICTIONARY:
			continue
		var e: Dictionary = raws[i]
		var n: Sprite2D = _foes[i]
		n.position = Vector2(float(e.get("x", 0)), float(e.get("y", 0)))
		n.z_index = 18 + int(n.position.y / 8.0)
		var tex := n.texture
		if tex:
			n.scale = Vector2(40.0 / float(tex.get_width()), 40.0 / float(tex.get_height()))
		n.modulate = Color(1, 1, 1, 1) if float(e.get("flash", 0)) <= 0.0 else Color(1.2, 0.8, 0.7)


func _paint_toasts(raws: Array) -> void:
	for child in _toasts.get_children():
		child.queue_free()
	var n := 0
	for raw in raws:
		if n >= 4:
			break
		var line := Look.ink_label(str(raw), 14)
		line.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		line.custom_minimum_size = Vector2(340, 0)
		var card := Panel.new()
		card.custom_minimum_size = Vector2(360, 36)
		card.add_theme_stylebox_override("panel", Look.plaque_box())
		card.add_child(line)
		line.position = Vector2(12, 8)
		line.size = Vector2(336, 40)
		_toasts.add_child(card)
		n += 1


func _paint_bag(raws: Array) -> void:
	for child in _bag.get_children():
		child.queue_free()
	for raw in raws:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = raw
		var id := str(row.get("id", ""))
		var label := "%s×%s" % [str(row.get("name", id)), str(row.get("n", 1))]
		var b := Look.wood_button(label, 108)
		b.custom_minimum_size = Vector2(108, 36)
		b.add_theme_font_size_override("font_size", 14)
		b.pressed.connect(func() -> void: _take(id))
		_bag.add_child(b)


func _paint_orders(raws: Array) -> void:
	for child in _orders.get_children():
		child.queue_free()
	for raw in raws:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var o: Dictionary = raw
		var line := Look.ink_label("%s · %s" % [str(o.get("recipe", "")), str(o.get("name", ""))], 14, Look.GOLD)
		_orders.add_child(line)


func _take(item_id: String) -> void:
	if _you_held != "":
		_prompt.text = "手里满了"
		return
	Net.send_take(item_id)


func _clamp_cam(p: Vector2) -> Vector2:
	var vp := get_viewport_rect().size
	var half := Vector2(vp.x / (2.0 * _cam.zoom.x), vp.y / (2.0 * _cam.zoom.y))
	var sz := _valley.size_px() if _zone == "valley" else _zone_map.size_px()
	if sz.x <= half.x * 2.0:
		p.x = sz.x * 0.5
	else:
		p.x = clampf(p.x, half.x, sz.x - half.x)
	if sz.y <= half.y * 2.0:
		p.y = sz.y * 0.5
	else:
		p.y = clampf(p.y, half.y, sz.y - half.y)
	return p


func _place(z: String, rush: bool, floor: int) -> String:
	if z == "kitchen":
		return "厨房 · 堂口热" if rush else "厨房"
	if z == "mine":
		return "矿 %s层" % str(floor) if floor > 0 else "矿里"
	if z == "wild":
		return "荒野"
	return "山谷"
