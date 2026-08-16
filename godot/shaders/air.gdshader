shader_type canvas_item;
render_mode unshaded, blend_mix;

// One thin dusk veil. Grain and vignette only. Not a second style.
uniform float grain : hint_range(0.0, 0.12) = 0.018;
uniform float vig : hint_range(0.0, 0.5) = 0.08;
uniform vec4 dusk : source_color = vec4(0.10, 0.08, 0.06, 1.0);

void fragment() {
	vec2 uv = UV;
	float n = fract(sin(dot(uv * vec2(311.7, 127.1), vec2(12.9898, 78.233))) * 43758.5453);
	float v = pow(length(uv - vec2(0.5)) * 1.35, 1.7);
	float a = clamp(v * vig + (n - 0.5) * grain, 0.0, 0.28);
	COLOR = vec4(dusk.rgb, a);
}
