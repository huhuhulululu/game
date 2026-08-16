extends Node

## Play.tscn walks the same tan coat, not a sliding idle stamp.

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
	if not await _assert_cycle():
		get_tree().quit(1)
		return
	print("PLAY_STEP_OK")
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


func _foot_diff(a: Image, b: Image) -> int:
	var n := 0
	var y := 420
	while y < 472:
		var x := 80
		while x < 250:
			if abs(a.get_pixel(x, y).a - b.get_pixel(x, y).a) > 0.12:
				n += 1
			x += 2
		y += 2
	return n


func _head_delta(a: Image, b: Image) -> float:
	var total := 0.0
	var n := 0
	var y := 50
	while y < 128:
		var x := 124
		while x < 196:
			var pa := a.get_pixel(x, y)
			var pb := b.get_pixel(x, y)
			if pa.a > 0.2 and pb.a > 0.2:
				total += abs(pa.r - pb.r) + abs(pa.g - pb.g) + abs(pa.b - pb.b)
				n += 1
			x += 2
		y += 2
	if n < 20:
		return 9.0
	return total / float(n)


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


func _assert_sheets() -> bool:
	var idle := _png("char-warm.png")
	var walk := _png("char-warm-walk.png")
	var walk2 := _png("char-warm-walk2.png")
	var pine := _png("char-pine.png")
	var pine_walk := _png("char-pine-walk.png")
	if idle == null or walk == null or walk2 == null or pine == null or pine_walk == null:
		printerr("NO_SHEET")
		return false
	if walk.get_pixel(2, 2).a > 0.03 or walk2.get_pixel(2, 2).a > 0.03:
		printerr("WALK_PLATE")
		return false
	if _foot_diff(idle, walk) < 12 or _foot_diff(idle, walk2) < 12:
		printerr("SLIDING_STAMP")
		return false
	if _head_delta(idle, walk) > 0.18 or _head_delta(idle, walk2) > 0.18:
		printerr("NEW_FACE ", _head_delta(idle, walk))
		return false
	if _foot_diff(pine, pine_walk) < 12:
		printerr("PINE_WALK_LOST")
		return false
	print("PLAY_STEP_WARM")
	print("PLAY_STEP_PINE")
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


func _assert_cycle() -> bool:
	await _feed(_snap({}))
	await _feed(_snap({
		"actors": [_you({"x": 338.0}), _mate({"x": 396.0})],
		"youAt": {"x": 338.0, "y": 342.0},
	}))
	if not await _wait_sheet(YOU, "char-warm-walk.png", 0.40):
		return false
	if not await _wait_sheet(MATE, "char-pine-walk.png", 0.40):
		return false
	if not await _wait_sheet(YOU, "char-warm.png", 0.50):
		return false
	if not await _wait_sheet(YOU, "char-warm-walk2.png", 0.50):
		return false
	var plaque: Panel = play.get("_plaque")
	if plaque == null or plaque.size.x > 280.0 or plaque.size.y > 80.0:
		printerr("PLAQUE_LOST")
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
