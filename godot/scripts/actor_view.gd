class_name ActorView
extends Node2D

## 暖 / 松 — one pair, one light. Feet on the ground.

var actor_id := ""
var warm := true
var facing := 2
var moving := false
var ping := 0.0
var away := false
var busy := ""
var fishing := "off"
var fish_mark := 0.0
var fish_pull := 0.0
var _t := 0.0
var _stride := 0.0
var _sit := 0.0
var _was_moving := false
var _want_move := false
var _coast := 0.0
var _sprite: Sprite2D
var _shadow: Sprite2D
var _glow: Sprite2D
var _name: Label
var _mine := false
var _bar_bg: Panel
var _bar_ok: ColorRect
var _bar_mark: ColorRect
var _bar_pull: ColorRect
var _lamp: Sprite2D
var _torch := false
var _place := ""


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_shadow = Look.contact(Look.BODY * 0.52)
	_shadow.position = Vector2(Look.BODY * Look.SHADOW_EAST, 6)
	_shadow.modulate = Color(1, 1, 1, 0.90)
	add_child(_shadow)
	_glow = Look.ping_glow(88)
	_glow.visible = false
	_glow.position = Vector2(0, -8)
	add_child(_glow)
	_sprite = Sprite2D.new()
	_sprite.centered = true
	_sprite.offset = Vector2.ZERO
	_sprite.material = Look.person_mat()
	_sprite.texture_filter = TEXTURE_FILTER_LINEAR
	add_child(_sprite)
	_lamp = Sprite2D.new()
	_lamp.name = "LampStick"
	_lamp.centered = true
	_lamp.visible = false
	add_child(_lamp)
	var layer := CanvasLayer.new()
	layer.layer = 8
	add_child(layer)
	_name = Look.ink_label("", 16, Look.INK)
	_name.size = Vector2(72, 22)
	_name.visible = false
	_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	layer.add_child(_name)
	_bars()
	_apply()


func _bars() -> void:
	_bar_bg = Panel.new()
	_bar_bg.size = Vector2(64, 12)
	_bar_bg.position = Vector2(-32, 10)
	_bar_bg.add_theme_stylebox_override("panel", Look.paper_box())
	_bar_bg.visible = false
	add_child(_bar_bg)
	_bar_ok = ColorRect.new()
	_bar_ok.size = Vector2(64 * 0.34, 6)
	_bar_ok.position = Vector2(-32 + 64 * 0.38, 13)
	_bar_ok.color = Look.MOSS
	_bar_ok.visible = false
	add_child(_bar_ok)
	_bar_mark = ColorRect.new()
	_bar_mark.size = Vector2(2, 12)
	_bar_mark.position = Vector2(-32, 10)
	_bar_mark.color = Look.INK
	_bar_mark.visible = false
	add_child(_bar_mark)
	_bar_pull = ColorRect.new()
	_bar_pull.size = Vector2(2, 3)
	_bar_pull.position = Vector2(-32, 22)
	_bar_pull.color = Look.GOLD
	_bar_pull.visible = false
	add_child(_bar_pull)


func apply(data: Dictionary, now: float) -> void:
	position = Vector2(float(data.get("x", 0)), float(data.get("y", 0)))
	var next_face := int(data.get("facing", 2))
	if next_face != facing:
		_stride = 0.0
	facing = next_face
	warm = str(data.get("side", "left")) != "right"
	ping = float(data.get("ping", 0))
	away = bool(data.get("away", false))
	busy = str(data.get("busy", ""))
	fishing = str(data.get("fishing", "off"))
	fish_mark = float(data.get("fishMark", 0))
	fish_pull = float(data.get("fishPull", 0))
	_place = str(data.get("zone", ""))
	var held := str(data.get("held", "")).split(":")[0]
	var has := bool(data.get("torch", false)) or held == "torch"
	_torch = has and _place != "kitchen" and _place != "mine"
	_mine = bool(data.get("mine", false)) or (actor_id != "" and actor_id == str(Net.you_id))
	if _mine:
		_name.text = ""
	else:
		_name.text = str(data.get("name", ""))
	z_index = 20 + int(position.y / 8.0)
	_t = now
	_place_name()
	_apply()


func _process(dt: float) -> void:
	var want_sit := busy == "sit"
	_sit = move_toward(_sit, 1.0 if want_sit else 0.0, dt / 0.22)
	if _want_move and not want_sit:
		moving = true
		_coast = 0.10
	else:
		_coast = max(_coast - dt, 0.0)
		if _coast <= 0.0 or want_sit:
			moving = false
	var can_walk := moving and not want_sit and _sit < 0.2
	if can_walk:
		if not _was_moving:
			_stride = 0.0
		_stride += minf(dt, 0.05)
	_was_moving = can_walk
	_place_name()
	_apply()


