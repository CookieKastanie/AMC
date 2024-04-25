const BLOCK_DATA_UNPACK = `
vec3 pos = vec3(
	float((a_vertexData & 0xFC000000u) >> 26u),
	float((a_vertexData & 0x03F00000u) >> 20u),
	float((a_vertexData & 0x000FC000u) >> 14u)
);

uint texId    = (a_vertexData & 0x00003FC0u) >> 6u;
uint uv       = (a_vertexData & 0x00000030u) >> 4u;
uint lighting =  a_vertexData & 0x0000000Fu;
`;


const FOG_FUNCTION = `
float getFog() {
	float cameraToPixelDist = length(v_worldPos - cameraWorldPos);
	float gFogEnd = 50.0;
	float distRatio = 4.0 - cameraToPixelDist / gFogEnd;
	float gExpFogDensity = 2.0;
	return clamp(exp(-distRatio * gExpFogDensity), 0.0, 1.0);
}
`;

export const TERRAIN_OPAQUE_VS = 
`#version 300 es
precision mediump float;

layout(location = 0) in uint a_vertexData;

flat out float v_texId;
out vec2 v_uv;
out float v_lighting;
out vec3 v_worldPos;

uniform vec3 chunkPos;
uniform mat4 VP;

void main(){
	${BLOCK_DATA_UNPACK}

	v_worldPos = pos + chunkPos;
	gl_Position = VP * vec4(v_worldPos, 1.0);

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
in vec3 v_worldPos;

out vec4 fragColor;

uniform sampler2DArray blocksTextures;
uniform vec3 cameraWorldPos;

${FOG_FUNCTION}

void main(){
	vec3 color = texture(blocksTextures, vec3(v_uv, v_texId)).rgb;
	fragColor = vec4(mix(color * v_lighting, vec3(0.259, 0.647, 0.961), getFog()), 1.0);
}`;

export const TERRAIN_ALPHA_MASK_VS = `#version 300 es
precision mediump float;

layout(location = 0) in uint a_vertexData;

flat out float v_texId;
out vec2 v_uv;
out float v_lighting;
out vec3 v_worldPos;

uniform vec3 chunkPos;
uniform mat4 VP;

void main(){
	${BLOCK_DATA_UNPACK}

	v_worldPos = pos + chunkPos;
	gl_Position = VP * vec4(v_worldPos, 1.0);

	v_texId = float(texId);
	v_uv = vec2(
		float((uv & 0x2u) >> 1u),
		1. - float(uv & 1u)
	);
	v_lighting = float(lighting) / 16.;
}`;
export const TERRAIN_ALPHA_MASK_FS = 
`#version 300 es
precision mediump float;
precision mediump sampler2DArray;

flat in float v_texId;
in vec2 v_uv;
in float v_lighting;
in vec3 v_worldPos;

out vec4 fragColor;

uniform sampler2DArray blocksTextures;
uniform vec3 cameraWorldPos;

${FOG_FUNCTION}

void main(){
	vec4 color = texture(blocksTextures, vec3(v_uv, v_texId));

	if(color.a < 0.5) {
		discard;
	} else {
		fragColor = vec4(mix(color.rgb * v_lighting, vec3(0.259, 0.647, 0.961), getFog()), 1.0);
	}
}`;









export const TERRAIN_TRANSLUCENT_VS = `#version 300 es
precision mediump float;

layout(location = 0) in uint a_vertexData;

flat out float v_texId;
out vec2 v_uv;
out float v_lighting;

uniform vec3 chunkPos;
uniform mat4 VP;

void main(){
	${BLOCK_DATA_UNPACK}

	gl_Position = VP * vec4(pos + chunkPos, 1.0);

	v_texId = float(texId);
	v_uv = vec2(
		float((uv & 0x2u) >> 1u),
		1. - float(uv & 1u)
	);
	v_lighting = float(lighting) / 16.;
}`;
export const TERRAIN_TRANSLUCENT_FS = 
`#version 300 es
precision mediump float;
precision mediump sampler2DArray;

flat in float v_texId;
in vec2 v_uv;
in float v_lighting;

layout (location = 0) out vec4 accum;
layout (location = 1) out float reveal;

uniform sampler2DArray blocksTextures;

void main(){
	vec4 color = texture(blocksTextures, vec3(v_uv, v_texId));

	// weight function
	float weight = clamp(pow(min(1.0, color.a * 10.0) + 0.01, 3.0) * 1e8 * pow(1.0 - gl_FragCoord.z * 0.9, 3.0), 1e-2, 3e3);

	// store pixel color accumulation
	accum = vec4(color.rgb * color.a, color.a) * weight;

	// store pixel revealage threshold
	reveal = color.a;

	// store pixel color accumulation
	//accum = vec4((color.rgb * color.a) * weight, color.a);

	// store pixel revealage threshold
	//reveal = color.a * weight;
}`;


export const TERRAIN_COMPOSE_VS =
`#version 300 es
precision mediump float;

layout(location = 0) in vec3 a_position;

void main(){
	vec4 pos = vec4(a_position, 1.0);

	gl_Position = pos;
}`;

export const TERRAIN_COMPOSE_FS =
`#version 300 es
precision mediump float;

// shader outputs
layout (location = 0) out vec4 frag;

// color accumulation buffer
uniform sampler2D accum;

// revealage threshold buffer
uniform sampler2D reveal;

// epsilon number
const float EPSILON = 0.00001f;

// calculate floating point numbers equality accurately
bool isApproximatelyEqual(float a, float b)
{
	return abs(a - b) <= (abs(a) < abs(b) ? abs(b) : abs(a)) * EPSILON;
}

// get the max value between three values
float max3(vec3 v) 
{
	return max(max(v.x, v.y), v.z);
}

void main()
{
	// fragment coordination
	ivec2 coords = ivec2(gl_FragCoord.xy);
	
	// fragment revealage
	float revealage = texelFetch(reveal, coords, 0).r;

	// fragment color
	vec4 accumulation = texelFetch(accum, coords, 0);

	//float tmp = accumulation.a;
	//accumulation.a = revealage;
	//revealage = accumulation.a;
	
	// save the blending and color texture fetch cost if there is not a transparent fragment
	if (isApproximatelyEqual(revealage, 1.0f)) 
		discard;
 
	
	
	// suppress overflow
	if (isinf(max3(abs(accumulation.rgb)))) 
		accumulation.rgb = vec3(accumulation.a);

	// prevent floating point precision bug
	vec3 average_color = accumulation.rgb / max(accumulation.a, EPSILON);

	// blend pixels
	frag = vec4(average_color, 1.0f - revealage);
}
`;










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
	vec4 color = texture(blocksTextures, vec3(v_uv, texId));
	fragColor = color;
}`;


