extends Control

var _scene: Node


func _ready() -> void:
	set_anchors_and_offsets_preset(PRESET_FULL_RECT)
	size = get_viewport_rect().size
	mouse_filter = MOUSE_FILTER_IGNORE
	show_boot()


func show_boot() -> void:
	_swap(preload("res://scripts/boot.gd").new())


func show_room() -> void:
	_swap(preload("res://scripts/room.gd").new())


func show_play() -> void:
	_swap(preload("res://scripts/play.gd").new())


func _swap(next: Node) -> void:
	if _scene and is_instance_valid(_scene):
		_scene.queue_free()
	_scene = next
	add_child(next)
