#version 300 es
precision mediump float;

layout(location = 0) in uint a_vertexData;

flat out float v_texId;
out vec2 v_uv;
out float v_lighting;
out vec3 v_worldPos;

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

	v_worldPos = pos + chunkPos;
	gl_Position = VP * vec4(v_worldPos, 1.0);

	v_texId = float(texId);
	v_uv = vec2(
		float((uv & 0x2u) >> 1u),
		1. - float(uv & 1u)
	);
	v_lighting = float(lighting) / 16.;
}
