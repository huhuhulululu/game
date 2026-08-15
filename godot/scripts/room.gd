extends Control

## Open a room on the same cover. Everyday names, readable ink.

var _name: LineEdit
var _code: LineEdit
var _code_row: HBoxContainer
var _err: Label
var _prefer := "left"
var _warm: Button
var _pine: Button


func _ready() -> void:
	set_anchors_and_offsets_preset(PRESET_FULL_RECT)
	size = get_viewport_rect().size
	_bg()
	_panel()
	if not Net.joined.is_connected(_on_joined):
		Net.joined.connect(_on_joined)
	if not Net.fail.is_connected(_on_fail):
		Net.fail.connect(_on_fail)


func _bg() -> void:
	var sky := ColorRect.new()
	sky.set_anchors_and_offsets_preset(PRESET_FULL_RECT)
	sky.color = Color(0.42, 0.30, 0.20)
	add_child(sky)
	var cover := TextureRect.new()
	cover.texture = load("res://assets/art/cover-valley.png")
	cover.texture_filter = TEXTURE_FILTER_LINEAR
	cover.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	cover.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	cover.set_anchors_and_offsets_preset(PRESET_FULL_RECT)
	cover.modulate = Color(0.92, 0.86, 0.78)
	add_child(cover)


func _panel() -> void:
	var panel := Panel.new()
	panel.position = Vector2(400, 86)
	panel.size = Vector2(480, 548)
	panel.add_theme_stylebox_override("panel", Look.plaque_box())
	add_child(panel)
	var kicker := Look.ink_label("两部 iPhone · 同一夜", 14, Look.GOLD)
	kicker.position = Vector2(40, 20)
	kicker.size = Vector2(400, 24)
	kicker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(kicker)
	var title := Look.ink_label("并肩山谷", 36, Look.INK)
	title.position = Vector2(40, 46)
	title.size = Vector2(400, 48)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(title)
	var tag := Look.ink_label("一个人开间。进谷后再把四位码念给另一个人。", 15, Look.INK)
	tag.position = Vector2(36, 100)
	tag.size = Vector2(408, 40)
	tag.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(tag)
	var name_l := Look.ink_label("你的名字", 14, Look.GOLD)
	name_l.position = Vector2(48, 150)
	panel.add_child(name_l)
	_name = Look.field("怎么称呼")
	_name.text = "暖"
	_name.position = Vector2(48, 176)
	_name.size = Vector2(384, 42)
	panel.add_child(_name)
	var sides := HBoxContainer.new()
	sides.position = Vector2(48, 232)
	sides.size = Vector2(384, 48)
	sides.add_theme_constant_override("separation", 16)
	panel.add_child(sides)
	_warm = Look.wood_button("暖", 180)
	_pine = Look.wood_button("松", 180)
	_warm.pressed.connect(func() -> void: _prefer = "left"; _paint_sides())
	_pine.pressed.connect(func() -> void: _prefer = "right"; _paint_sides())
	sides.add_child(_warm)
	sides.add_child(_pine)
	_paint_sides()
	var create := Look.wood_button("开一间", 384)
	create.position = Vector2(48, 300)
	create.pressed.connect(_open)
	panel.add_child(create)
	var have := Look.wood_button("我有房间码", 384)
	have.position = Vector2(48, 360)
	have.pressed.connect(func() -> void: _code_row.visible = true)
	panel.add_child(have)
	_code_row = HBoxContainer.new()
	_code_row.position = Vector2(48, 420)
	_code_row.size = Vector2(384, 48)
	_code_row.visible = false
	_code_row.add_theme_constant_override("separation", 10)
	panel.add_child(_code_row)
	_code = Look.field("四位码")
	_code.max_length = 6
	_code.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_code_row.add_child(_code)
	var go := Look.wood_button("进去", 100)
	go.pressed.connect(_join)
	_code_row.add_child(go)
	_err = Look.ink_label("", 15, Color(0.55, 0.22, 0.14))
	_err.position = Vector2(48, 478)
	_err.size = Vector2(384, 48)
	_err.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	panel.add_child(_err)


func _paint_sides() -> void:
	_warm.modulate = Color(1.12, 1.02, 0.88) if _prefer == "left" else Color(0.82, 0.78, 0.72)
	_pine.modulate = Color(0.92, 1.06, 0.92) if _prefer == "right" else Color(0.82, 0.78, 0.72)


func _player() -> String:
	var n := _name.text.strip_edges()
	return n if n != "" else "我"


func _open() -> void:
	_err.text = ""
	Net.connect_room(_player(), "", _prefer)


func _join() -> void:
	_err.text = ""
	var code := _code.text.strip_edges().to_upper()
	if code == "":
		_err.text = "先写下四位码"
		return
	Net.connect_room(_player(), code, _prefer)


func _on_joined(_side: String, _room: String) -> void:
	(get_parent() as Node).call("show_play")


func _on_fail(text: String) -> void:
	_err.text = text
