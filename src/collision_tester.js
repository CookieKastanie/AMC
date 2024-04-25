import { vec3, vec4 } from 'akila/math';
import { AABB } from './aabb';
import { LRD } from './line_debugger_renderer';
import { Chunk } from './chunk';

const frac = x => x - Math.floor(x);
const dividBySelfW = (v) => {
	v[0] = v[0] / v[3];
	v[1] = v[1] / v[3];
	v[2] = v[2] / v[3];
	v[3] = 1;
	return v;
}

const leftRightMin = (a, b) => {
	if(a < b) {
		return -a;
	} else {
		return b;
	}
}

export class CollisionTester {
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

	static AABBpushAABB(a, b) {
		const move = vec3.create();
		move[0] = 0;
		move[1] = 0;
		move[2] = 0;

		if(CollisionTester.AABBToAABBTest(a, b) != true) {
			return move;
		}

		const dxL = Math.abs(b.maxX - a.minX);
		const dxR = Math.abs(a.maxX - b.minX);

		const dyL = Math.abs(b.maxY - a.minY);
		const dyR = Math.abs(a.maxY - b.minY);

		const dzL = Math.abs(b.maxZ - a.minZ);
		const dzR = Math.abs(a.maxZ - b.minZ);

		const minX = leftRightMin(dxL, dxR);
		const minY = leftRightMin(dyL, dyR);
		const minZ = leftRightMin(dzL, dzR);

		const globalMin = Math.min(Math.abs(minX), Math.abs(minY), Math.abs(minZ));
		if(globalMin === Math.abs(minX)) {
			move[0] = minX;
			return move;
		}

		if(globalMin === Math.abs(minY)) {
			move[1] = minY;
			return move;
		}

		if(globalMin === Math.abs(minZ)) {
			move[2] = minZ;
			return move;
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
			LRD.addAABB(CollisionTester.blockAABB, color);

			if(block != 0) {
				/*/
				if(CollisionTester.AABBToAABBTest(aabb, CollisionTester.blockAABB)) {
					console.log('collide');
					
					const m = CollisionTester.AABBToAABBDistance(aabb, CollisionTester.blockAABB);
					vec3.add(position, position, m);
				}
				//*/

				const m = CollisionTester.AABBpushAABB(CollisionTester.blockAABB, aabb);
				vec3.add(position, position, m);
			}
		}

		return position;
	}





	static isChunkInViewport(chunkAABB, camera) {
		const pv = camera.getVPMatrix();

		for(let i = 0; i < 8; ++i) {
			const p = CollisionTester.chunkAABBPoints[i];

			vec4.transformMat4(p, chunkAABB.points[i], pv);
			dividBySelfW(p);

			if(p[0] >= -1 && p[0] <= 1 &&
			   p[1] >= -1 && p[1] <= 1 &&
			   p[2] >= -1 && p[2] <= 1) {
				return true;
			}

			if(vec3.distance(camera.getPosition(), chunkAABB.center) <= (Chunk.SIZE * 1.5)) {
				return true;
			}
		}

		return false;
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
