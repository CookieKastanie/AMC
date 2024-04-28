import { mat3, quat, vec2, vec3 } from 'akila/math';
import { Time } from 'akila/time'

import { AABB } from './aabb';
import { Keyboard, Mouse } from 'akila/inputs';
import { Display } from 'akila/webgl';

const clamp = (x, a, b) => {
	return Math.min(b, Math.max(x, a));
}

export class Player {
	constructor() {
		this.position = vec3.create();
		this.setPosition([0, 0, 0]);

		this.localVel = vec3.create();
		this.vel = vec3.create();
		this.forward = vec3.create();
		this.forward[0] = 0;
		this.forward[1] = 0;
		this.forward[2] = -1;

		this.azimuth = 0;
		this.elevation = 0;

		this.acceleration = 1;
		//this.run = false;
		this.isGrounded = false;

		this.aabb = new AABB();

		this.aabb.originMinX = -0.25;
		this.aabb.originMaxX = 0.25;

		this.aabb.originMinY = -0.25;
		this.aabb.originMaxY = 1.5;
		//this.aabb.originMinY = -0.25;
		//this.aabb.originMaxY = 0.25;

		this.aabb.originMinZ = -0.25;
		this.aabb.originMaxZ = 0.25;

		this.aabb.setPosition([0, 0, 0]);

		this.mouse = new Mouse();
		this.keyboard = new Keyboard();

		const canvas = Display.ctx.canvas;
        canvas.addEventListener('click', () => {
            if(!document.pointerLockElement) canvas.requestPointerLock();
        });
	}

	handlInputs() {
		if (!!document.pointerLockElement) {
			this.azimuth -= this.mouse.velX() * 0.25;
			this.elevation -= this.mouse.velY() * 0.25;
		}

		this.elevation = clamp(this.elevation, -89.5, 89.5);

		

		if(this.keyboard.isPressed(Keyboard.KEY_Z)) {
			this.localVel[0] += this.acceleration * Time.limitedDelta;
		}

		if(this.keyboard.isPressed(Keyboard.KEY_S)) {
			this.localVel[0] -= this.acceleration * Time.limitedDelta;
		}

		if(this.keyboard.isPressed(Keyboard.KEY_Q)) {
			this.localVel[2] -= this.acceleration * Time.limitedDelta;
		}

		if(this.keyboard.isPressed(Keyboard.KEY_D)) {
			this.localVel[2] += this.acceleration * Time.limitedDelta;
		}

		if(this.isGrounded && this.keyboard.isPressed(Keyboard.SPACE)) {
			this.localVel[1] = 11 * Time.limitedDelta;
		}

		//this.run = this.keyboard.isPressed(Keyboard.SHIFT);

		this.maxSpeed = 7;
		if(this.keyboard.isPressed(Keyboard.SHIFT)) {
			this.maxSpeed = 10;
		}

		if(this.keyboard.isPressed(Keyboard.CTRL)) {
			this.maxSpeed = 3;
		}
	}

	update() {
		this.handlInputs();
		this.isGrounded = false;

		const l = vec2.length([this.localVel[0], this.localVel[2]]);
		vec3.multiply(this.localVel, this.localVel, [0.9, 1, 0.9]);

		const vMax = this.maxSpeed * Time.limitedDelta;
		if(l > vMax) {
			const q = vMax / l;
			this.localVel[0] *= q;
			this.localVel[2] *= q;
		}

		this.localVel[1] -= 0.25 * Time.limitedDelta;
		

		const rot = quat.create();
		const m = mat3.create();

		quat.fromEuler(rot, 0, this.azimuth + 90, 0);

		mat3.fromQuat(m, rot);
		vec3.transformMat3(this.vel, this.localVel, m);


		vec3.add(this.position, this.position, this.vel);

		quat.fromEuler(rot, this.elevation, this.azimuth, 0);
		
		
		mat3.fromQuat(m, rot);

		const v = [0, 0, -1];
		vec3.transformMat3(this.forward, v, m);


		//const l = vec3.length(this.localVel);
		//if(l > 6) {
		//	vec3.scale(this.localVel, this.localVel, 6 / l);
		//}


		//const v = vec3.create();
		//vec3.scale(v, this.localVel, Time.limitedDelta);

		//vec3.add(this.position, this.position, v);





		//vec3.multiply(this.localVel, this.localVel, [0.1 * Time.limitedDelta, 0.1 * Time.limitedDelta, 0.1 * Time.limitedDelta]);
		//this.localVel[1] -= 9.8 * Time.limitedDelta;
	}

	setPosition(pos) {
		this.position[0] = pos[0];
		this.position[1] = pos[1];
		this.position[2] = pos[2];
	}
}