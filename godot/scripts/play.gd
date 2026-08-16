extends Node2D

## Valley / mine / kitchen. Authority stays on the server.

var _world: Node2D
var _valley: ValleyWorld
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
var _prompt_bar: Panel
var _toasts: VBoxContainer
var _bag: HBoxContainer
var _ice: HBoxContainer
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
var _cam_locked := false
var _bag_sig := ""
var _ice_sig := ""
var _toast_sig := ""
var _order_sig := ""
var _fish_hud: Panel
var _fish_ok: ColorRect
var _fish_mark: ColorRect
var _fish_pull: ColorRect
var _atlas: TextureRect
var _visible: Dictionary = {}
var _map_w := 0
var _hud_sign: Label
var _sign_card: Panel
var _hud_mate: Label
var _plot_sig := ""
var _ear: ValleyEar
var _mute_btn: Button


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_world = Node2D.new()
	_world.y_sort_enabled = true
	add_child(_world)
	_valley = preload("res://scenes/valley.tscn").instantiate() as ValleyWorld
	_world.add_child(_valley)
	_zone_map = ZoneMap.new()
	_zone_map.visible = false
	_world.add_child(_zone_map)
	_cam = Camera2D.new()
	_cam.zoom = Vector2(1.58, 1.58)
	_cam.position = _valley.size_px() * 0.5
	_cam.position_smoothing_enabled = false
	_cam.position_smoothing_speed = 6
	add_child(_cam)
	_cam.make_current()
	_hud()
	add_child(Look.air_layer())
	if not Net.snap_got.is_connected(_on_snap):
		Net.snap_got.connect(_on_snap)
	if Net.last_snap.size() > 0:
		_on_snap(Net.last_snap)


func _hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var card := Panel.new()
	card.position = Vector2(16, 16)
	card.size = Vector2(320, 148)
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
	_hud_mate = Look.ink_label("", 13, Look.GOLD)
	_hud_mate.position = Vector2(16, 114)
	_hud_mate.size = Vector2(288, 24)
	card.add_child(_hud_mate)
	_sign_card = Panel.new()
	_sign_card.position = Vector2(352, 16)
	_sign_card.size = Vector2(400, 88)
	_sign_card.visible = false
	_sign_card.add_theme_stylebox_override("panel", Look.plaque_box())
	layer.add_child(_sign_card)
	_hud_sign = Look.ink_label("", 14, Look.GOLD)
	_hud_sign.position = Vector2(12, 8)
	_hud_sign.size = Vector2(376, 72)
	_hud_sign.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_sign_card.add_child(_hud_sign)
	_bag = HBoxContainer.new()
	_bag.position = Vector2(16, 172)
	_bag.add_theme_constant_override("separation", 10)
	layer.add_child(_bag)
	_ice = HBoxContainer.new()
	_ice.position = Vector2(16, 228)
	_ice.add_theme_constant_override("separation", 10)
	layer.add_child(_ice)
	_toasts = VBoxContainer.new()
	_toasts.position = Vector2(900, 16)
	_toasts.size = Vector2(360, 220)
	_toasts.add_theme_constant_override("separation", 6)
	layer.add_child(_toasts)
	_orders = VBoxContainer.new()
	_orders.position = Vector2(900, 250)
	_orders.size = Vector2(360, 160)
	layer.add_child(_orders)
	_prompt_bar = Panel.new()
	_prompt_bar.position = Vector2(350, 598)
	_prompt_bar.size = Vector2(580, 64)
	_prompt_bar.add_theme_stylebox_override("panel", Look.slip_box())
	layer.add_child(_prompt_bar)
	_prompt = Look.ink_label("", 20)
	_prompt.position = Vector2(18, 14)
	_prompt.size = Vector2(544, 36)
	_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_prompt.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_prompt_bar.add_child(_prompt)
	var act := Look.wood_button("做", 88)
	act.position = Vector2(1160, 600)
	act.button_down.connect(func() -> void:
		_act = true
		_held = true
		if _ear:
			_ear.tone("act")
	)
	act.button_up.connect(func() -> void: _held = false)
	layer.add_child(act)
	var shout := Look.wood_button("喊", 72)
	shout.position = Vector2(1070, 560)
	shout.pressed.connect(func() -> void:
		_ping = true
		if _ear:
			_ear.tone("shout")
	)
	layer.add_child(shout)
	_ear = ValleyEar.new()
	add_child(_ear)
	_mute_btn = Look.wood_button("声", 72)
	_mute_btn.position = Vector2(1070, 500)
	_mute_btn.pressed.connect(_toggle_mute)
	layer.add_child(_mute_btn)
	var pad := Control.new()
	pad.position = Vector2(36, 560)
	pad.size = Vector2(120, 120)
	pad.mouse_filter = Control.MOUSE_FILTER_STOP
	pad.gui_input.connect(_on_pad)
	layer.add_child(pad)
	_fish_hud = Panel.new()
	_fish_hud.position = Vector2(350, 548)
	_fish_hud.size = Vector2(560, 44)
	_fish_hud.visible = false
	_fish_hud.add_theme_stylebox_override("panel", Look.paper_box())
	layer.add_child(_fish_hud)
	_fish_ok = ColorRect.new()
	_fish_ok.position = Vector2(16 + 528 * 0.38, 10)
	_fish_ok.size = Vector2(528 * 0.34, 16)
	_fish_ok.color = Look.MOSS
	_fish_hud.add_child(_fish_ok)
	_fish_mark = ColorRect.new()
	_fish_mark.position = Vector2(16, 8)
	_fish_mark.size = Vector2(4, 20)
	_fish_mark.color = Look.INK
	_fish_hud.add_child(_fish_mark)
	_fish_pull = ColorRect.new()
	_fish_pull.position = Vector2(16, 30)
	_fish_pull.size = Vector2(2, 6)
	_fish_pull.color = Look.GOLD
	_fish_hud.add_child(_fish_pull)
	_atlas = TextureRect.new()
	_atlas.position = Vector2(16, 290)
	_atlas.size = Vector2(192, 128)
	_atlas.visible = false
	_atlas.texture_filter = TEXTURE_FILTER_NEAREST
	layer.add_child(_atlas)


