extends Node

## Play.tscn walks a four-beat cycle on the existing coats. No new pack.

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
const BAG_EIGHT := [
	{"id": "fish", "n": 1, "name": "鱼", "fresh": 30},
	{"id": "wood", "n": 2, "name": "青木"},
	{"id": "herb", "n": 1, "name": "山草", "fresh": 90},
	{"id": "wheat", "n": 2, "name": "麦"},
	{"id": "egg", "n": 1, "name": "蛋", "fresh": 80},
	{"id": "ore", "n": 1, "name": "矿石"},
	{"id": "stone", "n": 1, "name": "石"},
	{"id": "berry", "n": 1, "name": "果", "fresh": 50},
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
	if not await _assert_front():
		get_tree().quit(1)
		return
	if not await _assert_pass():
		get_tree().quit(1)
		return
	if not await _assert_two():
		get_tree().quit(1)
		return
	print("PLAY_WALK_OK")
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
	var row := {
		"id": MATE,
		"name": "松",
		"side": "right",
		"x": 348.0,
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
		"bag": BAG_EIGHT,
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
		"partner": {"name": "松", "zone": "valley", "online": true, "where": "身旁"},
		"partnerAt": {"x": 348.0, "y": 342.0, "zone": "valley"},
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _feed(s: Dictionary) -> void:
	play.call("_on_snap", s)
	await get_tree().process_frame
	await get_tree().process_frame


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


func _live_kids(box: Node) -> int:
	if box == null:
		return 0
	var n := 0
	for child in box.get_children():
		if not child.is_queued_for_deletion():
			n += 1
	return n


func _assert_quiet() -> bool:
	var plaque: Panel = play.get("_plaque")
	if plaque == null or plaque.size.y > 80.0:
		printerr("PLAQUE_LOST")
		return false
	if _live_kids(play.get("_bag")) > 2:
		printerr("BAG_STRIPE")
		return false
	var body := _body(YOU)
	var sprite: Sprite2D = body.get("_sprite") as Sprite2D if body else null
	if sprite == null or sprite.texture == null:
		printerr("NO_SPRITE")
		return false
	var h := float(sprite.texture.get_height()) * sprite.scale.y
	if abs(h - Look.BODY) > 1.0 or Look.BODY < 180.0:
		printerr("COAT_SCALE ", h, " ", Look.BODY)
		return false
	return true


func _wait_sheet(id: String, name: String, limit: float) -> bool:
	var t := 0.0
	while t < limit:
		if _sheet_file(id) == name:
			return true
		await get_tree().process_frame
		t += get_process_delta_time()
	printerr("SHEET_WAIT ", id, " want ", name, " got ", _sheet_file(id))
	return false


func _assert_front() -> bool:
	await _feed(_snap({}))
	await _feed(_snap({}))
	await get_tree().create_timer(0.14).timeout
	await _feed(_snap({
		"actors": [_you({"x": 338.0}), _mate({"x": 396.0})],
		"youAt": {"x": 338.0, "y": 342.0},
	}))
	if not await _wait_sheet(YOU, "char-warm-walk.png", 0.30):
		return false
	if not await _wait_sheet(MATE, "char-pine-walk.png", 0.30):
		return false
	if not _assert_quiet():
		return false
	if not _no_fail(play):
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	print("PLAY_WALK_A")
	return true


func _assert_pass() -> bool:
	if not await _wait_sheet(YOU, "char-warm.png", 0.40):
		return false
	if not await _wait_sheet(MATE, "char-pine.png", 0.40):
		return false
	print("PLAY_WALK_PASS")
	return true


func _assert_two() -> bool:
	if not await _wait_sheet(YOU, "char-warm-walk2.png", 0.40):
		return false
	if not await _wait_sheet(MATE, "char-pine-walk2.png", 0.40):
		return false
	await _feed(_snap({
		"actors": [_you({"x": 390.0, "facing": 1}), _mate({"x": 448.0, "facing": 1})],
		"youAt": {"x": 390.0, "y": 342.0},
	}))
	if not await _wait_sheet(YOU, "char-warm-side-walk.png", 0.30):
		return false
	print("PLAY_WALK_B")
	return true
