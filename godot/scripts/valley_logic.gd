class_name ValleyLogic
extends Node2D

## Collision / plots / village marks. Not hung FAIL props.

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
## Crop language stays on disk. Valley sits sprout / ripe, not tuft mounds.
const CROP_YOUNG := "prop-tuft.png"
const CROP_RIPE := "prop-bush.png"
const PLOT_YOUNG := "prop-sprout.png"
const PLOT_RIPE := "prop-ripe.png"
const MARK_FORTUNE := "prop-fortune.png"
const MARK_DAWN := "prop-dawn.png"
const MARK_FORGE := "prop-smith.png"
const MARK_STALL := "prop-booth.png"

var _crops: Node2D
var _marks: Node2D


func _ready() -> void:
	if _crops == null:
		_crops = Node2D.new()
		_crops.name = "Crops"
		_crops.z_index = 6
		add_child(_crops)
	if _marks == null:
		_marks = Node2D.new()
		_marks.name = "Marks"
		_marks.z_index = 7
		add_child(_marks)
	_sit_marks()


func size_px() -> Vector2:
	return SIZE_PX


func show_crops(plots: Array) -> void:
	if _crops == null:
		_crops = Node2D.new()
		_crops.name = "Crops"
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
			var ripe := stage >= 3
			var _named := CROP_RIPE if ripe else CROP_YOUNG
			var sheet := PLOT_RIPE if ripe else PLOT_YOUNG
			if ripe:
				_sit_plot(_crops, sheet, x, y, 36, 34)
			else:
				_sit_plot(_crops, sheet, x, y, 30, 28)


func _sit_marks() -> void:
	for child in _marks.get_children():
		child.queue_free()
	var dawn := _first_tile("B")
	var fortune := _first_tile("G")
	var forge := _first_tile("Y")
	var stall := _first_tile("S")
	if dawn != Vector2i.ZERO:
		_sit_plot(_marks, MARK_DAWN, dawn.x, dawn.y, 56, 68)
	if fortune != Vector2i.ZERO:
		_sit_plot(_marks, MARK_FORTUNE, fortune.x, fortune.y, 64, 72)
	if forge != Vector2i.ZERO:
		_sit_plot(_marks, MARK_FORGE, forge.x, forge.y, 36, 32)
	if stall != Vector2i.ZERO:
		_sit_plot(_marks, MARK_STALL, stall.x, stall.y, 40, 42)


func _first_tile(ch: String) -> Vector2i:
	for y in ROWS.size():
		var row := ROWS[y]
		for x in row.length():
			if row[x] == ch:
				return Vector2i(x, y)
	return Vector2i.ZERO


func _sit_plot(into: Node2D, sheet: String, gx: int, gy: int, wide: float, tall: float) -> void:
	var tex := load("res://assets/art/%s" % sheet) as Texture2D
	if tex == null or into == null:
		return
	var n := Node2D.new()
	n.position = Vector2((gx + 0.5) * TILE - wide * 0.5, (gy + 0.94) * TILE - tall)
	n.z_index = 6
	var stain := Look.contact(wide * 0.92)
	stain.position = Vector2(wide * (0.50 + Look.SHADOW_EAST), tall * 0.92)
	n.add_child(stain)
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.texture_filter = TEXTURE_FILTER_LINEAR
	s.scale = Vector2(wide / float(tex.get_width()), tall / float(tex.get_height()))
	s.position = Vector2.ZERO
	n.add_child(s)
	into.add_child(n)
