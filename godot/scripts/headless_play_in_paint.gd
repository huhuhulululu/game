extends Node

## Existing coats sit in the painting. Your name is hidden. Bag is a short slip.

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
	if not await _assert_you():
		get_tree().quit(1)
		return
	if not await _assert_bag():
		get_tree().quit(1)
		return
	if not await _assert_coat():
		get_tree().quit(1)
		return
	print("PLAY_IN_OK")
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
		"bag": BAG_EIGHT,
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
	await get_tree().process_frame


func _views(n: Node) -> Array:
	var out: Array = []
	if n is ActorView:
		out.append(n)
	for child in n.get_children():
		out.append_array(_views(child))
	return out


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


func _assert_you() -> bool:
	await _feed(_snap({}))
	var rows: Array = _views(play)
	var you_view: ActorView = null
	var mate_view: ActorView = null
	for raw in rows:
		var view: ActorView = raw
		if view.actor_id == YOU:
			you_view = view
		elif view.actor_id == MATE:
			mate_view = view
	if you_view == null or mate_view == null:
		printerr("NO_COATS")
		return false
	var you_ink: Label = you_view.get("_name")
	if you_ink != null and you_ink.visible:
		printerr("YOU_TAG")
		return false
	if you_ink != null and str(you_ink.text) != "":
		printerr("YOU_INK ", you_ink.text)
		return false
	print("PLAY_IN_YOU")
	var mate_ink: Label = mate_view.get("_name")
	if mate_ink == null or not mate_ink.visible:
		printerr("MATE_HIDDEN")
		return false
	if str(mate_ink.text).find("松") < 0:
		printerr("MATE_INK ", mate_ink.text)
		return false
	print("PLAY_NAME_YOU")
	print("PLAY_NAME_MATE")
	return true


func _assert_bag() -> bool:
	await _feed(_snap({}))
	var bag: Node = play.get("_bag")
	if bag == null:
		printerr("NO_BAG")
		return false
	if (bag as Control).position.y > 90.0:
		printerr("BAG_LOW ", (bag as Control).position)
		return false
	var n := 0
	for child in bag.get_children():
		if child.is_queued_for_deletion():
			continue
		n += 1
		if child is Control and (child as Control).size.x > 280.0:
			printerr("BAG_STRIPE ", (child as Control).size)
			return false
		if child is Button and str((child as Button).text).find("袋") < 0:
			printerr("NO_BAG_LINE ", (child as Button).text)
			return false
	if n != 1:
		printerr("BAG_COUNT ", n)
		return false
	var held: Label = play.get("_hud_held")
	if held != null and held.visible and str(held.text).find("手里空着") >= 0:
		printerr("HELD_STRIPE ", held.text)
		return false
	print("PLAY_IN_BAG")
	return true


func _assert_coat() -> bool:
	await _feed(_snap({}))
	if not _has_tex(play, "char-warm"):
		printerr("NO_WARM_COAT")
		return false
	if not _has_tex(play, "char-pine"):
		printerr("NO_PINE_COAT")
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _no_fail(play):
		return false
	if Look.BODY < 220.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(YOU):
		printerr("NO_ACTOR")
		return false
	var body: ActorView = actors[YOU] as ActorView
	var sprite: Sprite2D = body.get("_sprite") as Sprite2D
	if sprite == null or sprite.texture == null:
		printerr("NO_SPRITE")
		return false
	if str(sprite.texture.resource_path).find("char-warm.png") < 0:
		printerr("NEW_FACE ", sprite.texture.resource_path)
		return false
	var h := float(sprite.texture.get_height()) * sprite.scale.y
	if abs(h - Look.BODY) > 1.0:
		printerr("COAT_SCALE ", h, " BODY ", Look.BODY)
		return false
	var shadow: Sprite2D = body.get("_shadow") as Sprite2D
	if shadow == null or not shadow.visible:
		printerr("NO_SHADOW")
		return false
	if shadow.modulate.a < 0.4:
		printerr("SHADOW_FAINT ", shadow.modulate.a)
		return false
	if shadow.scale.x <= 0.2 or shadow.scale.y <= 0.2:
		printerr("SHADOW_BLOB ", shadow.scale)
		return false
	print("PLAY_IN_SHADOW")
	return true
