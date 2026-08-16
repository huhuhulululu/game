extends Node

## Play.tscn keeps leftover chrome off. Painted cover stays the title.

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
const TORN := [
	"prop-hole.png",
	"prop-silk.png",
	"prop-torch.png",
	"prop-camp-pot.png",
	"prop-smith.png",
	"prop-booth.png",
	"prop-hearth.png",
	"prop-chop.png",
	"prop-oven.png",
	"prop-serve.png",
	"prop-cool.png",
	"prop-bin.png",
	"prop-shelf.png",
	"prop-way.png",
	"prop-vein.png",
	"prop-steps.png",
	"prop-cache.png",
	"prop-mouth.png",
	"prop-fire.png",
	"prop-rock.png",
	"prop-dock.png",
	"prop-ore.png",
	"prop-gate.png",
	"prop-beast.png",
]
const OLD_INK := [
	"prop-pot.png",
	"prop-cut.png",
	"prop-stove.png",
	"prop-pass.png",
	"prop-icebox.png",
	"prop-pantry.png",
	"prop-trash.png",
	"prop-door-open.png",
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
	if not await _assert_empty():
		get_tree().quit(1)
		return
	if not await _assert_do():
		get_tree().quit(1)
		return
	print("PLAY_CHROME_OK")
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
		"actors": [_actor({})],
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
			for torn in TORN:
				if path.find(str(torn)) >= 0:
					printerr("HUNG_TORN ", path)
					return false
			for old in OLD_INK:
				if path.find(str(old)) >= 0:
					printerr("OLD_INK ", path)
					return false
	for child in n.get_children():
		if not _no_fail(child):
			return false
	return true


func _live_kids(box: Node) -> int:
	if box == null:
		return 0
	var n := 0
	for child in box.get_children():
		if not child.is_queued_for_deletion():
			n += 1
	return n


func _has_ink(n: Node) -> bool:
	if n is Label and str((n as Label).text).strip_edges() != "":
		return true
	if n is Button and str((n as Button).text).strip_edges() != "":
		return true
	for child in n.get_children():
		if _has_ink(child):
			return true
	return false


func _leftover() -> bool:
	var toasts: Control = play.get("_toasts")
	var orders: Control = play.get("_orders")
	if toasts != null:
		if toasts.visible and _live_kids(toasts) == 0:
			printerr("EMPTY_TOAST_BOX")
			return true
		if toasts.size.y >= 200.0 and _live_kids(toasts) == 0:
			printerr("RESERVED_TOAST ", toasts.size)
			return true
	if orders != null:
		if orders.visible and _live_kids(orders) == 0:
			printerr("EMPTY_ORDER_BOX")
			return true
		if orders.size.y >= 140.0 and _live_kids(orders) == 0:
			printerr("RESERVED_ORDER ", orders.size)
			return true
	return _empty_tr(play)


func _empty_tr(n: Node) -> bool:
	if n is Panel:
		var p := n as Panel
		if p.is_visible_in_tree() and p.global_position.x >= 800.0 and p.global_position.y < 480.0:
			if not _has_ink(p):
				printerr("LEFTOVER_PANEL ", p.global_position, " ", p.size)
				return true
	if n is ColorRect:
		var r := n as ColorRect
		if r.is_visible_in_tree() and r.global_position.x >= 800.0 and r.global_position.y < 480.0:
			printerr("LEFTOVER_RECT ", r.global_position)
			return true
	for child in n.get_children():
		if _empty_tr(child):
			return true
	return false


func _find_do(n: Node) -> Button:
	if n is Button and (n as Button).text == "做":
		return n as Button
	for child in n.get_children():
		var hit := _find_do(child)
		if hit:
			return hit
	return null


func _assert_empty() -> bool:
	await _feed(_snap({}))
	if _leftover():
		return false
	await _feed(_snap({
		"toasts": ["", "  "],
	}))
	var toasts: Control = play.get("_toasts")
	if toasts != null and (toasts.visible or _live_kids(toasts) > 0):
		printerr("BLANK_TOAST")
		return false
	if _leftover():
		return false
	var plaque: Panel = play.get("_plaque")
	if plaque == null or plaque.size.x > 280.0:
		printerr("PLAQUE_LOST")
		return false
	if not _no_fail(play):
		return false
	if _has_tex(play, "cover-valley.png"):
		printerr("TITLE_COUPLE")
		return false
	print("PLAY_CHROME_EMPTY")
	return true


func _assert_do() -> bool:
	var act := _find_do(play)
	if act == null:
		printerr("NO_DO")
		return false
	act.emit_signal("button_down")
	play.set("_act", true)
	play.set("_held", true)
	await _feed(_snap({
		"prompt": "歇",
		"toasts": [],
		"orders": [],
	}))
	if _leftover():
		return false
	print("PLAY_CHROME_DO")
	await _feed(_snap({
		"toasts": ["火边坐了一会儿"],
	}))
	var box: Control = play.get("_toasts")
	if box == null or not box.visible or not _has_ink(box):
		printerr("TOAST_LOST")
		return false
	await _feed(_snap({
		"toasts": [],
	}))
	if box.visible or _live_kids(box) > 0:
		printerr("TOAST_LEFT")
		return false
	if _leftover():
		return false
	if Look.BODY < 180.0:
		printerr("COAT_STAMP ", Look.BODY)
		return false
	return true
