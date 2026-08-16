extends Node

## Room card is dusk wood on the painted cover. Not a parchment form.

const FAIL := [
	"prop-cover-tree",
	"prop-cover-tree-b",
	"prop-cover-lamp",
	"prop-cover-shore",
	"prop-cover-verge",
	"prop-hut",
	"prop-lodge",
]
const TORN := [
	"prop-hole.png",
	"prop-silk.png",
	"prop-torch.png",
	"prop-camp-pot.png",
	"prop-smith.png",
	"prop-booth.png",
	"prop-beast.png",
]


var app: Node
var started := false


func _ready() -> void:
	app = (load("res://scripts/app.gd") as GDScript).new()
	add_child(app)


func _process(_dt: float) -> void:
	if started:
		return
	if app == null or app.get("_scene") == null:
		return
	started = true
	_run()


func _run() -> void:
	if not await _assert_room():
		get_tree().quit(1)
		return
	print("PLAY_ROOM_OK")
	get_tree().quit(0)


func _has_tex(n: Node, needle: String) -> bool:
	if n is TextureRect:
		var tex: Texture2D = (n as TextureRect).texture
		if tex and str(tex.resource_path).find(needle) >= 0:
			return true
	if n is Sprite2D:
		var tex2: Texture2D = (n as Sprite2D).texture
		if tex2 and str(tex2.resource_path).find(needle) >= 0:
			return true
	for child in n.get_children():
		if _has_tex(child, needle):
			return true
	return false


func _style_path(n: Control, kind: String) -> String:
	var sb := n.get_theme_stylebox(kind)
	if sb is StyleBoxTexture:
		var tex: Texture2D = (sb as StyleBoxTexture).texture
		if tex:
			return str(tex.resource_path)
	return ""


func _find_btn(n: Node, label: String) -> Button:
	if n is Button and (n as Button).text == label:
		return n as Button
	for child in n.get_children():
		var hit := _find_btn(child, label)
		if hit:
			return hit
	return null


func _no_fail(n: Node) -> bool:
	if n is Sprite2D or n is TextureRect:
		var tex: Texture2D = n.get("texture") as Texture2D
		if tex:
			var path := str(tex.resource_path)
			for bad in FAIL:
				if path.find(str(bad)) >= 0:
					printerr("FAIL_PROP ", path)
					return false
			for torn in TORN:
				if path.find(str(torn)) >= 0:
					printerr("HUNG_TORN ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _assert_room() -> bool:
	app.call("show_room")
	await get_tree().process_frame
	await get_tree().process_frame
	var room: Node = app.get("_scene")
	if room == null:
		printerr("NO_ROOM")
		return false
	if not _has_tex(room, "cover-valley.png"):
		printerr("ROOM_NO_COVER")
		return false
	if _has_tex(room, "char-warm") or _has_tex(room, "char-pine"):
		printerr("TITLE_COUPLE")
		return false
	var card: Panel = room.get_node_or_null("RoomCard") as Panel
	if card == null:
		printerr("NO_ROOM_CARD")
		return false
	var card_tex := _style_path(card, "panel")
	if card_tex.find("tex-room.png") < 0:
		printerr("ROOM_NOT_WOOD ", card_tex)
		return false
	if card_tex.find("tex-plaque.png") >= 0 or card_tex.find("tex-paper.png") >= 0:
		printerr("PARCHMENT_CARD ", card_tex)
		return false
	var open := _find_btn(room, "开一间")
	var warm := _find_btn(room, "暖")
	var pine := _find_btn(room, "松")
	if open == null or warm == null or pine == null:
		printerr("NO_WOOD_CHIPS")
		return false
	if _style_path(open, "normal").find("tex-slip.png") < 0:
		printerr("OPEN_NOT_SLIP ", _style_path(open, "normal"))
		return false
	if _style_path(warm, "normal").find("tex-slip.png") < 0:
		printerr("WARM_NOT_SLIP")
		return false
	if not _no_fail(room):
		return false
	if Look.BODY < 180.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	print("PLAY_ROOM_COVER")
	print("PLAY_ROOM_WOOD")
	return true
