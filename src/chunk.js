import { Block } from './block';

import { VAO, VBO, AVBO } from 'akila/webgl'
import { mat4, vec3 } from 'akila/math'
import { ChunkAABB } from './aabb';
import { DynamicGBuffer } from './dynamic_gbuffer';

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

		this.aabb = new ChunkAABB();

		this.worldPosition = vec3.create();
		this.worldPosition[0] = this.x * Chunk.SIZE;
		this.worldPosition[1] = this.y * Chunk.SIZE;
		this.worldPosition[2] = this.z * Chunk.SIZE;

		this.data = new Array(Chunk.SIZE * Chunk.SIZE * Chunk.SIZE);
		for(let i = 0; i < this.data.length; ++i) {
			this.data[i] = new Block();
		}

		this.gDataBuffer = new DynamicGBuffer(Chunk.SIZE * Block.getGeometry().length);
	}

	getBlock(x, y, z) {
		return this.data[x + Chunk.SIZE * (y + Chunk.SIZE * z)];
	}

	build(world) {
		this.aabb.setToInfinity();
		this.gDataBuffer.begin();

		for(let chunkZ = 0; chunkZ < Chunk.SIZE; ++chunkZ)
		for(let chunkY = 0; chunkY < Chunk.SIZE; ++chunkY)
		for(let chunkX = 0; chunkX < Chunk.SIZE; ++chunkX) {
			const x = this.worldPosition[0] + chunkX;
			const y = this.worldPosition[1] + chunkY;
			const z = this.worldPosition[2] + chunkZ;

			const block = this.getBlock(chunkX, chunkY, chunkZ);
			if(block.isAir) {
				continue;
			}

			this.aabb.trySetMinMax(x, y, z);

			const blockGeometry = Block.getGeometry();
			const offsets = Block.getOffsets();

			for(let j = 0; j < offsets.length; ++j) {
				const offset = offsets[j];
				const face = blockGeometry.faces[j];

				const neighborBlock = world.getBlock(x + offset[0], y + offset[1], z + offset[2]);
				if(neighborBlock.isAir || (neighborBlock.isTransparent && block.isTransparent == false)) {
					this.addVertices(world, face, chunkX, chunkY, chunkZ);
				}
			}
		}

		this.gDataBuffer.end();
		this.aabb.setupPoints();
	}

	addVertices = (world, face, chunkX, chunkY, chunkZ) => {
		for(let vi = 0; vi < face.position.length; ++vi) {
			const x = face.position[vi][0] + chunkX;
			const y = face.position[vi][1] + chunkY;
			const z = face.position[vi][2] + chunkZ;
	
			const u = face.uv[vi][0];
			const v = face.uv[vi][1];
	
			let texID = this.getBlock(chunkX, chunkY, chunkZ).id;

			{ // grass
				if(texID === 2 && world.getBlock(this.worldPosition[0] + chunkX, this.worldPosition[1] + chunkY + 1, this.worldPosition[2] + chunkZ).isAir) {
					if(face.name === 'top') {
						texID = 0;	
					} else if(face.name !== 'bot') {
						texID = 3;
					}
				}

				if(texID === (16 + 4)) { // wood log
					if(face.name === 'top' || face.name === 'bot') {
						texID = 16 + 5;	
					}
				}
			}


			const uv = (u << 1) | v;
			const lighting = face.lighting;
			//const lighting = 0xF;
			//const lighting = (0xF * this.y) / 4;
			//const lighting = Math.floor(Math.random() * 0xF);
	
			this.gDataBuffer.add((x << 26) | (y << 20) | (z << 14) | (texID << 6) | (uv << 4) | lighting);
		}
	}
}

Chunk.SIZE = 32;
