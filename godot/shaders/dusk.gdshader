shader_type canvas_item;

uniform vec4 dusk : source_color = vec4(1.04, 0.90, 0.76, 1.0);
uniform vec4 haze : source_color = vec4(0.72, 0.54, 0.40, 1.0);
uniform float fog : hint_range(0.0, 1.0) = 0.08;
uniform float edge : hint_range(0.0, 0.3) = 0.06;

void fragment() {
	vec4 c = texture(TEXTURE, UV);
	float a = smoothstep(0.04, 0.04 + edge, c.a);
	c.rgb *= dusk.rgb;
	c.rgb = mix(c.rgb, haze.rgb, fog);
	COLOR = vec4(c.rgb, a);
}
