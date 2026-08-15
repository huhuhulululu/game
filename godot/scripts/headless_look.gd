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
	var valley := ValleyMap.new()
	root.add_child(valley)
	var you := ActorView.new()
	root.add_child(you)
	you.apply({"x": 280, "y": 430, "name": "暖", "side": "left", "facing": 2}, 0.0)
	var cam := Camera2D.new()
	root.add_child(cam)
	cam.make_current()
	cam.zoom = Vector2(1.85, 1.85)
	var vp := Vector2(1280, 720)
	var half := vp / (2.0 * cam.zoom)
	var sz: Vector2 = valley.size_px()
	cam.position = Vector2(clampf(280.0, half.x, sz.x - half.x), clampf(430.0, half.y, sz.y - half.y))
	var hud := CanvasLayer.new()
	hud.layer = 20
	root.add_child(hud)
	var bag := Look.wood_button("山草×3", 108)
	bag.position = Vector2(16, 152)
	bag.custom_minimum_size = Vector2(108, 36)
	hud.add_child(bag)
	var egg := Look.wood_button("麦×2", 108)
	egg.position = Vector2(132, 152)
	egg.custom_minimum_size = Vector2(108, 36)
	hud.add_child(egg)
	await process_frame
	await process_frame
	await process_frame
	_shot("play")
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
	cam.position = Vector2(6.4 * 36.0 + 32.0, 11.4 * 36.0 + 36.0)
	await process_frame
	await process_frame
	_shot("stall")
	cam.position = Vector2(4.2 * 36.0 + 84.0, 2.4 * 36.0 + 74.0)
	await process_frame
	await process_frame
	_shot("cabin")
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
