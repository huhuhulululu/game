shader_type canvas_item;

// Warm night on the painted bed. Lamps already in the paint stay the light.
uniform vec4 night : source_color = vec4(0.78, 0.68, 0.52, 1.0);
uniform float amount : hint_range(0.0, 1.0) = 0.0;
uniform float lamp : hint_range(0.0, 1.0) = 0.50;

void fragment() {
	vec4 c = texture(TEXTURE, UV);
	float sky = 1.0 - smoothstep(0.14, 0.46, UV.y);
	float hi = max(c.r, max(c.g, c.b));
	float lo = min(c.r, min(c.g, c.b));
	float sat = hi - lo;
	float warm = clamp((c.r - c.b) * 2.2, 0.0, 1.0);
	float glow = smoothstep(lamp, lamp + 0.22, c.r * 0.72 + c.g * 0.28);
	glow *= smoothstep(0.10, 0.26, sat) * warm * (1.0 - sky);
	vec3 dim = c.rgb * night.rgb;
	dim *= mix(1.0, 0.52, sky);
	c.rgb = mix(c.rgb, mix(dim, c.rgb * vec3(1.05, 0.90, 0.68), glow), amount);
	COLOR = c;
}
