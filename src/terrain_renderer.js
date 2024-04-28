import { Display, FrameBuffer, Shader, Texture, VAO, VBO } from 'akila/webgl'
import { TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS, TERRAIN_ALPHA_MASK_VS, TERRAIN_ALPHA_MASK_FS, TERRAIN_TRANSLUCENT_VS, TERRAIN_TRANSLUCENT_FS, TERRAIN_COMPOSE_VS, TERRAIN_COMPOSE_FS } from './frags'
import { vec3 } from 'akila/math';
import { CollisionTester } from './collision_tester'
import { LRD } from './line_debugger_renderer'
import { Infos } from 'akila/utils'

import test from '!raw-loader!./shaders/opaque_terrain.vs'

export class TerrainRenderer {
	static init() {
		//TerrainRenderer.opaqueShader = new Shader(TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS);
		TerrainRenderer.opaqueShader = new Shader(test, TERRAIN_OPAQUE_FS);
		TerrainRenderer.alphaMaskShader = new Shader(TERRAIN_ALPHA_MASK_VS, TERRAIN_ALPHA_MASK_FS);
		TerrainRenderer.translucentShader = new Shader(TERRAIN_TRANSLUCENT_VS, TERRAIN_TRANSLUCENT_FS);
		TerrainRenderer.composeShader = new Shader(TERRAIN_COMPOSE_VS, TERRAIN_COMPOSE_FS);
		TerrainRenderer.composeShader.use();
		TerrainRenderer.composeShader.sendInt('accum', 0);
		TerrainRenderer.composeShader.sendInt('reveal', 1);

		const accumTex = new Texture(null);
		accumTex.setTextureData(null, Infos.getFullScreenWidth(), Infos.getFullScreenHeight());
		accumTex.setParameters({minFilter: Texture.NEAREST, magFilter: Texture.NEAREST, wrapS: Texture.CLAMP_TO_EDGE, wrapS: Texture.CLAMP_TO_EDGE});
		accumTex.setUnit(0);

		const revealTex = new Texture(null);
		revealTex.setTextureData(null, Infos.getFullScreenWidth(), Infos.getFullScreenHeight(), Texture.R8, Texture.RED);
		revealTex.setParameters({minFilter: Texture.NEAREST, magFilter: Texture.NEAREST, wrapS: Texture.CLAMP_TO_EDGE, wrapS: Texture.CLAMP_TO_EDGE});
		revealTex.setUnit(1);

		TerrainRenderer.translucentFramebuffer = new FrameBuffer(Infos.getFullScreenWidth(), Infos.getFullScreenHeight(), {texColor: [
			accumTex,
			revealTex
		], depthTest: false});

		TerrainRenderer.fullscreenTriangle = new VAO()
        .addVBO(new VBO([
            3,1,0, -1,1,0, -1,-3,0
        ], 3, 0));
	}

	static drawWorld(display, world, camera) {
		// Visibility test
		TerrainRenderer.chuckToRenderCount = 0;
		for(let i = 0; i < (world.sizeX * world.sizeY * world.sizeZ) || TerrainRenderer.chuckToRenderCount >= TerrainRenderer.maxChunkRenderCount; ++i) {
			const chunk = world.chunks[i];
			if(CollisionTester.isChunkInViewport(chunk.aabb, camera) == false) {
				continue;
			}
			//LRD.addAABB(chunk.aabb)
	
			TerrainRenderer.chuckToRender[TerrainRenderer.chuckToRenderCount++] = i;
		}

		display.setClearColor(0.259, 0.647, 0.961);
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

		if(false)
		{
			// Translucent geometry
			TerrainRenderer.translucentFramebuffer.use();

			//*/
			//Display.ctx.depthMask(Display.ctx.FALSE);
			display.disable(Display.DEPTH_TEST);
			display.blendFuncSeparate(Display.ctx.ONE, Display.ctx.ONE, Display.ctx.ZERO, Display.ctx.ONE_MINUS_SRC_COLOR);
			//Display.ctx.enable(Display.ctx.BLEND);
			//Display.ctx.blendFunc(0, Display.ctx.ONE, Display.ctx.ONE);
			//Display.ctx.blendFunc(1, Display.ctx.ZERO, Display.ctx.ONE_MINUS_SRC_COLOR);
			//Display.ctx.blendEquation(Display.ctx.FUNC_ADD);

			Display.ctx.clearBufferfv(Display.ctx.COLOR, 0, [0, 0, 0, 0]);
			Display.ctx.clearBufferfv(Display.ctx.COLOR, 1, [1, 1, 1, 1]);

			TerrainRenderer.translucentShader.use();
			TerrainRenderer.translucentShader.sendMat4('VP', camera.getVPMatrix());
			TerrainRenderer.translucentShader.sendVec3('cameraWorldPos', camera.getPosition());
			TerrainRenderer.terrainTexture.use();

			for(let i = 0; i < TerrainRenderer.chuckToRenderCount; ++i) {
				const chunk = world.chunks[TerrainRenderer.chuckToRender[i]];

				if(chunk.gTranslucentDataBuffer.getCount() <= 0) {
					continue;
				}

				TerrainRenderer.translucentShader.sendVec3('chunkPos', chunk.worldPosition);
				chunk.gTranslucentDataBuffer.draw();
			}
			//display.useDefaultFrameBuffer();
			//Display.ctx.depthMask(Display.ctx.TRUE);
			//display.enable(Display.DEPTH_TEST);
			//Display.ctx.blendEquation(Display.ctx.FUNC_REVERSE_SUBTRACT);
			
			//Display.ctx.blendEquation(Display.ctx.FUNC_SUBTRACT);
			display.defaultBlendFunc();
			//*/
		}

		display.useDefaultFrameBuffer();

		/*
		TerrainRenderer.composeShader.use();
		TerrainRenderer.translucentFramebuffer.getTexture(0).use();
		TerrainRenderer.translucentFramebuffer.getTexture(1).use();
		TerrainRenderer.fullscreenTriangle.draw();
		*/
		
		display.enable(Display.DEPTH_TEST);
	}
}

TerrainRenderer.terrainTexture = null;
TerrainRenderer.maxChunkRenderCount = 512;
TerrainRenderer.chuckToRender = new Uint32Array(TerrainRenderer.maxChunkRenderCount);
TerrainRenderer.chuckToRenderCount = 0;
