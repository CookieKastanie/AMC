import { Display, Shader, Texture, TextureArray, VAO, VBO } from 'akila/webgl'
import { Time } from 'akila/time'
import { World } from './world'
import { Action } from './action'

import { Keyboard, Mouse } from 'akila/inputs'
import { TrackBallCamera, FirstPersonCamera, Infos, Camera } from 'akila/utils'


import { TERRAIN_IMG_DATA } from './terrain_image_data'
import { CROSS_IMAGE_DATA } from './cross_image_data'

import { TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS, CROSS_VS, CROSS_FS } from './frags'
import { Block } from './block'
import { SDF } from './sdf_functions'
import { LRD } from './line_debugger_renderer'
import { mat4, vec3, vec4 } from 'akila/math'
import { Player } from './player'
import { CollisionTester } from './collision_tester'
import { DebugCamera } from './debug_camera'
import { TextureLoader } from './texture_loader'


//const display = new Display(1280, 720, {webGLVersion: 2});
const display = new Display(Infos.getFullScreenWidth(), Infos.getFullScreenHeight(), {webGLVersion: 2});
display.setClearColor(0.259, 0.647, 0.961);

const crossVAO = new VAO(VAO.TRIANGLE_FAN);
crossVAO.addVBO(new VBO([-1, -1, 1, -1, 1, 1, -1, 1], 2, 0));
const crossShader = new Shader(CROSS_VS, CROSS_FS);

let terrainTexture;
let crossTexture;

const shader = new Shader(TERRAIN_OPAQUE_VS, TERRAIN_OPAQUE_FS);

let mouse;
let keyboard;
let camera;

let camera2;

let player;

const time = new Time();

//const world = new World(16, 4, 16);
//const world = new World(8, 2, 8);
const world = new World(4, 2, 4);

time.onInit(async () => {
	mouse = new Mouse();
	keyboard = new Keyboard();

	player = new Player();

	camera = new FirstPersonCamera(display.getWidth(), display.getHeight(), {near: 0.1, far: 400, fovy: Math.PI / 2.5});
	//camera.setPosition([128, 50, 0]);

	camera2 = new DebugCamera(display.getWidth(), display.getHeight(), {near: 0.1, far: 10, fovy: Math.PI / 2.5});
	//camera2.position = new Float32Array([128, 50, 0]);

	const loadingResult = await Promise.all([
		TextureLoader.texture2dArray(TERRAIN_IMG_DATA, [16, 16], {minFilter: Texture.LINEAR_MIPMAP_LINEAR, magFilter: Texture.NEAREST}),
		TextureLoader.texture2d(CROSS_IMAGE_DATA, {minFilter: Texture.NEAREST, magFilter: Texture.NEAREST}),
		new Promise(resolve => {SDF.fillWorld(world); resolve();})
	]);

	terrainTexture = loadingResult[0];
	crossTexture = loadingResult[1];

	world.buildAll();
});

let mouseClicked = false;
time.onTick(() => {
	LRD.start();

	if(keyboard.isPressed(Keyboard.KEY_A)) {
		camera2.position = [...camera.position];
		camera2.up = [...camera.up];
		camera2.forward = [...camera.forward];
	}

	camera.update();
	camera.aabb = player.aabb;
	//camera.speed = 1;
	//const move = CollisionTester.AABBToWorld(camera.aabb, camera.position, world);
	//vec3.add(camera.position, camera.position, move);
	//camera.setPosition(move);
	//camera.update();

	camera2.update();

	if(mouse.isPressed(Mouse.LEFT_BUTTON) || mouse.isPressed(Mouse.RIGHT_BUTTON)) {
		if(mouseClicked == false) {
			mouseClicked = true;

			if(mouse.isPressed(Mouse.LEFT_BUTTON)) {
				Action.destroyBlockFromCameraRay(world, camera);
			} else {
				const block = new Block();
				block.isAir = false;
				//block.id = 16*3 + 1;
				block.id = 4;
				//block.isTransparent = true;
				block.isTransparent = false;

				Action.placeBlockFromCameraRay(world, block, camera);
			}
		}
	} else {
		mouseClicked = false;
	}

	world.update();
});

time.onDraw(() => {
	// World pass
	display.clear();
	shader.use();
	shader.sendMat4('VP', camera.getVPMatrix());
	terrainTexture.use();
	world.draw(shader, camera2);
	
	// Debug pass
	camera2.drawView();
	LRD.draw(camera);

	// Cross pass
	display.disable(Display.DEPTH_TEST);
	display.blendFunc(Display.ONE_MINUS_DST_COLOR, Display.ONE_MINUS_SRC_ALPHA);

	crossShader.use();
	crossShader.sendVec2('screenSize', new Float32Array([display.getWidth(), display.getHeight()]));
	crossTexture.use();
	crossVAO.draw();

	display.defaultBlendFunc();
	display.enable(Display.DEPTH_TEST);
});

time.start();
