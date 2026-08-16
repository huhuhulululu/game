class_name ZoneMap
extends Node2D

## Indoor floors are one sheet, not a tile wallpaper.

const TILE := 36

var _sig := ""
var _w := 0
var _h := 0
var _zone := ""
var _fog: Sprite2D
var _glow: Node2D
var _fog_sig := ""
var _path_img: Image


func size_px() -> Vector2:
	return Vector2(max(_w, 1) * TILE, max(_h, 1) * TILE)


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
	_fog_sig = ""
	for child in get_children():
		remove_child(child)
		child.free()
	_fog = null
	_glow = null
	texture_filter = TEXTURE_FILTER_LINEAR
	_paint(zone, lines)
	_fog = Sprite2D.new()
	_fog.centered = false
	_fog.z_index = 28
	_fog.texture_filter = TEXTURE_FILTER_LINEAR
	add_child(_fog)
	_glow = Node2D.new()
	_glow.z_index = 8
	add_child(_glow)


func show_fog(revealed: Array, visible: Array, fires: Array) -> void:
	if _fog == null or _w <= 0:
		return
	var bits: PackedStringArray = []
	for k in revealed:
		bits.append(str(int(k)))
	bits.append("v")
	for k in visible:
		bits.append(str(int(k)))
	bits.append("f")
	for k in fires:
		bits.append(str(int(k)))
	var sig := "|".join(bits)
	if sig == _fog_sig:
		return
	_fog_sig = sig
	var seen := {}
	for k in revealed:
		seen[int(k)] = true
	var vis := {}
	for k in visible:
		vis[int(k)] = true
	# Unread wild is a heavier dusk wash. The painted bed stays. Not a black ring.
	var img := Image.create(_w, _h, false, Image.FORMAT_RGBA8)
	for y in _h:
		for x in _w:
			var key := y * _w + x
			if _zone != "wild":
				img.set_pixel(x, y, Color(0, 0, 0, 0))
			elif not seen.has(key):
				img.set_pixel(x, y, Look.PATH_UNREAD)
			elif not vis.has(key):
				img.set_pixel(x, y, Look.PATH_MEMORY)
			else:
				img.set_pixel(x, y, Color(0, 0, 0, 0))
	_path_img = img
	_fog.texture = ImageTexture.create_from_image(img)
	_fog.scale = Vector2(TILE, TILE)
	_paint_fires(fires)


func wash_at(x: int, y: int) -> Color:
	if _path_img == null or x < 0 or y < 0 or x >= _w or y >= _h:
		return Color(0, 0, 0, 0)
	return _path_img.get_pixel(x, y)


func _paint_fires(_fires: Array) -> void:
	if _glow == null:
		return
	for child in _glow.get_children():
		child.queue_free()
	# Lit fire stays in the snap. Do not hang a pot sticker.


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


func _wash(x: int, y: int, color: Color) -> void:
	var r := ColorRect.new()
	r.position = Vector2(x * TILE, y * TILE)
	r.size = Vector2(TILE + 1, TILE + 1)
	r.color = color
	r.z_index = 1
	add_child(r)


func _paint(zone: String, rows: PackedStringArray) -> void:
	var h := rows.size()
	var w := rows[0].length()
	_w = w
	_h = h
	_zone = zone
	if zone == "wild":
		_sit_wild_bed()
	elif zone == "kitchen":
		_sit_kitchen_bed()
	elif zone == "mine":
		_sit_mine_bed()
	else:
		_floor(_tex("tex-stone.png"), w, h)
	for y in h:
		var row := rows[y]
		for x in w:
			if x >= row.length():
				continue
			_bit(zone, row[x], x, y)


func _sit_wild_bed() -> void:
	_sit_bed("bed-wild.png", "WildBed")


func _sit_kitchen_bed() -> void:
	_sit_bed("bed-kitchen.png", "KitchenBed")


func _sit_mine_bed() -> void:
	_sit_bed("bed-mine.png", "MineBed")


func set_season(sea: String) -> void:
	if _zone != "wild":
		return
	var bed := get_node_or_null("WildBed") as Sprite2D
	if bed == null or bed.material != null:
		return
	# One dusk language. Winter cooler paper, summer warmer. Not four beds.
	bed.modulate = Look.season_paper(sea) if sea != "" else Color(1, 1, 1)


