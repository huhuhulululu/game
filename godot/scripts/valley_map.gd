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
	bed.modulate = Color(1.02, 0.76, 0.50)
	add_child(bed)
	var ground := Sprite2D.new()
	ground.texture = sheet
	ground.centered = false
	ground.position = Vector2(-80, -80)
	ground.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	if sheet:
		ground.scale = Vector2((sz.x + 160.0) / float(sheet.get_width()), (sz.y + 160.0) / float(sheet.get_height()))
	ground.z_index = 0
	ground.material = Look.prop_mat(0.0)
	add_child(ground)
	_land()
	_houses()
	_ridge()
	_shore()
	_docks()
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
	_prop("prop-mine.png", 8.15, 2.72, 136, 112, 6, 0.08, 0.95)


func _ridge() -> void:
	var kinds: Array[String] = ["prop-tree.png", "prop-tree-wide.png"]
	# Crowns sit in the spawn frame, behind the cottages — not a fringe above y=0.
	var north: Array[Vector2] = [
		Vector2(1.4, 3.55), Vector2(4.8, 3.35), Vector2(8.6, 3.50),
		Vector2(12.4, 3.40), Vector2(16.0, 3.55), Vector2(20.2, 3.30),
		Vector2(23.6, 3.60), Vector2(27.8, 3.45), Vector2(30.6, 3.70),
	]
	for i in north.size():
		var p: Vector2 = north[i]
		_prop(kinds[i % kinds.size()], p.x, p.y, 74, 98, 5, 0.10, 0.96)
	var walls: Array[Vector2] = [
		Vector2(0.5, 6.5), Vector2(0.9, 9.4),
		Vector2(23.2, 10.35),
		Vector2(27.4, 6.9), Vector2(29.2, 9.1), Vector2(26.6, 12.0),
	]
	for i in walls.size():
		var p: Vector2 = walls[i]
		_prop(kinds[(i + 2) % kinds.size()], p.x, p.y, 70, 94, 12 + int(p.y), 0.10, 0.96)
	_prop("prop-bush.png", 6.8, 4.15, 38, 32, 5, 0.08, 0.88)
	_prop("prop-bush.png", 12.8, 4.20, 36, 32, 5, 0.08, 0.88)
	_prop("prop-bush.png", 20.6, 4.05, 38, 32, 5, 0.08, 0.88)


func _shore() -> void:
	for i in 8:
		var x := 2.4 + float(i) * 3.4
		_prop("prop-tuft.png", x, _bend(x, "creek") - 0.42 + float(i % 2) * 0.14, 26, 22, 4, 0.06, 0.86)
	_prop("prop-rock.png", 7.6, _bend(7.6, "creek") - 0.20, 32, 28, 6, 0.08, 0.90)
	_prop("prop-rock.png", 19.8, _bend(19.8, "creek") - 0.18, 30, 26, 6, 0.08, 0.90)
	_prop("prop-tuft.png", 10.4, _bend(10.4, "path") - 0.20, 24, 20, 4, 0.06, 0.86)
	_prop("prop-tuft.png", 14.8, _bend(14.8, "path") + 0.18, 26, 22, 4, 0.06, 0.86)
	_prop("prop-tuft.png", 20.2, _bend(20.2, "path") - 0.12, 24, 20, 4, 0.06, 0.86)


func _docks() -> void:
	# hung() puts the node at the sprite top. Deck sits ~0.74 down the 36px dock.
	_prop("prop-dock.png", 4.2, _bend(4.2, "creek") - 0.82, 56, 36, 4, 0.06, 0.98)
	_prop("prop-dock-b.png", 11.2, _bend(11.2, "creek") - 0.82, 56, 36, 4, 0.06, 0.98)


func _bits() -> void:
	_prop("prop-stall.png", 6.15, 11.18, 96, 90, 7, 0.05, 0.96)
	_prop("prop-altar.png", 12.2, 11.65, 52, 58, 7, 0.05, 0.98)
	_prop("prop-board.png", 17.2, 11.55, 58, 68, 7, 0.05, 0.96)
	_prop("prop-anvil.png", 21.4, 11.55, 56, 60, 7, 0.05, 0.98)
	_prop("prop-gate.png", 30.2, 13.2, 48, 56, 7, 0.08, 0.94)
	_prop("prop-tree.png", 29.4, 12.2, 70, 94, 9, 0.08, 0.96)
	_prop("prop-bush.png", 16.6, 4.9, 40, 36, 5, 0.10, 0.88)
	_prop("prop-bush.png", 18.4, 5.1, 36, 32, 5, 0.10, 0.88)
