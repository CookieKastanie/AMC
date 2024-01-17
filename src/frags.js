export const TERRAIN_OPAQUE_VS = 
`#version 300 es
precision mediump float;

layout(location = 0) in uint a_vertexData;

flat out float v_texId;
out vec2 v_uv;
out float v_lighting;

uniform vec3 chunkPos;
uniform mat4 VP;

void main(){
	vec3 pos = vec3(
		float((a_vertexData & 0xFC000000u) >> 26u),
		float((a_vertexData & 0x03F00000u) >> 20u),
		float((a_vertexData & 0x000FC000u) >> 14u)
	);

	uint texId    = (a_vertexData & 0x00003FC0u) >> 6u;
	uint uv       = (a_vertexData & 0x00000030u) >> 4u;
	uint lighting =  a_vertexData & 0x0000000Fu;

	gl_Position = VP * vec4(pos + chunkPos, 1.0);

	v_texId = float(texId);
	v_uv = vec2(
		float((uv & 0x2u) >> 1u),
		1. - float(uv & 1u)
	);
	v_lighting = float(lighting) / 16.;
}`;

export const TERRAIN_OPAQUE_FS = 
`#version 300 es
precision mediump float;
precision mediump sampler2DArray;

flat in float v_texId;
in vec2 v_uv;
in float v_lighting;

out vec4 fragColor;

uniform sampler2DArray blocksTextures;
uniform vec3 tint;

void main(){
	vec3 color = texture(blocksTextures, vec3(v_uv, v_texId)).rgb;
	fragColor = vec4(tint * color * v_lighting, 1.0);

	/*/
	vec4 color = texture(blocksTextures, vec3(v_uv, v_texId));
	if(color.a < 0.5) {
		discard;
	} else {
		fragColor = vec4(tint * color.rgb * v_lighting, 1.0);
	}
	//*/
}`;






export const LINE_VS = 
`#version 300 es
precision mediump float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_color;

out vec3 v_color;

uniform mat4 VP;

void main(){
	vec4 pos = VP * vec4(a_position, 1.0);
	pos.z -= 0.0001;

	gl_Position = pos;
	v_color = a_color;
}`;

export const LINE_FS = 
`#version 300 es
precision mediump float;

in vec3 v_color;

out vec4 fragColor;

void main(){
	fragColor = vec4(v_color, 1.0);
}`;





export const CROSS_VS = 
`#version 300 es
precision mediump float;

layout(location = 0) in vec2 a_position;

out vec2 v_uv;

uniform vec2 screenSize;

void main(){
	//vec2 pixelPos = a_position * (38.0 * 0.5);
	vec2 pixelPos = a_position * 38.0;
	gl_Position = vec4(pixelPos / screenSize, 0.0, 1.0);
	v_uv = a_position * 0.5 + 0.5;
}`;

export const CROSS_FS = 
`#version 300 es
precision mediump float;

in vec2 v_uv;

out vec4 fragColor;

uniform sampler2D tex;

void main(){
	fragColor = texture(tex, v_uv);
}`;






export const BLOCK_SELECT_VS = 
`#version 300 es
precision mediump float;

layout(location = 0) in vec2 a_position;

out vec2 v_uv;

uniform vec2 screenSize;

void main(){
	vec2 pixelPos = a_position * 64.0 + screenSize * vec2(1, -1) + vec2(-64.0, 64.0);
	gl_Position = vec4(pixelPos / screenSize, 0.0, 1.0);
	v_uv = (a_position * 0.5 + 0.5) * vec2(1.0, -1.0);
}`;

export const BLOCK_SELECT_FS = 
`#version 300 es
precision mediump float;
precision mediump sampler2DArray;

in vec2 v_uv;

out vec4 fragColor;

uniform sampler2DArray blocksTextures;
uniform float texId;

void main(){
	vec3 color = texture(blocksTextures, vec3(v_uv, texId)).rgb;
	fragColor = vec4(color, 1.0);
}`;


