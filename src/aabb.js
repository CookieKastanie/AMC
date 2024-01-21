export class AABB {
	constructor() {
		this.minX = Number.MAX_SAFE_INTEGER;
		this.maxX = Number.MIN_SAFE_INTEGER;

		this.minY = Number.MAX_SAFE_INTEGER;
		this.maxY = Number.MIN_SAFE_INTEGER;

		this.minZ = Number.MAX_SAFE_INTEGER;
		this.maxZ = Number.MIN_SAFE_INTEGER;

		this.originMinX = Number.MAX_SAFE_INTEGER;
		this.originMaxX = Number.MIN_SAFE_INTEGER;

		this.originMinY = Number.MAX_SAFE_INTEGER;
		this.originMaxY = Number.MIN_SAFE_INTEGER;

		this.originMinZ = Number.MAX_SAFE_INTEGER;
		this.originMaxZ = Number.MIN_SAFE_INTEGER;
	}

	setPosition(pos) {
		this.minX = this.originMinX + pos[0];
		this.maxX = this.originMaxX + pos[0];

		this.minY = this.originMinY + pos[1];
		this.maxY = this.originMaxY + pos[1];

		this.minZ = this.originMinZ + pos[2];
		this.maxZ = this.originMaxZ + pos[2];
	}
}

export class ChunkAABB {
	constructor() {
		this.points = new Array(8);
		this.setToInfinity();
		this.setupPoints();
	}

	setToInfinity() {
		this.minX = Number.MAX_SAFE_INTEGER;
		this.maxX = Number.MIN_SAFE_INTEGER;

		this.minY = Number.MAX_SAFE_INTEGER;
		this.maxY = Number.MIN_SAFE_INTEGER;

		this.minZ = Number.MAX_SAFE_INTEGER;
		this.maxZ = Number.MIN_SAFE_INTEGER;
	}

	trySetMinMax(x, y, z) {
		if(x + 1 > this.maxX) this.maxX = x + 1;
		if(x < this.minX) this.minX = x;

		if(y + 1 > this.maxY) this.maxY = y + 1;
		if(y < this.minY) this.minY = y;

		if(z + 1 > this.maxZ) this.maxZ = z + 1;
		if(z < this.minZ) this.minZ = z;
	}

	setupPoints() {
		this.points[0] = [this.minX, this.minY, this.minZ, 1];
		this.points[1] = [this.minX, this.minY, this.maxZ, 1];
		this.points[2] = [this.minX, this.maxY, this.minZ, 1];
		this.points[3] = [this.minX, this.maxY, this.maxZ, 1];
		this.points[4] = [this.maxX, this.minY, this.minZ, 1];
		this.points[5] = [this.maxX, this.minY, this.maxZ, 1];
		this.points[6] = [this.maxX, this.maxY, this.minZ, 1];
		this.points[7] = [this.maxX, this.maxY, this.maxZ, 1];

		this.center = [
			this.minX * 0.5 + this.maxX * 0.5,
			this.minY * 0.5 + this.maxY * 0.5,
			this.minZ * 0.5 + this.maxZ * 0.5,
		];
	}
}