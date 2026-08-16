shader_type canvas_item;
render_mode unshaded, blend_mix;

// Soft dusk haze on the painted bed. Not a fear veil.
uniform float amount : hint_range(0.0, 1.0) = 0.48;
uniform vec4 mist : source_color = vec4(0.86, 0.78, 0.64, 1.0);
uniform vec4 shade : source_color = vec4(0.62, 0.54, 0.40, 1.0);

void fragment() {
	vec2 uv = UV;
	float t = TIME * 0.07;
	float w1 = sin(uv.x * 5.4 + t * 1.1 + uv.y * 1.8);
	float w2 = sin(uv.x * 2.8 - t * 0.8 + uv.y * 3.6);
	float drift = 0.5 + 0.28 * w1 + 0.22 * w2;
	float low = smoothstep(0.12, 0.90, uv.y);
	float a = clamp((0.09 + drift * 0.11) * low * amount, 0.0, 0.26);
	vec3 col = mix(shade.rgb, mist.rgb, clamp(drift, 0.0, 1.0));
	COLOR = vec4(col, a);
}
