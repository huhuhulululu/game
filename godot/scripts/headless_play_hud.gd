extends Node

## Play.tscn sits a quiet plaque and one bag line. Same coats, larger BODY.

const YOU := "p1"
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
	"prop-hearth.png",
	"prop-chop.png",
	"prop-oven.png",
	"prop-serve.png",
	"prop-cool.png",
	"prop-bin.png",
	"prop-shelf.png",
	"prop-way.png",
	"prop-vein.png",
	"prop-steps.png",
	"prop-cache.png",
	"prop-mouth.png",
	"prop-fire.png",
	"prop-rock.png",
	"prop-dock.png",
	"prop-ore.png",
	"prop-gate.png",
	"prop-beast.png",
]
const OLD_INK := [
	"prop-pot.png",
	"prop-cut.png",
	"prop-stove.png",
	"prop-pass.png",
	"prop-icebox.png",
	"prop-pantry.png",
	"prop-trash.png",
	"prop-door-open.png",
]
const KITCHEN_ROWS := [
	"################",
	"#12345....Q...X#",
	"#..............#",
	"#C..........U..#",
	"#C..........U..#",
	"#..............#",
	"#L.............#",
	"#6.....R.....W.#",
	"################",
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
	if play == null or play.get("_valley") == null or play.get("_zone_map") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not await _assert_plaque():
		get_tree().quit(1)
		return
	if not await _assert_bag():
		get_tree().quit(1)
		return
	if not await _assert_coat():
		get_tree().quit(1)
		return
	print("PLAY_HUD_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
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
		"actors": [_actor({})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "",
		"bag": [],
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
			for old in OLD_INK:
				if path.find(str(old)) >= 0:
					printerr("OLD_INK ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _chip_text(box: Node) -> String:
	var bits: PackedStringArray = []
	if box == null:
		return ""
	for child in box.get_children():
		if child is Button:
			bits.append((child as Button).text)
		elif child is Label:
			bits.append((child as Label).text)
	return " ".join(bits)


func _live_kids(box: Node) -> int:
	if box == null:
		return 0
	var n := 0
	for child in box.get_children():
		if not child.is_queued_for_deletion():
			n += 1
	return n


func _assert_plaque() -> bool:
	await _feed(_snap({
		"bag": BAG_EIGHT,
	}))
	var plaque: Panel = play.get("_plaque")
	if plaque == null:
		printerr("NO_PLAQUE")
		return false
	if plaque.position != Vector2(16, 16):
		printerr("PLAQUE_POS ", plaque.position)
		return false
	if plaque.size.x > 280.0 or plaque.size.y > 80.0:
		printerr("PLAQUE_BIG ", plaque.size)
		return false
	var place: Label = play.get("_hud_place")
	var ink: Label = play.get("_hud_ink")
	if place == null or str(place.text).find("山谷") < 0:
		printerr("NO_PLACE")
		return false
	if ink == null or str(ink.text).find("日") < 0 or str(ink.text).find("春") < 0:
		printerr("NO_INK ", ink.text if ink else "")
		return false
	if str(ink.text).find("金") < 0:
		printerr("NO_GOLD ", ink.text)
		return false
	print("PLAY_HUD_PLAQUE")
	return true


func _assert_bag() -> bool:
	await _feed(_snap({
		"bag": BAG_EIGHT,
	}))
	var bag: Node = play.get("_bag")
	if _live_kids(bag) > 2:
		printerr("BAG_STRIPE ", _live_kids(bag), " ", _chip_text(bag))
		return false
	var text := _chip_text(bag)
	if text.find("袋") < 0:
		printerr("NO_BAG_LINE ", text)
		return false
	if text.find("青木") < 0 or text.find("蔫了") < 0:
		printerr("BAG_LOST ", text)
		return false
	for child in bag.get_children():
		if child is Control and (child as Control).size.x > 280.0:
			printerr("BAG_LONG ", (child as Control).size)
			return false
		if child is Control and (child as Control).position.y + bag.position.y > 130.0:
			printerr("BAG_LOW ", bag.position, (child as Control).position)
			return false
	await _feed(_snap({
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_actor({"x": 108.0, "y": 252.0})],
		"youAt": {"x": 108.0, "y": 252.0},
		"bag": [{"id": "fish", "n": 1, "name": "鱼", "fresh": 30}],
		"ice": [
			{"id": "herb", "n": 1, "name": "山草", "fresh": 50},
			{"id": "egg", "n": 1, "name": "蛋", "fresh": 80},
		],
	}))
	var ice: Node = play.get("_ice")
	if _live_kids(ice) > 2:
		printerr("ICE_STRIPE ", _live_kids(ice), " ", _chip_text(ice))
		return false
	var ice_text := _chip_text(ice)
	if ice_text.find("冰柜") < 0 or ice_text.find("还行") < 0 or ice_text.find("蛋") < 0:
		printerr("ICE_LINE ", ice_text)
		return false
	await _feed(_snap({
		"zone": "valley",
		"tiles": [],
		"actors": [_actor({})],
		"youAt": {"x": 290.0, "y": 342.0},
		"bag": BAG_EIGHT,
		"ice": [
			{"id": "herb", "n": 1, "name": "山草", "fresh": 50},
		],
	}))
	var leftover := _chip_text(play.get("_ice"))
	if leftover.find("冰柜") >= 0:
		printerr("ICE_ON_VALLEY ", leftover)
		return false
	print("PLAY_HUD_BAG")
	return true


func _assert_coat() -> bool:
	await _feed(_snap({
		"bag": BAG_EIGHT,
	}))
	var valley: Node2D = play.get("_valley")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if not _no_fail(play):
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _has_tex(play, "char-warm"):
		printerr("NO_WARM_COAT")
		return false
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(YOU):
		printerr("NO_ACTOR")
		return false
	var body: Node2D = actors[YOU] as Node2D
	var sprite: Sprite2D = body.get("_sprite") as Sprite2D
	if sprite == null or sprite.texture == null:
		printerr("NO_SPRITE")
		return false
	var h := float(sprite.texture.get_height()) * sprite.scale.y
	if abs(h - Look.BODY) > 1.0 or Look.BODY < 180.0:
		printerr("COAT_STAMP ", h, " BODY ", Look.BODY)
		return false
	print("PLAY_HUD_COAT")
	return true
