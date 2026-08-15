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
	var pad := 420.0
	var sheet := _tex("ground-valley.png")
	var bed := Sprite2D.new()
	bed.texture = sheet
	bed.centered = false
	bed.position = Vector2(-pad, -pad)
	bed.texture_filter = TEXTURE_FILTER_LINEAR
	if sheet:
		bed.scale = Vector2((sz.x + pad * 2.0) / float(sheet.get_width()), (sz.y + pad * 2.0) / float(sheet.get_height()))
	bed.z_index = -2
	bed.modulate = Color(0.90, 0.80, 0.64)
	add_child(bed)
	var ground := Sprite2D.new()
	ground.texture = sheet
	ground.centered = false
	ground.position = Vector2(-80, -80)
	ground.texture_filter = TEXTURE_FILTER_LINEAR
	if sheet:
		ground.scale = Vector2((sz.x + 160.0) / float(sheet.get_width()), (sz.y + 160.0) / float(sheet.get_height()))
	ground.z_index = 0
	ground.material = Look.prop_mat(0.0)
	add_child(ground)
	_verge()
	_houses()
	_trees()
	_grove()
	_docks()
	_bits()


func _prop(name: String, gx: float, gy: float, w: float, h: float, z: int, fog := 0.03, sit := 0.97) -> void:
	add_child(Look.hung(_tex(name), Vector2(gx * TILE, gy * TILE), Vector2(w, h), z, fog, sit))


func _sheet(name: String, gx: float, gy: float, w: float, h: float, z: int) -> void:
	var tex := _tex(name)
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.position = Vector2(gx * TILE, gy * TILE)
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	if tex:
		s.scale = Vector2(w / float(tex.get_width()), h / float(tex.get_height()))
	s.z_index = z
	s.material = Look.prop_mat(0.02)
	add_child(s)


func _verge() -> void:
	_sheet("prop-verge.png", -0.2, 3.1, 156, 430, 1)
	_sheet("prop-verge.png", 0.6, 8.4, 132, 280, 1)


func _houses() -> void:
	_prop("prop-hut.png", 5.0, 4.55, 148, 108, 8, 0.03, 0.93)
	_prop("prop-lodge.png", 16.9, 4.35, 168, 116, 8, 0.03, 0.93)
	_prop("prop-mine.png", 8.4, 0.6, 92, 78, 6, 0.12, 0.94)


func _grove() -> void:
	_prop("prop-tree-tall.png", 0.05, 3.4, 72, 102, 12, 0.10, 0.96)
	_prop("prop-tree.png", 0.20, 5.7, 80, 106, 14, 0.10, 0.96)
	_prop("prop-pine.png", -0.10, 8.1, 66, 98, 16, 0.10, 0.96)
	_prop("prop-tree-wide.png", 0.15, 10.5, 84, 102, 18, 0.10, 0.96)
	_prop("prop-tree.png", 0.85, 12.8, 70, 94, 20, 0.10, 0.96)
	_prop("prop-pine.png", 2.35, 6.6, 58, 86, 13, 0.10, 0.96)
	_prop("prop-bush.png", 1.55, 4.5, 40, 34, 5, 0.08, 0.88)
	_prop("prop-bush.png", 2.45, 7.0, 38, 32, 5, 0.08, 0.88)
	_prop("prop-bush.png", 1.70, 9.3, 40, 34, 5, 0.08, 0.88)
	_prop("prop-bush.png", 2.90, 11.6, 36, 32, 5, 0.08, 0.88)
	_prop("prop-tuft.png", 2.70, 5.1, 28, 24, 4, 0.06, 0.86)
	_prop("prop-tuft.png", 1.35, 7.7, 26, 22, 4, 0.06, 0.86)
	_prop("prop-tuft.png", 3.10, 8.6, 26, 22, 4, 0.06, 0.86)
	_prop("prop-tuft.png", 2.40, 10.9, 28, 24, 4, 0.06, 0.86)
	_prop("prop-tuft.png", 3.30, 13.5, 26, 22, 4, 0.06, 0.86)
	_prop("prop-rock.png", 1.15, 3.9, 34, 30, 6, 0.08, 0.90)
	_prop("prop-rock.png", 2.05, 13.1, 36, 32, 6, 0.08, 0.90)


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
			_prop(name, x - 0.8, y - 2.4, 72, 96, 10 + y, 0.10 + float(y) * 0.008, 0.96)


func _docks() -> void:
	_prop("prop-dock.png", 4.2, 9.25, 56, 36, 4, 0.06, 0.98)
	_prop("prop-dock-b.png", 11.2, 9.25, 56, 36, 4, 0.06, 0.98)


func _bits() -> void:
	_prop("prop-stall.png", 6.4, 11.55, 64, 68, 7, 0.05, 0.98)
	_prop("prop-altar.png", 12.2, 11.65, 52, 58, 7, 0.05, 0.98)
	_prop("prop-board.png", 17.2, 11.65, 52, 60, 7, 0.05, 0.98)
	_prop("prop-anvil.png", 21.4, 11.55, 56, 60, 7, 0.05, 0.98)
	_prop("prop-gate.png", 30.2, 13.2, 48, 56, 7, 0.08, 0.94)
	_prop("prop-tree-gold.png", 29.4, 12.2, 64, 80, 9, 0.08, 0.96)
	_prop("prop-bush.png", 16.6, 2.8, 40, 36, 5, 0.10, 0.88)
	_prop("prop-bush.png", 18.2, 3.1, 36, 32, 5, 0.10, 0.88)
