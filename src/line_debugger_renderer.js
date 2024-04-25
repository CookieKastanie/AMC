import { Shader, VAO, VBO } from 'akila/webgl';
import { LINE_VS, LINE_FS } from './frags'
import { mat4, vec4 } from 'akila/math';

const dividBySelfW = (v) => {
	v[0] = v[0] / v[3];
	v[1] = v[1] / v[3];
	v[2] = v[2] / v[3];
	v[3] = 1;
	return v;
}

export class LRD {
	static init() {
		//LRD.maxLine = 512;
		LRD.maxLine = 10000;
		LRD.position = new Float32Array(LRD.maxLine * 3 * 2);
		LRD.color = new Float32Array(LRD.maxLine * 3 * 2);

		LRD.vao = new VAO(VAO.LINES);
		LRD.positionVBO = new VBO(LRD.position, 3, 0, VBO.DYNAMIC_DRAW);
		LRD.colorVBO = new VBO(LRD.color, 3, 1, VBO.DYNAMIC_DRAW);
		LRD.vao.addVBO(LRD.positionVBO).addVBO(LRD.colorVBO);

		LRD.lineShader = new Shader(LINE_VS, LINE_FS);

		window.DRAW_DEBUG = true;
	}

	static start() {
		if(!LRD.vao) {
			LRD.init();
		}

		LRD.lineCount = 0;
		LRD.index = 0;
		LRD.alertMaxLineCountFired = false;
	}

	static draw(camera) {
		if(window.DRAW_DEBUG !== true) {
			return;
		}

		LRD.lineShader.use();
		LRD.lineShader.sendMat4('VP', camera.getVPMatrix());

		LRD.positionVBO.setData(LRD.position);
		LRD.colorVBO.setData(LRD.color);
		
		LRD.vao.draw(LRD.lineCount * 2);
	}

	static addLine(from, to, color = LRD.WHITE) {
		if(LRD.lineCount >= LRD.maxLine) {
			// Limit 1 console.error per frame
			if(LRD.alertMaxLineCountFired === false) {
				LRD.alertMaxLineCountFired = true;
				console.error('Too many lines !');
			}

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

	static addCameraView(camera) {
		const pv = camera.getVPMatrix();
		const ipv = mat4.create();
		mat4.invert(ipv, pv);

		const nlb = dividBySelfW(vec4.transformMat4(vec4.create(), [-1, -1, 1, 1], ipv));
		const nrb = dividBySelfW(vec4.transformMat4(vec4.create(), [ 1, -1, 1, 1], ipv));
		const nrt = dividBySelfW(vec4.transformMat4(vec4.create(), [ 1,  1, 1, 1], ipv));
		const nlt = dividBySelfW(vec4.transformMat4(vec4.create(), [-1,  1, 1, 1], ipv));

		const flb = dividBySelfW(vec4.transformMat4(vec4.create(), [-1, -1, -1, 1], ipv));
		const frb = dividBySelfW(vec4.transformMat4(vec4.create(), [ 1, -1, -1, 1], ipv));
		const frt = dividBySelfW(vec4.transformMat4(vec4.create(), [ 1,  1, -1, 1], ipv));
		const flt = dividBySelfW(vec4.transformMat4(vec4.create(), [-1,  1, -1, 1], ipv));

		LRD.addLine(nlb, nrb, LRD.RED);
		LRD.addLine(nrb, nrt, LRD.RED);
		LRD.addLine(nrt, nlt, LRD.RED);
		LRD.addLine(nlt, nlb, LRD.RED);

		LRD.addLine(flb, frb, LRD.GREEN);
		LRD.addLine(frb, frt, LRD.GREEN);
		LRD.addLine(frt, flt, LRD.GREEN);
		LRD.addLine(flt, flb, LRD.GREEN);

		LRD.addLine(nlb, flb, LRD.WHITE);
		LRD.addLine(nrb, frb, LRD.WHITE);
		LRD.addLine(nrt, frt, LRD.WHITE);
		LRD.addLine(nlt, flt, LRD.WHITE);
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

LRD.YELLOW = [1, 1, 0];
