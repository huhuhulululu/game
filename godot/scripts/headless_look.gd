extends SceneTree

## Still frames: cover, valley, anvil, altar, close ground. No Net.


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
	var cam := Camera2D.new()
	root.add_child(cam)
	cam.make_current()
	var sz: Vector2 = valley.size_px()
	cam.position = sz * 0.5
	cam.zoom = Vector2(1280.0 / sz.x, 1280.0 / sz.x)
	await process_frame
	await process_frame
	_shot("valley")
	cam.zoom = Vector2(2.5, 2.5)
	cam.position = Vector2(21.4 * 36.0 + 28.0, 11.4 * 36.0 + 32.0)
	await process_frame
	await process_frame
	_shot("anvil")
	cam.position = Vector2(12.2 * 36.0 + 26.0, 11.5 * 36.0 + 32.0)
	await process_frame
	await process_frame
	_shot("altar")
	cam.zoom = Vector2(3.2, 3.2)
	cam.position = Vector2(18.0 * 36.0, 9.2 * 36.0)
	await process_frame
	await process_frame
	_shot("ground")
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
