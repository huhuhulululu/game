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
	c.rgb = mix(c.rgb, haze.rgb, fog);
	COLOR = vec4(c.rgb, a);
}
