import { vec3 } from 'akila/math';
import { Time } from 'akila/time'

import { AABB } from './aabb';
import { Keyboard, Mouse } from 'akila/inputs';

export class Player {
	constructor() {
		this.position = vec3.create();
		this.setPosition([0, 0, 0]);

		this.vel = vec3.create();

		this.acceleration = 1;
		this.run = false;
		this.isGrounded = true;

		this.aabb = new AABB();

		this.aabb.minX = -0.25;
		this.aabb.maxX = 0.25;

		//this.aabb.minY = -0.05;
		//this.aabb.maxY = 1.7;
		this.aabb.minY = -0.25;
		this.aabb.maxY = 0.25;


		this.aabb.minZ = -0.25;
		this.aabb.maxZ = 0.25;

		this.mouse = new Mouse();
		this.keyboard = new Keyboard();
	}

	handlInputs() {
		if(this.keyboard.isPressed(Keyboard.KEY_Z)) {
			this.vel[0] += this.acceleration * Time.delta;
		}

		if(this.keyboard.isPressed(Keyboard.KEY_S)) {
			this.vel[0] -= this.acceleration * Time.delta;
		}

		if(this.keyboard.isPressed(Keyboard.KEY_Q)) {
			this.vel[2] -= this.acceleration * Time.delta;
		}

		if(this.keyboard.isPressed(Keyboard.KEY_D)) {
			this.vel[2] += this.acceleration * Time.delta;
		}

		if(this.isGrounded && this.keyboard.isPressed(Keyboard.SPACE)) {
			this.vel[1] += 1.4;
		}

		this.run = this.keyboard.isPressed(Keyboard.SHIFT);
	}

	update() {
		this.handlInputs();

		const l = vec3.length(this.vel);
		if(l > 6) {
			vec3.scale(this.vel, this.vel, 6 / l);
		}

		const v = vec3.create();
		vec3.scale(v, this.vel, Time.delta);

		vec3.add(this.position, this.position, v);


		vec3.multiply(this.vec, this.vel, [0.1 * Time.delta, 1, 0.1 * Time.delta]);
		this.vel[1] -= 9.8 * Time.delta;
	}

	setPosition(pos) {
		this.position[0] = pos[0];
		this.position[1] = pos[1];
		this.position[2] = pos[2];
	}
}