func _on_pad(e: InputEvent) -> void:
	if e is InputEventMouseButton:
		_stick_down = e.pressed
		_stick_origin = e.position
		if e.pressed and _ear:
			_ear.unlock()
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
		if _ear:
			_ear.unlock()
			_ear.tone("act")
	if e.is_action_released("act"):
		_held = false
	if e.is_action_pressed("shout"):
		_ping = true
		if _ear:
			_ear.unlock()
			_ear.tone("shout")


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
	_hud_place.text = _place(zone, bool(s.get("rush", false)), int(s.get("floor", 0)), str(s.get("biome", "")))
	_hud_room.text = "房间 %s" % str(s.get("room", Net.room))
	var phase := "夜里" if bool(s.get("night", false)) else ("黄昏" if bool(s.get("dusk", false)) else "白天")
	# Hunger stays in the sim. The plaque never shows a soul or hunger number.
	_hud_ink.text = "日 %s · %s · %s · 金 %s" % [_ink_n(s.get("day", 0)), str(s.get("season", "春")), phase, _ink_n(s.get("gold", 0))]
	var prompt := str(s.get("prompt", ""))
	_prompt.text = prompt
	if prompt == "起竿" or prompt.find("太暗") >= 0 or prompt.find("咬") >= 0 or prompt.find("还早") >= 0:
		_prompt.add_theme_color_override("font_color", Color(0.55, 0.22, 0.14))
	elif prompt.find("绿") >= 0 or prompt.find("熟了") >= 0:
		_prompt.add_theme_color_override("font_color", Look.MOSS)
	elif prompt.find("歇") >= 0 or prompt.find("两人") >= 0 or prompt.find("一起") >= 0 or prompt.find("等她") >= 0 or prompt.find("堂口") >= 0 or prompt.find("烤") >= 0 or prompt.find("搜") >= 0 or prompt.find("并肩") >= 0:
		_prompt.add_theme_color_override("font_color", Look.GOLD)
	else:
		_prompt.add_theme_color_override("font_color", Look.INK)
	_paint_signs(s)
	_paint_mate(s)
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
	_paint_ice(s.get("ice", []), zone)
	_paint_orders(s.get("orders", []), zone)
	_paint_fish(s)
	var rows: Array = s.get("tiles", [])
	if rows.size() > 0:
		_tiles = rows
	if zone != _zone:
		_cam_locked = false
		if rows.size() == 0:
			_tiles = []
	_show_zone(zone, _tiles)
	_paint_crops(s)
	if _zone_map.visible:
		_zone_map.show_fog(s.get("revealed", []), s.get("visible", []), s.get("fires", []))
	_remember_vis(s)
	_paint_atlas(s)
	var you: Dictionary = s.get("youAt", {})
	_cam.zoom = Vector2(2.45, 2.45) if zone == "kitchen" or zone == "mine" else Vector2(1.58, 1.58)
	if you.size() > 0:
		var target := _clamp_cam(Vector2(float(you.get("x", 0)), float(you.get("y", 0))))
		if not _cam_locked:
			_cam.position_smoothing_enabled = false
			_cam.position = target
			_cam.reset_smoothing()
			_cam.position_smoothing_enabled = true
			_cam_locked = true
		else:
			_cam.position = target
	# Painting keeps its own dusk. Never purple night.
	# Night lives on the bed so painted lamps stay the light.
	var night := bool(s.get("night", false))
	var lit := bool(s.get("lit", true))
	_world.modulate = Color(1.0, 1.0, 1.0) if zone == "kitchen" or zone == "mine" else Look.VALLEY_DUSK
	if zone == "kitchen" or zone == "mine":
		_valley.set_night(0.0)
		_zone_map.set_night(0.0)
	elif night and zone == "wild":
		_valley.set_night(0.0)
		_zone_map.set_night(1.0, Color(0.46, 0.38, 0.28) if not lit else Color(0.78, 0.68, 0.52))
	elif night:
		_valley.set_night(1.0, Color(0.78, 0.68, 0.52))
		_zone_map.set_night(0.0)
	else:
		_valley.set_night(0.0)
		_zone_map.set_night(0.0)
	# Soft dusk rain / haze sit on the bed. Never a weather ring.
	var wet := _wet(s)
	var mist := _mist(s)
	if zone == "kitchen" or zone == "mine":
		_valley.set_rain(false)
		_zone_map.set_rain(false)
		_valley.set_fog(false)
		_zone_map.set_fog(false)
	elif zone == "wild":
		_valley.set_rain(false)
		_valley.set_fog(false)
		_zone_map.set_rain(wet)
		_zone_map.set_fog(mist)
	else:
		_valley.set_rain(wet)
		_valley.set_fog(mist)
		_zone_map.set_rain(false)
		_zone_map.set_fog(false)
	_paint_people(s)
	_paint_foes(s.get("enemies", []))
	if _ear:
		_ear.hear(s)


