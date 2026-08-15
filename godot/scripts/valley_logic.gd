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
## Crop language stays on disk. Not drawn on the painted bed.
const CROP_YOUNG := "prop-tuft.png"
const CROP_RIPE := "prop-bush.png"

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
	# Walk plots so the API stays live. Do not hang tuft/bush sprites on the bed.
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
			var _seed := str(plot.get("seed", ""))
			var _stage := int(plot.get("stage", 0))
			if _seed == "" and _stage <= 0:
				continue
			# CROP_YOUNG / CROP_RIPE stay named. No sprite.
