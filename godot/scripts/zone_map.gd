class_name ZoneMap
extends Node2D

## Indoor floors are one sheet, not a tile wallpaper.

const TILE := 36

var _sig := ""


func show_map(zone: String, rows: Array) -> void:
	var lines: PackedStringArray = []
	for row in rows:
		lines.append(str(row))
	if lines.is_empty():
		return
	var sig := "%s\n%s" % [zone, "\n".join(lines)]
	if sig == _sig:
		return
	_sig = sig
	for child in get_children():
		child.queue_free()
	texture_filter = TEXTURE_FILTER_LINEAR
	_paint(zone, lines)


func _tex(name: String) -> Texture2D:
	return load("res://assets/art/%s" % name) as Texture2D


func _floor(tex: Texture2D, w: int, h: int) -> void:
	if tex == null:
		return
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.region_enabled = true
	s.region_rect = Rect2(0, 0, w * TILE, h * TILE)
	s.texture_repeat = TEXTURE_REPEAT_ENABLED
	s.texture_filter = TEXTURE_FILTER_LINEAR
	s.material = Look.dusk_mat(0.05)
	s.z_index = 0
	add_child(s)


func _prop(tex: Texture2D, gx: float, gy: float, w: float, h: float, z: int) -> void:
	if tex == null:
		return
	add_child(Look.hung(tex, Vector2(gx * TILE, gy * TILE), Vector2(w, h), z, 0.05))


func _paint(zone: String, rows: PackedStringArray) -> void:
	var floor := _tex("tex-wood.png") if zone == "kitchen" else _tex("tex-stone.png" if zone == "mine" else "tex-paper.png")
	var h := rows.size()
	var w := rows[0].length()
	_floor(floor, w, h)
	for y in h:
		for x in w:
			_bit(zone, rows[y][x], x, y)


func _bit(zone: String, ch: String, x: int, y: int) -> void:
	if zone == "kitchen":
		if ch == "C":
			_prop(_tex("prop-cut.png"), x - 0.15, y - 0.35, 42, 48, 6)
		elif ch == "U":
			_prop(_tex("prop-stove.png"), x - 0.1, y - 0.35, 40, 48, 6)
		elif ch == "Q":
			_prop(_tex("prop-pot.png"), x - 0.2, y - 0.45, 48, 52, 7)
		elif ch == "W":
			_prop(_tex("prop-pass.png"), x - 0.1, y - 0.4, 44, 52, 7)
		elif ch == "R":
			_prop(_tex("prop-icebox.png"), x - 0.15, y - 0.35, 44, 48, 6)
		elif ch == "X":
			_prop(_tex("prop-trash.png"), x - 0.05, y - 0.2, 36, 40, 5)
		elif ch == "L":
			_prop(_tex("prop-door-open.png"), x - 0.2, y - 0.55, 48, 56, 8)
		elif "123456".find(ch) >= 0:
			_prop(_tex("prop-pantry.png"), x - 0.1, y - 0.45, 40, 52, 6)
		return
	if zone == "mine":
		if ch == "o":
			_prop(_tex("prop-ore.png"), x - 0.1, y - 0.15, 40, 36, 5)
		elif ch == "Z":
			_prop(_tex("prop-stairs.png"), x - 0.1, y - 0.2, 40, 40, 5)
		elif ch == "Y":
			_prop(_tex("prop-ore.png"), x - 0.05, y - 0.1, 36, 34, 5)
		elif ch == "L":
			_prop(_tex("prop-door-open.png"), x - 0.2, y - 0.5, 46, 54, 8)
		return
	if ch == "D":
		_prop(_tex("prop-dock.png"), x - 0.2, y - 0.1, 48, 36, 4)
	elif ch == "t" or ch == "T":
		_prop(_tex("prop-tree.png"), x - 0.7, y - 2.1, 64, 88, 10)
	elif ch == "K":
		_prop(_tex("prop-fire.png"), x - 0.15, y - 0.25, 40, 40, 6)
