extends Node

## In-valley 做 / 喊 / 声 are quiet wood slips. Not a stacked plaque box.

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
	if not _assert_hands():
		get_tree().quit(1)
		return
	print("PLAY_QUIET_OK")
	get_tree().quit(0)


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


func _assert_hands() -> bool:
	var act := _find_btn(play, "做")
	var shout := _find_btn(play, "喊")
	var mute := _find_btn(play, "声")
	if act == null or shout == null or mute == null:
		printerr("NO_HAND_CHIPS")
		return false
	var act_tex := _style_path(act, "normal")
	var shout_tex := _style_path(shout, "normal")
	var mute_tex := _style_path(mute, "normal")
	if act_tex.find("tex-slip.png") < 0 or shout_tex.find("tex-slip.png") < 0:
		printerr("HAND_NOT_SLIP ", act_tex, " ", shout_tex)
		return false
	if act_tex.find("tex-plaque.png") >= 0 or shout_tex.find("tex-plaque.png") >= 0:
		printerr("PLAQUE_HAND")
		return false
	if mute_tex.find("tex-slip.png") < 0 or mute_tex.find("tex-plaque.png") >= 0:
		printerr("MUTE_NOT_SLIP ", mute_tex)
		return false
	if act.position.x == shout.position.x and shout.position.x == mute.position.x:
		printerr("HARD_STACK")
		return false
	if act.size == shout.size and shout.size == mute.size:
		printerr("IDENTICAL_BOXES")
		return false
	print("PLAY_QUIET_SLIP")
	if mute.size.x >= act.size.x or mute.size.y >= act.size.y:
		printerr("MUTE_NOT_TINY ", mute.size)
		return false
	print("PLAY_QUIET_MUTE")
	var plaque: Panel = play.get("_plaque")
	if plaque == null or plaque.size.x > 280.0 or plaque.size.y > 80.0:
		printerr("PLAQUE_LOST")
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	if not _no_fail(play):
		return false
	if Look.BODY < 180.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	return true
