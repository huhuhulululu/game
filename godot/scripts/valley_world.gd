class_name ValleyWorld
extends Node2D

## One painted dusk. People walk on it. No sticker crops.

var _logic: ValleyLogic


func _ready() -> void:
	texture_filter = TEXTURE_FILTER_LINEAR
	_logic = get_node_or_null("Logic") as ValleyLogic
	if _logic == null:
		_logic = ValleyLogic.new()
		_logic.name = "Logic"
		add_child(_logic)
	var bed := get_node_or_null("Bed") as Sprite2D
	if bed == null:
		bed = Sprite2D.new()
		bed.name = "Bed"
		add_child(bed)
		move_child(bed, 0)
	_fit_bed(bed)


func size_px() -> Vector2:
	return _logic.size_px() if _logic else ValleyLogic.SIZE_PX


func show_crops(plots: Array) -> void:
	if _logic:
		_logic.show_crops(plots)


func _fit_bed(bed: Sprite2D) -> void:
	var sheet := bed.texture
	if sheet == null:
		sheet = load("res://assets/art/bed-valley.png") as Texture2D
		bed.texture = sheet
	bed.centered = false
	bed.position = Vector2.ZERO
	bed.z_index = -1
	bed.texture_filter = TEXTURE_FILTER_LINEAR
	bed.modulate = Look.VALLEY_DUSK
	var sz := size_px()
	if sheet:
		bed.scale = Vector2(sz.x / float(sheet.get_width()), sz.y / float(sheet.get_height()))


func set_season(sea: String) -> void:
	var bed := get_node_or_null("Bed") as Sprite2D
	if bed == null:
		return
	# One dusk language. Winter cooler paper, summer warmer. Not four beds.
	if bed.material != null:
		return
	bed.modulate = Look.season_paper(sea) if sea != "" else Look.VALLEY_DUSK


func set_night(amount: float, shade := Look.NIGHT) -> void:
	var bed := get_node_or_null("Bed") as Sprite2D
	if bed == null:
		return
	bed.modulate = Look.VALLEY_DUSK
	if amount <= 0.001:
		bed.material = null
		return
	var mat := Look.night_mat(shade)
	mat.set_shader_parameter("amount", clampf(amount, 0.0, 1.0))
	bed.material = mat


func set_rain(wet: bool) -> void:
	var rain := get_node_or_null("Rain") as Sprite2D
	if not wet:
		if rain:
			rain.visible = false
		return
	if rain == null:
		rain = Sprite2D.new()
		rain.name = "Rain"
		rain.centered = false
		rain.z_index = 12
		var img := Image.create(8, 8, false, Image.FORMAT_RGBA8)
		img.fill(Color(1, 1, 1, 1))
		rain.texture = ImageTexture.create_from_image(img)
		add_child(rain)
	var sz := size_px()
	rain.scale = Vector2(sz.x / 8.0, sz.y / 8.0)
	rain.material = Look.rain_mat()
	rain.visible = true


func set_fog(mist: bool) -> void:
	var fog := get_node_or_null("Fog") as Sprite2D
	if not mist:
		if fog:
			fog.visible = false
		return
	if fog == null:
		fog = Sprite2D.new()
		fog.name = "Fog"
		fog.centered = false
		fog.z_index = 11
		var img := Image.create(8, 8, false, Image.FORMAT_RGBA8)
		img.fill(Color(1, 1, 1, 1))
		fog.texture = ImageTexture.create_from_image(img)
		add_child(fog)
	var sz := size_px()
	fog.scale = Vector2(sz.x / 8.0, sz.y / 8.0)
	fog.material = Look.fog_mat()
	fog.visible = true
