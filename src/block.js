export class Block {
	constructor() {
		this.isAir = true;
		this.id = 0;
		this.isTransparent = false;
		//this.textureId = 0;
		//this.lightFactors = [0, 0, 0, 0, 0, 0];
	}

	static getGeometry() {
		return Block.GEOMETRY;
	}

	static getOffsets() {
		return Block.OFFSETS;
	}
}

Block.GEOMETRY = {
	faces: [
		{
			name: 'top',
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
			name: 'front',
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
			name: 'left',
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
			name: 'bot',
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
			name: 'right',
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
			name: 'back',
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

Block.OFFSETS = [
	[0, 1, 0],
	[0, 0, 1],
	[-1, 0, 0],
	[0, -1, 0],
	[1, 0, 0],
	[0, 0, -1]
]