func set_mine_depth(floor: int) -> void:
	if _zone != "mine":
		return
	var bed := get_node_or_null("MineBed") as Sprite2D
	if bed == null or bed.material != null:
		return
	# One mine painting. Lower floors a deeper dusk. Not a new bed.
	bed.modulate = Look.mine_paper(floor)


func set_night(amount: float, shade := Look.NIGHT) -> void:
	var bed := get_node_or_null("WildBed") as Sprite2D
	if bed == null:
		return
	if amount <= 0.001:
		bed.material = null
		return
	var mat := Look.night_mat(shade)
	mat.set_shader_parameter("amount", clampf(amount, 0.0, 1.0))
	bed.material = mat


func set_rain(wet: bool) -> void:
	var rain := get_node_or_null("Rain") as Sprite2D
	if not wet or _zone != "wild":
		if rain:
			rain.visible = false
		return
	if rain == null:
		rain = Sprite2D.new()
		rain.name = "Rain"
		rain.centered = false
		rain.z_index = 16
		var img := Image.create(8, 8, false, Image.FORMAT_RGBA8)
		img.fill(Color(1, 1, 1, 1))
		rain.texture = ImageTexture.create_from_image(img)
		add_child(rain)
	var sz := size_px()
	rain.scale = Vector2(sz.x / 8.0, sz.y / 8.0)
	rain.material = Look.rain_mat()
	rain.visible = true


func set_fog(mist: bool) -> void:
	var fog := get_node_or_null("Fog") as Sprite2D
	if not mist or _zone != "wild":
		if fog:
			fog.visible = false
		return
	if fog == null:
		fog = Sprite2D.new()
		fog.name = "Fog"
		fog.centered = false
		fog.z_index = 15
		var img := Image.create(8, 8, false, Image.FORMAT_RGBA8)
		img.fill(Color(1, 1, 1, 1))
		fog.texture = ImageTexture.create_from_image(img)
		add_child(fog)
	var sz := size_px()
	fog.scale = Vector2(sz.x / 8.0, sz.y / 8.0)
	fog.material = Look.fog_mat()
	fog.visible = true


func _sit_bed(name: String, node: String) -> void:
	var tex := _tex(name)
	if tex == null:
		return
	var s := Sprite2D.new()
	s.name = node
	s.texture = tex
	s.centered = false
	s.z_index = 0
	s.texture_filter = TEXTURE_FILTER_LINEAR
	var sz := size_px()
	s.scale = Vector2(sz.x / float(tex.get_width()), sz.y / float(tex.get_height()))
	add_child(s)


func _wall(zone: String, x: int, y: int) -> void:
	var tex := _tex("tex-wood.png") if zone == "kitchen" else _tex("tex-stone.png")
	if tex == null:
		return
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.region_enabled = true
	var tw := maxi(1, tex.get_width() - int(TILE) - 1)
	var th := maxi(1, tex.get_height() - int(TILE) - 1)
	s.region_rect = Rect2((x * 19 + y * 7) % tw, (y * 13 + x * 5) % th, TILE + 1, TILE + 1)
	s.position = Vector2(x * TILE, y * TILE)
	s.texture_filter = TEXTURE_FILTER_LINEAR
	s.z_index = 2
	s.material = Look.dusk_mat(0.04)
	s.modulate = Color(0.62, 0.42, 0.26) if zone == "kitchen" else Color(0.40, 0.36, 0.32)
	add_child(s)


func _bit(zone: String, ch: String, x: int, y: int) -> void:
	if ch == "#":
		_wall(zone, x, y)
		return
	if zone == "kitchen" or zone == "mine":
		# Stations stay in the snap. Painted bed stays. Do not hang stickers.
		return
	if zone != "wild":
		return
	if ch == "~":
		_wash(x, y, Color(0.16, 0.42, 0.52, 0.72))
	elif ch == ",":
		_wash(x, y, Color(0.55, 0.42, 0.26, 0.55))
	elif ch == "m":
		_wash(x, y, Color(0.22, 0.32, 0.22, 0.55))
	elif ch == "s":
		_wash(x, y, Color(0.62, 0.52, 0.28, 0.28))
	if ch == "F":
		pass
	elif ch == "J":
		# Old camp is fire and rock. Search stays in the snap. Not a chest.
		pass
	elif ch == "t" or ch == "T":
		pass
