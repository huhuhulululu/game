extends SceneTree

## Open a room, enter the valley, walk. Unknown codes must not create a world.

var net: ValleyNet
var frames := 0
var start := Vector2.ZERO
var moved := false
var did_join := false
var snap_ok := false
var unknown_ok := false
var phase := "join"


func _initialize() -> void:
	net = ValleyNet.new()
	root.add_child(net)
	net.joined.connect(_on_join)
	net.fail.connect(_on_fail)
	net.snap_got.connect(_on_snap)
	print("HEADLESS connect ", net.ws_url())
	net.connect_room("暖", "", "left")


func _on_join(side: String, room: String) -> void:
	did_join = true
	print("JOINED ", room, " ", side)


func _on_fail(text: String) -> void:
	if phase == "unknown" and text.find("没有这间山谷") >= 0:
		unknown_ok = true
		print("UNKNOWN_OK ", text)
		_finish()
		return
	printerr("FAIL ", text)
	quit(2)


func _on_snap(s: Dictionary) -> void:
	snap_ok = true
	var at: Dictionary = s.get("youAt", {})
	var p := Vector2(float(at.get("x", 0.0)), float(at.get("y", 0.0)))
	if start == Vector2.ZERO:
		start = p
		print("SPAWN ", p)
	elif p.distance_to(start) > 8.0:
		moved = true
		print("MOVED ", p)


func _process(_dt: float) -> bool:
	frames += 1
	if phase == "join" and did_join:
		net.send_input(1, 0, false, false, false)
	if phase == "join" and moved:
		phase = "unknown"
		print("WALK_OK")
		var other := ValleyNet.new()
		root.add_child(other)
		other.fail.connect(_on_fail)
		other.joined.connect(func(_s: String, _r: String) -> void:
			printerr("unknown room created a world")
			quit(3)
		)
		other.connect_room("过路人", "ZZZZ", "left")
	if frames > 900:
		printerr("TIMEOUT join=%s snap=%s moved=%s unknown=%s" % [did_join, snap_ok, moved, unknown_ok])
		quit(1)
	return false


func _finish() -> void:
	if did_join and snap_ok and moved and unknown_ok:
		print("HEADLESS_OK")
		quit(0)
	else:
		printerr("INCOMPLETE")
		quit(1)
