extends Node

## Camera sits the existing coat in the painted path. No new art.

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
	if not await _assert_frame():
		get_tree().quit(1)
		return
	print("PLAY_FRAME_OK")
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


func _assert_frame() -> bool:
	await _feed(_snap({}))
	await get_tree().create_timer(0.22).timeout
	await _feed(_snap({}))
	if not _has_tex(play, "char-warm"):
		printerr("NO_WARM_COAT")
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _no_fail(play):
		return false
	if Look.BODY < 220.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	var cam: Camera2D = play.get("_cam")
	if cam == null:
		printerr("NO_CAM")
		return false
	if cam.zoom.x < 2.05 or cam.zoom.x > 2.40:
		printerr("MURAL_ZOOM ", cam.zoom)
		return false
	print("PLAY_FRAME_ZOOM")
	var valley: Node2D = play.get("_valley")
	var mid: Vector2 = valley.size_px() * 0.5 if valley else Vector2(612, 306)
	if cam.position.distance_to(mid) < 40.0:
		printerr("CAM_BED_CENTER ", cam.position)
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
	var screen := body.get_global_transform_with_canvas().origin
	var vp := get_viewport().get_visible_rect().size
	if screen.x < 40.0 or screen.x > vp.x - 40.0:
		printerr("COAT_OFF_X ", screen)
		return false
	if screen.y < 80.0 or screen.y > vp.y - 20.0:
		printerr("COAT_OFF_Y ", screen)
		return false
	await get_tree().process_frame
	var img := get_viewport().get_texture().get_image()
	if img:
		DirAccess.make_dir_recursive_absolute("/tmp/look-shots")
		img.save_png("/tmp/look-shots/play-frame.png")
	print("PLAY_FRAME_SIT")
	return true