func _place_name() -> void:
	if _name == null:
		return
	# Your name stays off. Mate ink sits Look.BODY - 28 above the feet, in screen space.
	if _mine or _name.text == "" or (actor_id != "" and actor_id == str(Net.you_id)):
		_name.visible = false
		return
	var p := get_global_transform_with_canvas().origin
	var zoom := 1.0
	var cam := get_viewport().get_camera_2d()
	if cam:
		zoom = maxf(cam.zoom.y, 0.01)
	var lift := (Look.BODY - 28) * zoom
	_name.position = Vector2(p.x - 36, p.y - lift - 28.0 * zoom - 12.0 + Look.BODY * 0.10 * _sit * zoom)
	_name.visible = _name.text != "" and not _mine


func set_moving(v: bool) -> void:
	_want_move = v
	if v:
		moving = true
		_coast = 0.10
	_apply()


func _sit_lamp() -> void:
	if _lamp == null:
		return
	# Held light stays in the snap. Do not hang a torch sticker.
	_lamp.visible = false


func _tex(path: String) -> Texture2D:
	return load("res://assets/art/%s" % path) as Texture2D


func _walk_beat() -> int:
	return int(floor(_stride / 0.18)) % 4


func _walk_tex(w: String, face: String) -> Texture2D:
	# Four beats on the existing sheets: walk, stand, walk2, stand.
	var beat := _walk_beat()
	if beat == 0:
		return _tex("char-%s-%swalk.png" % [w, face])
	if beat == 2:
		return _tex("char-%s-%swalk2.png" % [w, face])
	if face == "side-":
		return _tex("char-%s-side.png" % w)
	if face == "back-":
		return _tex("char-%s-back.png" % w)
	return _tex("char-%s.png" % w)


func _sheet() -> Texture2D:
	var w := "warm" if warm else "pine"
	if _sit > 0.45:
		return _tex("char-%s-sit.png" % w)
	if busy == "fish":
		return _tex("char-%s-fish.png" % w)
	if busy == "chop":
		return _tex("char-%s-chop.png" % w)
	if busy == "forge":
		return _tex("char-%s-forge.png" % w)
	if facing == 0:
		if not moving:
			return _tex("char-%s-back.png" % w)
		return _walk_tex(w, "back-")
	if facing == 1 or facing == 3:
		if not moving:
			return _tex("char-%s-side.png" % w)
		return _walk_tex(w, "side-")
	if not moving:
		return _tex("char-%s.png" % w)
	return _walk_tex(w, "")


func _apply() -> void:
	if _sprite == null:
		return
	_sprite.texture = _sheet()
	var tex := _sprite.texture
	if tex:
		var s := Look.BODY / float(tex.get_height())
		_sprite.scale = Vector2(s, s)
		var plant := -Look.BODY * (Look.FOOT - 0.5)
		var drop := Look.BODY * 0.035 * _sit
		var bob := 0.0
		if moving and _sit < 0.2:
			var phase := _stride / 0.18
			phase = phase - floor(phase / 4.0) * 4.0
			var lift := 0.0
			if phase >= 1.0 and phase < 2.0:
				lift = sin((phase - 1.0) * PI)
			elif phase >= 3.0:
				lift = sin((phase - 3.0) * PI)
			bob = -lift * 6.0
		_sprite.position = Vector2(0.0, plant + drop + bob)
	_sprite.flip_h = facing == 3
	_sit_lamp()
	modulate = Color(0.70, 0.64, 0.56) if away else Color(1, 1, 1)
	if _glow:
		var lit := ping > 0.04
		_glow.visible = lit
		if lit:
			var pulse := clampf(ping / 1.6, 0.0, 1.0)
			_glow.modulate = Color(1.0, 0.94, 0.82, 0.22 + pulse * 0.42)
			var grow := 0.85 + (1.0 - pulse) * 0.55
			_glow.scale = Vector2(grow, grow * 0.72)
	if _shadow:
		_shadow.position = Vector2(Look.BODY * Look.SHADOW_EAST, 6)
		_shadow.modulate.a = 0.90
	var fight := fishing == "fight" and busy != "sit"
	if _bar_bg:
		_bar_bg.visible = fight
		_bar_ok.visible = fight
		_bar_mark.visible = fight
		_bar_pull.visible = fight
		if fight:
			var mark := clampf(fish_mark, 0.0, 1.0)
			var green := mark > 0.38 and mark < 0.72
			_bar_ok.color = Color(0.38, 0.62, 0.48, 1.0) if green else Look.MOSS
			_bar_mark.position.x = -32 + 64.0 * mark - 1.0
			_bar_pull.size.x = 64.0 * clampf(fish_pull, 0.0, 1.0)
