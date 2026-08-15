class_name ValleyMap
extends Node2D

## One painted floor. Houses sit in it. No per-tile wallpaper.

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
	"#~~~~D~~~~~~D~~~~~~~~~~~~~~~~~~~~#",
	"#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
	"#................................#",
	"#......SS....GG....BB....YY......#",
	"#......S.................Y.....O.#",
	"#..............................V.#",
	"##################################",
]


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_paint()


func size_px() -> Vector2:
	return Vector2(ROWS[0].length() * TILE, ROWS.size() * TILE)


func _tex(name: String) -> Texture2D:
	return load("res://assets/art/%s" % name) as Texture2D


func _paint() -> void:
	var sz := size_px()
	var bed := Polygon2D.new()
	bed.color = Color(0.36, 0.22, 0.11)
	bed.polygon = PackedVector2Array([
		Vector2(-900, -900),
		Vector2(sz.x + 900, -900),
		Vector2(sz.x + 900, sz.y + 900),
		Vector2(-900, sz.y + 900),
	])
	bed.z_index = -2
	add_child(bed)
	var ground := Sprite2D.new()
	ground.texture = _tex("ground-valley.png")
	ground.centered = false
	ground.position = Vector2(-80, -80)
	ground.texture_filter = TEXTURE_FILTER_LINEAR
	var tex := ground.texture
	if tex:
		ground.scale = Vector2((sz.x + 160.0) / float(tex.get_width()), (sz.y + 160.0) / float(tex.get_height()))
	ground.z_index = 0
	ground.material = Look.dusk_mat(0.0)
	add_child(ground)
	_houses()
	_trees()
	_docks()
	_bits()


func _prop(name: String, gx: float, gy: float, w: float, h: float, z: int, fog := 0.03) -> void:
	add_child(Look.hung(_tex(name), Vector2(gx * TILE, gy * TILE), Vector2(w, h), z, fog))


func _houses() -> void:
	_prop("prop-cabin.png", 4.2, 2.4, 168, 148, 8, 0.04)
	_prop("prop-inn.png", 17.6, 2.1, 200, 168, 8, 0.04)
	_prop("prop-mine.png", 8.4, 0.6, 92, 78, 6, 0.12)


func _trees() -> void:
	var kinds: Array[String] = ["prop-tree.png", "prop-tree-wide.png", "prop-tree-tall.png", "prop-pine.png"]
	var h := ROWS.size()
	var w := ROWS[0].length()
	for y in h:
		for x in w:
			if ROWS[y][x] != "T":
				continue
			if (x + y * 3) % 3 != 0:
				continue
			var name: String = kinds[(x * 7 + y * 13) % kinds.size()]
			_prop(name, x - 0.8, y - 2.4, 72, 96, 10 + y, 0.10 + float(y) * 0.008)


func _docks() -> void:
	_prop("prop-dock.png", 4.2, 9.15, 56, 40, 4, 0.06)
	_prop("prop-dock-b.png", 11.2, 9.15, 56, 40, 4, 0.06)


func _bits() -> void:
	_prop("prop-stall.png", 6.4, 11.4, 64, 72, 7, 0.05)
	_prop("prop-altar.png", 12.2, 11.5, 52, 64, 7, 0.05)
	_prop("prop-board.png", 17.2, 11.5, 52, 64, 7, 0.05)
	_prop("prop-anvil.png", 21.4, 11.4, 56, 64, 7, 0.05)
	_prop("prop-gate.png", 30.2, 13.2, 48, 56, 7, 0.08)
	_prop("prop-tree-gold.png", 29.4, 12.2, 64, 80, 9, 0.08)
	_prop("prop-bush.png", 16.6, 2.8, 40, 36, 5, 0.10)
	_prop("prop-bush.png", 18.2, 3.1, 36, 32, 5, 0.10)
