extends Node

## Existing coats take a warm dusk grade. Same face. No new person.

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
	if not await _assert_dusk():
		get_tree().quit(1)
		return
	print("PLAY_DUSK_OK")
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
		"actors": [_you({}), _you({
			"id": MATE,
			"name": "松",
			"side": "right",
			"x": 348.0,
		})],
		"youAt": {"x": 290.0, "y": 342.0},
		"prompt": "",
		"bag": [{"id": "wood", "n": 1, "name": "青木"}],
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


func _assert_dusk() -> bool:
	await _feed(_snap({}))
	await get_tree().create_timer(0.22).timeout
	await _feed(_snap({}))
	if not _has_tex(play, "char-warm"):
		printerr("NO_WARM_COAT")
		return false
	if not _has_tex(play, "char-pine"):
		printerr("NO_PINE_COAT")
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _no_fail(play):
		return false
	if Look.BODY < 220.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	var actors: Dictionary = play.get("_actors")
	if actors == null or not actors.has(YOU):
		printerr("NO_ACTOR")
		return false
	var body: ActorView = actors[YOU] as ActorView
	var sprite: Sprite2D = body.get("_sprite") as Sprite2D
	if sprite == null or sprite.texture == null:
		printerr("NO_SPRITE")
		return false
	if str(sprite.texture.resource_path).find("char-warm.png") < 0:
		printerr("NEW_FACE ", sprite.texture.resource_path)
		return false
	print("PLAY_DUSK_FACE")
	var mat := sprite.material as ShaderMaterial
	if mat == null:
		printerr("NO_PERSON_MAT")
		return false
	var grade := float(mat.get_shader_parameter("grade"))
	if grade < 0.2:
		printerr("NO_DUSK_GRADE ", grade)
		return false
	var dusk: Color = mat.get_shader_parameter("dusk")
	if dusk.r <= dusk.b or dusk.g <= dusk.b:
		printerr("COLD_KEY ", dusk)
		return false
	var edge := float(mat.get_shader_parameter("edge"))
	if edge < 0.08:
		printerr("HARD_CUT ", edge)
		return false
	var you_ink: Label = body.get("_name")
	if you_ink != null and you_ink.visible:
		printerr("YOU_TAG")
		return false
	await get_tree().process_frame
	_shot()
	print("PLAY_DUSK_GRADE")
	return true


func _shot() -> void:
	var img := get_viewport().get_texture().get_image()
	if img == null:
		return
	DirAccess.make_dir_recursive_absolute("/tmp/look-shots")
	img.save_png("/tmp/look-shots/play-dusk.png")
