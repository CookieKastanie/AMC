import { Shader } from 'akila/webgl'
import { TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS, TERRAIN_ALPHA_MASK_VS, TERRAIN_ALPHA_MASK_FS } from './frags'
import { vec3 } from 'akila/math';
import { CollisionTester } from './collision_tester';

export class TerrainRenderer {
	static init() {
		TerrainRenderer.opaqueShader = new Shader(TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS);
		TerrainRenderer.opaqueShader.use();

		TerrainRenderer.alphaMaskShader = new Shader(TERRAIN_ALPHA_MASK_VS, TERRAIN_ALPHA_MASK_FS);
		TerrainRenderer.alphaMaskShader.use();
	}

	static drawWorld(display, world, camera) {
		display.clear();

		const camPos = camera.getPosition();

		TerrainRenderer.opaqueShader.use();
		TerrainRenderer.opaqueShader.sendMat4('VP', camera.getVPMatrix());
		TerrainRenderer.opaqueShader.sendVec3('cameraWorldPos', camPos);
		TerrainRenderer.terrainTexture.use();


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

		TerrainRenderer.chuckToRenderCount = 0;
		for(let i = 0; i < (world.sizeX * world.sizeY * world.sizeZ) || TerrainRenderer.chuckToRenderCount >= TerrainRenderer.maxChunkRenderCount; ++i) {
			const chunk = world.chunks[i];
			//const chunk = world.chunks[TerrainRenderer.indexArray[i]];

			if(vec3.distance(chunk.aabb.center, camPos) > (16 * 10)) {
				continue;
			}

			if(CollisionTester.isChunkInViewport(chunk.aabb, camera) == false) {
				continue;
			}
	
			TerrainRenderer.chuckToRender[TerrainRenderer.chuckToRenderCount++] = i;
		}

		for(let i = 0; i < TerrainRenderer.chuckToRenderCount; ++i) {
			const chunk = world.chunks[TerrainRenderer.chuckToRender[i]];

			if(chunk.gOpaqueDataBuffer.getCount() <= 0) {
				continue;
			}

			TerrainRenderer.opaqueShader.sendVec3('chunkPos', chunk.worldPosition);
			chunk.gOpaqueDataBuffer.draw();
		}


		TerrainRenderer.alphaMaskShader.use();
		TerrainRenderer.alphaMaskShader.sendMat4('VP', camera.getVPMatrix());
		TerrainRenderer.alphaMaskShader.sendVec3('cameraWorldPos', camPos);
		TerrainRenderer.terrainTexture.use();

		for(let i = 0; i < TerrainRenderer.chuckToRenderCount; ++i) {
			const chunk = world.chunks[TerrainRenderer.chuckToRender[i]];

			if(chunk.gAlphaMaskDataBuffer.getCount() <= 0) {
				continue;
			}

			TerrainRenderer.alphaMaskShader.sendVec3('chunkPos', chunk.worldPosition);
			chunk.gAlphaMaskDataBuffer.draw();
		}
	}
}

TerrainRenderer.terrainTexture = null;
TerrainRenderer.maxChunkRenderCount = 512;
TerrainRenderer.chuckToRender = new Uint32Array(TerrainRenderer.maxChunkRenderCount);
TerrainRenderer.chuckToRenderCount = 0;
