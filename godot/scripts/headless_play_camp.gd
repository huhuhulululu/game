extends Node
## Play.tscn sits the old camp. Search stays in the snap.

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
const WILD_ROWS := [
	"############",
	"#....J....L#",
	"#..........#",
	"#~~~,,,,~~~#",
	"############",
]
const CAMP_KEY := 17


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
	if not await _assert_wild():
		get_tree().quit(1)
		return
	if not await _assert_loot():
		get_tree().quit(1)
		return
	if not await _assert_pair():
		get_tree().quit(1)
		return
	if not await _assert_hearth():
		get_tree().quit(1)
		return
	print("PLAY_CAMP_OK")
	get_tree().quit(0)


func _actor(extra: Dictionary) -> Dictionary:
	var row := {
		"id": YOU,
		"name": "暖",
		"side": "left",
		"x": 198.0,
		"y": 72.0,
		"facing": 2,
		"held": "",
		"heldName": "",
		"fishing": "off",
		"fishMark": 0.0,
		"fishPull": 0.0,
		"busy": "",
		"ping": 0.0,
		"zone": "wild",
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
		"biome": "林",
		"zone": "wild",
		"tiles": WILD_ROWS,
		"actors": [_actor({})],
		"youAt": {"x": 198.0, "y": 72.0},
		"prompt": "搜旧营",
		"bag": [],
		"ice": [],
		"pot": [],
		"potReady": "",
		"toasts": [],
		"orders": [],
		"plots": [],
		"enemies": [],
		"revealed": [CAMP_KEY],
		"visible": [CAMP_KEY],
		"fires": [],
		"board": [],
		"fortune": {},
		"partner": {},
		"partnerAt": {},
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
	return _count_tex(n, needle) > 0


func _count_tex(n: Node, needle: String) -> int:
	var hit := 0
	if n is Sprite2D:
		var tex: Texture2D = (n as Sprite2D).texture
		if tex and str(tex.resource_path).find(needle) >= 0:
			hit += 1
	for child in n.get_children():
		hit += _count_tex(child, needle)
	return hit


func _has_label(n: Node, needle: String) -> bool:
	if n is Label and str((n as Label).text).find(needle) >= 0:
		return true
	if n is Button and str((n as Button).text).find(needle) >= 0:
		return true
	for child in n.get_children():
		if _has_label(child, needle):
			return true
	return false


func _prompt_gold(prompt: Label) -> bool:
	var c := prompt.get_theme_color("font_color", "Label")
	return abs(c.r - Look.GOLD.r) < 0.04 and abs(c.g - Look.GOLD.g) < 0.04


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


func _camp_sit(zone_map: Node2D) -> bool:
	if zone_map == null:
		return false
	if not _has_tex(zone_map, "bed-wild.png"):
		printerr("NO_WILD_BED")
		return false
	if _count_tex(zone_map, "prop-fire.png") != 1:
		printerr("FIRE_COUNT ", _count_tex(zone_map, "prop-fire.png"))
		return false
	if _count_tex(zone_map, "prop-rock.png") != 1:
		printerr("ROCK_COUNT ", _count_tex(zone_map, "prop-rock.png"))
		return false
	if _has_tex(zone_map, "prop-camp-pot.png"):
		printerr("POT_ON_COLD_CAMP")
		return false
	if _has_tex(zone_map, "prop-pot.png"):
		printerr("HUNG_OLD_POT")
		return false
	if not _no_fail(zone_map):
		return false
	return true


func _assert_wild() -> bool:
	if not FileAccess.file_exists("res://assets/art/bed-valley.png"):
		printerr("MISSING_VALLEY_BED")
		return false
	await _feed(_snap({}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var prompt: Label = play.get("_prompt")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_CAMP")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("WILD_HIDDEN_CAMP")
		return false
	if not _camp_sit(zone_map):
		return false
	if prompt == null or str(prompt.text).find("搜旧营") < 0:
		printerr("CAMP_PROMPT ", prompt.text if prompt else "")
		return false
	if not _prompt_gold(prompt):
		printerr("CAMP_PROMPT_INK")
		return false
	print("PLAY_CAMP_WILD")
	return true


func _assert_loot() -> bool:
	await _feed(_snap({
		"prompt": "搜旧营",
		"toasts": ["暖 在旧营里翻出一点存货"],
		"bag": [{"id": "wood", "n": 1, "name": "青木"}],
	}))
	var zone_map: Node2D = play.get("_zone_map")
	var prompt: Label = play.get("_prompt")
	var bag: HBoxContainer = play.get("_bag")
	var toasts: VBoxContainer = play.get("_toasts")
	if prompt == null or str(prompt.text).find("搜旧营") < 0 or not _prompt_gold(prompt):
		printerr("LOOT_PROMPT ", prompt.text if prompt else "")
		return false
	if toasts == null or not _has_label(toasts, "翻出一点存货"):
		printerr("LOOT_TOAST")
		return false
	if bag == null or not _has_label(bag, "青木"):
		printerr("LOOT_BAG")
		return false
	if not _camp_sit(zone_map):
		return false
	await _feed(_snap({
		"prompt": "搜旧营",
		"toasts": ["旧营被翻过了"],
		"bag": [{"id": "wood", "n": 1, "name": "青木"}],
	}))
	toasts = play.get("_toasts")
	if toasts == null or not _has_label(toasts, "旧营被翻过了"):
		printerr("DONE_TOAST")
		return false
	if not _camp_sit(play.get("_zone_map")):
		return false
	print("PLAY_CAMP_LOOT")
	return true


func _assert_pair() -> bool:
	await _feed(_snap({
		"prompt": "并肩搜旧营",
		"toasts": ["旧营还留着两个人的东西"],
		"actors": [
			_actor({}),
			{
				"id": "p2",
				"name": "松",
				"side": "right",
				"x": 234.0,
				"y": 72.0,
				"facing": 2,
				"held": "",
				"heldName": "",
				"fishing": "off",
				"busy": "",
				"ping": 0.0,
				"zone": "wild",
			},
		],
		"partner": {"name": "松", "online": true, "where": "身旁"},
		"partnerAt": {"x": 234.0, "y": 72.0, "zone": "wild"},
	}))
	var zone_map: Node2D = play.get("_zone_map")
	var world: Node2D = play.get("_world")
	var prompt: Label = play.get("_prompt")
	var toasts: VBoxContainer = play.get("_toasts")
	if prompt == null or str(prompt.text).find("并肩搜旧营") < 0 or not _prompt_gold(prompt):
		printerr("PAIR_PROMPT ", prompt.text if prompt else "")
		return false
	if toasts == null or not _has_label(toasts, "两个人的东西"):
		printerr("PAIR_TOAST")
		return false
	if world == null or not _has_tex(world, "char-warm") or not _has_tex(world, "char-pine"):
		printerr("PAIR_COATS")
		return false
	if not _camp_sit(zone_map):
		return false
	print("PLAY_CAMP_PAIR")
	return true


func _assert_hearth() -> bool:
	await _feed(_snap({
		"zone": "kitchen",
		"biome": "",
		"tiles": KITCHEN_ROWS,
		"prompt": "",
		"toasts": [],
		"bag": [],
		"actors": [_actor({"x": 108.0, "y": 108.0, "zone": "kitchen"})],
		"youAt": {"x": 108.0, "y": 108.0},
		"revealed": [],
		"visible": [],
	}))
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	if valley != null and valley.visible:
		printerr("VALLEY_ON_KITCHEN_CAMP")
		return false
	if zone_map == null or not zone_map.visible:
		printerr("KITCHEN_HIDDEN_CAMP")
		return false
	if not _has_tex(zone_map, "prop-hearth.png"):
		printerr("NO_HEARTH")
		return false
	if _has_tex(zone_map, "bed-wild.png"):
		printerr("WILD_BED_IN_KITCHEN")
		return false
	if _has_tex(zone_map, "prop-fire.png"):
		printerr("CAMP_FIRE_IN_KITCHEN")
		return false
	if not _no_fail(zone_map):
		return false
	print("PLAY_CAMP_HEARTH")
	return true