func _toggle_mute() -> void:
	if _ear == null or _mute_btn == null:
		return
	_ear.set_muted(not _ear.muted)
	_mute_btn.text = "静" if _ear.muted else "声"


func _paint_signs(s: Dictionary) -> void:
	if _hud_sign == null or _sign_card == null:
		return
	var bits: PackedStringArray = []
	var fortune: Variant = s.get("fortune", {})
	if typeof(fortune) == TYPE_DICTIONARY:
		var row: Dictionary = fortune
		var title := str(row.get("title", ""))
		var life := str(row.get("life", ""))
		if title != "":
			bits.append("%s · %s" % [title, life])
	var board: Array = s.get("board", [])
	if board.size() > 0:
		var names: PackedStringArray = []
		for raw in board:
			names.append(str(raw))
		bits.append("今晚 %s" % "、".join(names))
	_hud_sign.text = "\n".join(bits)
	_sign_card.visible = bits.size() > 0


func _paint_mate(s: Dictionary) -> void:
	if _hud_mate == null:
		return
	var raw: Variant = s.get("partner", {})
	if typeof(raw) != TYPE_DICTIONARY:
		_hud_mate.text = ""
		return
	var row: Dictionary = raw
	var name := str(row.get("name", ""))
	if name == "" or name == "还没来":
		_hud_mate.text = ""
		return
	if bool(row.get("online", false)):
		var where := str(row.get("where", ""))
		_hud_mate.text = "%s 在%s" % [name, where] if where != "" else name
	else:
		_hud_mate.text = "%s 断线了，人还在原地" % name


