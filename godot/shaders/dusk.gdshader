shader_type canvas_item;

uniform vec4 dusk : source_color = vec4(1.02, 0.97, 0.90, 1.0);
uniform vec4 haze : source_color = vec4(0.78, 0.62, 0.46, 1.0);
uniform float fog : hint_range(0.0, 1.0) = 0.03;
uniform float edge : hint_range(0.0, 0.3) = 0.10;
uniform float feet : hint_range(0.0, 0.5) = 0.16;
uniform float grade : hint_range(0.0, 1.0) = 0.0;

void fragment() {
	vec4 c = texture(TEXTURE, UV);
	float a = smoothstep(0.02, 0.02 + edge, c.a);
	float foot = smoothstep(1.0 - feet, 1.0, UV.y);
	a *= 1.0 - foot * 0.62;
	c.rgb = mix(c.rgb, c.rgb * dusk.rgb, grade);
	// West key only when a coat grade is on. Beds keep grade 0.0.
	float west = mix(1.08, 0.90, UV.x);
	c.rgb *= mix(vec3(1.0), vec3(west, west * 0.96, west * 0.86), grade * 0.55);
	float luma = dot(c.rgb, vec3(0.30, 0.54, 0.16));
	c.rgb = mix(c.rgb, vec3(luma) * dusk.rgb, grade * 0.16);
	c.rgb = mix(c.rgb, haze.rgb, fog);
	// Umber the fringe so a soft cut is not a white halo.
	c.rgb = mix(haze.rgb * 0.50, c.rgb, mix(1.0, smoothstep(0.06, 0.42, c.a), grade));
	COLOR = vec4(c.rgb, a);
}
