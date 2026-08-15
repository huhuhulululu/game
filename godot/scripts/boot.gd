extends Control

## One cover. Not three PNGs on black.


func _ready() -> void:
	set_anchors_and_offsets_preset(PRESET_FULL_RECT)
	size = get_viewport_rect().size
	mouse_filter = MOUSE_FILTER_STOP
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
	add_child(cover)
	gui_input.connect(_on_gui)


func _on_gui(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.pressed:
		(get_parent() as Node).call("show_room")
	if e is InputEventScreenTouch and e.pressed:
		(get_parent() as Node).call("show_room")
