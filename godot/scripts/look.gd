class_name Look
extends Object

## Warm dusk. Old paper and wood ink. Not DST rings, not system grey.

const INK := Color(0.24, 0.15, 0.09)
const GOLD := Color(0.78, 0.58, 0.32)
const PAPER := Color(0.93, 0.86, 0.74)
const MOSS := Color(0.25, 0.43, 0.36)
const DUSK := Color(1.0, 1.0, 1.0)
const HAZE := Color(0.78, 0.62, 0.46)
const VALLEY_DUSK := Color(1.14, 0.78, 0.52)
const BODY := 62.0
const FOOT := 0.979


static func cjk() -> Font:
	var base := load("res://fonts/kai.ttf") as Font
	var extra := load("res://fonts/multiply.ttf") as Font
	if base and extra:
		base.fallbacks = [extra]
	return base


static func dusk_mat(fog := 0.08) -> ShaderMaterial:
	var m := ShaderMaterial.new()
	m.shader = load("res://shaders/dusk.gdshader") as Shader
	m.set_shader_parameter("dusk", DUSK)
	m.set_shader_parameter("haze", HAZE)
	m.set_shader_parameter("fog", fog)
	m.set_shader_parameter("edge", 0.10)
	m.set_shader_parameter("feet", 0.16)
	m.set_shader_parameter("grade", 0.0)
	return m


static func person_mat() -> ShaderMaterial:
	var m := dusk_mat(0.0)
	m.set_shader_parameter("feet", 0.0)
	m.set_shader_parameter("edge", 0.06)
	m.set_shader_parameter("fog", 0.0)
	return m


static func prop_mat(fog := 0.03) -> ShaderMaterial:
	var m := dusk_mat(fog)
	m.set_shader_parameter("feet", 0.0)
	m.set_shader_parameter("edge", 0.08)
	return m


static func plaque_box() -> StyleBoxTexture:
	var s := StyleBoxTexture.new()
	s.texture = load("res://assets/art/tex-plaque.png") as Texture2D
	s.texture_margin_left = 18
	s.texture_margin_top = 16
	s.texture_margin_right = 18
	s.texture_margin_bottom = 16
	s.content_margin_left = 16
	s.content_margin_top = 12
	s.content_margin_right = 16
	s.content_margin_bottom = 12
	return s


static func name_box() -> StyleBoxTexture:
	var s := StyleBoxTexture.new()
	s.texture = load("res://assets/art/tex-plaque.png") as Texture2D
	s.texture_margin_left = 10
	s.texture_margin_top = 8
	s.texture_margin_right = 10
	s.texture_margin_bottom = 8
	s.content_margin_left = 8
	s.content_margin_top = 3
	s.content_margin_right = 8
	s.content_margin_bottom = 3
	return s


static func paper_box() -> StyleBoxTexture:
	var s := StyleBoxTexture.new()
	s.texture = load("res://assets/art/tex-paper.png") as Texture2D
	s.texture_margin_left = 8
	s.texture_margin_top = 8
	s.texture_margin_right = 8
	s.texture_margin_bottom = 8
	s.content_margin_left = 16
	s.content_margin_top = 12
	s.content_margin_right = 16
	s.content_margin_bottom = 12
	return s


static func slip_box() -> StyleBoxTexture:
	# Valley wood + old paper. Tile so chips are not stretched beige forms.
	var s := StyleBoxTexture.new()
	s.texture = load("res://assets/art/tex-slip.png") as Texture2D
	s.texture_margin_left = 16
	s.texture_margin_top = 13
	s.texture_margin_right = 16
	s.texture_margin_bottom = 13
	s.content_margin_left = 18
	s.content_margin_top = 10
	s.content_margin_right = 18
	s.content_margin_bottom = 10
	s.axis_stretch_horizontal = StyleBoxTexture.AXIS_STRETCH_MODE_TILE_FIT
	s.axis_stretch_vertical = StyleBoxTexture.AXIS_STRETCH_MODE_TILE_FIT
	return s


static func ink_label(text: String, size: int = 18, color: Color = INK) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", cjk())
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	return l


static func wood_button(text: String, wide := 220) -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(wide, 48)
	b.add_theme_font_override("font", cjk())
	b.add_theme_font_size_override("font_size", 20)
	b.add_theme_color_override("font_color", INK)
	b.add_theme_color_override("font_hover_color", GOLD)
	b.add_theme_color_override("font_pressed_color", GOLD)
	var box := plaque_box()
	b.add_theme_stylebox_override("normal", box)
	b.add_theme_stylebox_override("hover", box)
	b.add_theme_stylebox_override("pressed", box)
	b.add_theme_stylebox_override("focus", box)
	return b


