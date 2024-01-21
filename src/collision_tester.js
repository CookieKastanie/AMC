import { vec3, vec4 } from 'akila/math';
import { AABB } from './aabb';
import { LRD } from './line_debugger_renderer';

const frac = x => x - Math.floor(x);
const dividBySelfW = (v) => {
	v[0] = v[0] / v[3];
	v[1] = v[1] / v[3];
	v[2] = v[2] / v[3];
	v[3] = 1;
	return v;
}

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

	static AABBToAABBDistance(a, b) {
		const dxg = a.maxX - b.minX;
		const dxd = b.maxX - a.minX;

		const dyg = a.maxY - b.minY;
		const dyd = b.maxY - a.minY;

		const dzg = a.maxZ - b.minZ;
		const dzd = b.maxZ - a.minZ;

		const minx = Math.min(Math.abs(dxg), Math.abs(dxd));
		const miny = Math.min(Math.abs(dyg), Math.abs(dyd));
		const minz = Math.min(Math.abs(dzg), Math.abs(dzd));

		//console.log(minx, miny, minz)

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

 		const blockPosition = vec3.create();
		for(let i = 0; i < CollisionTester.swaps.length; ++i) {
			vec3.add(blockPosition, currentBlockPosition, CollisionTester.swaps[i]);

			const block = world.getBlock(...blockPosition);

			CollisionTester.blockAABB.setPosition(blockPosition);

			const color = (CollisionTester.swaps[i][0] != 0 || CollisionTester.swaps[i][2] != 0) ? LRD.GREEN : LRD.RED;
			//LRD.addAABB(CollisionTester.blockAABB, color);

			if(block.isAir == false) {
				//*/
				if(CollisionTester.AABBToAABBTest(aabb, CollisionTester.blockAABB)) {
					console.log('collide');
					
					const m = CollisionTester.AABBToAABBDistance(aabb, CollisionTester.blockAABB);
					vec3.add(position, position, m);
				}
				//*/
			}
		}

		return position;
	}



	static isRangesOverlaps(aMin, aMax, bmin, bMax) {
		return (aMin <= bMax && aMax >= bmin) || (aMax <= bMax && aMin >= bmin)
	}

	static isChunkInViewport(chunkAABB, camera) {
		//const pv = camera.getVPMatrix();
		const pv = camera.camera;

		for(let i = 0; i < 8; ++i) {
			const p = CollisionTester.chunkAABBPoints[i];

			vec4.transformMat4(p, chunkAABB.points[i], pv);
			//dividBySelfW(p);
/*
			if(
				p[0] <= 1 && p[0] >= -1 &&
				p[1] <= 1 && p[1] >= -1 &&
				p[2] <= 1 && p[2] >= -1
			) {
				return true;
			}//*/

			if(p[2] <= 0) {
				return true;
			}
		}

		return false;


		
		/*
		const minX = pv[0] * chunkAABB.minX + pv[12];
		const maxX = pv[0] * chunkAABB.maxX + pv[12];

		const minY = pv[5] * chunkAABB.minY + pv[13];
		const maxY = pv[5] * chunkAABB.maxY + pv[13];

		const minZ = pv[10] * chunkAABB.minZ + pv[14];
		const maxZ = pv[10] * chunkAABB.maxZ + pv[14];

		out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;

		const view = 1;
		return (
			CollisionTester.isRangesOverlaps(minX, maxX, -view, view) ||
			CollisionTester.isRangesOverlaps(minY, maxY, -view, view) ||
			CollisionTester.isRangesOverlaps(minZ, maxZ, -view, view)
		);*/
	}

	static isPointInView(point, camera) {
		const pv = camera.getVPMatrix();

		const p = vec4.create();
		p[0] = point[0];
		p[1] = point[1];
		p[2] = point[2];
		p[3] = 1;

		vec4.transformMat4(p, p, pv);

		dividBySelfW(p);

		return (
			p[0] <= 1 && p[0] >= -1 &&
			p[1] <= 1 && p[1] >= -1 &&
			p[2] <= 1 && p[2] >= -1
		);
	}
}

CollisionTester.blockAABB = new AABB();
CollisionTester.blockAABB.originMinX = 0;
CollisionTester.blockAABB.originMaxX = 1;
CollisionTester.blockAABB.originMinY = 0;
CollisionTester.blockAABB.originMaxY = 1;
CollisionTester.blockAABB.originMinZ = 0;
CollisionTester.blockAABB.originMaxZ = 1;

CollisionTester.chunkAABBPoints = [];
for(let i = 0; i < 8; ++i) {
	CollisionTester.chunkAABBPoints.push([0, 0, 0, 1]);
}

/*/
CollisionTester.swaps = [
	[-1, 0, -1],
	[0, 0, -1],
	[1, 0, -1],

	[-1, 0, 0],
	[0, 0, 0],
	[1, 0, 0],

	[-1, 0, 1],
	[0, 0, 1],
	[1, 0, 1],

	/////

	[-1, -1, -1],
	[0, -1, -1],
	[1, -1, -1],

	[-1, -1, 0],
	[0, -1, 0],
	[1, -1, 0],

	[-1, -1, 1],
	[0, -1, 1],
	[1, -1, 1],

	/////

	[-1, 1, -1],
	[0, 1, -1],
	[1, 1, -1],

	[-1, 1, 0],
	[0, 1, 0],
	[1, 1, 0],

	[-1, 1, 1],
	[0, 1, 1],
	[1, 1, 1],
];
//*/

CollisionTester.swaps = [ // better order
	//[0, 0, 0],

	[0, -1, 0],
	[0, 1, 0],

	///

	[0, 0, -1],
	[-1, 0, 0],
	[1, 0, 0],
	[0, 0, 1],
	[0, -1, -1],
	[-1, -1, 0],
	[1, -1, 0],
	[0, -1, 1],
	[0, 1, -1],
	[-1, 1, 0],
	[1, 1, 0],
	[0, 1, 1],

	///

	[-1, 0, -1],
	[1, 0, -1],
	[-1, 0, 1],
	[1, 0, 1],
	[-1, -1, -1],
	[1, -1, -1],
	[-1, -1, 1],
	[1, -1, 1],
	[-1, 1, -1],
	[1, 1, -1],
	[-1, 1, 1],
	[1, 1, 1],
];
