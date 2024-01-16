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
		for(let y = 0; y < world.getYSizeBlockCount(); ++y)
		for(let x = 0; x < world.getXSizeBlockCount(); ++x) {
			const surface = (noise2D(x * 0.015, z * 0.015) * .5 + .5) * 23 + 15;
			const cave = noise3D(x * 0.05, y * 0.05, z * 0.05) * .5 + .5;
	
			if(y == 56 && (x < stamp.length) && (z < stamp[0].length)) {
				const b = world.getBlock(x + 55, 60, z + 58);
				b.isAir = stamp[x][z] == 0;
				b.id = 16*3;
			}
	
			if(Math.hypot(x - 57, y - 35, z - 62) < 25) {
				const b = world.getBlock(x, y, z);
				b.isAir = false;
				b.id = 4;
				continue;
			}
	
			if(SDF.capsule([x, y, z], [22, 56, 24], [38, 40, 110], 5) < 0) {
				const b = world.getBlock(x, y, z);
				b.isAir = false;
				b.id = Math.floor(Math.random() * 16 + 16*4);
				continue;
			}
	
			if(SDF.capsule([x, y, z], [38, 40, 110], [112, 30, 48], 5) < 0) {
				const b = world.getBlock(x, y, z);
				b.isAir = false;
				b.id = Math.floor(Math.random() * 16 + 16*4);
				continue;
			}
	
			if(SDF.capsule([x, y, z], [22, 56, 24], [112, 30, 48], 5) < 0) {
				const b = world.getBlock(x, y, z);
				b.isAir = false;
				b.id = Math.floor(Math.random() * 16 + 16*4);
				continue;
			}
	
			// terrain
			if(y == 0) { // bedrock
				const b = world.getBlock(x, y, z);
				b.isAir = false;
				b.id = 17;
				continue;
			}
	
			if(y < surface) { // surface
				if(cave < 0.3) { // rayon des caves
					continue;
				}
	
				const b = world.getBlock(x, y, z);
				b.isAir = false;
				
				if(y < 15) { // pierre
					b.id = 1;
				} else if(y < 20) { // dable
					b.id = 18;
				} else { // terre
					b.id = 2;
				}
			}
		}
	}
}