extends Node

## Play.tscn shows pair-fish and dual 做 as two coats. Not a bonus stat.

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
	if not await _assert_fish():
		get_tree().quit(1)
		return
	if not await _assert_do():
		get_tree().quit(1)
		return
	if not await _assert_sleep():
		get_tree().quit(1)
		return
	print("PLAY_HANDS_OK")
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
		"partner": {"name": "松", "zone": "valley", "online": true, "where": "身旁"},
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


func _near_pair() -> bool:
	var a := _body(YOU)
	var b := _body(MATE)
	if a == null or b == null:
		return false
	return a.position.distance_to(b.position) < 90.0


func _no_pair_stat() -> bool:
	var ink: Label = play.get("_hud_ink")
	if ink == null:
		return true
	var t := ink.text
	return t.find("成对") < 0 and t.find("bond") < 0 and t.find("pair+") < 0


func _assert_fish() -> bool:
	await _feed(_snap({
		"actors": [
			_you({"busy": "fish", "fishing": "wait"}),
			_mate({"busy": "fish", "fishing": "wait"}),
		],
		"prompt": "两人同钓 · 水面还没动",
	}))
	var valley: Node2D = play.get("_valley")
	var prompt: Label = play.get("_prompt")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN")
		return false
	if not _has_tex(play, "char-warm-fish"):
		printerr("NO_WARM_FISH")
		return false
	if not _has_tex(play, "char-pine-fish"):
		printerr("NO_PINE_FISH")
		return false
	if not _near_pair():
		printerr("FISH_FAR")
		return false
	if prompt == null or prompt.text.find("两人同钓") < 0:
		printerr("FISH_PROMPT ", prompt.text if prompt else "")
		return false
	if not _no_pair_stat() or not _no_fail(valley):
		return false
	print("PLAY_PAIR_FISH")
	return true


func _assert_do() -> bool:
	await _feed(_snap({
		"actors": [
			_you({"x": 864.0, "y": 486.0, "busy": "forge", "fishing": "fight", "fishMark": 0.5}),
			_mate({"x": 900.0, "y": 486.0, "busy": "forge", "fishing": "fight", "fishMark": 0.5}),
		],
		"youAt": {"x": 864.0, "y": 486.0},
		"partnerAt": {"x": 900.0, "y": 486.0, "zone": "valley"},
		"prompt": "锻 · 绿的时候按 · 还差3下",
	}))
	var valley: Node2D = play.get("_valley")
	if not _has_tex(play, "char-warm-forge"):
		printerr("NO_WARM_FORGE")
		return false
	if not _has_tex(play, "char-pine-forge"):
		printerr("NO_PINE_FORGE")
		return false
	if not _near_pair():
		printerr("FORGE_FAR")
		return false
	if valley == null or _has_tex(valley, "prop-smith.png"):
		printerr("HUNG_SMITH")
		return false
	print("PLAY_PAIR_FORGE")
	await _feed(_snap({
		"actors": [
			_you({"x": 270.0, "y": 486.0, "busy": "fish", "fishing": "fight", "fishMark": 0.5}),
			_mate({"x": 318.0, "y": 486.0, "busy": "fish", "fishing": "fight", "fishMark": 0.5}),
		],
		"youAt": {"x": 270.0, "y": 486.0},
		"partnerAt": {"x": 318.0, "y": 486.0, "zone": "valley"},
		"prompt": "摊 · 桂花 · 绿的时候按 · 还差3下",
	}))
	if not _has_tex(play, "char-warm-fish"):
		printerr("NO_WARM_STALL")
		return false
	if not _has_tex(play, "char-pine-fish"):
		printerr("NO_PINE_STALL")
		return false
	if not _near_pair():
		printerr("STALL_FAR")
		return false
	if valley == null or _has_tex(valley, "prop-booth.png"):
		printerr("HUNG_BOOTH")
		return false
	if not _no_pair_stat() or not _no_fail(valley):
		return false
	print("PLAY_PAIR_STALL")
	return true


func _assert_sleep() -> bool:
	await _feed(_snap({
		"night": true,
		"dusk": false,
		"actors": [
			_you({"x": 306.0, "y": 270.0, "busy": "sit"}),
			_mate({"x": 348.0, "y": 270.0, "busy": "sit"}),
		],
		"youAt": {"x": 306.0, "y": 270.0},
		"partnerAt": {"x": 348.0, "y": 270.0, "zone": "valley"},
		"prompt": "等她也躺下",
	}))
	await get_tree().create_timer(0.28).timeout
	var valley: Node2D = play.get("_valley")
	var zone_map: Node2D = play.get("_zone_map")
	var prompt: Label = play.get("_prompt")
	if valley == null or not valley.visible:
		printerr("VALLEY_HIDDEN_SLEEP")
		return false
	if zone_map != null and zone_map.visible:
		printerr("SLEEP_INDOOR")
		return false
	if not _has_tex(play, "char-warm-sit"):
		printerr("NO_WARM_SIT")
		return false
	if not _has_tex(play, "char-pine-sit"):
		printerr("NO_PINE_SIT")
		return false
	if not _near_pair():
		printerr("SLEEP_FAR")
		return false
	if prompt == null or prompt.text.find("躺") < 0:
		printerr("SLEEP_PROMPT ", prompt.text if prompt else "")
		return false
	if _has_tex(play, "bed-sleep") or _has_tex(play, "prop-bed"):
		printerr("SLEEP_BED_HUD")
		return false
	if not _no_pair_stat() or not _no_fail(valley):
		return false
	print("PLAY_PAIR_SLEEP")
	return true
