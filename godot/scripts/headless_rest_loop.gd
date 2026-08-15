extends SceneTree

## 出谷 → 砍/捡/火 → 砧绿窗 → 摊绿窗. Rules stay on the server snap.

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
	"#~~~~D~~~~~~D~~~~~~~~~~~~~~~~~~~~#",
	"#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
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
var wild_ok := false
var forge_ok := false
var stall_ok := false
var chopped := false
var picked := false
var fired := false
var mapped := false
var act_cool := 0
var last_log := ""
var send_acc := 0.0
var ore_need := 2


func _initialize() -> void:
	net = ValleyNet.new()
	root.add_child(net)
	net.joined.connect(_on_join)
	net.fail.connect(_on_fail)
	net.snap_got.connect(_on_snap)
	print("REST connect ", net.ws_url())
	net.connect_room("暖", "", "left")


func _on_join(_side: String, room: String) -> void:
	did_join = true
	print("JOINED ", room)
	if phase == "join":
		phase = "go_gate"


func _on_fail(text: String) -> void:
	printerr("FAIL ", text)
	quit(2)


func _on_snap(s: Dictionary) -> void:
	snap = s
	if (s.get("tiles", []) as Array).size() > 0:
		tiles_cache = s.get("tiles", [])
		tiles_zone = str(s.get("zone", ""))
	if _zone() == "wild" and not mapped and tiles_cache.size() > 0:
		var zm := ZoneMap.new()
		root.add_child(zm)
		zm.show_map("wild", tiles_cache)
		zm.show_fog(s.get("revealed", []), s.get("visible", []), s.get("fires", []))
		mapped = true
		print("WILD_MAP_OK ", tiles_cache.size(), "x", str(tiles_cache[0]).length() if tiles_cache.size() > 0 else 0)
	_note()


func _note() -> void:
	var texts := _toasts()
	if _zone() == "wild" and str(snap.get("revealed", [])).length() > 2:
		pass
	if texts.find("砍下") >= 0:
		chopped = true
	if texts.find("采到") >= 0:
		picked = true
	if texts.find("添旺") >= 0 or texts.find("火还旺") >= 0:
		fired = true
	if chopped and picked and fired and _zone() == "valley" and not wild_ok:
		wild_ok = true
		print("WILD_OK")
	if texts.find("收刃") >= 0 or _gear():
		if not forge_ok:
			forge_ok = true
			print("FORGE_OK")
	if texts.find("买下") >= 0:
		if not stall_ok:
			stall_ok = true
			print("STALL_OK")


func _toasts() -> String:
	var bits: PackedStringArray = []
	for raw in snap.get("toasts", []):
		bits.append(str(raw))
	return " ".join(bits)


func _gear() -> bool:
	return (snap.get("gear", []) as Array).size() > 0


func _held_id() -> String:
	return str(_me().get("held", "")).split(":")[0]


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


func _bag_n(id: String) -> int:
	for raw in snap.get("bag", []):
		if typeof(raw) == TYPE_DICTIONARY and str((raw as Dictionary).get("id", "")) == id:
			return int((raw as Dictionary).get("n", 0))
	return 0


func _ore_count() -> int:
	return _bag_n("ore") + (1 if _held_id() == "ore" else 0)


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
	if _zone() == "mine":
		return ch != "#"
	if _zone() == "wild":
		return not (ch == "#" or ch == "T" or ch == "~")
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


func _act_once() -> bool:
	if act_cool > 0:
		return false
	act_cool = 12
	return true


func _green() -> bool:
	return _fishing() == "fight" and _mark() > 0.40 and _mark() < 0.70


