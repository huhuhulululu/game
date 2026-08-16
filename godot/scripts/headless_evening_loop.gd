extends SceneTree

## 钓 → 下锅 → 白天不能歇 → 夜里歇. Rules stay on the server snap.

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
	"#~~~~D~~~~~~D~~~~~~~~~~~~~~~~~,,~#",
	"#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~,,~#",
	"#................................#",
	"#......SS....GG....BB....YY......#",
	"#......S.................Y.....O.#",
	"#..............................V.#",
	"##################################",
]

var net: ValleyNet
var frames := 0
var phase := "join"
var snap: Dictionary = {}
var tiles_cache: Array = []
var tiles_zone := ""
var did_join := false
var fish_ok := false
var cook_ok := false
var day_no := false
var sleep_ok := false
var hold_left := 0
var act_cool := 0
var last_log := ""
var send_acc := 0.0
var start_day := 0
var started_ms := 0
var take_cool := 0


func _initialize() -> void:
	net = ValleyNet.new()
	root.add_child(net)
	net.joined.connect(_on_join)
	net.fail.connect(_on_fail)
	net.snap_got.connect(_on_snap)
	started_ms = Time.get_ticks_msec()
	print("EVENING connect ", net.ws_url())
	net.connect_room("暖", "", "left")


func _on_join(_side: String, room: String) -> void:
	did_join = true
	print("JOINED ", room)
	if phase == "join":
		phase = "go_dock"


func _on_fail(text: String) -> void:
	printerr("FAIL ", text)
	quit(2)


func _on_snap(s: Dictionary) -> void:
	snap = s
	if (s.get("tiles", []) as Array).size() > 0:
		tiles_cache = s.get("tiles", [])
		tiles_zone = str(s.get("zone", ""))
	_note()


func _note() -> void:
	var hid := _held_id()
	if hid.begins_with("fish") and not fish_ok:
		fish_ok = true
		print("FISH_OK ", _held_name())
	if hid.begins_with("dish") and not cook_ok:
		cook_ok = true
		print("COOK_OK ", _held_name())
	var texts := _toasts()
	if texts.find("取出") >= 0 and not cook_ok:
		cook_ok = true
		print("COOK_OK")
	if start_day == 0:
		start_day = int(snap.get("day", 0))
	if texts.find("还早") >= 0 and int(snap.get("day", 0)) == start_day and not day_no:
		day_no = true
		print("DAY_REST_NO")
	if texts.find("歇了一夜") >= 0 or (start_day > 0 and int(snap.get("day", 0)) > start_day):
		if not sleep_ok:
			sleep_ok = true
			print("SLEEP_OK")


func _toasts() -> String:
	var bits: PackedStringArray = []
	for raw in snap.get("toasts", []):
		bits.append(str(raw))
	return " ".join(bits)


func _held_id() -> String:
	return str(_me().get("held", "")).split(":")[0]


func _held_name() -> String:
	return str(_me().get("heldName", ""))


func _held_state() -> String:
	var raw := str(_me().get("held", ""))
	var bits := raw.split(":")
	return bits[1] if bits.size() > 1 else ""


func _fishing() -> String:
	return str(_me().get("fishing", "off"))


func _mark() -> float:
	return float(_me().get("fishMark", 0))


func _me() -> Dictionary:
	var you := str(snap.get("you", net.you_id))
	for raw in snap.get("actors", []):
		if typeof(raw) == TYPE_DICTIONARY and str((raw as Dictionary).get("id", "")) == you:
			return raw
	return {}


func _pos() -> Vector2:
	var at: Dictionary = snap.get("youAt", {})
	return Vector2(float(at.get("x", 0)), float(at.get("y", 0)))


func _zone() -> String:
	return str(snap.get("zone", "valley"))


func _prompt() -> String:
	return str(snap.get("prompt", ""))


func _tiles() -> PackedStringArray:
	var z := _zone()
	var src: Array = snap.get("tiles", [])
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
	for raw in snap.get("bag", []):
		if typeof(raw) == TYPE_DICTIONARY and str((raw as Dictionary).get("id", "")) == id:
			return int((raw as Dictionary).get("n", 0)) > 0
	return false


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
		return ch == "." or ch == "R"
	return not (ch == "#" or ch == "T" or ch == "C" or ch == "N" or ch == "~")


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
	while i < q.size() and i < 2500:
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


func _act_once(cool := 12) -> bool:
	if act_cool > 0:
		return false
	act_cool = cool
	return true


