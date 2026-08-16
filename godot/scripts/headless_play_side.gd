extends Node
## Play.tscn sits 火边 from the snap. Sit pose and fire already in.

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
const STICKER := [
	"prop-fireside",
	"prop-hearth-ring",
	"prop-bond",
]
const OLD_INK := [
	"prop-pot.png",
]
const WILD_ROWS := [
	"############",
	"#....K....L#",
	"#..........#",
	"#~~~,,,,~~~#",
	"############",
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
const FIRE_KEY := 17


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
	if not await _assert_fire():
		get_tree().quit(1)
		return
	if not await _assert_lamp():
		get_tree().quit(1)
		return
	if not await _assert_alone():
		get_tree().quit(1)
		return
	print("PLAY_SIDE_OK")
	get_tree().quit(0)


func _you(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 168.0,
		"y": 72.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "sit",
		"ping": 0.0,
		"zone": "wild",
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
		"x": 204.0,
		"y": 72.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "sit",
		"ping": 0.0,
		"zone": "wild",
		"away": false,
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
		"biome": "林",
		"zone": "wild",
		"tiles": WILD_ROWS,
		"actors": [_you({}), _mate({})],
		"youAt": {"x": 168.0, "y": 72.0},
		"prompt": "",
		"bag": [],
		"ice": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": [],
		"plots": [],
		"enemies": [],
		"revealed": [17, 18],
		"visible": [17, 18],
		"fires": [FIRE_KEY],
		"board": [],
		"fortune": {},
		"partner": {"id": MATE, "name": "松", "zone": "wild"},
		"partnerAt": {"x": 204.0, "y": 72.0, "zone": "wild"},
		"weather": {"id": "clear", "name": "晴"},
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


func _has_label(n: Node, needle: String) -> bool:
	if n is Label and str((n as Label).text).find(needle) >= 0:
		return true
	for child in n.get_children():
		if _has_label(child, needle):
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
			for bad in STICKER:
				if path.find(str(bad)) >= 0:
					printerr("SIDE_STICKER ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _no_bond() -> bool:
	var ink: Label = play.get("_hud_ink")
	if ink == null:
		return true
	var t := ink.text
	return t.find("成对") < 0 and t.find("bond") < 0 and t.find("默契") < 0 and t.find("魂") < 0


func _body(id: String) -> Node2D:
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(id):
		return null
	return actors[id] as Node2D


func _assert_fire() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	if not FileAccess.file_exists("res://assets/art/prop-fire.png"):
		printerr("MISSING_FIRE")
		return false
	await _feed(_snap({
		"toasts": ["火边坐了一会儿"],
	}))
	await get_tree().create_timer(0.28).timeout
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var toasts: VBoxContainer = play.get("_toasts")
	var ink: Label = play.get("_hud_ink")
	var warm := _body(YOU)
	if valley != null and valley.visible:
		printerr("VALLEY_ON_SIDE_FIRE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_SIDE")
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	if not _has_tex(zone_map, "prop-fire.png"):
		printerr("NO_FIRE")
		return false
	if not _has_tex(play, "char-warm-sit"):
		printerr("NO_WARM_SIT")
		return false
	if not _has_tex(play, "char-pine-sit"):
		printerr("NO_PINE_SIT")
		return false
	if warm == null or float(warm.get("_sit")) < 0.8:
		printerr("SIT_BLEND ", warm.get("_sit") if warm else "")
		return false
	if toasts == null or not _has_label(toasts, "火边坐了一会儿"):
		printerr("SIDE_TOAST")
		return false
	if ink == null or str(ink.text).find("夜里") < 0:
		printerr("SIDE_PLAQUE ", ink.text if ink else "")
		return false
	if not _no_bond():
		printerr("SIDE_BOND_HUD")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_SIDE_FIRE")
	return true


func _assert_lamp() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"biome": "",
		"tiles": KITCHEN_ROWS,
		"fires": [],
		"toasts": ["火边坐了一会儿"],
		"actors": [
			_you({"x": 360.0, "y": 72.0, "zone": "kitchen"}),
			_mate({"x": 396.0, "y": 72.0, "zone": "kitchen"}),
		],
		"youAt": {"x": 360.0, "y": 72.0},
		"partnerAt": {"x": 396.0, "y": 72.0, "zone": "kitchen"},
		"partner": {"id": MATE, "name": "松", "zone": "kitchen"},
	}))
	await get_tree().create_timer(0.28).timeout
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var kitchen := zone_map.get_node_or_null("KitchenBed") as Sprite2D if zone_map else null
	var toasts: VBoxContainer = play.get("_toasts")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_SIDE_LAMP")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_SIDE")
		return false
	if not _has_tex(zone_map, "prop-hearth.png"):
		printerr("NO_HEARTH")
		return false
	if kitchen != null and kitchen.material != null:
		printerr("KITCHEN_NIGHT_GRADE")
		return false
	if world == null or world.modulate != Color(1, 1, 1):
		printerr("KITCHEN_DIM ", world.modulate if world else "")
		return false
	if not _has_tex(play, "char-warm-sit"):
		printerr("NO_WARM_SIT_LAMP")
		return false
	if toasts == null or not _has_label(toasts, "火边坐了一会儿"):
		printerr("LAMP_TOAST")
		return false
	if not _no_bond():
		printerr("LAMP_BOND_HUD")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_SIDE_LAMP")
	return true


func _assert_alone() -> bool:
	await _feed(_snap({
		"toasts": [],
		"actors": [_you({})],
		"youAt": {"x": 168.0, "y": 72.0},
		"partner": {},
		"partnerAt": {},
	}))
	await get_tree().create_timer(0.28).timeout
	var toasts: VBoxContainer = play.get("_toasts")
	var zone_map: Node2D = play.get("_zone_map")
	if toasts != null and _has_label(toasts, "火边坐了一会儿"):
		printerr("SIDE_TOAST_ALONE")
		return false
	if zone_map == null or not _has_tex(zone_map, "prop-fire.png"):
		printerr("FIRE_GONE_ALONE")
		return false
	if not _has_tex(play, "char-warm-sit"):
		printerr("NO_SIT_ALONE")
		return false
	if not _no_fail(zone_map):
		return false
	await _feed(_snap({
		"zone": "valley",
		"biome": "",
		"tiles": [],
		"fires": [],
		"toasts": [],
		"night": true,
		"actors": [_you({"x": 290.0, "y": 342.0, "zone": "valley", "busy": ""})],
		"youAt": {"x": 290.0, "y": 342.0},
		"partner": {},
		"partnerAt": {},
	}))
	var valley: Node2D = play.get("_valley")
	zone_map = play.get("_zone_map")
	var bed := valley.get_node_or_null("Bed") as Sprite2D if valley else null
	toasts = play.get("_toasts")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_SIDE")
		return false
	if zone_map != null and zone_map.visible:
		printerr("WILD_ON_VALLEY_SIDE")
		return false
	if bed == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("VALLEY_REPLACED_BED")
		return false
	if toasts != null and _has_label(toasts, "火边坐了一会儿"):
		printerr("SIDE_TOAST_VALLEY")
		return false
	if not _no_fail(valley):
		return false
	print("PLAY_SIDE_ALONE")
	return true
