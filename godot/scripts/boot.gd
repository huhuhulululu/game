extends Control

## Title: painted valley, not a grey splash.


func _ready() -> void:
	set_anchors_preset(PRESET_FULL_RECT)
	mouse_filter = MOUSE_FILTER_STOP
	_sky()
	_valley()
	_sign()
	gui_input.connect(_on_gui)


func _sky() -> void:
	var sky := ColorRect.new()
	sky.set_anchors_preset(PRESET_FULL_RECT)
	sky.color = Color(0.07, 0.08, 0.09)
	add_child(sky)
	var moon := Panel.new()
	moon.size = Vector2(54, 54)
	moon.position = Vector2(1040, 48)
	var disk := StyleBoxFlat.new()
	disk.bg_color = Color(0.86, 0.82, 0.7, 0.88)
	disk.corner_radius_top_left = 27
	disk.corner_radius_top_right = 27
	disk.corner_radius_bottom_left = 27
	disk.corner_radius_bottom_right = 27
	moon.add_theme_stylebox_override("panel", disk)
	add_child(moon)


func _valley() -> void:
	var grass := TextureRect.new()
	grass.texture = load("res://assets/art/tex-grass.png")
	grass.stretch_mode = TextureRect.STRETCH_TILE
	grass.texture_filter = TEXTURE_FILTER_LINEAR
	grass.set_anchors_preset(PRESET_FULL_RECT)
	grass.offset_top = 220
	add_child(grass)
	_sprite("prop-tree-wide.png", Vector2(-40, 180), Vector2(320, 360))
	_sprite("prop-pine.png", Vector2(980, 120), Vector2(280, 400))
	_sprite("prop-cabin.png", Vector2(80, 250), Vector2(380, 340))
	_sprite("prop-inn.png", Vector2(820, 210), Vector2(420, 360))
	_sprite("prop-tree.png", Vector2(480, 280), Vector2(200, 260))


func _sprite(path: String, pos: Vector2, size: Vector2) -> void:
	var t := TextureRect.new()
	t.texture = load("res://assets/art/%s" % path)
	t.texture_filter = TEXTURE_FILTER_LINEAR
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	t.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	t.position = pos
	t.size = size
	add_child(t)


func _sign() -> void:
	var panel := Panel.new()
	panel.position = Vector2(430, 70)
	panel.size = Vector2(420, 200)
	panel.add_theme_stylebox_override("panel", Look.wood_box())
	add_child(panel)
	var title := Look.ink_label("并肩山谷", 42, Look.INK)
	title.position = Vector2(70, 36)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.size = Vector2(280, 56)
	panel.add_child(title)
	var en := Look.ink_label("a living valley for two phones", 16, Look.GOLD)
	en.position = Vector2(40, 100)
	en.size = Vector2(340, 28)
	en.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(en)
	var hint := Look.ink_label("两部 iPhone，同一座山 · 点灯进谷", 16, Look.INK)
	hint.position = Vector2(40, 140)
	hint.size = Vector2(340, 28)
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(hint)


func _on_gui(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.pressed:
		(get_parent() as Node).call("show_room")
	if e is InputEventScreenTouch and e.pressed:
		(get_parent() as Node).call("show_room")
