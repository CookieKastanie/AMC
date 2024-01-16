import { vec3 } from 'akila/math'
import { gridRaycast3d } from './grid_raycast3d'

export class Action {
	static placeBlockFromCameraRay(world, newBlock, camera, raylength = 6) {
		let start = camera.getPosition();
		let end = vec3.create();

		vec3.multiply(end, camera.getForward(), [raylength, raylength, raylength]);
		vec3.add(end, start, end);

		///

		let prev = null;
		for(let pos of gridRaycast3d(...start, ...end)) {
			const block = world.getBlock(...pos);

			if(prev !== null && prev.isAir && block.isAir == false) {
				prev.isAir = newBlock.isAir;
				prev.id = newBlock.id;
				prev.isTransparent = newBlock.isTransparent;

				const chunks = world.getChunksThatTouchBlockPosition(...pos);
				for(const chunk of chunks) {
					chunk.build(world);
				}

				break;
			}

			prev = block;
		}
	}

	static destroyBlockFromCameraRay(world, camera, raylength = 6) {
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