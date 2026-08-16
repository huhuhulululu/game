extends Node

## Play.tscn sits farm / fortune / board / wild. Not only a posed look shot.

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
const WILD_ROWS := [
	"############",
	"#T..F...J.L#",
	"#..........#",
	"#~~~,,,,~~~#",
	"############",
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
	if not await _assert_village():
		get_tree().quit(1)
		return
	if not await _assert_wild():
		get_tree().quit(1)
		return
	print("PLAY_VILLAGE_OK")
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


func _snap(zone: String, extra: Dictionary) -> Dictionary:
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
		"zone": zone,
		"tiles": [],
		"actors": [_actor({})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "",
		"bag": [],
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
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _assert_village() -> bool:
	var plots: Array = []
	for i in 12:
		if i == 0:
			plots.append({"seed": "tomato_seed", "stage": 1})
		elif i == 2:
			plots.append({"seed": "greens_seed", "stage": 3})
		else:
			plots.append({"seed": "", "stage": 0})
	await _feed(_snap("valley", {
		"plots": plots,
		"fortune": {"title": "宜近水", "life": "今晚河边更亲", "tilt": "fish"},
		"board": ["酥鱼条", "桂花糖"],
		"prompt": "熟了",
		"actors": [_actor({"x": 468.0, "y": 270.0})],
		"youAt": {"x": 468.0, "y": 270.0},
	}))
	var valley: Node2D = play.get("_valley")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if not _no_fail(valley):
		return false
	if not _has_tex(valley, "prop-sprout.png"):
		printerr("NO_SPROUT")
		return false
	if not _has_tex(valley, "prop-ripe.png"):
		printerr("NO_RIPE")
		return false
	if not _has_tex(valley, "prop-fortune.png"):
		printerr("NO_FORTUNE")
		return false
	if not _has_tex(valley, "prop-dawn.png"):
		printerr("NO_DAWN")
		return false
	if _has_tex(valley, "prop-tuft.png") or _has_tex(valley, "prop-bush.png"):
		printerr("OLD_CROP_MOUND")
		return false
	var sign: Label = play.get("_hud_sign")
	if sign == null or sign.text.find("宜近水") < 0 or sign.text.find("今晚") < 0:
		printerr("SIGN_FAIL ", sign.text if sign else "")
		return false
	print("PLAY_CROP_SIT")
	print("PLAY_FORTUNE_SIT")
	print("PLAY_DAWN_SIT")
	return true


func _assert_wild() -> bool:
	await _feed(_snap("wild", {
		"tiles": WILD_ROWS,
		"biome": "林",
		"revealed": [13, 14, 15],
		"visible": [13, 14],
		"fires": [21],
		"actors": [_actor({"x": 72.0, "y": 72.0})],
		"youAt": {"x": 72.0, "y": 72.0},
		"prompt": "砍",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var place: Label = play.get("_hud_place")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_WILD")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN_WILD")
		return false
	if str(play.get("_zone")) != "wild":
		printerr("ZONE_NOT_WILD ", play.get("_zone"))
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	if _has_tex(zone_map, "prop-tree.png"):
		printerr("HUNG_TREE")
		return false
	if not _no_fail(zone_map):
		return false
	if place != null and place.text.find("荒野") < 0:
		printerr("PLACE_WILD ", place.text)
		return false
	print("PLAY_WILD_BED")
	return true
