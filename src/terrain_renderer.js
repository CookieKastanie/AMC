import { Display, Shader } from 'akila/webgl'
import { TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS, TERRAIN_ALPHA_MASK_VS, TERRAIN_ALPHA_MASK_FS } from './frags'
import { vec3 } from 'akila/math';
import { CollisionTester } from './collision_tester';
import { LRD } from './line_debugger_renderer';

export class TerrainRenderer {
	static init() {
		TerrainRenderer.opaqueShader = new Shader(TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS);
		TerrainRenderer.opaqueShader.use();

		TerrainRenderer.alphaMaskShader = new Shader(TERRAIN_ALPHA_MASK_VS, TERRAIN_ALPHA_MASK_FS);
		TerrainRenderer.alphaMaskShader.use();
	}

	static drawWorld(display, world, camera) {
		
		// Visibility test
		TerrainRenderer.chuckToRenderCount = 0;
		for(let i = 0; i < (world.sizeX * world.sizeY * world.sizeZ) || TerrainRenderer.chuckToRenderCount >= TerrainRenderer.maxChunkRenderCount; ++i) {
			const chunk = world.chunks[i];
			if(CollisionTester.isChunkInViewport(chunk.aabb, camera) == false) {
				continue;
			}
	
			TerrainRenderer.chuckToRender[TerrainRenderer.chuckToRenderCount++] = i;
		}


		display.clear();

		// Opaque goometry
		display.disable(Display.BLEND);
		TerrainRenderer.opaqueShader.use();
		TerrainRenderer.opaqueShader.sendMat4('VP', camera.getVPMatrix());
		TerrainRenderer.opaqueShader.sendVec3('cameraWorldPos', camera.getPosition());
		TerrainRenderer.terrainTexture.use();

		for(let i = 0; i < TerrainRenderer.chuckToRenderCount; ++i) {
			const chunk = world.chunks[TerrainRenderer.chuckToRender[i]];

			if(chunk.gOpaqueDataBuffer.getCount() <= 0) {
				continue;
			}

			TerrainRenderer.opaqueShader.sendVec3('chunkPos', chunk.worldPosition);
			chunk.gOpaqueDataBuffer.draw();
		}

		// Alpha masked geometry
		TerrainRenderer.alphaMaskShader.use();
		TerrainRenderer.alphaMaskShader.sendMat4('VP', camera.getVPMatrix());
		TerrainRenderer.alphaMaskShader.sendVec3('cameraWorldPos', camera.getPosition());
		TerrainRenderer.terrainTexture.use();

		for(let i = 0; i < TerrainRenderer.chuckToRenderCount; ++i) {
			const chunk = world.chunks[TerrainRenderer.chuckToRender[i]];

			if(chunk.gAlphaMaskDataBuffer.getCount() <= 0) {
				continue;
			}

			TerrainRenderer.alphaMaskShader.sendVec3('chunkPos', chunk.worldPosition);
			chunk.gAlphaMaskDataBuffer.draw();
		}
		display.enable(Display.BLEND);
	}
}

TerrainRenderer.terrainTexture = null;
TerrainRenderer.maxChunkRenderCount = 512;
TerrainRenderer.chuckToRender = new Uint32Array(TerrainRenderer.maxChunkRenderCount);
TerrainRenderer.chuckToRenderCount = 0;
