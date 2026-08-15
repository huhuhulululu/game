extends SceneTree

## Boot the painted client and write three stills: cover, room, valley.


func _initialize() -> void:
	var app := preload("res://scripts/app.gd").new()
	root.add_child(app)
	await process_frame
	await process_frame
	_shot("cover")
	app.show_room()
	await process_frame
	await process_frame
	_shot("room")
	print("LOOK_BOOT_OK")
	quit(0)


func _shot(name: String) -> void:
	var img := root.get_viewport().get_texture().get_image()
	if img:
		var path := "user://look-%s.png" % name
		img.save_png(path)
		print("SHOT ", path, " ", img.get_width(), "x", img.get_height())
