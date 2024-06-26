export class Block {
	static getCubeGeometry() {
		return Block.CUBE_GEOMETRY;
	}

	static getCrossGeometry() {
		return Block.CROSS_GEOMETRY;
	}

	static getOffsets() {
		return Block.OFFSETS;
	}

	static getMetaData(id) {
		return Block.MAPPING[id];
	}
}

Block.OPAQUE = 0;
Block.ALPHA_MASK = 1;
Block.TRANSLUCENT = 2;

Block.EMPTY = 0;
Block.CUBE = 1;
Block.CROSS = 2;
Block.LIQUID = 3;

Block.TOP_FACE = 0;
Block.FRONT_FACE = 1;
Block.LEFT_FACE = 2;
Block.BOT_FACE = 3;
Block.RIGHT_FACE = 4;
Block.BACK_FACE = 5;

Block.CUBE_GEOMETRY = {
	faces: [
		{
			name: Block.TOP_FACE,
			position: [
				[0, 1, 0], [1, 1, 1], [1, 1, 0],
				[0, 1, 0], [0, 1, 1], [1, 1, 1]
			],
			uv: [
				[1, 0], [0, 1], [0, 0],
				[1, 0], [1, 1], [0, 1]
			],
			lighting: 15
		},
		{
			name: Block.FRONT_FACE,
			position: [
				[1, 1, 1], [0, 0, 1], [1, 0, 1],
				[1, 1, 1], [0, 1, 1], [0, 0, 1]
			],
			uv: [
				[1, 1], [0, 0], [1, 0],
				[1, 1], [0, 1], [0, 0]
			],
			lighting: 14
		},
		{
			name: Block.LEFT_FACE,
			position: [
				[0, 1, 1], [0, 0, 0], [0, 0, 1],
				[0, 1, 1], [0, 1, 0], [0, 0, 0]
			],
			uv: [
				[1, 1], [0, 0], [1, 0],
				[1, 1], [0, 1], [0, 0]
			],
			lighting: 12
		},
		{
			name: Block.BOT_FACE,
			position: [
				[1, 0, 0], [0, 0, 1], [0, 0, 0],
				[1, 0, 0], [1, 0, 1], [0, 0, 1]
			],
			uv: [
				[0, 1], [1, 0], [1, 1],
				[0, 1], [0, 0], [1, 0]
			],
			lighting: 10
		},
		{
			name: Block.RIGHT_FACE,
			position: [
				[1, 1, 0], [1, 0, 1], [1, 0, 0],
				[1, 1, 0], [1, 1, 1], [1, 0, 1]
			],
			uv: [
				[1, 1], [0, 0], [1, 0],
				[1, 1], [0, 1], [0, 0]
			],
			lighting: 13
		},
		{
			name: Block.BACK_FACE,
			position: [
				[0, 1, 0], [1, 0, 0], [0, 0, 0],
				[0, 1, 0], [1, 1, 0], [1, 0, 0]
			],
			uv: [
				[1, 1], [0, 0], [1, 0],
				[1, 1], [0, 1], [0, 0]
			],
			lighting: 11
		}
	],

	length: 3 * 2 * 6
}

Block.CROSS_GEOMETRY = {
	faces: [
		{
			position: [
				[1, 1, 1], [0, 0, 0], [1, 0, 1],
				[1, 1, 1], [0, 1, 0], [0, 0, 0],

				[1, 1, 1], [1, 0, 1], [0, 0, 0],
				[1, 1, 1], [0, 0, 0], [0, 1, 0],
			],
			uv: [
				[1, 1], [0, 0], [1, 0],
				[1, 1], [0, 1], [0, 0],

				[1, 1], [1, 0], [0, 0],
				[1, 1], [0, 0], [0, 1],
			],
			lighting: 15
		},
		{
			position: [
				[1, 1, 0], [0, 0, 1], [1, 0, 0],
				[1, 1, 0], [0, 1, 1], [0, 0, 1],

				[1, 1, 0], [1, 0, 0], [0, 0, 1],
				[1, 1, 0], [0, 0, 1], [0, 1, 1],
			],
			uv: [
				[0, 1], [1, 0], [0, 0],
				[0, 1], [1, 1], [1, 0],

				[0, 1], [0, 0], [1, 0],
				[0, 1], [1, 0], [1, 1],
			],
			lighting: 15
		}
	],

	length: 3 * 4 * 1
}

Block.OFFSETS = [
	[0, 1, 0],
	[0, 0, 1],
	[-1, 0, 0],
	[0, -1, 0],
	[1, 0, 0],
	[0, 0, -1]
]

