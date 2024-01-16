import { vec3 } from "akila/math";
import { AABB } from "./aabb";
import { LRD } from "./line_debugger_renderer";

const frac = x => x - Math.floor(x);

export class CollisionTester {
	//static isRangesOverlaps(aMin, aMax, bmin, bMax) { // expect well formed parameters
	//	return aMin <= bMax && aMax >= bmin
	//}






	static AABBToAABBTest(a, b) {
		return (
			a.minX < b.maxX &&
			a.maxX > b.minX &&
			a.minY < b.maxY &&
			a.maxY > b.minY &&
			a.minZ < b.maxZ &&
			a.maxZ > b.minZ
		);
	}

	static AABBToBlockTest(a, position, blockPosition) {
		return (
			(a.minX + position[0]) < (blockPosition[0] + 1) &&
			(a.maxX + position[0]) > (blockPosition[0] + 0) &&
			(a.minY + position[1]) < (blockPosition[1] + 1) &&
			(a.maxY + position[1]) > (blockPosition[1] + 0) &&
			(a.minZ + position[2]) < (blockPosition[2] + 1) &&
			(a.maxZ + position[2]) > (blockPosition[2] + 0)
		);
	}

	static AABBToBlockDistance(a, position, blockPosition) {
		/*
		const v = vec3.create();

		v[0] = Math.max(Math.min(a.minX + frac(position[0]) - 1, a.minX + frac(position[0])), Math.min(a.maxX + frac(position[0]) - 1, a.maxX + frac(position[0])));
		v[1] = Math.max(Math.min(a.minY + frac(position[1]) - 1, a.minY + frac(position[1])), Math.min(a.maxY + frac(position[1]) - 1, a.maxY + frac(position[1])));
		v[2] = Math.max(Math.min(a.minZ + frac(position[2]) - 1, a.minZ + frac(position[2])), Math.min(a.maxZ + frac(position[2]) - 1, a.maxZ + frac(position[2])));


		const min = Math.min(Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2]));
		if(min == Math.abs(v[0])) {
			v[1] = 0;
			v[2] = 0;
		} else if(min == Math.abs(v[1])) {
			v[0] = 0;
			v[2] = 0;
		} else if(min == Math.abs(v[2])) {
			v[0] = 0;
			v[1] = 0;
		}

		return v;*/

		const blockAABB = new AABB();
		//*/
		blockAABB.minX = 0;
		blockAABB.maxX = 1;

		blockAABB.minY = 0;
		blockAABB.maxY = 1;

		blockAABB.minZ = 0;
		blockAABB.maxZ = 1;
		//*/

		/*/
		blockAABB.minX = -0.5;
		blockAABB.maxX =  0.5;

		blockAABB.minY = -0.5;
		blockAABB.maxY =  0.5;

		blockAABB.minZ = -0.5;
		blockAABB.maxZ =  0.5;
		//*/

		//return CollisionTester.AABBToAABBDistance(a, position, blockAABB, [Math.floor(position[0]), Math.floor(position[1]), Math.floor(position[2])]);
		return CollisionTester.AABBToAABBDistance(a, position, blockAABB, blockPosition);
	}

	static AABBToAABBDistance(a, pa, b, pb) {
		const dxg = (a.maxX + pa[0]) - (b.minX + pb[0]);
		const dxd = (b.maxX + pb[0]) - (a.minX + pa[0]);

		const dyg = (a.maxY + pa[1]) - (b.minY + pb[1]);
		const dyd = (b.maxY + pb[1]) - (a.minY + pa[1]);

		const dzg = (a.maxZ + pa[2]) - (b.minZ + pb[2]);
		const dzd = (b.maxZ + pb[2]) - (a.minZ + pa[2]);

		const minx = Math.min(Math.abs(dxg), Math.abs(dxd));
		const miny = Math.min(Math.abs(dyg), Math.abs(dyd));
		const minz = Math.min(Math.abs(dzg), Math.abs(dzd));

		console.log(minx, miny, minz)

		const move = vec3.create();
		move[0] = 0;
		move[1] = 0;
		move[2] = 0;

		const globalMin = Math.min(minx, miny, minz);
		if(globalMin == minx) {
			if(minx == Math.abs(dxg)) move[0] = dxg;
			else if(minx == Math.abs(dxd)) move[0] = dxd;
		} else if(globalMin == miny) {
			if(miny == Math.abs(dyg)) move[1] = dyg;
			else if(miny == Math.abs(dyd)) move[1] = dyd;
		} else if(globalMin == minz) {
			if(minz == Math.abs(dzg)) move[2] = dzg;
			else if(minz == Math.abs(dzd)) move[2] = dzd;
		}

		return move;
	}

	static AABBToWorld(aabb, position, world) {
		position = vec3.clone(position);

		const currentBlockPosition = vec3.create();
		vec3.floor(currentBlockPosition, position);

		const swaps = [
			[0, -1, 0],

			[0, 0, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[0, 0, -1],
			[0, 0, 1],

			[0, 1, 0],
			[-1, 1, 0],
			[1, 1, 0],
			[0, 1, -1],
			[0, 1, 1],

			[0, 2, 0]
		];

		const blockAABB = new AABB();
		//*/
		blockAABB.minX = 0;
		blockAABB.maxX = 1;

		blockAABB.minY = 0;
		blockAABB.maxY = 1;

		blockAABB.minZ = 0;
		blockAABB.maxZ = 1;


/*
		const move = vec3.create();
		move[0] = 0;
		move[1] = 0;
		move[2] = 0;
*/
		//let blocks = [];
		for(let i = 0; i < swaps.length; ++i) {
			const block = world.getBlock(currentBlockPosition[0] + swaps[i][0], currentBlockPosition[1] + swaps[i][1], currentBlockPosition[2] + swaps[i][2]);

			let color = (swaps[i][0] != 0 || swaps[i][2] != 0 ) ? LRD.GREEN : LRD.RED;
			LRD.addAABB(blockAABB, [currentBlockPosition[0] + swaps[i][0], currentBlockPosition[1] + swaps[i][1], currentBlockPosition[2] + swaps[i][2]], color);

			if(block.isAir == false) {
				//blocks.add(block);
				if(CollisionTester.AABBToBlockTest(aabb, position, currentBlockPosition)) {
					console.log('collide');

					
					const m = CollisionTester.AABBToBlockDistance(aabb, position, currentBlockPosition);
					vec3.add(position, position, m);
				}
			}
		}

		return position;
		/*
		for(const block of blocks) {
			if(CollisionTester.AABBToBlockTest(aabb)) {
				console.log('collide');
			}
		}
		*/
	}







	static isRangesOverlaps(aMin, aMax, bmin, bMax) {
		return (aMin <= bMax && aMax >= bmin) || (aMax <= bMax && aMin >= bmin)
	}

	static isChunkInViewport(chunkAABB, camera) {
		//const pv = camera.getVPMatrix();
		const pv = camera.camera;

		const minX = pv[0] * chunkAABB.minX + pv[12];
		const maxX = pv[0] * chunkAABB.maxX + pv[12];

		const minY = pv[5] * chunkAABB.minY + pv[13];
		const maxY = pv[5] * chunkAABB.maxY + pv[13];

		const minZ = pv[10] * chunkAABB.minZ + pv[14];
		const maxZ = pv[10] * chunkAABB.maxZ + pv[14];

		const view = 1;
		return (
			CollisionTester.isRangesOverlaps(minX, maxX, -view, view) &&
			CollisionTester.isRangesOverlaps(minY, maxY, -view, view) &&
			CollisionTester.isRangesOverlaps(minZ, maxZ, -view, 0)
		);
	}
}