func _paint_crops(s: Dictionary) -> void:
	if _valley == null:
		return
	if _zone != "valley":
		return
	var plots: Array = s.get("plots", [])
	var bits: PackedStringArray = []
	for raw in plots:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = raw
		bits.append("%s:%s" % [str(row.get("seed", "")), _ink_n(row.get("stage", 0))])
	var sig := "|".join(bits)
	if sig == _plot_sig:
		return
	_plot_sig = sig
	_valley.show_crops(plots)


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
		var row := a.duplicate()
		if str(row.get("zone", "")) == "":
			row["zone"] = str(s.get("zone", _zone))
		node.set_moving(prev.distance_to(next) > 0.4)
		node.apply(row, Time.get_ticks_msec() / 1000.0)
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
		var hue := str(e.get("hue", ""))
		var tint := Color(1, 1, 1, 1)
		if hue.begins_with("#") and hue.length() >= 7:
			tint = Color.from_string(hue, Color(0.28, 0.24, 0.22))
		n.modulate = Color(1.2, 0.8, 0.7) if float(e.get("flash", 0)) > 0.0 else tint
		if _zone == "wild" and _map_w > 0:
			var key := int(n.position.y / 36.0) * _map_w + int(n.position.x / 36.0)
			n.visible = _visible.has(key)
		else:
			n.visible = true


func _ink_n(v: Variant) -> String:
	return str(int(round(float(v))))


func _weather_id(s: Dictionary) -> String:
	var raw: Variant = s.get("weather", {})
	if typeof(raw) == TYPE_DICTIONARY:
		var row: Dictionary = raw
		var id := str(row.get("id", "clear"))
		return id if id != "" else "clear"
	var word := str(raw)
	return word if word != "" else "clear"


func _wet(s: Dictionary) -> bool:
	var id := _weather_id(s)
	return id == "rain" or id == "storm"


func _mist(s: Dictionary) -> bool:
	return _weather_id(s) == "fog"


func _paint_fish(s: Dictionary) -> void:
	if _fish_hud == null:
		return
	var me := _me(s)
	# Sit / sleep stays on the valley. Do not reuse the timing bar as a bed HUD.
	var fight := str(me.get("fishing", "off")) == "fight" and str(me.get("busy", "")) != "sit"
	_fish_hud.visible = fight
	if not fight:
		return
	var mark := clampf(float(me.get("fishMark", 0)), 0.0, 1.0)
	var pull := clampf(float(me.get("fishPull", 0)), 0.0, 1.0)
	var green := mark > 0.38 and mark < 0.72
	_fish_ok.color = Color(0.38, 0.62, 0.48, 1.0) if green else Look.MOSS
	_fish_mark.position.x = 16 + 528.0 * mark - 2.0
	_fish_pull.size.x = max(2.0, 528.0 * pull)


func _paint_toasts(raws: Array) -> void:
	var lines: PackedStringArray = []
	for raw in raws:
		lines.append(str(raw))
	var sig := "|".join(lines)
	if sig == _toast_sig:
		return
	_toast_sig = sig
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


func _spoil_word(fresh: float) -> String:
	if fresh >= 70.0:
		return ""
	if fresh >= 40.0:
		return "还行"
	if fresh > 0.0:
		return "蔫了"
	return "坏了"


