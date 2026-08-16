shader_type canvas_item;
render_mode unshaded, blend_mix;

// Soft dusk rain on the painted bed. Not a weather ring.
uniform float amount : hint_range(0.0, 1.0) = 0.55;
uniform vec4 drop : source_color = vec4(0.82, 0.74, 0.62, 1.0);
uniform vec4 wet : source_color = vec4(0.42, 0.32, 0.22, 1.0);

void fragment() {
	vec2 uv = UV;
	float t = TIME;
	float slant = uv.x * 36.0 + uv.y * 16.0 + t * 1.4;
	float fall = uv.y * 12.0 - t * 2.1;
	float cell = fract(slant);
	float row = fract(fall + floor(slant) * 0.31);
	float n = fract(sin(dot(floor(vec2(slant, fall)), vec2(12.9898, 78.233))) * 43758.5453);
	float streak = smoothstep(0.10, 0.0, abs(cell - 0.48)) * smoothstep(0.62, 0.08, row);
	streak *= step(0.52, n);
	float veil = 0.08 * amount;
	float a = clamp(veil + streak * 0.20 * amount, 0.0, 0.32);
	vec3 col = mix(wet.rgb, drop.rgb, streak);
	COLOR = vec4(col, a);
}
