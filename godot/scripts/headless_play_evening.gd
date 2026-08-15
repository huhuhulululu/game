extends Node

## Play.tscn eats the snap. Zone swap and fish mark must move here, not only a posed look shot.

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
const MINE_ROWS := [
	"#########",
	"#L...o..#",
	"#.......#",
	"#########",
]
const KITCHEN_ROWS := [
	"################",
	"#12345....Q...X#",
	"#..............#",
	"#C..........U..#",
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
	if play == null or play.get("_valley") == null or play.get("_zone_map") == null or play.get("_fish_hud") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not await _assert_valley():
		get_tree().quit(1)
		return
	if not await _assert_mine():
		get_tree().quit(1)
		return
	if not await _assert_kitchen():
		get_tree().quit(1)
		return
	if not await _assert_fish():
		get_tree().quit(1)
		return
	print("PLAY_EVENING_OK")
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


func _assert_valley() -> bool:
	await _feed(_snap("valley", {
		"actors": [_actor({"x": 320.0, "y": 342.0, "facing": 1})],
		"youAt": {"x": 320.0, "y": 342.0},
		"prompt": "下竿",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var place: Label = play.get("_hud_place")
	var bed := valley.get_node_or_null("Bed") as Sprite2D
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if zone_map != null and zone_map.visible:
		printerr("ZONE_MAP_ON_VALLEY")
		return false
	if bed == null or bed.texture == null or str(bed.texture.resource_path).find("bed-valley.png") < 0:
		printerr("BED_FAIL")
		return false
	if not _no_fail(valley):
		return false
	var actors: Dictionary = play.get("_actors")
	if not actors.has(YOU):
		printerr("NO_ACTOR")
		return false
	var view: Node2D = actors[YOU]
	if view.position.distance_to(Vector2(320, 342)) > 0.5:
		printerr("ACTOR_POS ", view.position)
		return false
	if place != null and place.text != "山谷":
		printerr("PLACE_VALLEY ", place.text)
		return false
	print("PLAY_ZONE_VALLEY")
	return true


func _assert_mine() -> bool:
	await _feed(_snap("mine", {
		"tiles": MINE_ROWS,
		"floor": 1,
		"actors": [_actor({"x": 72.0, "y": 72.0})],
		"youAt": {"x": 72.0, "y": 72.0},
		"prompt": "挖",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var place: Label = play.get("_hud_place")
	if valley.visible:
		printerr("VALLEY_ON_MINE")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN_MINE")
		return false
	if str(play.get("_zone")) != "mine":
		printerr("ZONE_NOT_MINE ", play.get("_zone"))
		return false
	if zone_map.get_child_count() <= 0:
		printerr("MINE_EMPTY")
		return false
	if place != null and place.text.find("矿") < 0:
		printerr("PLACE_MINE ", place.text)
		return false
	print("PLAY_ZONE_MINE")
	return true


func _assert_kitchen() -> bool:
	await _feed(_snap("kitchen", {
		"tiles": KITCHEN_ROWS,
		"actors": [_actor({"x": 108.0, "y": 108.0})],
		"youAt": {"x": 108.0, "y": 108.0},
		"prompt": "切",
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var place: Label = play.get("_hud_place")
	if valley.visible:
		printerr("VALLEY_ON_KITCHEN")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("ZONE_MAP_HIDDEN_KITCHEN")
		return false
	if str(play.get("_zone")) != "kitchen":
		printerr("ZONE_NOT_KITCHEN ", play.get("_zone"))
		return false
	if place != null and place.text.find("厨房") < 0:
		printerr("PLACE_KITCHEN ", place.text)
		return false
	print("PLAY_ZONE_KITCHEN")
	return true


func _mark_x(mark: float) -> float:
	return 16.0 + 528.0 * mark - 2.0


func _assert_fish() -> bool:
	var mark := 0.55
	var fish := _snap("valley", {
		"actors": [_actor({
			"x": 290.0,
			"y": 342.0,
			"busy": "fish",
			"fishing": "fight",
			"fishMark": mark,
			"fishPull": 0.4,
		})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "稳住",
	})
	await _feed(fish)
	# Second feed after ActorView._ready so the 钓 pose sticks on the Play body.
	await _feed(fish)
	var valley: Node2D = play.get("_valley")
	var hud: CanvasItem = play.get("_fish_hud")
	var needle: ColorRect = play.get("_fish_mark")
	if not valley.visible:
		printerr("VALLEY_HIDDEN_FISH")
		return false
	if hud == null or not hud.visible:
		printerr("FISH_HUD_HIDDEN")
		return false
	if needle == null or abs(needle.position.x - _mark_x(mark)) > 0.5:
		printerr("FISH_MARK_X ", needle.position.x if needle else -1.0, " want ", _mark_x(mark))
		return false
	mark = 0.25
	await _feed(_snap("valley", {
		"actors": [_actor({
			"x": 290.0,
			"y": 342.0,
			"busy": "fish",
			"fishing": "fight",
			"fishMark": mark,
			"fishPull": 0.2,
		})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "稳住",
	}))
	if not hud.visible or abs(needle.position.x - _mark_x(mark)) > 0.5:
		printerr("FISH_MARK_FOLLOW ", needle.position.x, " want ", _mark_x(mark))
		return false
	var actors: Dictionary = play.get("_actors")
	if actors.has(YOU) and str((actors[YOU] as Node).get("busy")) != "fish":
		printerr("FISH_POSE ", (actors[YOU] as Node).get("busy"))
		return false
	print("PLAY_FISH_MARK")
	return true
