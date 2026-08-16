class_name ValleyEar
extends Node

## Thin sounds. Mute only stops the ear. It does not touch the world.

const TILE := 36
const GREEN_LO := 0.38
const GREEN_HI := 0.72
const RATE := 22050

var muted := false
var last_heard: PackedStringArray = []
var _unlocked := false

var _zone := ""
var _x := 0.0
var _y := 0.0
var _step_at := -999999
var _shore_at := -999999
var _fire_at := -999999
var _in_green := false
var _last_busy := ""
var _last_ping: Dictionary = {}
var _voices: Array[AudioStreamPlayer] = []
var _cursor := 0
var _clip: Dictionary = {}


func _ready() -> void:
	for i in 6:
		var p := AudioStreamPlayer.new()
		add_child(p)
		_voices.append(p)
	_clip["step"] = _beep(96.0, 0.045, "sine", 0.016)
	_clip["shore_a"] = _beep(260.0, 0.20, "sine", 0.012)
	_clip["shore_b"] = _beep(190.0, 0.16, "sine", 0.010)
	_clip["fire"] = _beep(72.0, 0.09, "saw", 0.010)
	_clip["door_a"] = _beep(170.0, 0.12, "tri", 0.020)
	_clip["door_b"] = _beep(128.0, 0.14, "sine", 0.016)
	_clip["green"] = _beep(698.0, 0.07, "sine", 0.022)
	_clip["act"] = _beep(420.0, 0.055, "tri", 0.018)
	_clip["shout"] = _beep(520.0, 0.11, "sine", 0.020)
	_clip["sit"] = _beep(196.0, 0.14, "sine", 0.012)


func set_muted(v: bool) -> void:
	muted = v
	unlock()
	if not muted:
		return
	for p in _voices:
		p.stop()


func unlock() -> void:
	if _unlocked or _voices.is_empty():
		return
	_unlocked = true
	var p: AudioStreamPlayer = _voices[0]
	p.stream = _clip.get("step")
	p.volume_db = -80.0
	p.play()
	p.volume_db = 0.0


func hear(snap: Dictionary) -> PackedStringArray:
	var now := Time.get_ticks_msec()
	var sounds: PackedStringArray = []
	var me := _me(snap)
	var at: Dictionary = snap.get("youAt", {}) if typeof(snap.get("youAt", {})) == TYPE_DICTIONARY else {}
	var x := float(me.get("x", at.get("x", 0)))
	var y := float(me.get("y", at.get("y", 0)))
	var zone := str(snap.get("zone", ""))
	var tx := int(floor(x / float(TILE)))
	var ty := int(floor(y / float(TILE)))
	var moved := Vector2(x - _x, y - _y).length() > 0.45
	var busy := str(me.get("busy", ""))

	if _zone != "" and zone == "kitchen" and _zone != "kitchen":
		sounds.append("door")

	if moved and busy == "" and now - _step_at >= 280:
		sounds.append("step")
		_step_at = now

	var rows: Array = snap.get("tiles", [])
	if rows.size() > 0:
		if _near_water(rows, tx, ty) and now - _shore_at >= 1400:
			sounds.append("shore")
			_shore_at = now
		if _near_fire(snap, rows, tx, ty) and now - _fire_at >= 900:
			sounds.append("fire")
			_fire_at = now

	var fishing := str(me.get("fishing", ""))
	var mark := float(me.get("fishMark", 0))
	var green := fishing == "fight" and mark >= GREEN_LO and mark <= GREEN_HI
	if green and not _in_green:
		sounds.append("green")

	if busy == "sit" and _last_busy != "sit":
		sounds.append("sit")
	elif (busy == "chop" or busy == "forge" or busy == "fish") and _last_busy != busy:
		sounds.append("act")

	var you := str(snap.get("you", ""))
	for raw in snap.get("actors", []):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var a: Dictionary = raw
		var id := str(a.get("id", ""))
		if id == "" or id == you:
			continue
		var ping := float(a.get("ping", 0))
		var prev := float(_last_ping.get(id, 0))
		if ping > 0.04 and prev <= 0.04:
			sounds.append("shout")
		_last_ping[id] = ping

	_zone = zone
	_x = x
	_y = y
	_in_green = green
	_last_busy = busy
	last_heard = sounds
	if not muted:
		for kind in sounds:
			tone(kind)
	return sounds


