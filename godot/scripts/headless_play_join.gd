extends Node

## Join-code face is the same dusk wood slip as 开一间. Not a leftover form.

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
	if not await _assert_join():
		get_tree().quit(1)
		return
	print("PLAY_JOIN_OK")
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


func _assert_join() -> bool:
	app.call("show_room")
	await get_tree().process_frame
	await get_tree().process_frame
	var room: Node = app.get("_scene")
	if room == null:
		printerr("NO_ROOM")
		return false
	if not _has_tex(room, "cover-valley.png"):
		printerr("JOIN_NO_COVER")
		return false
	if _has_tex(room, "char-warm") or _has_tex(room, "char-pine"):
		printerr("TITLE_COUPLE")
		return false
	var card: Panel = room.get_node_or_null("RoomCard") as Panel
	if card == null:
		printerr("NO_ROOM_CARD")
		return false
	var have := _find_btn(room, "我有房间码")
	if have == null:
		printerr("NO_HAVE_CHIP")
		return false
	have.emit_signal("pressed")
	await get_tree().process_frame
	await get_tree().process_frame
	var card_tex := _style_path(card, "panel")
	if card_tex.find("tex-room.png") < 0:
		printerr("JOIN_NOT_WOOD ", card_tex)
		return false
	if card_tex.find("tex-plaque.png") >= 0 or card_tex.find("tex-paper.png") >= 0:
		printerr("PARCHMENT_CARD ", card_tex)
		return false
	print("PLAY_JOIN_WOOD")
	var code: LineEdit = card.get_node_or_null("JoinCode") as LineEdit
	if code == null or not code.visible:
		printerr("NO_JOIN_CODE")
		return false
	if code.max_length != 4:
		printerr("JOIN_NOT_FOUR ", code.max_length)
		return false
	if _style_path(code, "normal").find("tex-slip.png") < 0:
		printerr("CODE_NOT_SLIP ", _style_path(code, "normal"))
		return false
	if _style_path(code, "normal").find("tex-paper.png") >= 0:
		printerr("CODE_PAPER")
		return false
	var go := _find_btn(room, "进去")
	var back := _find_btn(room, "回")
	if go == null or back == null:
		printerr("NO_JOIN_CHIPS")
		return false
	if not go.visible or not back.visible:
		printerr("JOIN_CHIPS_HIDDEN")
		return false
	if _style_path(go, "normal").find("tex-slip.png") < 0:
		printerr("GO_NOT_SLIP")
		return false
	if _style_path(back, "normal").find("tex-slip.png") < 0:
		printerr("BACK_NOT_SLIP")
		return false
	var open := _find_btn(room, "开一间")
	if open != null and open.visible:
		printerr("OPEN_STILL_UP")
		return false
	print("PLAY_JOIN_CODE")
	back.emit_signal("pressed")
	await get_tree().process_frame
	await get_tree().process_frame
	open = _find_btn(room, "开一间")
	if open == null or not open.visible:
		printerr("OPEN_NOT_BACK")
		return false
	if code.visible:
		printerr("CODE_STILL_UP")
		return false
	if not _no_fail(room):
		return false
	if Look.BODY < 180.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	return true
