extends Node

## Play.tscn shows kitchen rush as two coats. Tickets stay in the kitchen.

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
	if not await _assert_hot():
		get_tree().quit(1)
		return
	if not await _assert_do():
		get_tree().quit(1)
		return
	if not await _assert_only():
		get_tree().quit(1)
		return
	print("PLAY_RUSH_OK")
	get_tree().quit(0)


func _you(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 54.0,
		"y": 126.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "",
		"ping": 0.0,
		"away": false,
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _mate(extra: Dictionary) -> Dictionary:
	var row := {
		"id": MATE,
		"name": "松",
		"side": "right",
		"x": 378.0,
		"y": 54.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "",
		"ping": 0.0,
		"away": false,
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _tickets() -> Array:
	return [
		{"recipe": "桂花茶", "name": "客人"},
		{"recipe": "蘑菇汤", "name": "行客"},
	]


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
		"rush": true,
		"floor": 0,
		"biome": "",
		"zone": "kitchen",
		"tiles": KITCHEN_ROWS,
		"actors": [_you({}), _mate({})],
		"youAt": {"x": 54.0, "y": 126.0},
		"prompt": "上菜！堂口在催",
		"bag": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": _tickets(),
		"plots": [],
		"enemies": [],
		"revealed": [],
		"visible": [],
		"fires": [],
		"board": [],
		"fortune": {},
		"partner": {"name": "松", "zone": "kitchen", "online": true, "where": "厨房"},
		"partnerAt": {"x": 378.0, "y": 54.0, "zone": "kitchen"},
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


func _text_has(n: Node, needle: String) -> bool:
	if n is Label and (n as Label).text.find(needle) >= 0:
		return true
	for child in n.get_children():
		if _text_has(child, needle):
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


func _no_pair_stat() -> bool:
	var ink: Label = play.get("_hud_ink")
	if ink == null:
		return true
	var t := ink.text
	return t.find("成对") < 0 and t.find("bond") < 0 and t.find("pair+") < 0 and t.find("combo") < 0


func _assert_hot() -> bool:
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var place: Label = play.get("_hud_place")
	var prompt: Label = play.get("_prompt")
	var box: Node = play.get("_orders")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_RUSH")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN_RUSH")
		return false
	if str(play.get("_zone")) != "kitchen":
		printerr("ZONE_NOT_KITCHEN ", play.get("_zone"))
		return false
	if not _has_tex(zone_map, "bed-kitchen.png"):
		printerr("NO_KITCHEN_BED")
		return false
	if not _has_tex(zone_map, "prop-hearth.png"):
		printerr("NO_HEARTH")
		return false
	if not _has_tex(zone_map, "prop-chop.png"):
		printerr("NO_CHOP")
		return false
	if not _has_tex(zone_map, "prop-oven.png"):
		printerr("NO_OVEN")
		return false
	if not _has_tex(zone_map, "prop-serve.png"):
		printerr("NO_SERVE")
		return false
	if not _has_tex(play, "char-warm"):
		printerr("NO_WARM_COAT")
		return false
	if not _has_tex(play, "char-pine"):
		printerr("NO_PINE_COAT")
		return false
	if place == null or place.text.find("堂口热") < 0:
		printerr("PLACE_RUSH ", place.text if place else "")
		return false
	if prompt == null or prompt.text.find("堂口") < 0:
		printerr("PROMPT_RUSH ", prompt.text if prompt else "")
		return false
	if box == null or not _text_has(box, "桂花茶") or not _text_has(box, "蘑菇汤"):
		printerr("NO_TICKETS")
		return false
	if not _no_pair_stat() or not _no_fail(zone_map):
		return false
	print("PLAY_RUSH_HOT")
	return true


func _assert_do() -> bool:
	await _feed(_snap({
		"actors": [
			_you({"x": 54.0, "y": 126.0, "busy": "chop"}),
			_mate({"x": 378.0, "y": 54.0, "busy": "chop"}),
		],
		"youAt": {"x": 54.0, "y": 126.0},
		"partnerAt": {"x": 378.0, "y": 54.0, "zone": "kitchen"},
		"prompt": "切着",
	}))
	var zone_map: Node2D = play.get("_zone_map")
	if not _has_tex(play, "char-warm-chop"):
		printerr("NO_WARM_CHOP")
		return false
	if not _has_tex(play, "char-pine-chop"):
		printerr("NO_PINE_CHOP")
		return false
	if zone_map == null or not _has_tex(zone_map, "prop-hearth.png") or not _has_tex(zone_map, "prop-chop.png"):
		printerr("NO_CHOP_STATIONS")
		return false
	await _feed(_snap({
		"actors": [
			_you({"x": 450.0, "y": 126.0, "busy": "chop"}),
			_mate({"x": 486.0, "y": 270.0, "busy": "chop"}),
		],
		"youAt": {"x": 450.0, "y": 126.0},
		"partnerAt": {"x": 486.0, "y": 270.0, "zone": "kitchen"},
		"prompt": "上菜！堂口在催",
	}))
	if not _has_tex(play, "char-warm-chop"):
		printerr("NO_WARM_OVEN")
		return false
	if not _has_tex(play, "char-pine-chop"):
		printerr("NO_PINE_SERVE")
		return false
	if zone_map == null or not _has_tex(zone_map, "prop-oven.png") or not _has_tex(zone_map, "prop-serve.png"):
		printerr("NO_SERVE_STATIONS")
		return false
	if not _no_pair_stat() or not _no_fail(zone_map):
		return false
	print("PLAY_RUSH_DO")
	return true


func _assert_only() -> bool:
	await _feed(_snap({
		"zone": "valley",
		"tiles": [],
		"rush": true,
		"actors": [
			_you({"x": 290.0, "y": 342.0, "busy": ""}),
			_mate({"x": 348.0, "y": 342.0, "busy": ""}),
		],
		"youAt": {"x": 290.0, "y": 342.0},
		"partnerAt": {"x": 348.0, "y": 342.0, "zone": "valley"},
		"partner": {"name": "松", "zone": "valley", "online": true, "where": "身旁"},
		"prompt": "",
		"orders": _tickets(),
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var place: Label = play.get("_hud_place")
	var box: Node = play.get("_orders")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_RUSH")
		return false
	if zone_map != null and zone_map.visible:
		printerr("KITCHEN_ON_VALLEY")
		return false
	if valley != null and _has_tex(valley, "bed-kitchen"):
		printerr("KITCHEN_BED_ON_VALLEY")
		return false
	if place == null or place.text.find("堂口") >= 0:
		printerr("PLACE_LEAK ", place.text if place else "")
		return false
	if box != null and box.get_child_count() > 0:
		printerr("TICKETS_ON_VALLEY ", box.get_child_count())
		return false
	if not _no_pair_stat() or not _no_fail(valley):
		return false
	print("PLAY_RUSH_ONLY")
	return true
