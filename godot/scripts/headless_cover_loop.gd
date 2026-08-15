extends Node

## Cover → 开一间 → fish → mine → kitchen. Drives Play, not a second net.

const TILE := 36
const DIRS := [Vector2i(0, -1), Vector2i(1, 0), Vector2i(0, 1), Vector2i(-1, 0)]
const KITCHEN_ROWS: PackedStringArray = [
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
const VALLEY_ROWS: PackedStringArray = [
	"##################################",
	"#TTTT..........TTTTTTTT..........#",
	"#TTTT...EE.....TTFFTTTT..........#",
	"#.......EE........FF.............#",
	"#................................#",
	"#....CCCC..........NNNN..........#",
	"#....C..C...PPPP...N..N..........#",
	"#....C..A...PPPP...N..I..........#",
	"#...........PPPP.................#",
	"#....,,,,,,,,,,,,,,,,,,,,,.......#",
	"#~~~~D~~~~~~D~~~~~~~~~~~~~~~~~~~~#",
	"#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
	"#................................#",
	"#......SS....GG....BB....YY......#",
	"#......S.................Y.....O.#",
	"#..............................V.#",
	"##################################",
]

var app: Node
var play: Node
var frames := 0
var phase := "boot"
var fish_ok := false
var ore_ok := false
var plate_ok := false
var hold_left := 0
var act_cool := 0
var last_log := ""
var tiles_cache: Array = []
var tiles_zone := ""


func _ready() -> void:
	app = preload("res://scripts/app.gd").new()
	add_child(app)
	if not Net.fail.is_connected(_on_fail):
		Net.fail.connect(_on_fail)
	print("COVER_LOOP ws ", Net.ws_url())


func _on_fail(text: String) -> void:
	printerr("NET_FAIL ", text)
	get_tree().quit(2)


func _process(_dt: float) -> void:
	frames += 1
	if act_cool > 0:
		act_cool -= 1
	if hold_left > 0:
		hold_left -= 1
	if phase == "boot" and frames == 4:
		_click(Vector2(640, 360))
		phase = "room"
	elif phase == "room" and frames == 8:
		var open := _find_button(app, "开一间")
		if open:
			open.emit_signal("pressed")
			print("CLICK 开一间")
		else:
			printerr("NO_OPEN_BUTTON")
			get_tree().quit(2)
		phase = "wait_play"
	elif phase == "wait_play":
		play = _find_play()
		if play and Net.last_snap.size() > 0:
			phase = "go_dock"
			print("ENTER ", _pos(), " ", _zone())
	elif play:
		_drive_play()
	if frames > 16000:
		printerr("TIMEOUT phase=%s fish=%s ore=%s plate=%s held=%s zone=%s prompt=%s" % [phase, fish_ok, ore_ok, plate_ok, _held_id(), _zone(), _prompt()])
		get_tree().quit(1)


func _drive_play() -> void:
	_note()
	var move := Vector2.ZERO
	var act := false
	var held := hold_left > 0
	if phase == "go_dock":
		var drive := _drive(Vector2i(5, 10), 2)
		move = drive["move"]
		if bool(drive["here"]) or _prompt() == "下竿":
			move = _nudge(int(drive["facing"])) if _prompt() != "下竿" else Vector2.ZERO
			if _prompt() == "下竿" and _act_once():
				act = true
				phase = "wait_bite"
				_log("CAST")
	elif phase == "wait_bite":
		if _fishing() == "bite" or _prompt() == "起竿":
			if _act_once():
				act = true
				phase = "fight"
				_log("HOOK")
		elif _fishing() != "wait" and _fishing() != "bite" and fish_ok:
			phase = "after_fish"
		elif _fishing() == "off" and _prompt() == "下竿" and _act_once():
			act = true
	elif phase == "fight":
		if fish_ok:
			phase = "after_fish"
		elif _fishing() == "fight" and _mark() > 0.40 and _mark() < 0.70 and _act_once():
			act = true
		elif _fishing() == "off" and _prompt() == "下竿":
			phase = "go_dock"
			_log("FISH_RETRY")
	elif phase == "after_fish":
		phase = "go_mine"
		_log(phase)
	elif phase == "go_mine":
		var door := _find("E")
		if door.x < 0:
			door = Vector2i(8, 3)
		var drive2 := _drive(door, 0)
		move = drive2["move"]
		if _zone() == "mine":
			phase = "in_mine"
			_log("IN_MINE")
		elif bool(drive2["here"]) or _prompt() == "进矿":
			move = _nudge(int(drive2["facing"])) if _prompt() != "进矿" else Vector2.ZERO
			if _prompt() == "进矿" and _act_once():
				act = true
	elif phase == "in_mine":
		if ore_ok:
			phase = "out_mine"
			_log("DUG")
		else:
			var ore := _find("o")
			if ore.x < 0:
				ore = Vector2i(3, 2)
			var drive3 := _drive(ore, 0)
			move = drive3["move"]
			if _prompt() == "挖":
				move = Vector2.ZERO
				if _act_once():
					act = true
			elif bool(drive3["here"]):
				move = _nudge(int(drive3["facing"]))
	elif phase == "out_mine":
		if _zone() == "valley":
			phase = "go_inn"
			_log("LEFT_MINE")
		else:
			var leave := _find("L")
			if leave.x < 0:
				leave = Vector2i(1, 1)
			var drive4 := _drive(leave, 3)
			move = drive4["move"]
			if bool(drive4["here"]) or _prompt() == "出矿":
				move = _nudge(int(drive4["facing"])) if _prompt() != "出矿" else Vector2.ZERO
				if _prompt() == "出矿" and _act_once():
					act = true
	elif phase == "go_inn":
		var inn := _find("I")
		if inn.x < 0:
			inn = Vector2i(22, 7)
		var drive5 := _drive(inn, 0)
		move = drive5["move"]
		if _zone() == "kitchen":
			phase = "to_cut"
			_log("IN_KITCHEN")
		elif bool(drive5["here"]) or _prompt() == "进厨房":
			move = _nudge(int(drive5["facing"])) if _prompt() != "进厨房" else Vector2.ZERO
			if _prompt() == "进厨房" and _act_once():
				act = true
	elif phase == "dump":
		var trash := _find("X")
		if trash.x < 0:
			trash = Vector2i(14, 1)
		var drive_d := _drive(trash, 0)
		move = drive_d["move"]
		if bool(drive_d["here"]) or _prompt() == "丢掉":
			move = _nudge(int(drive_d["facing"])) if _prompt() != "丢掉" else Vector2.ZERO
			if _prompt() == "丢掉" and _act_once():
				act = true
				phase = "to_cut"
				_log("DUMPED")
	elif phase == "to_cut":
		if _held_id() == "ore" or _held_id() == "wood" or _held_id() == "flint":
			phase = "dump"
			_log("DUMP")
		else:
			if _held_id() == "":
				var extra := _bag_cook()
				if extra != "":
					Net.send_take(extra)
					_log("TAKE " + extra)
			var cut := _find("C")
			if cut.x < 0:
				cut = Vector2i(1, 3)
			var drive6 := _drive(cut, 3)
			move = drive6["move"]
			if bool(drive6["here"]) or _prompt() == "切" or _prompt() == "切着":
				move = _nudge(int(drive6["facing"])) if _prompt() != "切" and _prompt() != "切着" else Vector2.ZERO
				if _prompt() == "切" and _act_once():
					act = true
					held = true
					hold_left = 40
					phase = "chop"
					_log("CHOP")
				elif _prompt() == "切着":
					phase = "chop"
	elif phase == "chop":
		held = true
		if _prompt() == "切着":
			pass
		elif _held_id() == "" and _prompt() == "切" and _act_once():
			act = true
		elif _held_id() != "" or _prompt() != "切":
			phase = "to_pot"
			_log("CHOP_DONE")
	elif phase == "to_pot":
		if _held_id() == "":
			var more := _bag_cook()
			if more != "":
				Net.send_take(more)
		var pot := _find("Q")
		if pot.x < 0:
			pot = Vector2i(10, 1)
		var drive7 := _drive(pot, 0)
		move = drive7["move"]
		var ptxt := _prompt()
		if ptxt == "切" or ptxt == "切着" or ptxt == "丢掉":
			move = _seek(_center(10, 2))
		elif bool(drive7["here"]) or ptxt.find("入锅") >= 0 or ptxt.find("开煮") >= 0 or ptxt.find("取 ·") >= 0:
			move = _nudge(int(drive7["facing"])) if ptxt.find("入锅") < 0 and ptxt.find("开煮") < 0 and ptxt.find("取 ·") < 0 else Vector2.ZERO
			if ptxt.find("取 ·") >= 0 and _act_once():
				act = true
				phase = "to_window"
				_log("DISH")
			elif ptxt.find("开煮") >= 0 and _act_once():
				act = true
				phase = "cook_wait"
				_log("BOIL")
			elif ptxt.find("入锅") >= 0 and _held_id() != "" and _act_once():
				act = true
				phase = "second"
				_log("POT1")
	elif phase == "second":
		var extra2 := _bag_cook()
		if extra2 != "":
			Net.send_take(extra2)
			phase = "pot2"
			_log("TAKE " + extra2)
		else:
			phase = "pot2"
	elif phase == "pot2":
		var pot2 := _find("Q")
		if pot2.x < 0:
			pot2 = Vector2i(10, 1)
		var drive8 := _drive(pot2, 0)
		move = drive8["move"]
		var p2 := _prompt()
		if bool(drive8["here"]) or p2.find("入锅") >= 0 or p2.find("开煮") >= 0 or p2.find("取 ·") >= 0 or p2.find("锅还在") >= 0:
			move = Vector2.ZERO
			if (p2.find("入锅") >= 0 or p2.find("开煮") >= 0 or p2.find("取 ·") >= 0) and _act_once():
				act = true
			if p2.find("取 ·") >= 0:
				phase = "to_window"
			elif p2.find("锅还在") >= 0 or str(Net.last_snap.get("potReady", "")) != "":
				phase = "cook_wait"
	elif phase == "cook_wait":
		if str(Net.last_snap.get("potReady", "")) != "" or _prompt().find("取 ·") >= 0:
			if _act_once():
				act = true
				phase = "to_window"
				_log("COOKED")
		elif _prompt().find("开煮") >= 0 and _act_once():
			act = true
	elif phase == "to_window":
		if not _held_id().begins_with("dish") and _prompt().find("取 ·") >= 0 and _act_once():
			act = true
		var win := _find("W")
		if win.x < 0:
			win = Vector2i(14, 7)
		var drive9 := _drive(win, 1)
		move = drive9["move"]
		if bool(drive9["here"]) or _prompt().find("上菜") >= 0:
			move = _nudge(int(drive9["facing"])) if _prompt().find("上菜") < 0 else Vector2.ZERO
			if _prompt().find("上菜") >= 0 and _act_once():
				act = true
				if plate_ok or _held_id() == "":
					_finish()
	if play:
		play.set("_stick_v", move)
		if act:
			play.set("_act", true)
		play.set("_held", held or act)


func _note() -> void:
	var held := _held_id()
	if held.begins_with("fish") and not fish_ok:
		fish_ok = true
		print("FISH_OK ", _held_name())
	if (held == "ore" or _bag_has("ore")) and not ore_ok:
		ore_ok = true
		print("ORE_OK")
	if held.begins_with("dish") and not plate_ok:
		plate_ok = true
		print("PLATE_OK ", _held_name())


func _held_id() -> String:
	return str(_me().get("held", "")).split(":")[0]


func _held_name() -> String:
	return str(_me().get("heldName", ""))


func _fishing() -> String:
	return str(_me().get("fishing", "off"))


func _mark() -> float:
	return float(_me().get("fishMark", 0))


func _me() -> Dictionary:
	var you := str(Net.last_snap.get("you", Net.you_id))
	for raw in Net.last_snap.get("actors", []):
		if typeof(raw) == TYPE_DICTIONARY and str((raw as Dictionary).get("id", "")) == you:
			return raw
	return {}


func _pos() -> Vector2:
	var at: Dictionary = Net.last_snap.get("youAt", {})
	return Vector2(float(at.get("x", 0)), float(at.get("y", 0)))


func _zone() -> String:
	return str(Net.last_snap.get("zone", "valley"))


func _prompt() -> String:
	return str(Net.last_snap.get("prompt", ""))


func _tiles() -> PackedStringArray:
	var z := _zone()
	var src: Array = Net.last_snap.get("tiles", [])
	if src.size() > 0:
		tiles_cache = src
		tiles_zone = z
	elif tiles_zone == z and tiles_cache.size() > 0:
		src = tiles_cache
	else:
		src = []
	var out: PackedStringArray = []
	for row in src:
		out.append(str(row))
	return out


func _bag_has(id: String) -> bool:
	for raw in Net.last_snap.get("bag", []):
		if typeof(raw) == TYPE_DICTIONARY and str((raw as Dictionary).get("id", "")) == id:
			return int((raw as Dictionary).get("n", 0)) > 0
	return false


func _bag_cook() -> String:
	for id in ["herb", "osmanthus", "greens", "tomato", "egg", "wheat", "mushroom", "fish"]:
		if _bag_has(id) and _held_id() != id:
			return id
	return ""


func _find(ch: String) -> Vector2i:
	var rows := _tiles()
	for y in rows.size():
		var x := rows[y].find(ch)
		if x >= 0:
			return Vector2i(x, y)
	return Vector2i(-1, -1)


func _center(tx: int, ty: int) -> Vector2:
	return Vector2(tx * TILE + TILE / 2.0, ty * TILE + TILE / 2.0)


func _stand(tx: int, ty: int, facing: int) -> Vector2:
	var d: Vector2i = DIRS[facing]
	return _center(tx - d.x, ty - d.y)


func _approach(tx: int, ty: int, prefer: int = 0) -> Dictionary:
	var order: Array[int] = [prefer, 0, 1, 2, 3]
	for facing in order:
		var pos := _stand(tx, ty, facing)
		if _walk_at(_tile_of(pos)):
			return {"pos": pos, "facing": facing}
	return {"pos": _center(tx, ty), "facing": prefer}


func _drive(tile: Vector2i, prefer: int) -> Dictionary:
	if tile.x < 0:
		return {"move": Vector2.ZERO, "here": false, "facing": prefer}
	var ap := _approach(tile.x, tile.y, prefer)
	var pos: Vector2 = ap["pos"]
	var facing := int(ap["facing"])
	return {"move": _path_move(pos), "here": _here(pos), "facing": facing}


func _seek(target: Vector2) -> Vector2:
	var d := target - _pos()
	if d.length() <= 11.0:
		return Vector2.ZERO
	return d.normalized()


func _tile_of(p: Vector2) -> Vector2i:
	return Vector2i(int(floor(p.x / TILE)), int(floor(p.y / TILE)))


func _nav_rows() -> PackedStringArray:
	var rows := _tiles()
	if not rows.is_empty():
		return rows
	if _zone() == "kitchen":
		return KITCHEN_ROWS
	if _zone() == "valley":
		return VALLEY_ROWS
	return rows


func _walk_at(p: Vector2i) -> bool:
	var rows := _nav_rows()
	if p.y < 0 or p.y >= rows.size():
		return false
	if p.x < 0 or p.x >= rows[p.y].length():
		return false
	var ch := rows[p.y][p.x]
	if _zone() == "kitchen":
		return ch == "." or ch == "L" or ch == "R"
	if _zone() == "mine":
		return ch != "#"
	return not (ch == "#" or ch == "T" or ch == "C" or ch == "N")


func _bfs_next(goal: Vector2) -> Vector2i:
	var start := _tile_of(_pos())
	var end := _tile_of(goal)
	if start == end:
		return Vector2i(-1, -1)
	var q: Array[Vector2i] = [start]
	var came := {}
	var seen := {}
	seen[start] = true
	var i := 0
	while i < q.size() and i < 500:
		var cur: Vector2i = q[i]
		i += 1
		for d in DIRS:
			var nxt: Vector2i = cur + d
			if seen.has(nxt) or not _walk_at(nxt):
				continue
			seen[nxt] = true
			came[nxt] = cur
			q.append(nxt)
			if nxt == end:
				var step := nxt
				while came.has(step) and came[step] != start:
					step = came[step]
				return step
	return Vector2i(-1, -1)


func _path_move(target: Vector2) -> Vector2:
	var step := _bfs_next(target)
	if step.x < 0:
		return _seek(target)
	return _seek(_center(step.x, step.y))


func _nudge(facing: int) -> Vector2:
	var d: Vector2i = DIRS[facing]
	return Vector2(d.x, d.y) * 0.35


func _here(target: Vector2) -> bool:
	return _pos().distance_to(target) <= 14.0


func _log(msg: String) -> void:
	if msg == last_log:
		return
	last_log = msg
	print(msg)


func _act_once() -> bool:
	if act_cool > 0:
		return false
	act_cool = 12
	return true


func _find_play() -> Node:
	for child in app.get_children():
		if child.has_method("_clamp_cam"):
			return child
	return null


func _find_button(n: Node, text: String) -> Button:
	if n is Button and (n as Button).text == text:
		return n
	for child in n.get_children():
		var found := _find_button(child, text)
		if found:
			return found
	return null


func _click(pos: Vector2) -> void:
	var down := InputEventMouseButton.new()
	down.button_index = MOUSE_BUTTON_LEFT
	down.pressed = true
	down.position = pos
	down.global_position = pos
	get_viewport().push_input(down)
	var up := down.duplicate()
	up.pressed = false
	get_viewport().push_input(up)


func _finish() -> void:
	if fish_ok and ore_ok and plate_ok:
		print("COVER_LOOP_OK")
		get_tree().quit(0)
	else:
		printerr("INCOMPLETE fish=%s ore=%s plate=%s" % [fish_ok, ore_ok, plate_ok])
		get_tree().quit(1)
