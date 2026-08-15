class_name ActorView
extends Node2D

## 暖 / 松 use the painted stand-ins. No grey capsule.

var actor_id := ""
var warm := true
var facing := 2
var moving := false
var ping := 0.0
var _t := 0.0
var _sprite: Sprite2D
var _glow: Sprite2D
var _name: Label


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_glow = Sprite2D.new()
	var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
	for y in 64:
		for x in 64:
			var d := Vector2(x - 32, y - 32).length() / 32.0
			var a := clampf(1.0 - d, 0.0, 1.0)
			img.set_pixel(x, y, Color(0.956, 0.905, 0.823, a * a))
	_glow.texture = ImageTexture.create_from_image(img)
	_glow.modulate = Color(1, 1, 1, 0)
	_glow.scale = Vector2(1.4, 0.9)
	add_child(_glow)
	_sprite = Sprite2D.new()
	_sprite.centered = true
	_sprite.offset = Vector2(0, -28)
	add_child(_sprite)
	_name = Look.ink_label("", 13, Color(0.956, 0.905, 0.823))
	_name.position = Vector2(-28, -78)
	_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_name.custom_minimum_size = Vector2(56, 18)
	add_child(_name)
	_apply()


func apply(data: Dictionary, now: float) -> void:
	position = Vector2(float(data.get("x", 0)), float(data.get("y", 0)))
	facing = int(data.get("facing", 2))
	warm = str(data.get("side", "left")) != "right"
	ping = float(data.get("ping", 0))
	_name.text = str(data.get("name", ""))
	z_index = 20 + int(position.y / 8.0)
	_t = now
	_apply()


func set_moving(v: bool) -> void:
	moving = v
	_apply()


func _tex(path: String) -> Texture2D:
	return load("res://assets/art/%s" % path) as Texture2D


func _sheet() -> Texture2D:
	var step := int(_t / 0.21) % 2 == 0
	var w := "warm" if warm else "pine"
	if facing == 0:
		if not moving:
			return _tex("char-%s-back.png" % w)
		return _tex("char-%s-back-walk.png" % w) if step else _tex("char-%s-back-walk2.png" % w)
	if facing == 1 or facing == 3:
		if not moving:
			return _tex("char-%s-side.png" % w)
		return _tex("char-%s-side-walk.png" % w) if step else _tex("char-%s-side-walk2.png" % w)
	if not moving:
		return _tex("char-%s.png" % w)
	return _tex("char-%s-walk.png" % w) if step else _tex("char-%s-walk2.png" % w)


func _apply() -> void:
	if _sprite == null:
		return
	_sprite.texture = _sheet()
	var tex := _sprite.texture
	if tex:
		var h := 72.0
		var s := h / float(tex.get_height())
		_sprite.scale = Vector2(s, s)
	_sprite.flip_h = facing == 3
	if _glow and ping > 0.0:
		_glow.modulate.a = minf(0.45, ping * 0.28)
		_glow.scale = Vector2(0.28 + (1.6 - ping) * 0.08, 0.18 + (1.6 - ping) * 0.05)
	elif _glow:
		_glow.modulate.a = 0.0
