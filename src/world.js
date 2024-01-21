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

	draw(shader, camera) {

		shader.sendVec3('tint', new Float32Array([1, 1, 1]));

		if(this.indexArray == undefined) {
			this.indexArray = new Array(this.sizeX * this.sizeY * this.sizeZ);

			for(let i = 0; i < this.indexArray.length; ++i) {
				this.indexArray[i] = i;
			}
		}
		
		

		const camPos = camera.getPosition();
		/*/
		this.chunks.sort((a, b) => {
			const distA = Math.pow(a.aabb.center[0] - camPos[0], 2) + Math.pow(a.aabb.center[1] - camPos[1], 2) + Math.pow(a.aabb.center[2] - camPos[2], 2);
			const distB = Math.pow(b.aabb.center[0] - camPos[0], 2) + Math.pow(b.aabb.center[1] - camPos[1], 2) + Math.pow(b.aabb.center[2] - camPos[2], 2);

			return distA - distB;
		});
		//*/

		this.indexArray.sort((ia, ib) => {
			const a = this.chunks[ia];
			const b = this.chunks[ib];

			//const distA = Math.pow(a.aabb.center[0] - camPos[0], 2) + Math.pow(a.aabb.center[1] - camPos[1], 2) + Math.pow(a.aabb.center[2] - camPos[2], 2);
			//const distB = Math.pow(b.aabb.center[0] - camPos[0], 2) + Math.pow(b.aabb.center[1] - camPos[1], 2) + Math.pow(b.aabb.center[2] - camPos[2], 2);


			const distA = vec3.distance(a.aabb.center, camPos);
			const distB = vec3.distance(b.aabb.center, camPos);

			return distA < distB ? -1 : 1;
		});


		for(let i = 0; i < (this.sizeX * this.sizeY * this.sizeZ); ++i) {
			//const chunk = this.chunks[i];
			const chunk = this.chunks[this.indexArray[i]];

			//*
			if(vec3.distance(chunk.aabb.center, camPos) > (16 * 8)) {
				continue;
			}
			//*/

//*/
			if(CollisionTester.isChunkInViewport(chunk.aabb, camera) == false) {
				//shader.sendVec3('tint', new Float32Array([1, 0, 0]));
				//LRD.addAABB(chunk.aabb, LRD.YELLOW);
				//chunk.draw(shader);

				continue;

			//} else {
			//	shader.sendVec3('tint', new Float32Array([1, 1, 1]));
			}
//*/

//const shade = i / (this.sizeX * this.sizeY * this.sizeZ)

//shader.sendVec3('tint', new Float32Array([shade, shade, shade]));
//shader.sendVec3('tint', new Float32Array([1, 1, 1]));
			chunk.draw(shader);
		}
	}

	update() {
		if(this.buildList.length > 0) {
			const chunk = this.buildList.shift();
			chunk.build(this);
		}		
	}
}