static func chip_button(text: String, wide := 128) -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(wide, 54)
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_override("font", cjk())
	b.add_theme_font_size_override("font_size", 16)
	b.add_theme_color_override("font_color", INK)
	b.add_theme_color_override("font_hover_color", GOLD)
	b.add_theme_color_override("font_pressed_color", GOLD)
	var box := slip_box()
	b.add_theme_stylebox_override("normal", box)
	b.add_theme_stylebox_override("hover", box)
	b.add_theme_stylebox_override("pressed", box)
	b.add_theme_stylebox_override("focus", box)
	return b


static func field(placeholder: String) -> LineEdit:
	var e := LineEdit.new()
	e.placeholder_text = placeholder
	e.max_length = 8
	e.custom_minimum_size = Vector2(240, 40)
	e.add_theme_font_override("font", cjk())
	e.add_theme_font_size_override("font_size", 18)
	e.add_theme_color_override("font_color", INK)
	e.add_theme_color_override("font_placeholder_color", Color(INK, 0.45))
	e.add_theme_stylebox_override("normal", paper_box())
	e.add_theme_stylebox_override("focus", paper_box())
	return e


static func shadow_tex() -> Texture2D:
	var img := Image.create(96, 40, false, Image.FORMAT_RGBA8)
	for y in 40:
		for x in 96:
			var d := Vector2((x - 48) / 46.0, (y - 20) / 18.0).length()
			var a := clampf(1.0 - d, 0.0, 1.0)
			img.set_pixel(x, y, Color(0.04, 0.02, 0.01, a * a * 1.0))
	return ImageTexture.create_from_image(img)


static func ping_tex() -> Texture2D:
	var img := Image.create(96, 96, false, Image.FORMAT_RGBA8)
	for y in 96:
		for x in 96:
			var d := Vector2((x - 48) / 46.0, (y - 48) / 46.0).length()
			var a := clampf(1.0 - d, 0.0, 1.0)
			img.set_pixel(x, y, Color(0.96, 0.90, 0.78, a * a * 0.85))
	return ImageTexture.create_from_image(img)


static func ping_glow(width: float) -> Sprite2D:
	var s := Sprite2D.new()
	s.texture = ping_tex()
	s.centered = true
	s.scale = Vector2(width / 96.0, width / 96.0)
	s.z_index = -1
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	return s


static func contact(width: float) -> Sprite2D:
	var s := Sprite2D.new()
	s.texture = shadow_tex()
	s.centered = true
	s.scale = Vector2(width / 72.0, (width * 0.22) / 40.0)
	s.z_index = 0
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	return s


static func sit_frac(tex: Texture2D) -> float:
	if tex == null:
		return 0.86
	var img := tex.get_image()
	if img == null:
		return 0.86
	var h := img.get_height()
	var w := img.get_width()
	for y in range(h - 1, -1, -1):
		var x := 0
		while x < w:
			if img.get_pixel(x, y).a > 0.22:
				return clampf((float(y) + 1.0) / float(h), 0.58, 0.97)
			x += 6
	return 0.86


static func hung(tex: Texture2D, pos: Vector2, size: Vector2, z: int, fog := 0.03, sit := 0.97) -> Node2D:
	var n := Node2D.new()
	n.position = pos
	n.z_index = z
	n.y_sort_enabled = false
	var sit_y := size.y * sit
	var stain := contact(size.x * 1.36)
	stain.scale.y = (size.x * 0.30) / 40.0
	stain.position = Vector2(size.x * 0.50, sit_y)
	stain.modulate = Color(1, 1, 1, 0.95)
	n.add_child(stain)
	var core := contact(size.x * 0.84)
	core.scale.y = (size.x * 0.14) / 40.0
	core.position = Vector2(size.x * 0.50, sit_y - 1.0)
	core.modulate = Color(1, 1, 1, 1.0)
	n.add_child(core)
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.z_index = 1
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	if tex:
		s.scale = Vector2(size.x / float(tex.get_width()), size.y / float(tex.get_height()))
	s.position.y = 3.0
	s.material = prop_mat(fog)
	n.add_child(s)
	return n
