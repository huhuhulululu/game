extends SceneTree

## Cover, valley fill, sit props, bag ×, name 暖.


func _initialize() -> void:
	var boot := preload("res://scripts/boot.gd").new()
	root.add_child(boot)
	await process_frame
	await process_frame
	await process_frame
	_shot("cover")
	boot.queue_free()
	await process_frame
	var dusk := Node2D.new()
	dusk.modulate = Look.VALLEY_DUSK
	root.add_child(dusk)
	var valley := preload("res://scenes/valley.tscn").instantiate() as ValleyWorld
	dusk.add_child(valley)
	var you := ActorView.new()
	dusk.add_child(you)
	you.apply({"x": 290, "y": 342, "name": "暖", "side": "left", "facing": 2}, 0.0)
	var cam := Camera2D.new()
	root.add_child(cam)
	cam.make_current()
	cam.zoom = Vector2(1.58, 1.58)
	var vp := Vector2(1280, 720)
	var half := vp / (2.0 * cam.zoom)
	var sz: Vector2 = valley.size_px()
	cam.position = Vector2(clampf(290.0, half.x, sz.x - half.x), clampf(342.0, half.y, sz.y - half.y))
	var hud := CanvasLayer.new()
	hud.layer = 20
	root.add_child(hud)
	var card := Panel.new()
	card.position = Vector2(16, 16)
	card.size = Vector2(268, 62)
	card.add_theme_stylebox_override("panel", Look.plaque_box())
	hud.add_child(card)
	var place := Look.ink_label("山谷", 20)
	place.position = Vector2(12, 6)
	card.add_child(place)
	var ink := Look.ink_label("日 0 · 春 · 白天 · 金 20", 13)
	ink.position = Vector2(12, 34)
	ink.size = Vector2(244, 20)
	card.add_child(ink)
	var bag := Look.chip_button("袋 · 山草×3 · 麦×2", 220)
	bag.position = Vector2(16, 82)
	hud.add_child(bag)
	var bar := Panel.new()
	bar.position = Vector2(560, 640)
	bar.size = Vector2(160, 36)
	bar.add_theme_stylebox_override("panel", Look.slip_box())
	hud.add_child(bar)
	var prompt := Look.ink_label("下竿", 16)
	prompt.position = Vector2(12, 6)
	prompt.size = Vector2(136, 24)
	prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prompt.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	bar.add_child(prompt)
	var pad := Control.new()
	pad.position = Vector2(36, 560)
	pad.size = Vector2(120, 120)
	hud.add_child(pad)
	root.add_child(Look.air_layer())
	await process_frame
	await process_frame
	await process_frame
	_shot("enter")
	_shot("play")
	you.set_moving(true)
	you.apply({"x": 290, "y": 342, "name": "暖", "side": "left", "facing": 2}, 0.21)
	await process_frame
	await process_frame
	_shot("walk")
	you.set_moving(true)
	you.apply({"x": 320, "y": 342, "name": "暖", "side": "left", "facing": 1}, 0.42)
	var pine := ActorView.new()
	dusk.add_child(pine)
	pine.apply({"x": 350, "y": 342, "name": "松", "side": "right", "facing": 2}, 0.0)
	await process_frame
	await process_frame
	_shot("pair")
	you.set_moving(false)
	you.apply({"x": 320, "y": 342, "name": "暖", "side": "left", "facing": 1, "busy": "fish", "fishing": "fight", "fishMark": 0.52, "fishPull": 0.4}, 0.0)
	pine.apply({"x": 360, "y": 342, "name": "松", "side": "right", "facing": 3}, 0.0)
	await process_frame
	await process_frame
	_shot("fish")
	cam.zoom = Vector2(1280.0 / sz.x, 1280.0 / sz.x)
	cam.position = sz * 0.5
	await process_frame
	await process_frame
	_shot("valley")
	cam.zoom = Vector2(2.4, 2.4)
	cam.position = Vector2(21.4 * 36.0 + 28.0, 11.4 * 36.0 + 32.0)
	await process_frame
	await process_frame
	_shot("anvil")
	cam.position = Vector2(12.2 * 36.0 + 26.0, 11.5 * 36.0 + 32.0)
	await process_frame
	await process_frame
	_shot("altar")
	cam.position = Vector2(6.4 * 36.0 + 32.0, 11.55 * 36.0 + 34.0)
	await process_frame
	await process_frame
	_shot("stall")
	cam.position = Vector2(17.2 * 36.0 + 26.0, 11.65 * 36.0 + 30.0)
	await process_frame
	await process_frame
	_shot("board")
	cam.position = Vector2(5.05 * 36.0 + 70.0, 5.55 * 36.0 + 50.0)
	await process_frame
	await process_frame
	_shot("cabin")
	you.set_moving(false)
	you.apply({"x": 5.05 * 36.0 + 70.0, "y": 5.55 * 36.0 + 110.0, "name": "暖", "side": "left", "facing": 2}, 0.0)
	pine.apply({"x": 5.05 * 36.0 + 104.0, "y": 5.55 * 36.0 + 110.0, "name": "松", "side": "right", "facing": 2}, 0.0)
	cam.position = Vector2(5.05 * 36.0 + 86.0, 5.55 * 36.0 + 86.0)
	await process_frame
	await process_frame
	_shot("cabin-pair")
	cam.position = Vector2(16.95 * 36.0 + 78.0, 5.40 * 36.0 + 54.0)
	await process_frame
	await process_frame
	_shot("lodge")
	print("LOOK_BOOT_OK")
	quit(0)


func _shot(name: String) -> void:
	var img := root.get_viewport().get_texture().get_image()
	if img:
		img.save_png("user://look-%s.png" % name)
		img.save_png("/tmp/look-shots/look-%s.png" % name)
		print("SHOT ", name, " ", img.get_width(), "x", img.get_height())
	else:
		print("SHOT_FAIL ", name)
