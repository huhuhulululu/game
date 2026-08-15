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
	you.apply({"x": 290, "y": 342, "name": "暖", "side": "left", "facing": 2}, 0.0)
	var cam := Camera2D.new()
	root.add_child(cam)
	cam.make_current()
	cam.zoom = Vector2(1.85, 1.85)
	var vp := Vector2(1280, 720)
	var half := vp / (2.0 * cam.zoom)
	var sz: Vector2 = valley.size_px()
	cam.position = Vector2(clampf(290.0, half.x, sz.x - half.x), clampf(342.0, half.y, sz.y - half.y))
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
	root.add_child(pine)
	pine.apply({"x": 350, "y": 342, "name": "松", "side": "right", "facing": 2}, 0.0)
	await process_frame
	await process_frame
	_shot("pair")
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
	cam.position = Vector2(5.0 * 36.0 + 74.0, 4.55 * 36.0 + 54.0)
	await process_frame
	await process_frame
	_shot("cabin")
	you.set_moving(false)
	you.apply({"x": 5.0 * 36.0 + 74.0, "y": 4.55 * 36.0 + 118.0, "name": "暖", "side": "left", "facing": 2}, 0.0)
	pine.apply({"x": 5.0 * 36.0 + 108.0, "y": 4.55 * 36.0 + 118.0, "name": "松", "side": "right", "facing": 2}, 0.0)
	cam.position = Vector2(5.0 * 36.0 + 90.0, 4.55 * 36.0 + 90.0)
	await process_frame
	await process_frame
	_shot("cabin-pair")
	cam.position = Vector2(16.9 * 36.0 + 84.0, 4.35 * 36.0 + 58.0)
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
