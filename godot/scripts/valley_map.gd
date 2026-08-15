class_name ValleyMap
extends Node2D

## One painted floor. Grass, path, and creek are one sheet.

const TILE := 36

const ROWS: PackedStringArray = [
	"##################################",
	"#TTTT..........TTTTTTTT..........#",
	"#TTTT...EE.....TTFFTTTT..........#",
	"#.......EE........FF.............#",
	"#................................#",
	"#....CCCC..........NNNN..........#",
	"#....C..C...PPPP...N..N..........#",
	"#....C..A...PPPP...N..I..........#",
	"#...........PPPP.................#",
	"#....,,,,,,,,,,,,,,,,,,,,,.......#",
	"#~~~~D~~~~~~D~~~~~~~~~~~~~~~~~,,~#",
	"#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~,,~#",
	"#................................#",
	"#......SS....GG....BB....YY......#",
	"#......S.................Y.....O.#",
	"#..............................V.#",
	"##################################",
]


var _crops: Node2D


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_crops = Node2D.new()
	_crops.z_index = 6
	add_child(_crops)
	_paint()


func show_crops(plots: Array) -> void:
	if _crops == null:
		_crops = Node2D.new()
		_crops.z_index = 6
		add_child(_crops)
	for child in _crops.get_children():
		child.queue_free()
	var i := 0
	for y in ROWS.size():
		var row := ROWS[y]
		for x in row.length():
			if row[x] != "P":
				continue
			var plot: Dictionary = {}
			if i < plots.size() and typeof(plots[i]) == TYPE_DICTIONARY:
				plot = plots[i]
			i += 1
			var seed := str(plot.get("seed", ""))
			var stage := int(plot.get("stage", 0))
			if seed == "" and stage <= 0:
				continue
			_crops.add_child(_crop_at(x, y, seed, stage))


func _crop_at(x: int, y: int, seed: String, stage: int) -> Node2D:
	var ripe := stage >= 3
	var mid := stage == 2
	var name := "prop-bush.png" if mid or ripe else "prop-tuft.png"
	var w := 32.0 if ripe else (26.0 if mid else 18.0)
	var h := 30.0 if ripe else (24.0 if mid else 16.0)
	var n := Look.hung(_tex(name), Vector2(float(x) * TILE + (TILE - w) * 0.5, float(y) * TILE + TILE - h * 0.88), Vector2(w, h), 6 + y, 0.04, 0.92)
	if seed.find("tomato") >= 0:
		n.modulate = Color(0.90, 0.52, 0.36) if ripe else Color(0.62, 0.58, 0.36)
	elif seed.find("wheat") >= 0:
		n.modulate = Color(0.86, 0.72, 0.38)
	elif seed.find("greens") >= 0:
		n.modulate = Color(0.40, 0.60, 0.36)
	else:
		n.modulate = Color(0.58, 0.62, 0.38)
	return n


func size_px() -> Vector2:
	return Vector2(ROWS[0].length() * TILE, ROWS.size() * TILE)


func _tex(name: String) -> Texture2D:
	return load("res://assets/art/%s" % name) as Texture2D


func _paint() -> void:
	# People, two houses, land, creek. Cover trees, lamps, shore.
	var sz := size_px()
	var pad := 420.0
	var sheet := _tex("ground-valley.png")
	var bed := Sprite2D.new()
	bed.texture = sheet
	bed.centered = false
	bed.position = Vector2(-pad, -pad)
	bed.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	if sheet:
		bed.scale = Vector2((sz.x + pad * 2.0) / float(sheet.get_width()), (sz.y + pad * 2.0) / float(sheet.get_height()))
	bed.z_index = -2
	bed.modulate = Color(1, 1, 1)
	add_child(bed)
	_land()
	_houses()
	_ridge()
	_shore()
	_bits()


func _prop(name: String, gx: float, gy: float, w: float, h: float, z: int, fog := 0.03, sit := 0.97) -> void:
	add_child(Look.hung(_tex(name), Vector2(gx * TILE, gy * TILE), Vector2(w, h), z, fog, sit))


func _bend(gx: float, kind: String) -> float:
	var fx := clampf((gx * TILE) / 1224.0, 0.0, 1.0)
	var path_y := 308.0 + fx * 82.0 + 15.0 * sin(fx * 1.7 * PI)
	if kind == "path":
		return path_y / TILE
	var raw := 420.0 + 75.0 * sin(fx * 2.0 * PI)
	return maxf(raw, path_y + 26.0) / TILE


func _land() -> void:
	var tex := _tex("floor-valley.png")
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.position = Vector2(-48, -48)
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	s.z_index = 1
	s.material = Look.prop_mat(0.0)
	add_child(s)


func _houses() -> void:
	_prop("prop-hut.png", 4.55, 4.72, 176, 132, 8, 0.03, 0.93)
	_prop("prop-lodge.png", 16.20, 3.85, 220, 168, 8, 0.03, 0.93)


func _hang(name: String, gx: float, gy: float, w: float, h: float, z: int, fog := 0.02) -> void:
	var s := Sprite2D.new()
	var tex := _tex(name)
	s.texture = tex
	s.centered = false
	s.position = Vector2(gx * TILE, gy * TILE)
	s.z_index = z
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	if tex:
		s.scale = Vector2(w / float(tex.get_width()), h / float(tex.get_height()))
	s.material = Look.prop_mat(fog)
	add_child(s)


func _ridge() -> void:
	# Cover trees from the same painting. Few and large. No pixel balls.
	_prop("prop-cover-tree.png", 0.35, 1.55, 148, 208, 6, 0.04, 0.94)
	_prop("prop-cover-tree.png", 1.85, 3.45, 142, 198, 7, 0.03, 0.94)
	_prop("prop-cover-tree-b.png", 21.55, 2.55, 158, 196, 7, 0.03, 0.93)
	_prop("prop-cover-tree.png", 22.60, 1.15, 136, 188, 6, 0.04, 0.94)


func _shore() -> void:
	# Cover bank on the land lip. Not water stamps on the creek sheet.
	_prop("prop-cover-verge.png", 8.80, _bend(8.80, "creek") - 1.58, 88, 40, 3, 0.03, 0.88)
	_prop("prop-cover-shore.png", 22.40, _bend(22.40, "creek") - 1.62, 80, 42, 4, 0.03, 0.90)
	_prop("prop-cover-verge.png", 14.40, _bend(14.40, "path") - 0.22, 96, 44, 3, 0.03, 0.88)
	_prop("prop-cover-verge.png", 21.10, _bend(21.10, "path") - 0.18, 90, 42, 3, 0.03, 0.88)


func _docks() -> void:
	# hung() puts the node at the sprite top. Deck sits ~0.74 down the 36px dock.
	# Docks stay off the valley. Creek is the floor sheet.
	pass


func _bits() -> void:
	# Cover lamps on the two cover roofs. No stall, no anvil.
	_hang("prop-cover-lamp.png", 6.82, 6.52, 38, 50, 11, 0.02)
	_hang("prop-cover-lamp.png", 17.18, 5.12, 42, 54, 11, 0.02)
