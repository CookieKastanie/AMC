import { createNoise2D, createNoise3D } from 'simplex-noise'

const dot = (a, b) => {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

const stamp = [
	[1, 1, 1, 0, 1, 0, 0, 1],
	[1, 0, 0, 0, 1, 0, 1, 0],
	[1, 0, 0, 0, 1, 0, 1, 0],
	[1, 0, 0, 0, 1, 1, 0, 0],
	[1, 0, 0, 0, 1, 0, 1, 0],
	[1, 1, 1, 0, 1, 0, 0, 1]
];

export class SDF {
	static capsule(p, a, b, r) {
		const pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
		const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];;
		const h = Math.min(Math.max(dot(pa, ba) / dot(ba, ba), 0.0), 1.0);
		return Math.hypot(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - r;
	}

	static fillWorld(world) {
		const noise2D = createNoise2D();
		const noise3D = createNoise3D();

		for(let z = 0; z < world.getZSizeBlockCount(); ++z)
		//for(let y = 0; y < world.getYSizeBlockCount(); ++y)
		for(let y = world.getYSizeBlockCount() - 1; y >= 0; --y)
		for(let x = 0; x < world.getXSizeBlockCount(); ++x) {
			const surface = (noise2D(x * 0.015, z * 0.015) * .5 + .5) * 23 + 15;
			const cave = noise3D(x * 0.05, y * 0.05, z * 0.05) * .5 + .5;
	
			if(y == 56 && (x < stamp.length) && (z < stamp[0].length)) {

				if(stamp[x][z] !== 0) {
					world.setBlock(x + 55, 60, z + 58, 27);
				}
			}
	
			if(Math.hypot(x - 57, y - 35, z - 62) < 25) {
				world.setBlock(x, y, z, 4);
				continue;
			}

			if(Math.hypot(x - 128, y - 35, z - 128) < 15) {
				world.setBlock(x, y, z, 5);
				continue;
			}
	
			if(SDF.capsule([x, y, z], [22, 56, 24], [38, 40, 110], 5) < 0) {
				world.setBlock(x, y, z, Math.floor(Math.random() * 16 + 29));
				continue;
			}
	
			if(SDF.capsule([x, y, z], [38, 40, 110], [112, 30, 48], 5) < 0) {
				world.setBlock(x, y, z, Math.floor(Math.random() * 16 + 29));
				continue;
			}
	
			if(SDF.capsule([x, y, z], [22, 56, 24], [112, 30, 48], 5) < 0) {
				world.setBlock(x, y, z, Math.floor(Math.random() * 16 + 29));
				continue;
			}
	
			// terrain
			if(y == 0) { // bedrock
				world.setBlock(x, y, z, 6);
				continue;
			}
	
			if(y < surface) { // surface
				if(cave < 0.3) { // rayon des caves
					continue;
				}
				
				if(y < 15) { // pierre
					world.setBlock(x, y, z, 2);
				} else if(y < 20) { // sable
					world.setBlock(x, y, z, 7);
				} else { // terre
					if(world.getBlock(x, y + 1, z) === 0) {
						world.setBlock(x, y, z, 1);
					} else {
						world.setBlock(x, y, z, 3);
					}
				}
			}
		}
	}
}