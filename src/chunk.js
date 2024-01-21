import { Block } from './block';

import { VAO, VBO, AVBO } from 'akila/webgl'
import { mat4, vec3 } from 'akila/math'
import { ChunkAABB } from './aabb';

/*

vertex data :

  x  |  y  |  z  | textID | uv | light |
  6  |  6  |  6  |   8    |  2 |   4   |  = 32
 26    20    14      6       4     0
*/

export class Chunk {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;

		this.wx = this.x * Chunk.SIZE;
		this.wy = this.y * Chunk.SIZE;
		this.wz = this.z * Chunk.SIZE;

		this.aabb = new ChunkAABB();

		//this.matWorldPos = mat4.identity(mat4.create());
		//mat4.translate(this.matWorldPos, this.matWorldPos, [this.wx, this.wy, this.wz]);
		this.worldPosition = vec3.create();
		this.worldPosition[0] = this.wx;
		this.worldPosition[1] = this.wy;
		this.worldPosition[2] = this.wz;

		this.data = new Array(Chunk.SIZE * Chunk.SIZE * Chunk.SIZE);
		for(let i = 0; i < this.data.length; ++i) {
			this.data[i] = new Block();
		}

		this.maxBufferSize = this.data.length * Block.getVertices().length;

		//this.gDataBuffer = new Int32Array((this.data.length / Chunk.SIZE) * Block.getVertices().length);
		this.gDataBuffer = new Int32Array(Chunk.SIZE * Block.getVertices().length);
		this.gDataBufferLength = 0;

		this.initVAO();
	}

	initVAO() {
		this.dataVBO = new AVBO(null, VBO.DYNAMIC_DRAW);
		this.dataVBO.addVertexAttribute(1, 0, 0, 0, AVBO.UNSIGNED_INT);
		this.vao = new VAO().addVBO(this.dataVBO);
	}

	sendToGPU() {
		if(this.vao === null) {
			this.initVAO();
		}

		this.dataVBO.setData(this.gDataBuffer);
	}

	getBlock(x, y, z) {
		return this.data[x + Chunk.SIZE * (y + Chunk.SIZE * z)];
	}

	build(world) {
		this.aabb.setToInfinity();

		let i = 0;
		for(let iz = 0; iz < Chunk.SIZE; ++iz)
		for(let iy = 0; iy < Chunk.SIZE; ++iy)
		for(let ix = 0; ix < Chunk.SIZE; ++ix) {
			const x = this.wx + ix;
			const y = this.wy + iy;
			const z = this.wz + iz;

			const block = this.getBlock(ix, iy, iz);
			if(block.isAir) {
				continue;
			}

			this.aabb.trySetMinMax(x, y, z);

			const verts = Block.getVertices();
			const swaps = Block.getSwaps();

			for(let j = 0; j < swaps.length; ++j) {
				const s = swaps[j];
				const v = verts.faces[j];

				const neighborBlock = world.getBlock(x + s[0], y + s[1], z + s[2]);
				if(neighborBlock.isAir || (neighborBlock.isTransparent && block.isTransparent == false)) {
					this.addVertices(world, v, i, ix, iy, iz); i += verts.length;
				}
			}
		}

		if(this.gDataBuffer.length > (i * 2)) { // slice buffer if too big
			this.gDataBuffer = this.gDataBuffer.slice(0, this.gDataBuffer.length / 2);
			if(this.vao !== null) {
				this.vao.delete();
				this.vao = null;
			}
		}

		this.gDataBufferLength = i;

		this.sendToGPU();
		this.aabb.setupPoints();
	}

	addVertices = (world, vArr, io, ox, oy, oz) => {
		let i = io;
		for(let vi = 0; vi < vArr.verts.length; ++vi) {
			const x = vArr.verts[vi][0] + ox;
			const y = vArr.verts[vi][1] + oy;
			const z = vArr.verts[vi][2] + oz;
	
			const u = vArr.uv[vi][0];
			const v = vArr.uv[vi][1];
	
			let texID = this.getBlock(ox, oy, oz).id;

			{ // grass
				if(texID === 2 && world.getBlock(this.wx + ox, this.wy + oy + 1, this.wz + oz).isAir) {
					if(vArr.face === 'top') {
						texID = 0;	
					} else if(vArr.face !== 'bot') {
						texID = 3;
					}
				}
			}


			const uv = (u << 1) | v;
			const lighting = vArr.lighting;
			//const lighting = 0xF;
			//const lighting = (0xF * this.y) / 4;
			//const lighting = Math.floor(Math.random() * 0xF);

			if(this.gDataBuffer.length <= i) { // grow buffer if needed
				const old = this.gDataBuffer;
				this.gDataBuffer = new Int32Array(old.length * 2);
				this.gDataBuffer.set(old);

				if(this.vao !== null) {
					this.vao.delete();
					this.vao = null;
				}
			}
	
			this.gDataBuffer[i++] = (x << 26) | (y << 20) | (z << 14) | (texID << 6) | (uv << 4) | lighting;
		}
	}

	draw(shader) {
		if(this.gDataBufferLength <= 0) {
			return;
		}

		shader.sendVec3('chunkPos', this.worldPosition);
		this.vao.draw(this.gDataBufferLength);
	}
}

Chunk.SIZE = 32;