func _food_chip(row: Dictionary) -> String:
	var id := str(row.get("id", ""))
	var base := str(row.get("name", id))
	for mark in ["·鲜", "·还行", "·蔫了", "·坏了"]:
		base = base.replace(mark, "")
	var tick := ""
	if row.has("fresh"):
		tick = _spoil_word(float(row.get("fresh", 100)))
	var n := _ink_n(row.get("n", 1))
	if tick != "":
		return "%s·%s×%s" % [base, tick, n]
	return "%s×%s" % [base, n]


func _paint_bag(raws: Array) -> void:
	var bits: PackedStringArray = []
	for raw in raws:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = raw
		bits.append("%s:%s:%s" % [str(row.get("id", "")), _ink_n(row.get("n", 1)), _food_chip(row)])
	var sig := "|".join(bits)
	if sig == _bag_sig:
		return
	_bag_sig = sig
	for child in _bag.get_children():
		child.queue_free()
	for raw in raws:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = raw
		var id := str(row.get("id", ""))
		var b := Look.chip_button(_food_chip(row), 148)
		b.pressed.connect(func() -> void: _take(id))
		_bag.add_child(b)


func _paint_ice(raws: Array, zone: String) -> void:
	# Ice chips stay in the kitchen. Do not hang them on the valley.
	if zone != "kitchen":
		if _ice_sig != "":
			_ice_sig = ""
			for child in _ice.get_children():
				child.queue_free()
		return
	var bits: PackedStringArray = []
	for raw in raws:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = raw
		bits.append("%s:%s:%s" % [str(row.get("id", "")), _ink_n(row.get("n", 1)), _food_chip(row)])
	var sig := "|".join(bits)
	if sig == _ice_sig:
		return
	_ice_sig = sig
	for child in _ice.get_children():
		child.queue_free()
	if bits.is_empty():
		return
	_ice.add_child(Look.ink_label("冰柜", 14, Look.GOLD))
	for raw in raws:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var row: Dictionary = raw
		_ice.add_child(Look.chip_button(_food_chip(row), 148))


func _paint_orders(raws: Array, zone: String) -> void:
	# Overcooked tickets stay in the kitchen. Do not hang them on the valley.
	if zone != "kitchen":
		if _order_sig != "":
			_order_sig = ""
			for child in _orders.get_children():
				child.queue_free()
		return
	var bits: PackedStringArray = []
	for raw in raws:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var o: Dictionary = raw
		bits.append("%s:%s" % [str(o.get("recipe", "")), str(o.get("name", ""))])
	var sig := "kitchen|" + "|".join(bits)
	if sig == _order_sig:
		return
	_order_sig = sig
	for child in _orders.get_children():
		child.queue_free()
	for raw in raws:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var o: Dictionary = raw
		var line := Look.ink_label("%s · %s" % [str(o.get("recipe", "")), str(o.get("name", ""))], 14, Look.GOLD)
		line.position = Vector2(12, 6)
		line.size = Vector2(336, 24)
		var card := Panel.new()
		card.custom_minimum_size = Vector2(360, 32)
		card.add_theme_stylebox_override("panel", Look.slip_box())
		card.add_child(line)
		_orders.add_child(card)


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


func _remember_vis(s: Dictionary) -> void:
	_visible.clear()
	for raw in s.get("visible", []):
		_visible[int(raw)] = true
	if _tiles.size() > 0:
		_map_w = str(_tiles[0]).length()


