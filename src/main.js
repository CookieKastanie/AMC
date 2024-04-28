import { Display, Shader, Texture, TextureArray, VAO, VBO } from 'akila/webgl'
import { Time } from 'akila/time'
import { World } from './world'
import { Action } from './action'

import { Keyboard, Mouse } from 'akila/inputs'
import { TrackBallCamera, FirstPersonCamera, Infos, Camera } from 'akila/utils'


import { TERRAIN_IMG_DATA } from './terrain_image_data'
import { CROSS_IMAGE_DATA } from './cross_image_data'

import { Block } from './block'
import { SDF } from './sdf_functions'
import { LRD } from './line_debugger_renderer'
import { mat4, vec3, vec4 } from 'akila/math'
import { Player } from './player'
import { CollisionTester } from './collision_tester'
import { TextureLoader } from './texture_loader'
import { TerrainRenderer } from './terrain_renderer'
import { UIRenderer } from './ui_renderer'
import { AABB } from './aabb'


//const display = new Display(1280, 720, {webGLVersion: 2});
const display = new Display(Infos.getFullScreenWidth(), Infos.getFullScreenHeight(), {webGLVersion: 2});

let mouse;
let keyboard;
let camera;

let camera2;

let player;

let currentPlayerBlockId = 1;

const time = new Time();

//const world = new World(16, 8, 16); // 16

//const world = new World(1, 1, 1); // 32

const world = new World(8, 4, 8); // 32

//const world = new World(4, 2, 4);

//const world = new World(32, 16, 32); // 8

time.onInit(async () => {
	TerrainRenderer.init();
	UIRenderer.init();

	mouse = new Mouse();
	keyboard = new Keyboard();

	player = new Player();

	//camera = new FirstPersonCamera(display.getWidth(), display.getHeight(), {near: 0.1, far: 200, fovy: Math.PI / 2.5});
	//camera.setPosition([128, 94, 0]);
	camera = new Camera(display.getWidth(), display.getHeight(), {near: 0.1, far: 200, fovy: Math.PI / 2.5});


	camera2 = new Camera(display.getWidth(), display.getHeight(), {near: 0.1, far: 200, fovy: Math.PI / 2.5});
	//camera2.position = new Float32Array([128, 50, 0]);

	const loadingResult = await Promise.all([
		TextureLoader.texture2dArray(TERRAIN_IMG_DATA, [16, 16], {minFilter: Texture.LINEAR_MIPMAP_LINEAR, magFilter: Texture.NEAREST, wrapS: Texture.CLAMP_TO_EDGE, wrapS: Texture.CLAMP_TO_EDGE}),
		TextureLoader.texture2d(CROSS_IMAGE_DATA, {minFilter: Texture.NEAREST, magFilter: Texture.NEAREST}),
		new Promise(resolve => {SDF.fillWorld(world); resolve();})
	]);

	TerrainRenderer.terrainTexture = loadingResult[0];
	UIRenderer.terrainTexture = loadingResult[0];
	UIRenderer.crossTexture = loadingResult[1];

	world.buildAll();

	{
		const pos = CollisionTester.traceBlock(
			[world.getXSizeBlockCount() / 2, world.getYSizeBlockCount() + 1, world.getZSizeBlockCount() / 2],
			[world.getXSizeBlockCount() / 2, 0, world.getZSizeBlockCount() / 2],
			world
		);
		player.setPosition(pos);
	}
});

let A = new AABB();
A.originMinX = -1;
A.originMaxX = 1;

A.originMinY = -1;
A.originMaxY = 1;

A.originMinZ = -1;
A.originMaxZ = 1;

let B = new AABB();
B.originMinX = -1;
B.originMaxX = 1;

B.originMinY = -1;
B.originMaxY = 1;

B.originMinZ = -1;
B.originMaxZ = 1;

B.setPosition([0, 0, 0]);