Block.MAPPING = [
	{ // 0
		name: 'Air',
		isTransparent: true,
		opacity: Block.TRANSLUCENT,
		shape: Block.EMPTY,
		textureIds: [0, 0, 0] // top, sides, bot
	},
	{ // 1
		name: 'Grass',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [0, 3, 2] // top, sides, bot
	},
	{ // 2
		name: 'Stone',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [1, 1, 1] // top, sides, bot
	},
	{ // 3
		name: 'Dirt',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [2, 2, 2] // top, sides, bot
	},
	{ // 4
		name: 'Plank',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [4, 4, 4] // top, sides, bot
	},

	/////////

	{ // 5
		name: 'Cobblestone',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [16, 16, 16] // top, sides, bot
	},
	{ // 6
		name: 'Bedrock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [17, 17, 17] // top, sides, bot
	},
	{ // 7
		name: 'Sand',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [18, 18, 18] // top, sides, bot
	},
	{ // 8
		name: 'Gravel',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [19, 19, 19] // top, sides, bot
	},
	{ // 9
		name: 'WoodLog',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [21, 20, 21] // top, sides, bot
	},
	{ // 10
		name: 'Leaves',
		isTransparent: true,
		opacity: Block.ALPHA_MASK,
		shape: Block.CUBE,
		textureIds: [22, 22, 22] // top, sides, bot
	},

	////////

	{ // 11
		name: 'GoldOre',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [32, 32, 32] // top, sides, bot
	},
	{ // 12
		name: 'IronOre',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [33, 33, 33] // top, sides, bot
	},
	{ // 13
		name: 'CoalOre',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [34, 34, 34] // top, sides, bot
	},
	{ // 14
		name: 'CopperOre',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [35, 35, 35] // top, sides, bot
	},
	{ // 15
		name: 'DiamontOre',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [36, 36, 36] // top, sides, bot
	},
	{ // 16
		name: 'LapizOre',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [37, 37, 37] // top, sides, bot
	},
	{ // 7
		name: 'RedstoneOre',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [38, 38, 38] // top, sides, bot
	},
	{ // 8
		name: 'EmeraldOre',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [39, 39, 39] // top, sides, bot
	},
	{ // 19
		name: 'GoldBlock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [40, 40, 40] // top, sides, bot
	},
	{ // 20
		name: 'IronBlock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [41, 41, 41] // top, sides, bot
	},
	{ // 21
		name: 'CoalBlock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [42, 42, 42] // top, sides, bot
	},
	{ // 22
		name: 'CopperBlock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [43, 43, 43] // top, sides, bot
	},
	{ // 23
		name: 'DiamontBlock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [44, 44, 44] // top, sides, bot
	},
	{ // 24
		name: 'LapizBlock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [45, 45, 45] // top, sides, bot
	},
	{ // 25
		name: 'RedstoneBlock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [46, 46, 46] // top, sides, bot
	},
	{ // 26
		name: 'EmeraldBlock',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [47, 47, 47] // top, sides, bot
	},

	////////

	{ // 27
		name: 'Sponge',
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [48, 48, 48] // top, sides, bot
	},
	{ // 28
		name: 'Glass',
		isTransparent: true,
		opacity: Block.TRANSLUCENT,
		shape: Block.CUBE,
		textureIds: [49, 49, 49] // top, sides, bot
	},


	////////

	{ // 29
		name: 'Poppy',
		isTransparent: true,
		opacity: Block.ALPHA_MASK,
		shape: Block.CROSS,
		textureIds: [12, 12, 12] // top, sides, bot
	},
	{ // 30
		name: 'Dandelon',
		isTransparent: true,
		opacity: Block.ALPHA_MASK,
		shape: Block.CROSS,
		textureIds: [13, 13, 13] // top, sides, bot
	},
	{ // 31
		name: 'Saplin',
		isTransparent: true,
		opacity: Block.ALPHA_MASK,
		shape: Block.CROSS,
		textureIds: [15, 15, 15] // top, sides, bot
	},
	{ // 32
		name: 'Mushroom',
		isTransparent: true,
		opacity: Block.ALPHA_MASK,
		shape: Block.CROSS,
		textureIds: [28, 28, 28] // top, sides, bot
	},
	{ // 33
		name: 'BrownMushroom',
		isTransparent: true,
		opacity: Block.ALPHA_MASK,
		shape: Block.CROSS,
		textureIds: [29, 29, 29] // top, sides, bot
	},


	////////
/*
	{
		name: 'Glass',
		isTransparent: true,
		opacity: Block.ALPHA_MASK,
		shape: Block.CUBE,
		textureIds: [64, 64, 64] // top, sides, bot
	},*/
];


for(let i = 0; i < 16; ++i) {  // 34
	Block.MAPPING.push({
		name: 'Wool' + i,
		isTransparent: false,
		opacity: Block.OPAQUE,
		shape: Block.CUBE,
		textureIds: [64 + i, 64 + i, 64 + i] // top, sides, bot
	})
}
