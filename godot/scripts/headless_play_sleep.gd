extends Node

## Play.tscn sits the cover-coat sleep pose on the valley bed. Not a second room.

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
	if not await _assert_sleep():
		get_tree().quit(1)
		return
	print("PLAY_SLEEP_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 306.0,
		"y": 270.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "sit",
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
		"night": true,
		"dusk": false,
		"lit": true,
		"rush": false,
		"floor": 0,
		"biome": "",
		"zone": "valley",
		"tiles": [],
		"actors": [_actor({})],
		"youAt": {"x": 306.0, "y": 270.0},
		"prompt": "歇一夜（田会自己长）",
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


func _assert_sleep() -> bool:
	await _feed(_snap({}))
	await get_tree().create_timer(0.28).timeout
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var fish_hud: CanvasItem = play.get("_fish_hud")
	var place: Label = play.get("_hud_place")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if zone_map != null and zone_map.visible:
		printerr("ZONE_MAP_ON_SLEEP")
		return false
	if str(play.get("_zone")) != "valley":
		printerr("ZONE_NOT_VALLEY ", play.get("_zone"))
		return false
	var bed := valley.get_node_or_null("Bed") as Sprite2D
	if bed == null or bed.texture == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("BED_FAIL")
		return false
	if not _has_tex(play, "char-warm-sit.png"):
		printerr("NO_SIT_POSE")
		return false
	if _has_tex(play, "bed-sleep") or _has_tex(play, "prop-bed"):
		printerr("SLEEP_BED_HUD")
		return false
	if fish_hud != null and fish_hud.visible:
		printerr("FISH_HUD_ON_SLEEP")
		return false
	if not _no_fail(valley):
		return false
	if place != null and place.text != "山谷":
		printerr("PLACE_SLEEP ", place.text)
		return false
	print("PLAY_SLEEP_SIT")
	print("PLAY_SLEEP_VALLEY")
	return true
