class_name ValleyLogic
extends Node2D

## Collision / plots only. Not the look.

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

const SIZE_PX := Vector2(34 * TILE, 17 * TILE)

var _crops: Node2D


func _ready() -> void:
	if _crops == null:
		_crops = Node2D.new()
		_crops.z_index = 6
		add_child(_crops)


func size_px() -> Vector2:
	return SIZE_PX


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


func _tex(name: String) -> Texture2D:
	return load("res://assets/art/%s" % name) as Texture2D