func tone(kind: String) -> void:
	if muted:
		return
	if kind == "step":
		_play(_clip.get("step"))
	elif kind == "shore":
		_play(_clip.get("shore_a"))
		_later("shore_b", 0.07)
	elif kind == "fire":
		_play(_clip.get("fire"))
	elif kind == "door":
		_play(_clip.get("door_a"))
		_later("door_b", 0.09)
	elif kind == "green":
		_play(_clip.get("green"))
	elif kind == "act":
		_play(_clip.get("act"))
	elif kind == "shout":
		_play(_clip.get("shout"))
	elif kind == "sit":
		_play(_clip.get("sit"))


func _me(snap: Dictionary) -> Dictionary:
	var you := str(snap.get("you", ""))
	for raw in snap.get("actors", []):
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var a: Dictionary = raw
		if str(a.get("id", "")) == you:
			return a
	return {}


func _tile(rows: Array, x: int, y: int) -> String:
	if y < 0 or y >= rows.size():
		return ""
	var row := str(rows[y])
	if x < 0 or x >= row.length():
		return ""
	return row[x]


func _near_water(rows: Array, tx: int, ty: int) -> bool:
	for dy in range(-1, 2):
		for dx in range(-1, 2):
			var ch := _tile(rows, tx + dx, ty + dy)
			if ch == "~" or ch == "D":
				return true
	return false


func _near_fire(snap: Dictionary, rows: Array, tx: int, ty: int) -> bool:
	var mw := str(rows[0]).length() if rows.size() > 0 else 1
	for raw in snap.get("fires", []):
		var key := int(raw)
		var fx := key % mw
		var fy := int(floor(float(key) / float(mw)))
		if abs(fx - tx) <= 2 and abs(fy - ty) <= 2:
			return true
	for dy in range(-1, 2):
		for dx in range(-1, 2):
			var ch := _tile(rows, tx + dx, ty + dy)
			if ch == "K" or ch == "J":
				return true
	return false


func _beep(freq: float, dur: float, kind: String, gain: float) -> AudioStreamWAV:
	var n := maxi(8, int(RATE * dur))
	var data := PackedByteArray()
	data.resize(n * 2)
	for i in n:
		var t := float(i) / float(RATE)
		var env := 1.0 - t / dur
		if env < 0.0:
			env = 0.0
		var phase := TAU * freq * t
		var s := sin(phase)
		if kind == "tri":
			s = 2.0 * abs(2.0 * fmod(freq * t + 0.25, 1.0) - 1.0) - 1.0
		elif kind == "saw":
			s = 2.0 * fmod(freq * t, 1.0) - 1.0
		var v := int(clampf(s * env * gain * 32767.0, -32767.0, 32767.0))
		data.encode_s16(i * 2, v)
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = RATE
	wav.stereo = false
	wav.loop_mode = AudioStreamWAV.LOOP_DISABLED
	wav.data = data
	return wav


func _play(stream: Variant) -> void:
	if muted or stream == null or _voices.is_empty():
		return
	var p: AudioStreamPlayer = _voices[_cursor]
	_cursor = (_cursor + 1) % _voices.size()
	p.stream = stream
	p.play()


func _later(clip_id: String, delay: float) -> void:
	var tree := get_tree()
	if tree == null:
		return
	tree.create_timer(delay).timeout.connect(func() -> void:
		if not muted:
			_play(_clip.get(clip_id))
	)
