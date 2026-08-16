class_name ValleyNet
extends Node

## Talks to the existing Node/ws room. Empty room creates; unknown code does not.

signal joined(side: String, room: String)
signal snap_got(data: Dictionary)
signal fail(text: String)

var socket := WebSocketPeer.new()
var open := false
var side := "left"
var room := ""
var last_snap: Dictionary = {}
var you_id := ""
var _hello: Dictionary = {}
var _hello_sent := false
var _closed_told := false


func ws_url() -> String:
	var env := OS.get_environment("VALLEY_WS").strip_edges()
	if env != "":
		return env
	if OS.has_feature("web"):
		var host := str(JavaScriptBridge.eval("window.location.host", true))
		var proto := str(JavaScriptBridge.eval("window.location.protocol", true))
		if host != "" and host != "<null>" and host != "null":
			var scheme := "wss" if proto.begins_with("https") else "ws"
			return "%s://%s/ws" % [scheme, host]
	return "ws://127.0.0.1:5173/ws"


func connect_room(player_name: String, code: String, prefer: String) -> void:
	_hello = {
		"t": "hello",
		"room": code.strip_edges().to_upper(),
		"name": player_name if player_name != "" else "过路人",
		"prefer": prefer,
	}
	_hello_sent = false
	_closed_told = false
	open = false
	socket = WebSocketPeer.new()
	var err := socket.connect_to_url(ws_url())
	if err != OK:
		fail.emit("连不上山谷")


func send(msg: Dictionary) -> void:
	if socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	socket.send_text(JSON.stringify(msg))


func send_input(x: float, y: float, action: bool, held: bool, ping: bool) -> void:
	send({"t": "input", "x": x, "y": y, "action": action, "held": held, "ping": ping})


func send_take(item_id: String) -> void:
	send({"t": "take", "id": item_id})


func _process(_dt: float) -> void:
	socket.poll()
	var st := socket.get_ready_state()
	if st == WebSocketPeer.STATE_OPEN:
		if not _hello_sent and not _hello.is_empty():
			_hello_sent = true
			open = true
			send(_hello)
		while socket.get_available_packet_count() > 0:
			_on_text(socket.get_packet().get_string_from_utf8())
	elif st == WebSocketPeer.STATE_CLOSED:
		open = false
		if not _hello.is_empty() and not _closed_told:
			_closed_told = true
			if not _hello_sent:
				fail.emit("连不上山谷")


func _on_text(txt: String) -> void:
	var parsed: Variant = JSON.parse_string(txt)
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	var msg: Dictionary = parsed
	var t := str(msg.get("t", ""))
	if t == "joined":
		side = str(msg.get("side", "left"))
		room = str(msg.get("room", ""))
		joined.emit(side, room)
	elif t == "err":
		fail.emit(str(msg.get("text", "出错了")))
	elif t == "snap":
		var data: Variant = msg.get("snap", {})
		if typeof(data) == TYPE_DICTIONARY:
			last_snap = _merge_snap(data)
			you_id = str(last_snap.get("you", ""))
			snap_got.emit(last_snap)


func _merge_snap(next: Dictionary) -> Dictionary:
	if bool(next.get("full", true)) or last_snap.is_empty():
		return next
	var out: Dictionary = last_snap.duplicate(true)
	for k in next.keys():
		out[k] = next[k]
	if (next.get("tiles", []) as Array).is_empty():
		out["tiles"] = last_snap.get("tiles", [])
	if (next.get("revealed", []) as Array).is_empty():
		out["revealed"] = last_snap.get("revealed", [])
	if (next.get("fires", []) as Array).is_empty():
		out["fires"] = last_snap.get("fires", [])
	out["full"] = false
	return out