func _busy() -> String:
	return str(_me().get("busy", ""))


func _take_once(id: String) -> void:
	if take_cool > 0 or _held_id() != "":
		return
	take_cool = 16
	net.send_take(id)
	_log("TAKE " + id)


func _face_spot(ch: String, fallback: Vector2i, prefer: int, words: PackedStringArray) -> Dictionary:
	var tile := _find(ch)
	if tile.x < 0:
		tile = fallback
	var drive := _drive(tile, prefer)
	var move: Vector2 = drive["move"]
	var ptxt := _prompt()
	var hit := false
	for w in words:
		if ptxt.find(w) >= 0:
			hit = true
			break
	if hit:
		move = Vector2.ZERO
	elif bool(drive["here"]):
		move = _nudge(int(drive["facing"]))
	return {"move": move, "hit": hit, "facing": int(drive["facing"])}


func _process(_dt: float) -> bool:
	frames += 1
	send_acc += _dt
	if send_acc < 0.05:
		return false
	send_acc = 0.0
	if act_cool > 0:
		act_cool -= 1
	if take_cool > 0:
		take_cool -= 1
	if hold_left > 0:
		hold_left -= 1
	if start_day == 0:
		start_day = int(snap.get("day", 0))
	var move := Vector2.ZERO
	var act := false
	var held := hold_left > 0
	if phase == "go_dock":
		var step := _face_spot("D", Vector2i(5, 10), 2, PackedStringArray(["下竿", "起竿", "稳住"]))
		move = step["move"]
		if bool(step["hit"]) and _prompt() == "下竿" and _act_once():
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
			phase = "go_inn"
			_log("CAUGHT")
		elif _fishing() == "off" and _prompt() == "下竿" and _act_once():
			act = true
	elif phase == "fight":
		if fish_ok:
			phase = "go_inn"
			_log("CAUGHT")
		elif _fishing() == "fight" and _mark() > 0.40 and _mark() < 0.70 and _act_once(4):
			act = true
		elif _fishing() == "off" and _prompt() == "下竿":
			phase = "go_dock"
			_log("FISH_RETRY")
	elif phase == "go_inn":
		if _zone() == "kitchen":
			phase = "leave_door"
			_log("IN_KITCHEN")
		else:
			var step := _face_spot("I", Vector2i(21, 7), 0, PackedStringArray(["进厨房"]))
			move = step["move"]
			if bool(step["hit"]) and _act_once():
				act = true
	elif phase == "leave_door":
		if _prompt() == "出厨房":
			move = Vector2(1, 0)
		else:
			phase = "to_cut"
			_log("OFF_DOOR")
	elif phase == "to_cut":
		if _held_id() == "" and fish_ok:
			phase = "to_pot"
			_log("NO_FISH_HAND")
		elif _held_state() == "prepped" or _held_state() == "cooked" or _held_state() == "ready":
			phase = "to_pot"
			_log("PREPPED")
		else:
			var step := _face_spot("C", Vector2i(1, 3), 3, PackedStringArray(["切", "切着"]))
			move = step["move"]
			if _prompt() == "出厨房":
				move = Vector2(1, 0)
			elif bool(step["hit"]) and _prompt() == "切" and _act_once():
				act = true
				held = true
				hold_left = 90
				phase = "chop"
				_log("CHOP")
			elif _prompt() == "切着":
				phase = "chop"
	elif phase == "chop":
		held = true
		if _prompt() == "切着" or _busy() == "chop":
			pass
		elif _held_id() == "" and _prompt() == "切" and _act_once():
			act = true
		elif _held_id() != "":
			phase = "to_pot"
			_log("CHOP_DONE")
	elif phase == "to_pot":
		if _held_id() == "":
			if _bag_has("herb"):
				_take_once("herb")
			else:
				_take_once("wheat")
		var step := _face_spot("Q", Vector2i(10, 1), 0, PackedStringArray(["入锅", "开煮", "取 ·", "先切", "先下炉", "还没"]))
		move = step["move"]
		var ptxt := _prompt()
		if ptxt == "切" or ptxt == "切着" or ptxt == "丢掉" or ptxt == "出厨房":
			move = _seek(_center(10, 2))
		elif bool(step["hit"]):
			if ptxt.find("取 ·") >= 0 and _held_id() == "" and _act_once():
				act = true
				phase = "leave_kitchen"
				_log("DISH")
			elif ptxt.find("开煮") >= 0 and _act_once():
				act = true
				phase = "cook_wait"
				_log("BOIL")
			elif ptxt.find("入锅") >= 0 and _held_id() != "" and _act_once():
				act = true
				phase = "second"
				_log("POT1")
			elif ptxt.find("先切") >= 0:
				phase = "to_cut"
				_log("NEED_CHOP")
	elif phase == "second":
		if _held_id() == "":
			if _bag_has("herb"):
				_take_once("herb")
			elif _bag_has("wheat"):
				_take_once("wheat")
			elif _bag_has("egg"):
				_take_once("egg")
		if _held_id() != "":
			phase = "pot2"
			_log("SECOND " + _held_id())
	elif phase == "pot2":
		var step := _face_spot("Q", Vector2i(10, 1), 0, PackedStringArray(["入锅", "开煮", "取 ·", "锅还在"]))
		move = step["move"]
		var p2 := _prompt()
		if bool(step["hit"]) and (p2.find("入锅") >= 0 or p2.find("开煮") >= 0 or p2.find("取 ·") >= 0) and _act_once():
			act = true
		if p2.find("取 ·") >= 0:
			phase = "cook_wait"
		elif p2.find("锅还在") >= 0 or str(snap.get("potReady", "")) != "":
			phase = "cook_wait"
			_log("BOILING")
	elif phase == "cook_wait":
		if str(snap.get("potReady", "")) != "" and str(snap.get("potReady", "")) != "在煮":
			if _held_id() != "":
				phase = "dump"
				_log("HAND_FULL")
			elif _prompt().find("取 ·") >= 0 and _act_once():
				act = true
				phase = "leave_kitchen"
				_log("COOKED")
		elif _prompt().find("开煮") >= 0 and _act_once():
			act = true
		elif _prompt().find("取 ·") >= 0 and _held_id() == "" and _act_once():
			act = true
			phase = "leave_kitchen"
			_log("COOKED")
	elif phase == "dump":
		var step := _face_spot("X", Vector2i(14, 1), 0, PackedStringArray(["丢掉"]))
		move = step["move"]
		if bool(step["hit"]) and _act_once():
			act = true
			phase = "cook_wait"
			_log("DUMPED")
	elif phase == "leave_kitchen":
		if _zone() == "valley":
			phase = "go_bed_day"
			_log("LEFT_INN")
		else:
			if not cook_ok and _prompt().find("取 ·") >= 0 and _held_id() == "" and _act_once():
				act = true
			var step := _face_spot("L", Vector2i(1, 6), 3, PackedStringArray(["出厨房"]))
			move = step["move"]
			if bool(step["hit"]) and _act_once():
				act = true
	elif phase == "go_bed_day":
		if day_no:
			phase = "wait_night"
			_log("DAY_NO")
		else:
			var step := _face_spot("A", Vector2i(8, 7), 0, PackedStringArray(["还早", "歇一夜"]))
			move = step["move"]
			if bool(step["hit"]) and _prompt().find("还早") >= 0 and _act_once():
				act = true
			elif bool(step["hit"]) and _prompt().find("歇一夜") >= 0:
				day_no = true
				print("DAY_REST_NO")
				_log("ALREADY_NIGHT")
	elif phase == "wait_night":
		if sleep_ok:
			_finish()
		else:
			var step := _face_spot("A", Vector2i(8, 7), 0, PackedStringArray(["还早", "歇一夜"]))
			move = step["move"]
			if bool(step["hit"]) and _prompt().find("歇一夜") >= 0 and _act_once():
				act = true
				_log("SLEEP")
	if fish_ok and cook_ok and day_no and sleep_ok:
		_finish()
	net.send_input(move.x, move.y, act, held or act, false)
	if frames % 400 == 0:
		_log("TICK %s %s day=%s night=%s held=%s %s" % [phase, _pos(), snap.get("day", 0), snap.get("night", false), _held_id(), _prompt()])
	if Time.get_ticks_msec() - started_ms > 240000:
		printerr("TIMEOUT phase=%s fish=%s cook=%s day_no=%s sleep=%s prompt=%s held=%s pos=%s toasts=%s" % [phase, fish_ok, cook_ok, day_no, sleep_ok, _prompt(), _held_id(), _pos(), _toasts()])
		quit(1)
	return false


func _finish() -> void:
	if fish_ok and cook_ok and day_no and sleep_ok:
		print("EVENING_OK")
		quit(0)
		return
	printerr("INCOMPLETE fish=%s cook=%s day_no=%s sleep=%s" % [fish_ok, cook_ok, day_no, sleep_ok])
	quit(1)
