import { Camera } from "akila/utils";
import { LRD } from "./line_debugger_renderer";
import { mat4, vec4 } from "akila/math";

const dividBySelfW = (v) => {
	v[0] = v[0] / v[3];
	v[1] = v[1] / v[3];
	v[2] = v[2] / v[3];
	v[3] = 1;
	return v;
}

export class DebugCamera extends Camera {
	constructor(w, h, options) {
		super(w, h, options);
	}

	drawView() {
		const pv = this.getVPMatrix();
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
}
