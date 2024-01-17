import { Shader, VAO, VBO } from "akila/webgl";

import { LINE_VS, LINE_FS } from './frags'

export class LRD {
	static init() {
		LRD.maxLine = 512;
		LRD.position = new Float32Array(LRD.maxLine * 3 * 2);
		LRD.color = new Float32Array(LRD.maxLine * 3 * 2);

		LRD.vao = new VAO(VAO.LINES);
		LRD.positionVBO = new VBO(LRD.position, 3, 0, VBO.DYNAMIC_DRAW);
		LRD.colorVBO = new VBO(LRD.color, 3, 1, VBO.DYNAMIC_DRAW);
		LRD.vao.addVBO(LRD.positionVBO).addVBO(LRD.colorVBO);

		LRD.lineShader = new Shader(LINE_VS, LINE_FS);
	}

	static start() {
		if(!LRD.vao) {
			LRD.init();
		}

		LRD.lineCount = 0;
		LRD.index = 0;
	}

	static draw(camera) {
		LRD.lineShader.use();
		LRD.lineShader.sendMat4('VP', camera.getVPMatrix());

		LRD.positionVBO.setData(LRD.position);
		LRD.colorVBO.setData(LRD.color);
		
		LRD.vao.draw(LRD.lineCount * 3);
	}

	static addLine(from, to, color = LRD.WHITE) {
		if(LRD.lineCount >= LRD.maxLine) {
			console.error('Too many lines !');
			return;
		}

		const indexStart = LRD.index;
		
		LRD.position[LRD.index++] = from[0];
		LRD.position[LRD.index++] = from[1];
		LRD.position[LRD.index++] = from[2];

		LRD.position[LRD.index++] = to[0];
		LRD.position[LRD.index++] = to[1];
		LRD.position[LRD.index++] = to[2];

		for(let i = 0; i < 6; i += 3) {
			LRD.color[indexStart + i + 0] = color[0];
			LRD.color[indexStart + i + 1] = color[1];
			LRD.color[indexStart + i + 2] = color[2];
		}

		++LRD.lineCount;
	}

	static addAABB(aabb, color = LRD.WHITE) {
		LRD.addLine([
			aabb.minX,
			aabb.minY,
			aabb.minZ
		], [
			aabb.maxX,
			aabb.minY,
			aabb.minZ
		], color);

		LRD.addLine([
			aabb.minX,
			aabb.maxY,
			aabb.minZ,
		], [
			aabb.maxX,
			aabb.maxY,
			aabb.minZ,
		], color);

		LRD.addLine([
			aabb.minX,
			aabb.minY,
			aabb.maxZ
		], [
			aabb.maxX,
			aabb.minY,
			aabb.maxZ
		], color);

		LRD.addLine([
			aabb.minX,
			aabb.maxY,
			aabb.maxZ
		], [
			aabb.maxX,
			aabb.maxY,
			aabb.maxZ
		], color);

		////

		LRD.addLine([
			aabb.minX,
			aabb.minY,
			aabb.minZ
		], [
			aabb.minX,
			aabb.maxY,
			aabb.minZ
		], color);

		LRD.addLine([
			aabb.maxX,
			aabb.minY,
			aabb.minZ
		], [
			aabb.maxX,
			aabb.maxY,
			aabb.minZ
		], color);

		LRD.addLine([
			aabb.minX,
			aabb.minY,
			aabb.maxZ
		], [
			aabb.minX,
			aabb.maxY,
			aabb.maxZ
		], color);

		LRD.addLine([
			aabb.maxX,
			aabb.minY,
			aabb.maxZ
		], [
			aabb.maxX,
			aabb.maxY,
			aabb.maxZ
		], color);

		////

		LRD.addLine([
			aabb.minX,
			aabb.minY,
			aabb.minZ
		], [
			aabb.minX,
			aabb.minY,
			aabb.maxZ
		], color);

		LRD.addLine([
			aabb.maxX,
			aabb.minY,
			aabb.minZ
		], [
			aabb.maxX,
			aabb.minY,
			aabb.maxZ
		], color);

		LRD.addLine([
			aabb.minX,
			aabb.maxY,
			aabb.minZ
		], [
			aabb.minX,
			aabb.maxY,
			aabb.maxZ
		], color);

		LRD.addLine([
			aabb.maxX,
			aabb.maxY,
			aabb.minZ
		], [
			aabb.maxX,
			aabb.maxY,
			aabb.maxZ
		], color);
	}
}

LRD.RED = [1, 0, 0];
LRD.GREEN = [0, 1, 0];
LRD.BLUE = [0, 0, 1];
LRD.WHITE = [1, 1, 1];
