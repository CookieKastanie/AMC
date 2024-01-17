import { vec3 } from "akila/math";

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
		this.setToInfinity();
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
		if(x > this.maxX) this.maxX = x;
		else if(x < this.minX) this.minX = x;

		if(y > this.maxY) this.maxY = y;
		else if(y < this.minY) this.minY = y;

		if(z > this.maxZ) this.maxZ = z;
		else if(z < this.minZ) this.minZ = z;
	}
}