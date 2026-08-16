extends Node
## Play.tscn shows spoil ticks and the kitchen icebox. Cool box already there.

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
	if not await _assert_cool():
		get_tree().quit(1)
		return
	if not await _assert_wilt():
		get_tree().quit(1)
		return
	if not await _assert_ice():
		get_tree().quit(1)
		return
	print("PLAY_SPOIL_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 108.0,
		"y": 252.0,
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
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 108.0, "y": 252.0},
		"prompt": "冰柜空着",
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


func _assert_cool() -> bool:
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_SPOIL")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_SPOIL")
		return false
	if not _has_tex(zone_map, "bed-kitchen.png"):
		printerr("NO_KITCHEN_BED")
		return false
	if not _has_tex(zone_map, "prop-cool.png"):
		printerr("NO_COOL")
		return false
	if _has_tex(zone_map, "prop-icebox.png"):
		printerr("HUNG_OLD_ICEBOX")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_SPOIL_COOL")
	return true


func _assert_wilt() -> bool:
	await _feed(_snap({
		"bag": [
			{"id": "fish", "n": 1, "name": "鱼", "fresh": 30},
			{"id": "wood", "n": 2, "name": "青木"},
			{"id": "herb", "n": 1, "name": "山草", "fresh": 90},
		],
	}))
	var bag: Node = play.get("_bag")
	var text := _chip_text(bag)
	if text.find("蔫了") < 0:
		printerr("NO_WILT ", text)
		return false
	if text.find("青木") < 0:
		printerr("NO_WOOD ", text)
		return false
	if text.find("山草·") >= 0:
		printerr("FRESH_TICK ", text)
		return false
	print("PLAY_SPOIL_WILT")
	return true


func _assert_ice() -> bool:
	await _feed(_snap({
		"prompt": "取冰",
		"bag": [{"id": "fish", "n": 1, "name": "鱼", "fresh": 30}],
		"ice": [
			{"id": "herb", "n": 1, "name": "山草", "fresh": 50},
			{"id": "egg", "n": 1, "name": "蛋", "fresh": 80},
		],
	}))
	var ice: Node = play.get("_ice")
	var text := _chip_text(ice)
	if text.find("冰柜") < 0:
		printerr("NO_ICE_MARK ", text)
		return false
	if text.find("还行") < 0:
		printerr("NO_ICE_TICK ", text)
		return false
	if text.find("蛋") < 0:
		printerr("NO_ICE_EGG ", text)
		return false
	await _feed(_snap({
		"zone": "valley",
		"tiles": [],
		"actors": [_actor({"x": 290.0, "y": 342.0})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "",
		"bag": [{"id": "fish", "n": 1, "name": "鱼", "fresh": 30}],
		"ice": [
			{"id": "herb", "n": 1, "name": "山草", "fresh": 50},
		],
	}))
	var leftover := _chip_text(play.get("_ice"))
	if leftover.find("冰柜") >= 0 or leftover.find("还行") >= 0:
		printerr("ICE_ON_VALLEY ", leftover)
		return false
	var bag := _chip_text(play.get("_bag"))
	if bag.find("蔫了") < 0:
		printerr("BAG_LOST_WILT ", bag)
		return false
	print("PLAY_SPOIL_ICE")
	return true
