const frac0 = x => x - Math.floor(x);
const frac1 = x => 1 - x + Math.floor(x);
const sign = x => (x > 0 ? 1 : (x < 0 ? -1 : 0));

export const gridRaycast3d = function *(x1, y1, z1, x2, y2, z2) {
    let tMaxX, tMaxY, tMaxZ, tDeltaX, tDeltaY, tDeltaZ;
    let voxel = {x: 0, y: 0, z: 0};


    let dx = sign(x2 - x1);
    if(dx != 0) tDeltaX = Math.min(dx / (x2 - x1), 10000000.0); else tDeltaX = 10000000.0;
    if(dx > 0) tMaxX = tDeltaX * frac1(x1); else tMaxX = tDeltaX * frac0(x1);
    voxel.x = Math.floor(x1);

    let dy = sign(y2 - y1);
    if(dy != 0) tDeltaY = Math.min(dy / (y2 - y1), 10000000.0); else tDeltaY = 10000000.0;
    if(dy > 0) tMaxY = tDeltaY * frac1(y1); else tMaxY = tDeltaY * frac0(y1);
    voxel.y = Math.floor(y1);

    let dz = sign(z2 - z1);
    if(dz != 0) tDeltaZ = Math.min(dz / (z2 - z1), 10000000.0); else tDeltaZ = 10000000.0;
    if(dz > 0) tMaxZ = tDeltaZ * frac1(z1); else tMaxZ = tDeltaZ * frac0(z1);
    voxel.z = Math.floor(z1);

    while (true) {
        if (tMaxX < tMaxY) {
            if (tMaxX < tMaxZ) {
                voxel.x += dx;
                tMaxX += tDeltaX;
            } else {
                voxel.z += dz;
                tMaxZ += tDeltaZ;
            }
        } else {
            if (tMaxY < tMaxZ) {
                voxel.y += dy;
                tMaxY += tDeltaY;
            } else {
                voxel.z += dz;
                tMaxZ += tDeltaZ;
            }
        }
        if (tMaxX > 1 && tMaxY > 1 && tMaxZ > 1) break;
        yield [voxel.x, voxel.y, voxel.z];
    }
}
