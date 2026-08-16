shader_type canvas_item;

uniform vec4 dusk : source_color = vec4(1.05, 0.92, 0.78, 1.0);
uniform float vig : hint_range(0.0, 0.6) = 0.22;

void fragment() {
	vec4 c = texture(TEXTURE, UV);
	c.rgb *= dusk.rgb;
	vec2 p = UV - vec2(0.5);
	float v = clamp(dot(p, p) * 1.6, 0.0, 1.0) * vig;
	c.rgb *= 1.0 - v;
	COLOR = c;
}
