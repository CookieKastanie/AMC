import { Shader } from 'akila/webgl'
import { TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS } from './frags'
import { vec3 } from 'akila/math';
import { CollisionTester } from './collision_tester';

export class TerrainRenderer {
	static init() {
		TerrainRenderer.opaquerShader = new Shader(TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS);
		TerrainRenderer.opaquerShader.use();
		TerrainRenderer.opaquerShader.sendVec3('tint', new Float32Array([1, 1, 1]));
	}

	static drawWorld(display, world, camera) {
		display.clear();

		TerrainRenderer.opaquerShader.use();
		TerrainRenderer.opaquerShader.sendMat4('VP', camera.getVPMatrix());
		TerrainRenderer.opaquerShader.sendVec3('cameraWorldPos', camera.getPosition());
		TerrainRenderer.terrainTexture.use();

		// draw world
		const camPos = camera.getPosition();

		/*/
		if(TerrainRenderer.indexArray == undefined) {
			TerrainRenderer.indexArray = new Array(world.sizeX * world.sizeY * world.sizeZ);

			for(let i = 0; i < TerrainRenderer.indexArray.length; ++i) {
				TerrainRenderer.indexArray[i] = i;
			}
		}

		TerrainRenderer.indexArray.sort((ia, ib) => {
			const a = world.chunks[ia];
			const b = world.chunks[ib];

			const distA = vec3.distance(a.aabb.center, camPos);
			const distB = vec3.distance(b.aabb.center, camPos);

			return distA < distB ? -1 : 1;
		});
		//*/


		for(let i = 0; i < (world.sizeX * world.sizeY * world.sizeZ); ++i) {
			const chunk = world.chunks[i];
			//const chunk = world.chunks[TerrainRenderer.indexArray[i]];

			if(vec3.distance(chunk.aabb.center, camPos) > (16 * 10)) {
				continue;
			}

			if(CollisionTester.isChunkInViewport(chunk.aabb, camera) == false) {
				continue;
			}

			// draw chunk
			if(chunk.gDataBuffer.getCount() <= 0) {
				continue;
			}
	
			TerrainRenderer.opaquerShader.sendVec3('chunkPos', chunk.worldPosition);
			chunk.gDataBuffer.draw();
		}
	}
}

TerrainRenderer.terrainTexture = null;
