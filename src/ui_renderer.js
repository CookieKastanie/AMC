import { Display, Shader, VAO, VBO } from 'akila/webgl';
import { CROSS_VS, CROSS_FS, BLOCK_SELECT_VS, BLOCK_SELECT_FS } from './frags'

export class UIRenderer {
	static init() {
		UIRenderer.crossShader = new Shader(CROSS_VS, CROSS_FS);
		UIRenderer.blockSelectShader = new Shader(BLOCK_SELECT_VS, BLOCK_SELECT_FS);

		UIRenderer.quadVAO = new VAO(VAO.TRIANGLE_FAN);
		UIRenderer.quadVAO.addVBO(new VBO([-1, -1, 1, -1, 1, 1, -1, 1], 2, 0));
	}

	static draw(display, currentBlockId) {
		display.disable(Display.DEPTH_TEST);

		UIRenderer.sceenSizeBuffer[0] = display.getWidth();
		UIRenderer.sceenSizeBuffer[1] = display.getHeight();
	
		UIRenderer.blockSelectShader.use();
		UIRenderer.blockSelectShader.sendVec2('screenSize', UIRenderer.sceenSizeBuffer);
		UIRenderer.blockSelectShader.sendFloat('texId', currentBlockId);
		UIRenderer.terrainTexture.use();
		UIRenderer.quadVAO.draw();

		display.blendFunc(Display.ONE_MINUS_DST_COLOR, Display.ONE_MINUS_SRC_ALPHA);
		UIRenderer.crossShader.use();
		UIRenderer.crossShader.sendVec2('screenSize', UIRenderer.sceenSizeBuffer);
		UIRenderer.crossTexture.use();
		UIRenderer.quadVAO.draw();
		display.defaultBlendFunc();

		display.enable(Display.DEPTH_TEST);
	}
}

UIRenderer.sceenSizeBuffer = new Float32Array(2);
UIRenderer.terrainTexture = null;
UIRenderer.crossShader = null;
