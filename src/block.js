export class Block {
	constructor() {
		this.isAir = true;
		this.id = 0;
		this.isTransparent = false;
		//this.textureId = 0;
		//this.lightFactors = [0, 0, 0, 0, 0, 0];
	}

	static getVertices() {
		return Block.VERTICES;
	}

	static getSwaps() {
		return Block.SWAPS;
	}
}

Block.VERTICES = {
	faces: [
		{
			face: 'top',
			verts: [
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
			face: 'front',
			verts: [
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
			face: 'left',
			verts: [
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
			face: 'bot',
			verts: [
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
			face: 'right',
			verts: [
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
			face: 'back',
			verts: [
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

Block.SWAPS = [
	[0, 1, 0],
	[0, 0, 1],
	[-1, 0, 0],
	[0, -1, 0],
	[1, 0, 0],
	[0, 0, -1]
]
