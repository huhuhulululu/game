extends SceneTree

## 田种收 → 卦棚问 → 看板揭 → 白天不能歇 → 夜里歇. Rules stay on the server snap.

const TILE := 36
const DIRS := [Vector2i(0, -1), Vector2i(1, 0), Vector2i(0, 1), Vector2i(-1, 0)]
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
var field_ok := false
var fortune_ok := false
var board_ok := false
var day_no := false
var sleep_ok := false
var harvest_ok := false
var mapped := false
var act_cool := 0
var last_log := ""
var send_acc := 0.0
var start_day := 0
var started_ms := 0


func _initialize() -> void:
	net = ValleyNet.new()
	root.add_child(net)
	net.joined.connect(_on_join)
	net.fail.connect(_on_fail)
	net.snap_got.connect(_on_snap)
	started_ms = Time.get_ticks_msec()
	print("VILLAGE connect ", net.ws_url())
	net.connect_room("暖", "", "left")


func _on_join(_side: String, room: String) -> void:
	did_join = true
	print("JOINED ", room)
	if phase == "join":
		phase = "go_field"


func _on_fail(text: String) -> void:
	printerr("FAIL ", text)
	quit(2)


func _on_snap(s: Dictionary) -> void:
	snap = s
	if (s.get("tiles", []) as Array).size() > 0:
		tiles_cache = s.get("tiles", [])
		tiles_zone = str(s.get("zone", ""))
	if not mapped and _zone() == "valley":
		var vm := preload("res://scenes/valley.tscn").instantiate() as ValleyWorld
		root.add_child(vm)
		vm.show_crops(s.get("plots", []))
		mapped = true
		print("FIELD_MAP_OK")
	_note()


func _note() -> void:
	var texts := _toasts()
	if not field_ok:
		var planted := texts.find("种下") >= 0
		var plots: Array = snap.get("plots", [])
		if plots.size() > 0 and typeof(plots[0]) == TYPE_DICTIONARY and str((plots[0] as Dictionary).get("seed", "")) != "":
			planted = true
		if planted:
			field_ok = true
			print("FIELD_OK")
	var fortune: Variant = snap.get("fortune", {})
	if typeof(fortune) == TYPE_DICTIONARY and str((fortune as Dictionary).get("title", "")) != "" and not fortune_ok:
		if texts.find("另一只手") < 0 and texts.find("两个人") < 0:
			fortune_ok = true
			print("FORTUNE_OK")
	if (snap.get("board", []) as Array).size() > 0 and not board_ok:
		if texts.find("另一只手") < 0:
			board_ok = true
			print("BOARD_OK")
	if texts.find("还早") >= 0 and int(snap.get("day", 0)) == start_day and not day_no:
		day_no = true
		print("DAY_REST_NO")
	if texts.find("歇了一夜") >= 0 or int(snap.get("day", 0)) > start_day:
		if not sleep_ok:
			sleep_ok = true
			print("SLEEP_OK")
	var hid := _held_id()
	if hid == "tomato" or hid == "greens" or hid == "wheat" or (texts.find("收了") >= 0 and texts.find("手里") >= 0):
		if not harvest_ok:
			harvest_ok = true
			print("HARVEST_OK")


func _toasts() -> String:
	var bits: PackedStringArray = []
	for raw in snap.get("toasts", []):
		bits.append(str(raw))
	return " ".join(bits)


func _held_id() -> String:
	return str(_me().get("held", "")).split(":")[0]


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
	return {"move": move, "hit": hit}


func _process(_dt: float) -> bool:
	frames += 1
	send_acc += _dt
	if send_acc < 0.05:
		return false
	send_acc = 0.0
	if act_cool > 0:
		act_cool -= 1
	if start_day == 0:
		start_day = int(snap.get("day", 0))
	var move := Vector2.ZERO
	var act := false
	if phase == "go_field":
		if field_ok:
			phase = "go_bed_day"
			_log("PLANTED")
		else:
			var step := _face_spot("P", Vector2i(12, 8), 0, PackedStringArray(["种", "不用浇", "还在长", "熟了"]))
			move = step["move"]
			if bool(step["hit"]) and _prompt().find("种") >= 0 and _act_once():
				act = true
	elif phase == "go_bed_day":
		if day_no:
			phase = "go_gacha"
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
	elif phase == "go_gacha":
		if fortune_ok:
			phase = "go_board"
			_log("ASKED")
		else:
			var step := _face_spot("G", Vector2i(13, 13), 0, PackedStringArray(["问今日", "已问过"]))
			move = step["move"]
			if bool(step["hit"]) and _act_once():
				act = true
	elif phase == "go_board":
		if board_ok:
			phase = "go_bed_night"
			_log("UNCOVERED")
		else:
			var step := _face_spot("B", Vector2i(19, 13), 0, PackedStringArray(["揭", "今晚"]))
			move = step["move"]
			if bool(step["hit"]) and _act_once():
				act = true
	elif phase == "go_bed_night":
		if sleep_ok:
			phase = "go_harvest"
			_log("SLEPT")
		else:
			var step := _face_spot("A", Vector2i(8, 7), 0, PackedStringArray(["还早", "歇一夜"]))
			move = step["move"]
			if bool(step["hit"]) and _prompt().find("歇一夜") >= 0 and _act_once():
				act = true
	elif phase == "go_harvest":
		if harvest_ok:
			_finish()
		else:
			var step := _face_spot("P", Vector2i(12, 8), 0, PackedStringArray(["熟了", "还在长", "不用浇", "种"]))
			move = step["move"]
			if bool(step["hit"]) and _prompt().find("熟了") >= 0 and _act_once():
				act = true
	net.send_input(move.x, move.y, act, act, false)
	if field_ok and fortune_ok and board_ok and day_no and sleep_ok and harvest_ok:
		_finish()
	if frames % 400 == 0:
		_log("TICK %s %s day=%s night=%s %s" % [phase, _pos(), snap.get("day", 0), snap.get("night", false), _prompt()])
	if Time.get_ticks_msec() - started_ms > 240000:
		printerr("TIMEOUT phase=%s field=%s fortune=%s board=%s day_no=%s sleep=%s harvest=%s prompt=%s held=%s pos=%s" % [phase, field_ok, fortune_ok, board_ok, day_no, sleep_ok, harvest_ok, _prompt(), _held_id(), _pos()])
		quit(1)
	return false


func _finish() -> void:
	if field_ok and fortune_ok and board_ok and day_no and sleep_ok and harvest_ok:
		print("VILLAGE_OK")
		quit(0)
		return
	printerr("INCOMPLETE field=%s fortune=%s board=%s day_no=%s sleep=%s harvest=%s" % [field_ok, fortune_ok, board_ok, day_no, sleep_ok, harvest_ok])
	quit(1)
