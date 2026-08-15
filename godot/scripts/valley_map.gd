class_name ValleyMap
extends Node2D

## Painted valley from the same map string. Tiles are sheets, not color blocks.

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
	texture_repeat = TEXTURE_REPEAT_ENABLED
	_paint()


func size_px() -> Vector2:
	return Vector2(ROWS[0].length() * TILE, ROWS.size() * TILE)


func _tex(name: String) -> Texture2D:
	return load("res://assets/art/%s" % name) as Texture2D


func _tile(tex: Texture2D, gx: int, gy: int, z: int = 0) -> void:
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.position = Vector2(gx * TILE, gy * TILE)
	s.region_enabled = true
	var tw := tex.get_width()
	var th := tex.get_height()
	s.region_rect = Rect2((gx * 47) % max(1, tw - TILE), (gy * 31) % max(1, th - TILE), TILE + 1, TILE + 1)
	s.z_index = z
	add_child(s)


func _prop(tex: Texture2D, gx: float, gy: float, w: float, h: float, z: int) -> void:
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.position = Vector2(gx * TILE, gy * TILE)
	var sx := w / float(tex.get_width())
	var sy := h / float(tex.get_height())
	s.scale = Vector2(sx, sy)
	s.z_index = z
	add_child(s)


func _paint() -> void:
	var grass := _tex("tex-grass.png")
	var path := _tex("tex-path.png")
	var water := _tex("tex-water.png")
	var w := ROWS[0].length()
	var h := ROWS.size()
	for y in h:
		for x in w:
			var ch := ROWS[y][x]
			if ch == "~" or ch == "D":
				_tile(water, x, y, 0)
			elif ch == "," or ch == "P":
				_tile(path, x, y, 0)
			else:
				_tile(grass, x, y, 0)
	_houses()
	_trees()
	_docks()
	_bits()


func _houses() -> void:
	_prop(_tex("prop-cabin.png"), 4.2, 2.4, 168, 148, 8)
	_prop(_tex("prop-inn.png"), 17.6, 2.1, 200, 168, 8)
	_prop(_tex("prop-mine.png"), 8.4, 0.6, 92, 78, 6)


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
			_prop(_tex(name), x - 0.8, y - 2.4, 72, 96, 10 + y)


func _docks() -> void:
	_prop(_tex("prop-dock.png"), 4.2, 9.15, 56, 40, 4)
	_prop(_tex("prop-dock-b.png"), 11.2, 9.15, 56, 40, 4)


func _bits() -> void:
	_prop(_tex("prop-stall.png"), 6.4, 11.4, 64, 72, 7)
	_prop(_tex("prop-altar.png"), 12.2, 11.5, 52, 64, 7)
	_prop(_tex("prop-board.png"), 17.2, 11.5, 52, 64, 7)
	_prop(_tex("prop-anvil.png"), 21.4, 11.4, 56, 64, 7)
	_prop(_tex("prop-gate.png"), 30.2, 13.2, 48, 56, 7)
	_prop(_tex("prop-tree-gold.png"), 29.4, 12.2, 64, 80, 9)
	_prop(_tex("prop-bush.png"), 16.6, 2.8, 40, 36, 5)
	_prop(_tex("prop-bush.png"), 18.2, 3.1, 36, 32, 5)
