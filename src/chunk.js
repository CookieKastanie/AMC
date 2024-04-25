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

		this.data = new Uint8Array(Chunk.SIZE * Chunk.SIZE * Chunk.SIZE);
		for(let i = 0; i < this.data.length; ++i) {
			this.data[i] = 0;
		}

		this.gOpaqueDataBuffer = new DynamicGBuffer(128);
		this.gAlphaMaskDataBuffer = new DynamicGBuffer(128);
		this.gTranslucentDataBuffer = new DynamicGBuffer(128);
	}

	getBlock(x, y, z) {
		return this.data[x + Chunk.SIZE * (y + Chunk.SIZE * z)];
	}

	setBlock(x, y, z, id) {
		this.data[x + Chunk.SIZE * (y + Chunk.SIZE * z)] = id;
	}

	build(world) {
		this.aabb.setToInfinity();
		this.gOpaqueDataBuffer.begin();
		this.gAlphaMaskDataBuffer.begin();
		this.gTranslucentDataBuffer.begin();

		for(let chunkZ = 0; chunkZ < Chunk.SIZE; ++chunkZ)
		for(let chunkY = 0; chunkY < Chunk.SIZE; ++chunkY)
		for(let chunkX = 0; chunkX < Chunk.SIZE; ++chunkX) {
			const x = this.worldPosition[0] + chunkX;
			const y = this.worldPosition[1] + chunkY;
			const z = this.worldPosition[2] + chunkZ;

			const blockId = this.getBlock(chunkX, chunkY, chunkZ);
			const blockMeta = Block.getMetaData(blockId);
			if(blockId === 0) {
				continue;
			}

			this.aabb.trySetMinMax(x, y, z);

			let gDataBuffer; 
			switch(blockMeta.opacity) {
				case Block.ALPHA_MASK:
					gDataBuffer = this.gAlphaMaskDataBuffer;
					break;
				case Block.TRANSLUCENT:
					gDataBuffer = this.gTranslucentDataBuffer;
					break;
				case Block.OPAQUE:
				default:
					gDataBuffer = this.gOpaqueDataBuffer;
					break;
			}

			switch(blockMeta.shape) {
				case Block.CROSS:
					this.addCross(gDataBuffer, blockMeta, chunkX, chunkY, chunkZ);
					break;
				case Block.CUBE:
				default:
					this.addCube(gDataBuffer, blockMeta, world, x, y, z, chunkX, chunkY, chunkZ);
					break;
			}
		}

		this.gTranslucentDataBuffer.end();
		this.gAlphaMaskDataBuffer.end();
		this.gOpaqueDataBuffer.end();
		this.aabb.setupPoints();
	}

	addCube(gDataBuffer, blockMeta, world, x, y, z, chunkX, chunkY, chunkZ) {
		const blockGeometry = Block.getCubeGeometry();
		const offsets = Block.getOffsets();

		for(let j = 0; j < offsets.length; ++j) {
			const offset = offsets[j];
			const face = blockGeometry.faces[j];

			const neighborBlockId = world.getBlock(x + offset[0], y + offset[1], z + offset[2]);
			const neighborBlockMeta = Block.getMetaData(neighborBlockId);
			if(neighborBlockId === 0 || (neighborBlockMeta.isTransparent && blockMeta.isTransparent == false)) {
				this.addVertices(gDataBuffer, blockMeta, face, chunkX, chunkY, chunkZ);
			}
		}
	}

	addCross(gDataBuffer, blockMeta, chunkX, chunkY, chunkZ) {
		const blockGeometry = Block.getCrossGeometry();

		for(let i = 0; i < blockGeometry.faces.length; ++i) {
			const face = blockGeometry.faces[i];
			this.addVertices(gDataBuffer, blockMeta, face, chunkX, chunkY, chunkZ);
		}
	}

	addVertices(gDataBuffer, blockMeta, face, chunkX, chunkY, chunkZ) {
		for(let i = 0; i < face.position.length; ++i) {
			const x = face.position[i][0] + chunkX;
			const y = face.position[i][1] + chunkY;
			const z = face.position[i][2] + chunkZ;
	
			const u = face.uv[i][0];
			const v = face.uv[i][1];

			let texId = 0;
			switch(face.name) {
				case Block.TOP_FACE:
					texId = blockMeta.textureIds[0];
					break;
				case Block.BOT_FACE:
					texId = blockMeta.textureIds[2];
					break;
				default:
					texId = blockMeta.textureIds[1];
					break;
			}

			const uv = (u << 1) | v;
			const lighting = face.lighting;

			const packedBlockData = (x << 26) | (y << 20) | (z << 14) | (texId << 6) | (uv << 4) | lighting;
			gDataBuffer.add(packedBlockData);
		}
	}
}

Chunk.SIZE = 32;
