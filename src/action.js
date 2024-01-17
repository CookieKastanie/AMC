import { vec3 } from 'akila/math'
import { gridRaycast3d } from './grid_raycast3d'

export class Action {
	static traceBlockFromCameraRay(world, block, camera, raylength = 64) {
		let start = vec3.clone(camera.getPosition());
		let end = vec3.create();

		vec3.multiply(end, camera.getForward(), [raylength, raylength, raylength]);
		vec3.add(end, start, end);

		vec3.multiply(start, camera.getForward(), [2, 2, 2]);
		vec3.add(start, start, camera.getPosition());

		///

		const chunkSet = new Set();
		for(let pos of gridRaycast3d(...start, ...end)) {
			const b = world.getBlock(...pos);
			b.isAir = block.isAir;
			b.id = block.id;
			b.isTransparent = block.isTransparent;

			const chunks = world.getChunksThatTouchBlockPosition(...pos);
			for(const chunk of chunks) {
				chunkSet.add(chunk);
			}
		}

		for(const chunk of chunkSet) {
			chunk.build(world);
		}
	}

	static placeBlockFromCameraRay(world, newBlock, camera, raylength = 7) {
		let start = vec3.clone(camera.getPosition());
		let end = vec3.create();

		vec3.multiply(end, camera.getForward(), [raylength, raylength, raylength]);
		vec3.add(end, start, end);

		///

		let prev = null;
		let prevPos = null;
		for(let pos of gridRaycast3d(...start, ...end)) {
			const block = world.getBlock(...pos);

			if(prev !== null && prev.isAir && block.isAir == false) {
				vec3.floor(start, start);
				if(vec3.equals(prevPos, start)) { // todo replace by player aabb
					break;
				}

				prev.isAir = newBlock.isAir;
				prev.id = newBlock.id;
				prev.isTransparent = newBlock.isTransparent;

				const chunks = world.getChunksThatTouchBlockPosition(...prevPos);
				for(const chunk of chunks) {
					chunk.build(world);
				}

				break;
			}

			prev = block;
			prevPos = pos;
		}
	}

	static destroyBlockFromCameraRay(world, camera, raylength = 7) {
		let start = camera.getPosition();
		let end = vec3.create();

		vec3.multiply(end, camera.getForward(), [raylength, raylength, raylength]);
		vec3.add(end, start, end);

		///

		for(let pos of gridRaycast3d(...start, ...end)) {
			const block = world.getBlock(...pos);
			if(block.isAir == false) {
				block.isAir = true;
				
				const chunks = world.getChunksThatTouchBlockPosition(...pos);
				for(const chunk of chunks) {
					chunk.build(world);
				}

				break;
			}
		}
	}
}