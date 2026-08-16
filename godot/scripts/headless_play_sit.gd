extends Node

## Play.tscn sits the idle tan coat. A smear is not shipped.

const YOU := "p1"
const MATE := "p2"
const FAIL := [
	"prop-cover-tree",
	"prop-cover-tree-b",
	"prop-cover-lamp",
	"prop-cover-shore",
	"prop-cover-verge",
	"prop-hut",
	"prop-lodge",
]
const TORN := [
	"prop-hole.png",
	"prop-silk.png",
	"prop-torch.png",
	"prop-camp-pot.png",
	"prop-smith.png",
	"prop-booth.png",
	"prop-beast.png",
]


var play: Node2D
var started := false


func _ready() -> void:
	play = preload("res://scenes/play.tscn").instantiate() as Node2D
	add_child(play)


func _process(_dt: float) -> void:
	if started:
		return
	if play == null or play.get("_valley") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not _assert_sheets():
		get_tree().quit(1)
		return
	if not await _assert_sit():
		get_tree().quit(1)
		return
	print("PLAY_SIT_OK")
	get_tree().quit(0)


func _you(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 290.0,
		"y": 342.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "",
		"ping": 0.0,
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _mate(extra: Dictionary) -> Dictionary:
	var row := _you({
		"id": MATE,
		"name": "松",
		"side": "right",
		"x": 348.0,
	})
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _snap(extra: Dictionary) -> Dictionary:
	var row := {
		"you": YOU,
		"room": "TEST",
		"day": 0,
		"gold": 20,
		"season": "春",
		"night": false,
		"dusk": true,
		"lit": true,
		"rush": false,
		"floor": 0,
		"biome": "",
		"zone": "valley",
		"tiles": [],
		"actors": [_you({}), _mate({})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "",
		"bag": [{"id": "wood", "n": 1, "name": "青木"}],
		"ice": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": [],
		"plots": [],
		"enemies": [],
		"revealed": [],
		"visible": [],
		"fires": [],
		"board": [],
		"fortune": {},
		"partner": {},
		"partnerAt": {},
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _feed(s: Dictionary) -> void:
	play.call("_on_snap", s)
	await get_tree().process_frame
	await get_tree().process_frame


func _png(name: String) -> Image:
	var path := "res://assets/art/" + name
	var tex := load(path) as Texture2D
	if tex != null:
		var from_tex := tex.get_image()
		if from_tex != null:
			return from_tex
	return Image.load_from_file(path)


func _has_tex(n: Node, needle: String) -> bool:
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex and str(tex.resource_path).find(needle) >= 0:
			return true
	for child in n.get_children():
		if _has_tex(child, needle):
			return true
	return false


func _no_fail(n: Node) -> bool:
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex:
			var path := str(tex.resource_path)
			for bad in FAIL:
				if path.find(str(bad)) >= 0:
					printerr("FAIL_PROP ", path)
					return false
			for torn in TORN:
				if path.find(str(torn)) >= 0:
					printerr("HUNG_TORN ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _real_alpha(name: String) -> bool:
	var img := _png(name)
	if img == null:
		printerr("NO_SHEET ", name)
		return false
	if img.get_pixel(2, 2).a > 0.03 or img.get_pixel(img.get_width() - 3, 2).a > 0.03:
		printerr("SIT_PLATE ", name)
		return false
	if img.get_pixel(2, img.get_height() - 3).a > 0.03:
		printerr("SIT_PLATE_FOOT ", name)
		return false
	return true


func _no_slab(name: String) -> bool:
	var img := _png(name)
	if img == null:
		printerr("NO_SHEET ", name)
		return false
	var h := img.get_height()
	var w := img.get_width()
	var col := w - 8
	var n := 0
	var y := 0
	while y < h:
		if img.get_pixel(col, y).a > 0.08:
			n += 1
		y += 1
	if n > int(0.88 * float(h)):
		printerr("SIT_SLAB ", name, " ", n)
		return false
	return true


func _not_idle_copy(idle: Image, sit: Image) -> bool:
	var n := 0
	var y := 40
	while y < 200:
		var x := 100
		while x < 220:
			if abs(idle.get_pixel(x, y).a - sit.get_pixel(x, y).a) > 0.12:
				n += 1
			x += 3
		y += 3
	if n < 20:
		printerr("SIT_IS_IDLE")
		return false
	return true


func _tan_coat(sit: Image) -> bool:
	var n := 0
	var y := 200
	while y < 360:
		var x := 90
		while x < 230:
			var p := sit.get_pixel(x, y)
			if p.a > 0.4 and p.r > 0.42 and p.g > 0.28 and p.b < 0.55:
				n += 1
			x += 3
		y += 3
	if n < 30:
		printerr("NO_TAN_COAT ", n)
		return false
	return true


func _assert_sheets() -> bool:
	var idle := _png("char-warm.png")
	var sit := _png("char-warm-sit.png")
	var pine := _png("char-pine-sit.png")
	if idle == null or sit == null or pine == null:
		printerr("NO_SHEET")
		return false
	if not _real_alpha("char-warm-sit.png"):
		return false
	if not _real_alpha("char-pine-sit.png"):
		return false
	if not _no_slab("char-warm-sit.png"):
		return false
	if not _no_slab("char-pine-sit.png"):
		return false
	if not _not_idle_copy(idle, sit):
		return false
	if not _tan_coat(sit):
		return false
	print("PLAY_SIT_WARM")
	print("PLAY_SIT_PINE")
	return true


func _body(id: String) -> Node2D:
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(id):
		return null
	return actors[id] as Node2D


func _sheet_file(id: String) -> String:
	var body := _body(id)
	if body == null:
		return ""
	var sprite: Sprite2D = body.get("_sprite") as Sprite2D
	if sprite == null or sprite.texture == null:
		return ""
	return str(sprite.texture.resource_path).get_file()


func _wait_sheet(id: String, name: String, limit: float) -> bool:
	var t := 0.0
	while t < limit:
		if _sheet_file(id) == name:
			return true
		await get_tree().process_frame
		t += get_process_delta_time()
	printerr("SHEET_WAIT ", id, " want ", name, " got ", _sheet_file(id))
	return false


func _assert_sit() -> bool:
	await _feed(_snap({
		"actors": [_you({"busy": "sit", "x": 338.0}), _mate({"busy": "sit", "x": 396.0})],
		"youAt": {"x": 338.0, "y": 342.0},
	}))
	await get_tree().create_timer(0.28).timeout
	if not await _wait_sheet(YOU, "char-warm-sit.png", 0.40):
		return false
	if not await _wait_sheet(MATE, "char-pine-sit.png", 0.40):
		return false
	var plaque: Panel = play.get("_plaque")
	if plaque == null or plaque.size.x > 280.0 or plaque.size.y > 80.0:
		printerr("PLAQUE_LOST")
		return false
	var bag: Node = play.get("_bag")
	if bag == null or bag.get_child_count() != 1:
		printerr("BAG_LOST")
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _no_fail(play):
		return false
	if Look.BODY < 180.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	return true
