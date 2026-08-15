class_name Look
extends Object

## Warm dusk. Old paper and wood ink. Not DST rings, not system grey.

const INK := Color(0.24, 0.15, 0.09)
const GOLD := Color(0.78, 0.58, 0.32)
const PAPER := Color(0.93, 0.86, 0.74)
const DUSK := Color(1.02, 0.97, 0.90)
const HAZE := Color(0.78, 0.62, 0.46)


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
	m.set_shader_parameter("edge", 0.11)
	m.set_shader_parameter("feet", 0.20)
	m.set_shader_parameter("grade", 0.08)
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


static func name_box() -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = PAPER
	s.border_color = Color(0.42, 0.28, 0.16, 0.85)
	s.set_border_width_all(1)
	s.set_corner_radius_all(4)
	s.content_margin_left = 6
	s.content_margin_right = 6
	s.content_margin_top = 2
	s.content_margin_bottom = 2
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
			var d := Vector2((x - 48) / 46.0, (y - 20) / 14.0).length()
			var a := clampf(1.0 - d, 0.0, 1.0)
			img.set_pixel(x, y, Color(0.08, 0.05, 0.03, a * a * 0.88))
	return ImageTexture.create_from_image(img)


static func contact(width: float) -> Sprite2D:
	var s := Sprite2D.new()
	s.texture = shadow_tex()
	s.centered = true
	s.scale = Vector2(width / 72.0, (width * 0.42) / 40.0)
	s.z_index = 0
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	return s


static func hung(tex: Texture2D, pos: Vector2, size: Vector2, z: int, fog := 0.03) -> Node2D:
	var n := Node2D.new()
	n.position = pos
	n.z_index = z
	n.y_sort_enabled = false
	var sh := contact(size.x * 0.98)
	sh.position = Vector2(size.x * 0.50, size.y * 0.90)
	n.add_child(sh)
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = false
	s.z_index = 1
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	if tex:
		s.scale = Vector2(size.x / float(tex.get_width()), size.y / float(tex.get_height()))
	s.material = dusk_mat(fog)
	n.add_child(s)
	return n