func _paint_atlas(s: Dictionary) -> void:
	if _atlas == null:
		return
	if _tiles.is_empty() or _zone == "valley":
		_atlas.visible = false
		return
	_atlas.visible = true
	var h := _tiles.size()
	var w := str(_tiles[0]).length()
	if w <= 0 or h <= 0:
		return
	var fog := _zone == "wild"
	var seen := {}
	for raw in s.get("revealed", []):
		seen[int(raw)] = true
	var lit := {}
	for raw in s.get("fires", []):
		lit[int(raw)] = true
	var img := Image.create(w, h, false, Image.FORMAT_RGBA8)
	for y in h:
		var row := str(_tiles[y])
		for x in mini(w, row.length()):
			var key := y * w + x
			if fog and not seen.has(key):
				img.set_pixel(x, y, Color(0.36, 0.26, 0.16, 0.55))
				continue
			var ch := row[x]
			var c := Color(0.62, 0.52, 0.34, 0.9)
			if ch == "~" or ch == "D":
				c = Color(0.22, 0.42, 0.50, 0.95)
			elif ch == ",":
				c = Color(0.70, 0.54, 0.32, 0.95)
			elif ch == "t" or ch == "T":
				c = Color(0.22, 0.38, 0.24, 0.95)
			elif ch == "K" or lit.has(key):
				c = Color(0.86, 0.46, 0.22, 1.0)
			elif ch == "L":
				c = Color(0.78, 0.42, 0.18, 1.0)
			elif ch == "P":
				c = Color(0.52, 0.38, 0.22, 0.9)
			if fog and not _visible.has(key):
				c.a = 0.55
			img.set_pixel(x, y, c)
	var you_ping := float(_me(s).get("ping", 0))
	var mate_ping := 0.0
	var mate: Dictionary = {}
	var partner_raw: Variant = s.get("partner", {})
	if typeof(partner_raw) == TYPE_DICTIONARY:
		mate_ping = float((partner_raw as Dictionary).get("ping", 0))
	var at_raw: Variant = s.get("partnerAt", {})
	if typeof(at_raw) == TYPE_DICTIONARY:
		mate = at_raw
	var same_zone := mate.size() > 0 and str(mate.get("zone", _zone)) == _zone
	if same_zone and mate_ping > 0.04:
		_atlas_flash(img, w, h, float(mate.get("x", 0)), float(mate.get("y", 0)), Color(0.96, 0.90, 0.78, 0.95))
	var you: Dictionary = s.get("youAt", {})
	if you.size() > 0 and you_ping > 0.04:
		_atlas_flash(img, w, h, float(you.get("x", 0)), float(you.get("y", 0)), Color(0.96, 0.90, 0.78, 0.95))
	if same_zone:
		_atlas_dot(img, w, h, float(mate.get("x", 0)), float(mate.get("y", 0)), Color(0.25, 0.43, 0.36, 1.0))
	if you.size() > 0:
		_atlas_dot(img, w, h, float(you.get("x", 0)), float(you.get("y", 0)), Color(0.77, 0.36, 0.15, 1.0))
	_atlas.texture = ImageTexture.create_from_image(img)
	var cell := 4.0 if _zone == "wild" or _zone == "valley" else 6.0
	_atlas.custom_minimum_size = Vector2(w * cell, h * cell)
	_atlas.size = Vector2(w * cell, h * cell)


func _atlas_dot(img: Image, w: int, h: int, px: float, py: float, c: Color) -> void:
	var x := clampi(int(px / 36.0), 0, w - 1)
	var y := clampi(int(py / 36.0), 0, h - 1)
	img.set_pixel(x, y, c)


func _atlas_flash(img: Image, w: int, h: int, px: float, py: float, c: Color) -> void:
	var cx := clampi(int(px / 36.0), 0, w - 1)
	var cy := clampi(int(py / 36.0), 0, h - 1)
	for y in range(maxi(0, cy - 1), mini(h, cy + 2)):
		for x in range(maxi(0, cx - 1), mini(w, cx + 2)):
			img.set_pixel(x, y, c)


func _place(z: String, rush: bool, floor: int, biome := "") -> String:
	if z == "kitchen":
		return "厨房 · 堂口热" if rush else "厨房"
	if z == "mine":
		return "矿 %s层" % str(floor) if floor > 0 else "矿里"
	if z == "wild":
		return "荒野 · %s" % biome if biome != "" and biome != "野地" else "荒野"
	return "山谷"