let mouseClicked = false;
time.onTick(() => {
	LRD.start();

	player.update();

	const displacement = CollisionTester.AABBToWorld(player.aabb, player.position, world);
	vec3.add(player.position, player.position, displacement);
	if(displacement[1] > 0 && player.localVel[1] <= 0) {
		player.isGrounded = true;
		player.localVel[1] = 0;
	}

	camera.position[0] = player.position[0];
	camera.position[1] = player.position[1] + 1.25;
	camera.position[2] = player.position[2];

	camera.forward[0] = player.forward[0];
	camera.forward[1] = player.forward[1];
	camera.forward[2] = player.forward[2];
	camera.update();
	

	if(player.position[1] < -128) {
		const pos = CollisionTester.traceBlock(
			[world.getXSizeBlockCount() / 2, world.getYSizeBlockCount() + 1, world.getZSizeBlockCount() / 2],
			[world.getXSizeBlockCount() / 2, 0, world.getZSizeBlockCount() / 2],
			world
		);
		player.setPosition(pos);
		player.localVel[1] = 0;
	}
	
	
	//LRD.addAABB(player.aabb);
	
	
	
	
	
	//camera.aabb = player.aabb;
	//camera.speed = 4;


	

	/*/
	if(keyboard.isPressed(Keyboard.KEY_A)) {
		const move = CollisionTester.AABBToWorld(camera.aabb, camera.position, world);
		camera.setPosition(move);
	}

	
	{
		const fBuffer = new Float32Array(3);

		fBuffer[0] = camera.forward[0] + camera.position[0];
		fBuffer[1] = camera.forward[1] + camera.position[1];
		fBuffer[2] = camera.forward[2] + camera.position[2];

		mat4.lookAt(camera.camera, camera.position, fBuffer, camera.up);
		mat4.multiply(camera.vp, camera.projection, camera.camera);
	}
	//*/

	//LRD.addAABB(player.aabb);

	/*/
	{
		A.setPosition([-10, -10, -10]);
		LRD.addAABB(A, LRD.YELLOW);

		if(keyboard.isPressed(Keyboard.KEY_A)) {
			B.setPosition(camera.position);
		}

		LRD.addAABB(B, LRD.BLUE);

		const dist = CollisionTester.AABBpushAABB(A, B);
		console.log(dist[0], dist[1], dist[2]);

		//const res = CollisionTester.AABBToAABBTest(A, B);
		//console.log(res);
	}
	//*/


	/*/
	if(keyboard.isPressed(Keyboard.KEY_A)) {
		camera2.position = [...camera.position];
		camera2.up = [...camera.up];
		camera2.forward = [...camera.forward];
	}
	camera2.update();
	//*/
	//LRD.addCameraView(camera2);

	if(mouse.isPressed(Mouse.LEFT_BUTTON) || mouse.isPressed(Mouse.RIGHT_BUTTON) || mouse.isPressed(Mouse.WHEEL_BUTTON)) {
		if(mouseClicked == false) {
			mouseClicked = true;

			if(mouse.isPressed(Mouse.WHEEL_BUTTON)) {
				Action.traceBlockFromCameraRay(world, currentPlayerBlockId, camera);
			} else if(mouse.isPressed(Mouse.LEFT_BUTTON)) {
				Action.destroyBlockFromCameraRay(world, camera);
			} else {
				Action.placeBlockFromCameraRay(world, currentPlayerBlockId, camera, player.aabb);
			}
		}
	} else {
		mouseClicked = false;
	}

	currentPlayerBlockId += Math.sign(mouse.scrollVelY());
	if(currentPlayerBlockId < 0) currentPlayerBlockId += Block.MAPPING.length;
	currentPlayerBlockId = Math.floor(currentPlayerBlockId) % Block.MAPPING.length;

	world.update();
});

time.onDraw(() => {
	TerrainRenderer.drawWorld(display, world, camera);
	LRD.draw(camera);
	UIRenderer.draw(display, Block.getMetaData(currentPlayerBlockId).textureIds[1]);
});

time.start();
