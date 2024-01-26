import { AVBO, VAO } from "akila/webgl";

export class DynamicGBuffer {
	constructor(initialSize, ArrayType = Int32Array) {
		this.ArrayType = ArrayType;

		this.buffer = new this.ArrayType(initialSize);
		this.count = 0;
		this.needRecreateVAO = false;
		this.initVAO();
	}

	initVAO() {
		this.vbo = new AVBO(null, AVBO.DYNAMIC_DRAW);
		this.vbo.addVertexAttribute(1, 0, 0, 0, AVBO.UNSIGNED_INT);
		this.vao = new VAO().addVBO(this.vbo);
	}

	synchronize() {
		if(this.needRecreateVAO) {
			this.vao.delete();
			this.initVAO();
		}

		this.vbo.setData(this.buffer);
	}

	// set count to 0
	begin() {
		this.count = 0;
	}

	add(value) {
		if(this.buffer.length <= this.count) { // grow buffer
			const old = this.buffer;
			this.buffer = new this.ArrayType(this.count * 2);
			this.buffer.set(old);

			this.needRecreateVAO = true;
		}

		this.buffer[this.count++] = value;
	}

	end() {
		if(this.buffer.length > (this.count * 2)) { // slice buffer if too big
			this.buffer = this.buffer.slice(0, this.buffer.length / 2);
			this.needRecreateVAO = true;
		}

		this.synchronize();
	}

	getCount() {
		return this.count;
	}

	draw() {
		this.vao.draw(this.count);
	}
}