func _process(_dt: float) -> bool:
	frames += 1
	send_acc += _dt
	if send_acc < 0.05:
		return false
	send_acc = 0.0
	if act_cool > 0:
		act_cool -= 1
	var drive := _drive(Vector2i(-1, -1), 2)
	var move: Vector2 = drive["move"]
	var act := false
	if phase == "go_gate":
		var gate := _find("V")
		if gate.x < 0:
			gate = Vector2i(31, 15)
		drive = _drive(gate, 1)
		move = drive["move"]
		if _zone() == "wild":
			phase = "wild_chop"
			_log("IN_WILD")
		elif bool(drive["here"]) or _prompt().find("出谷") >= 0:
			move = _nudge(int(drive["facing"])) if _prompt().find("出谷") < 0 else Vector2.ZERO
			if _prompt().find("出谷") >= 0 and _act_once():
				act = true
	elif phase == "wild_chop":
		if chopped:
			phase = "wild_pick"
			_log("CHOPPED")
		else:
			var tree := _find("t")
			drive = _drive(tree, 0)
			move = drive["move"]
			if _prompt() == "砍":
				move = Vector2.ZERO
				if _act_once():
					act = true
			elif bool(drive["here"]):
				move = _nudge(int(drive["facing"]))
	elif phase == "wild_pick":
		if picked:
			phase = "wild_fire"
			_log("PICKED")
		else:
			var bush := _find("F")
			drive = _drive(bush, 0)
			move = drive["move"]
			if _prompt() == "采":
				move = Vector2.ZERO
				if _act_once():
					act = true
			elif bool(drive["here"]):
				move = _nudge(int(drive["facing"]))
	elif phase == "wild_fire":
		if fired:
			phase = "out_wild"
			_log("FIRED")
		else:
			var fire := _find("K")
			drive = _drive(fire, 0)
			move = drive["move"]
			var ptxt := _prompt()
			if ptxt.find("添火") >= 0 or ptxt.find("火还旺") >= 0 or ptxt.find("搓火把") >= 0 or ptxt.find("烤") >= 0:
				move = Vector2.ZERO
				if _act_once():
					act = true
					if ptxt.find("火还旺") >= 0:
						fired = true
			elif bool(drive["here"]):
				move = _nudge(int(drive["facing"]))
	elif phase == "out_wild":
		if _zone() == "valley":
			phase = "go_mine"
			_log("LEFT_WILD")
		else:
			var leave := _find("L")
			drive = _drive(leave, 2)
			move = drive["move"]
			if bool(drive["here"]) or _prompt() == "回山谷":
				move = _nudge(int(drive["facing"])) if _prompt() != "回山谷" else Vector2.ZERO
				if _prompt() == "回山谷" and _act_once():
					act = true
	elif phase == "go_mine":
		if _ore_count() >= ore_need:
			phase = "go_anvil"
			_log("HAS_ORE")
		elif _zone() == "mine":
			phase = "in_mine"
			_log("IN_MINE")
		else:
			var door := _find("E")
			if door.x < 0:
				door = Vector2i(8, 3)
			drive = _drive(door, 0)
			move = drive["move"]
			if bool(drive["here"]) or _prompt() == "进矿":
				move = _nudge(int(drive["facing"])) if _prompt() != "进矿" else Vector2.ZERO
				if _prompt() == "进矿" and _act_once():
					act = true
	elif phase == "in_mine":
		if _ore_count() >= ore_need:
			phase = "out_mine"
			_log("DUG")
		else:
			var ore := _find("o")
			drive = _drive(ore, 0)
			move = drive["move"]
			if _prompt() == "挖":
				move = Vector2.ZERO
				if _act_once():
					act = true
			elif bool(drive["here"]):
				move = _nudge(int(drive["facing"]))
	elif phase == "out_mine":
		if _zone() == "valley":
			phase = "go_anvil"
			_log("LEFT_MINE")
		else:
			var mouth := _find("L")
			drive = _drive(mouth, 3)
			move = drive["move"]
			if bool(drive["here"]) or _prompt() == "出矿":
				move = _nudge(int(drive["facing"])) if _prompt() != "出矿" else Vector2.ZERO
				if _prompt() == "出矿" and _act_once():
					act = true
	elif phase == "go_anvil":
		if _fishing() == "fight" and _prompt().find("锻") >= 0:
			phase = "forge"
			_log("FORGE")
		else:
			var anvil := _find("Y")
			if anvil.x < 0:
				anvil = Vector2i(24, 13)
			drive = _drive(anvil, 0)
			move = drive["move"]
			if bool(drive["here"]) or _prompt().find("打造") >= 0 or _prompt().find("锻") >= 0:
				move = _nudge(int(drive["facing"])) if _prompt().find("打造") < 0 and _prompt().find("锻") < 0 else Vector2.ZERO
				if (_prompt().find("打造") >= 0 or _prompt().find("锻") >= 0) and _act_once():
					act = true
	elif phase == "forge":
		if forge_ok:
			phase = "go_stall"
			_log("FORGED")
		elif _fishing() != "fight":
			phase = "go_mine" if _ore_count() < ore_need else "go_anvil"
			_log("FORGE_RETRY")
		elif _green() and _act_once():
			act = true
	elif phase == "go_stall":
		if _fishing() == "fight" and _prompt().find("摊") >= 0:
			phase = "shop"
			_log("SHOP")
		else:
			var stall := _find("S")
			if stall.x < 0:
				stall = Vector2i(7, 13)
			drive = _drive(stall, 0)
			move = drive["move"]
			if bool(drive["here"]) or _prompt().find("看货") >= 0 or _prompt().find("摊") >= 0:
				move = _nudge(int(drive["facing"])) if _prompt().find("看货") < 0 and _prompt().find("摊") < 0 else Vector2.ZERO
				if (_prompt().find("看货") >= 0 or _prompt().find("摊") >= 0) and _act_once():
					act = true
	elif phase == "shop":
		if stall_ok:
			_finish()
		elif _fishing() != "fight":
			phase = "go_stall"
			_log("SHOP_RETRY")
		elif _green() and _act_once():
			act = true
	net.send_input(move.x, move.y, act, act, false)
	if wild_ok and forge_ok and stall_ok:
		_finish()
	if frames > 18000:
		printerr("TIMEOUT phase=%s wild=%s forge=%s stall=%s zone=%s prompt=%s held=%s" % [phase, wild_ok, forge_ok, stall_ok, _zone(), _prompt(), _held_id()])
		quit(1)
	return false


func _finish() -> void:
	if wild_ok and forge_ok and stall_ok:
		print("REST_OK")
		quit(0)
		return
	printerr("INCOMPLETE wild=%s forge=%s stall=%s" % [wild_ok, forge_ok, stall_ok])
	quit(1)
