class_name ActorView
extends Node2D

## 暖 / 松 — one pair, one light. Feet on the ground.

var actor_id := ""
var warm := true
var facing := 2
var moving := false
var ping := 0.0
var busy := ""
var fishing := "off"
var fish_mark := 0.0
var fish_pull := 0.0
var _t := 0.0
var _sprite: Sprite2D
var _shadow: Sprite2D
var _name: Label
var _bar_bg: Panel
var _bar_ok: ColorRect
var _bar_mark: ColorRect


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_shadow = Look.contact(36)
	_shadow.position = Vector2(0, 4)
	add_child(_shadow)
	_sprite = Sprite2D.new()
	_sprite.centered = true
	_sprite.offset = Vector2(0, -28)
	_sprite.material = Look.dusk_mat(0.04)
	_sprite.texture_filter = TEXTURE_FILTER_LINEAR
	add_child(_sprite)
	_name = Look.ink_label("", 13, Look.PAPER)
	_name.position = Vector2(-36, -78)
	_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_name.custom_minimum_size = Vector2(72, 18)
	add_child(_name)
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
	_bar_ok.color = Color(0.42, 0.36, 0.22, 0.9)
	_bar_ok.visible = false
	add_child(_bar_ok)
	_bar_mark = ColorRect.new()
	_bar_mark.size = Vector2(2, 12)
	_bar_mark.position = Vector2(-32, 10)
	_bar_mark.color = Look.INK
	_bar_mark.visible = false
	add_child(_bar_mark)


func apply(data: Dictionary, now: float) -> void:
	position = Vector2(float(data.get("x", 0)), float(data.get("y", 0)))
	facing = int(data.get("facing", 2))
	warm = str(data.get("side", "left")) != "right"
	ping = float(data.get("ping", 0))
	busy = str(data.get("busy", ""))
	fishing = str(data.get("fishing", "off"))
	fish_mark = float(data.get("fishMark", 0))
	fish_pull = float(data.get("fishPull", 0))
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
	var w := "warm" if warm else "pine"
	if busy == "fish":
		return _tex("char-%s-fish.png" % w)
	if busy == "chop":
		return _tex("char-%s-chop.png" % w)
	if busy == "forge":
		return _tex("char-%s-forge.png" % w)
	if busy == "sit":
		return _tex("char-%s-sit.png" % w)
	var step := int(_t / 0.21) % 2 == 0
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
		var h := 48.0
		var s := h / float(tex.get_height())
		_sprite.scale = Vector2(s, s)
	_sprite.flip_h = facing == 3
	if _shadow:
		_shadow.modulate.a = 1.0
	var fight := fishing == "fight"
	if _bar_bg:
		_bar_bg.visible = fight
		_bar_ok.visible = fight
		_bar_mark.visible = fight
		if fight:
			_bar_mark.position.x = -32 + 64.0 * clampf(fish_mark, 0.0, 1.0) - 1.0
