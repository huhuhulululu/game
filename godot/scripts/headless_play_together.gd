extends Node

## Play.tscn shows both coats, a shout, and a kept seat. No second phone.

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
	if not await _assert_pair():
		get_tree().quit(1)
		return
	if not await _assert_shout():
		get_tree().quit(1)
		return
	if not await _assert_seat():
		get_tree().quit(1)
		return
	if not await _assert_share():
		get_tree().quit(1)
		return
	print("PLAY_TOGETHER_OK")
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
		"away": false,
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _partner(extra: Dictionary) -> Dictionary:
	var row := {
		"name": "松",
		"zone": "valley",
		"online": true,
		"ping": 0.0,
		"where": "身旁",
	}
	for key in extra.keys():
		row[key] = extra[key]
	return row


func _snap(extra: Dictionary) -> Dictionary:
	var you_row := _you({})
	var mate_row := _mate({})
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
		"actors": [you_row, mate_row],
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
		"partner": _partner({}),
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
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _body(id: String) -> Node2D:
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(id):
		return null
	return actors[id] as Node2D


func _heard() -> PackedStringArray:
	var ear: Node = play.get("_ear")
	if ear == null:
		return PackedStringArray()
	return ear.get("last_heard")


func _assert_pair() -> bool:
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var mate: Label = play.get("_hud_mate")
	var room: Label = play.get("_hud_room")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if zone_map != null and zone_map.visible:
		printerr("ZONE_MAP_ON_VALLEY")
		return false
	if not _has_tex(play, "char-warm"):
		printerr("NO_WARM_COAT")
		return false
	if not _has_tex(play, "char-pine"):
		printerr("NO_PINE_COAT")
		return false
	if _body(YOU) == null or _body(MATE) == null:
		printerr("PAIR_BODIES")
		return false
	if mate == null or mate.text != "松 在身旁":
		printerr("MATE_NEAR ", mate.text if mate else "")
		return false
	if room == null or room.text.find("TEST") < 0:
		printerr("ROOM_FAIL ", room.text if room else "")
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_PAIR_COATS")
	return true


func _assert_shout() -> bool:
	await _feed(_snap({
		"actors": [_you({}), _mate({"ping": 1.2})],
		"partner": _partner({"ping": 1.2}),
	}))
	var pine := _body(MATE)
	if pine == null:
		printerr("NO_PINE_SHOUT")
		return false
	var glow: CanvasItem = pine.get("_glow")
	if glow == null or not glow.visible:
		printerr("SHOUT_DARK")
		return false
	if not _heard().has("shout"):
		printerr("NO_SHOUT_TONE ", _heard())
		return false
	print("PLAY_SHOUT_LIT")
	return true


func _assert_seat() -> bool:
	await _feed(_snap({
		"actors": [_you({}), _mate({"away": true, "ping": 0.0})],
		"partner": _partner({"online": false, "ping": 0.0}),
		"toasts": ["松 断线了，人还在原地"],
	}))
	var pine := _body(MATE)
	var mate: Label = play.get("_hud_mate")
	var room: Label = play.get("_hud_room")
	if pine == null:
		printerr("AWAY_GONE")
		return false
	if pine.modulate.r > 0.80:
		printerr("AWAY_BRIGHT ", pine.modulate)
		return false
	if mate == null or mate.text.find("断线了，人还在原地") < 0:
		printerr("AWAY_LINE ", mate.text if mate else "")
		return false
	if room == null or room.text.find("TEST") < 0:
		printerr("ROOM_LOST_AWAY ", room.text if room else "")
		return false
	await _feed(_snap({
		"actors": [_you({"busy": "sit"}), _mate({"away": false})],
		"partner": _partner({"online": true}),
		"toasts": ["松 回来了"],
		"prompt": "歇一夜（田会自己长）",
	}))
	pine = _body(MATE)
	if pine == null or pine.modulate.r < 0.95:
		printerr("BACK_DIM")
		return false
	if room == null or room.text.find("TEST") < 0:
		printerr("ROOM_LOST_BACK ", room.text if room else "")
		return false
	if not _heard().has("sit"):
		printerr("NO_SIT_TONE ", _heard())
		return false
	await _feed(_snap({
		"actors": [_you({"busy": "chop"}), _mate({})],
	}))
	if not _heard().has("act"):
		printerr("NO_ACT_TONE ", _heard())
		return false
	print("PLAY_SEAT_KEEP")
	return true


func _assert_share() -> bool:
	await _feed(_snap({
		"zone": "wild",
		"biome": "林",
		"tiles": WILD_ROWS,
		"revealed": [26, 27, 34],
		"visible": [26],
		"actors": [
			_you({"x": 72.0, "y": 72.0}),
			_mate({"x": 360.0, "y": 72.0}),
		],
		"youAt": {"x": 72.0, "y": 72.0},
		"partner": _partner({"zone": "wild", "where": "身旁"}),
		"partnerAt": {"x": 360.0, "y": 72.0, "zone": "wild"},
		"prompt": "林子里有路",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_WILD")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN_WILD")
		return false
	var fog_sig := str(zone_map.get("_fog_sig"))
	if fog_sig.find("34") < 0:
		printerr("SHARE_FOG ", fog_sig)
		return false
	if not _no_fail(zone_map):
		return false
	return true
