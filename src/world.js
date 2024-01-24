import { vec3 } from "akila/math";
import { Block } from "./block";
import { Chunk } from "./chunk";
import { CollisionTester } from "./collision_tester";
import { LRD } from "./line_debugger_renderer";

export class World {
	constructor(sizeX = 4, sizeY = 4, sizeZ = 4) {
		this.sizeX = sizeX;
		this.sizeY = sizeY;
		this.sizeZ = sizeZ;
		this.chunks = new Array(sizeX * sizeY * sizeZ);

		this.nullBlock = new Block();
		this.buildList = new Array();

		let i = 0;
		for(let z = 0; z < sizeZ; ++z)
		for(let y = 0; y < sizeY; ++y)
		for(let x = 0; x < sizeX; ++x) {
			this.chunks[i++] = new Chunk(x, y, z);
		}
	}

	getXSizeBlockCount() {
		return this.sizeX * Chunk.SIZE;
	}

	getYSizeBlockCount() {
		return this.sizeY * Chunk.SIZE;
	}

	getZSizeBlockCount() {
		return this.sizeZ * Chunk.SIZE;
	}

	getChunk(x, y, z) {
		return this.chunks[x + this.sizeZ * (y + this.sizeY * z)];
	}

	getChunkFromBlockPosition(x, y, z) {
		if(x < 0 || x >= this.getXSizeBlockCount() || y < 0 || y >= this.getYSizeBlockCount() || z < 0 || z >= this.getZSizeBlockCount()) {
			return null;
		}

		return this.getChunk(
			Math.floor(x / Chunk.SIZE),
			Math.floor(y / Chunk.SIZE),
			Math.floor(z / Chunk.SIZE)
		);
	}

	getChunksThatTouchBlockPosition(x, y, z) {
		const baseChunk = this.getChunkFromBlockPosition(x, y, z);
		if(baseChunk === null) {
			return [];
		}

		const chunks = [baseChunk];

		const cx = Math.floor(x / Chunk.SIZE);
		const cy = Math.floor(y / Chunk.SIZE);
		const cz = Math.floor(z / Chunk.SIZE);

		const cbx = x % Chunk.SIZE;
		const cby = y % Chunk.SIZE;
		const cbz = z % Chunk.SIZE;

		if(cbx == 0 && cx > 0)                           chunks.push(this.getChunk(cx - 1, cy, cz));
		if(cbx == Chunk.SIZE - 1 && cx < this.sizeX - 1) chunks.push(this.getChunk(cx + 1, cy, cz));

		if(cby == 0 && cy > 0)                           chunks.push(this.getChunk(cx, cy - 1, cz));
		if(cby == Chunk.SIZE - 1 && cy < this.sizeY - 1) chunks.push(this.getChunk(cx, cy + 1, cz));

		if(cbz == 0 && cz > 0)                           chunks.push(this.getChunk(cx, cy, cz - 1));
		if(cbz == Chunk.SIZE - 1 && cz < this.sizeZ - 1) chunks.push(this.getChunk(cx, cy, cz + 1));

		return chunks;
	}

	getBlock(x, y, z) {
		if(x < 0 || x >= this.getXSizeBlockCount() || y < 0 || y >= this.getYSizeBlockCount() || z < 0 || z >= this.getZSizeBlockCount()) {
			this.nullBlock.isAir = true;
			return this.nullBlock;
		}

		return this.getChunk(
			Math.floor(x / Chunk.SIZE),
			Math.floor(y / Chunk.SIZE),
			Math.floor(z / Chunk.SIZE)
		).getBlock(
			x % Chunk.SIZE,
			y % Chunk.SIZE,
			z % Chunk.SIZE
		);
	}

	buildAll() {
		for(let i = 0; i < (this.sizeX * this.sizeY * this.sizeZ); ++i) {
			this.buildList.push(this.chunks[i]);
		}
	}

	update() {
		if(this.buildList.length > 0) {
			const chunk = this.buildList.shift();
			chunk.build(this);
		}		
	}
}
