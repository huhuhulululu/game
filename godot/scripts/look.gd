class_name Look
extends Object

## Shared ink / wood look. No editor-default grey.

const INK := Color(0.956, 0.905, 0.823)
const GOLD := Color(0.89, 0.72, 0.42)
const NIGHT := Color(0.08, 0.09, 0.07)
const MEADOW := Color(0.16, 0.2, 0.14)


static func cjk() -> Font:
	return load("res://fonts/cjk.tres") as Font


static func wood_box() -> StyleBoxTexture:
	var s := StyleBoxTexture.new()
	s.texture = load("res://assets/art/tex-wood.png") as Texture2D
	s.texture_margin_left = 10
	s.texture_margin_top = 10
	s.texture_margin_right = 10
	s.texture_margin_bottom = 10
	s.content_margin_left = 18
	s.content_margin_top = 12
	s.content_margin_right = 18
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
	var box := wood_box()
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
	e.add_theme_stylebox_override("normal", wood_box())
	e.add_theme_stylebox_override("focus", wood_box())
	return e
