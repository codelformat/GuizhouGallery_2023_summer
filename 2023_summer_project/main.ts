import * as THREE from 'three';

import {gui} from './guiPanel';
import { CharacterControls } from './characterControls_v2.1';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
// import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
// import WebGPU from 'three/addons/capabilities/WebGPU.js';
// import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import {scene, camera, renderer, composer, depthOfFieldEffect, mainLight} from './postprocess';
import { S } from './utils';
import { Interactions } from './interactions'
import { loadingManager, textureLoader, sceneReady, videos, videoMaterials, aluminumMaterial, paintedConcreteMaterial, tajMahalGraniteMaterial, plywoodMaterial, concreteMaterial, glassMaterial, whiteWoolMaterial, blueGlassMaterial, dragonMaterial, whiteMarbleMaterial, stoneMarbleMaterial } from './materials'
import { spotLightHelpers, spotLights } from './lights'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { PAINTINGS_INFO, numOfPoints, DOCUMENTARY_INDEX, DOCUMENTARY_VIDEO_INDEX, sizes } from './Constraints';
import { Reflector } from './Reflector'



/**
 * Base Settings
 */
const clock = new THREE.Clock();
let isFirstPersonView:boolean = false;



const gltfLoader = new GLTFLoader(loadingManager);
const fbxLoader = new FBXLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);

const dracoLoader = new DRACOLoader(loadingManager);

dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dracoLoader.setDecoderConfig({ type: 'js' });
gltfLoader.setDRACOLoader(dracoLoader);




/**
 * Controls
 */
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();



/**
 * Player Settings
 */
const worldOctree = new Octree();

const playerCollider = new Capsule(new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, 1.85, 0), 0.5);
playerCollider.translate(new THREE.Vector3(0.5, 0, -8.55));

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

/**
 * Panorama Environment & Background
 */
rgbeLoader.loadAsync('/imgs/christmas_photo_studio_05_2k.hdr').then((texture) => {
	texture.mapping = THREE.EquirectangularReflectionMapping;
	scene.environment = texture;
	// scene.background = texture;
});

rgbeLoader.loadAsync('/imgs/spaichingen_hill_4k.hdr').then((texture) => {
	texture.mapping = THREE.EquirectangularReflectionMapping;
	// scene.environment = texture;
	scene.background = texture;
});

const mirror_1 = new Reflector(new THREE.PlaneGeometry(100, 100), {
	textureWidth: window.innerWidth * window.devicePixelRatio,
	textureHeight: window.innerHeight * window.devicePixelRatio,
	color: 0xffffff,
});
const mirror_2 = new Reflector(new THREE.PlaneGeometry(30.1, 15.09), {
	textureWidth: window.innerWidth * window.devicePixelRatio,
	textureHeight: window.innerHeight * window.devicePixelRatio,
	color: 0xffffff,
});
function createSpecularReflection() {

	if (mirror_1.material instanceof THREE.Material) {
		mirror_1.material.transparent = true;
	}
	mirror_1.rotation.x = -0.5 * Math.PI;
	mirror_1.position.set(0, 0.06, 0);

	scene.add(mirror_1);


	if (mirror_2.material instanceof THREE.Material) {
		mirror_2.material.transparent = true;
	}
	mirror_2.rotation.x = -0.5 * Math.PI;
	mirror_2.position.set(15.05, 5.11, -9.61);

	scene.add(mirror_2);
}


/**
 * Points for interations
 */
interface Point {
	position: THREE.Vector3;
	element: HTMLElement;
}
const points: Point[] = [];

for (let i = 0; i <= numOfPoints; i++) {
	const point = {
		position: new THREE.Vector3(0, 0, 0),
		element: document.querySelector(`.point-${i}`)
	};
	points.push(point);
}

/**
 * Objects for raycast
 */
let raycast_objects: THREE.Mesh[] = [];
let raycast_objects_with_walls: THREE.Mesh[] = [];



const paintingsMaterials: THREE.MeshPhysicalMaterial[] = [];
for (let i = 1; i < numOfPoints; i++) {
	const imgTexture = textureLoader.load(PAINTINGS_INFO[i].img_src);
	const paintingMaterial = new THREE.MeshStandardMaterial({
		map: imgTexture,
		normalMap: new THREE.TextureLoader().load(PAINTINGS_INFO[i].normal_src),
		transparent: true,
		opacity: 1,
		envmapIntensity: 0,
		side: THREE.DoubleSide,
	});
	paintingsMaterials.push(paintingMaterial);
}

/**
 * Model Loader
 */

/**
 * Video Plane
 */
let videoPlayFlag = false;
const videoPlane = new THREE.Mesh(
	new THREE.PlaneGeometry(16, 9),
	videoMaterials[DOCUMENTARY_VIDEO_INDEX]
);
videoPlane.name = '纪录片';
videoPlane.position.set(15, 2.545, -9.563);
videoPlane.rotation.y = -1.57;
videoPlane.scale.set(0.556, 0.556, 1);
scene.add(videoPlane);

let interactionUI: any;
gltfLoader.setPath('/models/');
gltfLoader.load('校徽logoV0.1.glb', (gltf) => {
	scene.add(gltf.scene);

	worldOctree.fromGraphNode(gltf.scene);


	gltf.scene.traverse((child) => {
		if (child.name === 'path0') {
			var logo = gui.addFolder('校徽');
			child.position.x = 7.55;
			child.position.y = 2;
			child.position.z = -13.55;
			child.rotation.z = Math.PI / 4;
			mainLight.target = child;
			scene.add(child);

			logo.add(child.position, 'x').min(5).max(10).step(0.001).name('x');
			logo.add(child.position, 'y').min(2).max(4).step(0.001).name('y');
			logo.add(child.position, 'z').min(-14).max(-12).step(0.001).name('z');
			logo.add(child.scale, 'x').min(0).max(100).step(0.001).name('scaleX');
			logo.add(child.scale, 'y').min(0).max(100).step(0.001).name('scaleY');
			logo.add(child.scale, 'z').min(0).max(100).step(0.001).name('scaleZ');
			logo.add(child.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.001).name('rotationX');
			logo.add(child.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotationY');
			logo.add(child.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.001).name('rotationZ');
		}

		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;


			if (child.material.map) {
				child.material.map.anisotropy = 4;
			}
		}
	});
});

// gltfLoader.load('zong.glb', (gltf) => {
// 	scene.add(gltf.scene);

// 	worldOctree.fromGraphNode(gltf.scene);
// 	gltf.scene.traverse((child) => {
// 		console.log(child);
// 		if (child.name === 'path3') {
// 			var zong = gui.addFolder('综影')
// 			child.position.x = 7.55;
// 			child.position.y = 2;
// 			child.position.z = -5.55;
// 			child.rotation.z = -Math.PI / 4;

// 			zong.add(child.position, 'x').min(5).max(10).step(0.001).name('x');
// 			zong.add(child.position, 'y').min(1).max(6).step(0.01).name('y');
// 			zong.add(child.position, 'z').min(-8).max(-5).step(0.01).name('z');
// 			zong.add(child.scale, 'x').min(0).max(100).step(0.001).name('scaleX');
// 			zong.add(child.scale, 'y').min(0).max(100).step(0.001).name('scaleY');
// 			zong.add(child.scale, 'z').min(0).max(100).step(0.001).name('scaleZ');
			
// 			zong.add(child.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.001).name('rotationX');
// 			zong.add(child.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotationY');
// 			zong.add(child.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.001).name('rotationZ');
// 		}
// 		if (child.isMesh) {
// 			child.castShadow = true;
// 			child.receiveShadow = true;


// 			if (child.material.map) {
// 				child.material.map.anisotropy = 4;
// 			}
// 		}
// 	});
// });

let collision_objects: THREE.Mesh[] = [];
gltfLoader.load('展馆v1.51-withPics.glb', (gltf) => {
	let ray_withwall_2f: THREE.Mesh[] = [];
	let ray_withwall_pics: THREE.Mesh[] = [];
	scene.add(gltf.scene);

	worldOctree.fromGraphNode(gltf.scene);
	//const collisionGroup = new THREE.Group();

	gltf.scene.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
			collision_objects.push(child);

			if (child.material.map) {
				child.material.map.anisotropy = 4;
			}
		}
		// console.log(child);

		if (child.name === "玻璃幕墙1" || child.name === "玻璃幕墙2" || child.name === "玻璃幕墙3" || child.name === "玻璃幕墙4" || child.name === "玻璃幕墙5"
			|| child.name === "玻璃幕墙6" || child.name === "玻璃幕墙7" || child.name === "玻璃幕墙8" || child.name === '立方体'
			|| child.name === "上楼墙" || child.name === "下楼墙" || child.name === "立方体.002") {
			//collisionGroup.add(child);
			child.material = glassMaterial;
			// console.log(child);
		}
		else if (child.name === '2F地板' || child.name === '地板1层') {
			// console.log(child);
			child.material = whiteMarbleMaterial;
			//collisionGroup.add(child);
		}
		else if (child.name === '听歌识曲墙') {
			child.material = plywoodMaterial;
		}
		else if (child.name === 'X墙' || child.name === '2层y墙' || child.name === '1层y墙' || child.name === '立方体.001' || child.name === '立方体.003' || child.name === '楼梯实心墙') {
			child.material = paintedConcreteMaterial;
		}
		else if (child.name === '幕墙装饰'){
			child.material = aluminumMaterial;
		}
		else if(child.name === 'logo台1' || child.name === 'logo台2'){
			console.log('logo position');
			console.log(child.position);
		}
		else if (child.name === '1F楼顶' || child.name === '楼顶') {
			child.material = concreteMaterial;
		}
		else if (child.name === "2F墙1"
			|| child.name === "2F墙2" || child.name === "2F墙3" || child.name === "2F墙4" || child.name === "2F墙5" || child.name === "2F墙6"
			|| child.name === "2F墙7" || child.name === "2F墙8" || child.name === "2F墙9" || child.name === "2F墙10" || child.name === "2F墙11") {
			child.material = stoneMarbleMaterial;
			ray_withwall_2f.push(child);
			//collisionGroup.add(child);
		}
		else if (child.name === "蜡染展台1" || child.name === "蜡染展台2" || child.name === "蜡染展台3" || child.name === '姊妹箫展台' || child.name === '听歌识曲台') {
			child.material = blueGlassMaterial;
			//collisionGroup.add(child);
		}
		else if (child.name[0] === '竖') {
			// child.material = dragonMaterial;
			// Assuming you have a plane mesh named 'planeMesh'
			const geometry = child.geometry;

			// Assuming the plane is created using PlaneGeometry
			// PlaneGeometry creates two triangles to represent the plane
			// The first three vertices are one triangle's vertices
			const vertex1 = geometry.attributes.position.array.slice(0, 3);
			const vertex2 = geometry.attributes.position.array.slice(3, 6);
			const vertex3 = geometry.attributes.position.array.slice(6, 9);

			// Calculate the cross product of two edges of the triangle to get the normal
			const edge1 = new THREE.Vector3().fromArray(vertex2).sub(new THREE.Vector3().fromArray(vertex1));
			const edge2 = new THREE.Vector3().fromArray(vertex3).sub(new THREE.Vector3().fromArray(vertex1));
			const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();


			const match = child.name.match(/\d+/); // Extracts one or more digits from the name
			console.log(`Normal Vector ${match[0]}: (${normal.x}, ${normal.y}, ${normal.z})`);
			if (match) {
				const pointIndex = Number(match[0]);

				if (points[pointIndex]) {
					// console.log(pointIndex);
					child.material = paintingsMaterials[pointIndex - 1];
					points[pointIndex].position = child.position;

					// spotLights[pointIndex - 1].position.set(0, 1, 0);
					spotLights[pointIndex - 1].target = child;
					if (child.name[2] === '正') {
						spotLights[pointIndex - 1].position.set(child.position.x + 1, child.position.y + 2, child.position.z);
						// child.material.side = THREE.BackSide;
					}
					else if (child.name[2] === '横')
						spotLights[pointIndex - 1].position.set(child.position.x, child.position.y + 2, child.position.z - 1);
					else
						spotLights[pointIndex - 1].position.set(child.position.x - 1, child.position.y + 2, child.position.z);
					scene.add(spotLights[pointIndex - 1]);
					// scene.add(spotLightHelpers[pointIndex - 1]);

					console.log(child)
				}

				raycast_objects.push(child);
			}

			// child.opacity = 0;
		}

		points[23].position = videoPlane.position;
	});

	const helper = new OctreeHelper(worldOctree);
	helper.visible = false;
	scene.add(helper);

	const octreeHelperFolder = gui.addFolder('Octree Helper');
	octreeHelperFolder.add({ debug: false }, 'debug')
		.onChange(function (value) {

			helper.visible = value;

		});

	let raycast_obj_temp: THREE.Mesh[] = new Array(23);
	raycast_objects.forEach((obj) => {
		const match = obj.name.match(/\d+/);
		if (match) {
			const pointIndex = Number(match[0]);
			raycast_obj_temp[pointIndex - 1] = obj;
		}
	});
	raycast_objects = raycast_obj_temp;
	raycast_objects.push(videoPlane);

	raycast_objects.splice(22, 1);
	ray_withwall_pics = raycast_objects;
	raycast_objects_with_walls = ray_withwall_2f.concat(ray_withwall_pics);

	for (let i = 0; i < numOfPoints - 1; i++) {
		raycast_objects[i].material.opacity = 0;
		spotLights[i].power = 0;
	}

	mirror_fold2.add(raycast_objects[11].material, 'opacity').min(0).max(1).step(0.01).name('opacity');
	console.log(raycast_objects);
	interactionUI = new Interactions(raycast_objects, raycast_objects_with_walls, points, camera);
	createSpecularReflection();
	animate();
});

// Step 4: Listen for Video End Event
videos[DOCUMENTARY_VIDEO_INDEX].video.addEventListener('ended', () => {
	// Step 5: Update Object Opacity
	let opacity = 1;
	const fadeOutInterval = setInterval(() => {
		opacity -= 0.01; // Adjust the fading rate as needed
		videoPlane.material.opacity = opacity;
		if (opacity <= 0) {
			clearInterval(fadeOutInterval);
			scene.remove(videoPlane); // Optionally remove the object from the scene
		}
	}, 2000); // Interval duration for fading
});


// console.log(points);

/**
 * Characters
 */
var characterControls: CharacterControls
let model: any;



gltfLoader.load('Character_final.glb', function (gltf) {
	model = gltf.scene;
	

	model.traverse(function (object: any) {
		if (object.isMesh) {
			object.castShadow = true;
			object.receiveShadow = true;
			object.material.transparent = true;
			object.material.opacity = 1;
		}

	}
	);

	scene.add(model);
	model.position.copy(playerCollider.start);

	const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
	const mixer = new THREE.AnimationMixer(model);
	const animationsMap: Map<string, THREE.AnimationAction> = new Map()
	gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
		animationsMap.set(a.name, mixer.clipAction(a))
	})

	characterControls = new CharacterControls(scene, model, mixer, animationsMap, orbitControls, camera, worldOctree, playerCollider, collision_objects, 'Idle')
});

/**
 * Axes Helper
 */
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);




/**
 * Points of interest
 */
const raycaster = new THREE.Raycaster()
raycaster.far = 25;
raycaster.near = 0.1;

/**
 * Dragon Painting Plane
 */
// const dragonPaintingPlane = new THREE.Mesh(
// 	new THREE.PlaneGeometry(35, 9.5),
// 	dragonMaterial
// );
// dragonPaintingPlane.position.set(12.8, 7, -5.65);
// dragonPaintingPlane.scale.set(0.15, 0.15, 1);
// dragonPaintingPlane.rotation.y = -0.65;
// scene.add(dragonPaintingPlane);




/**
 * Physics Settings
 */
const STEPS_PER_FRAME = 5;




const keyStates = {}; // Key State Array
/** 
 * Control keys
 */
// CONTROL KEYS
const keysPressed = {}

document.addEventListener('keydown', (event) => {
	//keyDisplayQueue.down(event.key)
	if (event.shiftKey && characterControls) {
		characterControls.switchRunToggle()
	} else if (event.key.toLowerCase() == 'f' && videoPlayFlag) {
		videos[DOCUMENTARY_VIDEO_INDEX].video.play();
	} else if (event.key.toLowerCase() == 'v') {
		isFirstPersonView = !isFirstPersonView;
	}
	else {
		(keysPressed as any)[event.key.toLowerCase()] = true
	}
}, false);
document.addEventListener('keyup', (event) => {
	//keyDisplayQueue.up(event.key);
	(keysPressed as any)[event.key.toLowerCase()] = false
}, false);

document.body.addEventListener('mousemove', handleMouseMove);
function handleMouseMove(event: MouseEvent) {
	if (isFirstPersonView) {

		camera.rotation.y -= event.movementX / 500;
		camera.rotation.x -= event.movementY / 500;
	}
}


// Resize Window
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}



// gui.add(raycast_objects[1].material, 'opacity').min(0).max(1).step(0.01).name('opacity');
let mirror_fold1 = gui.addFolder('Mirror 1');
mirror_fold1.add(mirror_1.position, 'x').min(-100).max(100).step(0.01).name('x');
mirror_fold1.add(mirror_1.position, 'y').min(-100).max(100).step(0.01).name('y');
mirror_fold1.add(mirror_1.position, 'z').min(-100).max(100).step(0.01).name('z');
mirror_fold1.add(mirror_1.scale, 'x').min(0).max(1).step(0.001).name('scaleX');
mirror_fold1.add(mirror_1.scale, 'y').min(0).max(1).step(0.001).name('scaleY');

let mirror_fold2 = gui.addFolder('Mirror 2');
mirror_fold2.add(mirror_2.position, 'x').min(-100).max(100).step(0.01).name('x');
mirror_fold2.add(mirror_2.position, 'y').min(-100).max(100).step(0.01).name('y');
mirror_fold2.add(mirror_2.position, 'z').min(-100).max(100).step(0.01).name('z');
mirror_fold2.add(mirror_2.scale, 'x').min(0).max(1).step(0.001).name('scaleX');
mirror_fold2.add(mirror_2.scale, 'y').min(0).max(1).step(0.001).name('scaleY');


/**
 * Functions
 */

/**
 * Interation
 */
const timeStep = 1 / 60;
const hover_point = new THREE.Vector2(0, 0);

// let pointIndex: any = 0;





const click_raycaster: THREE.Raycaster = new THREE.Raycaster();

click_raycaster.far = 3;
let mouse_point: THREE.Vector2 = new THREE.Vector2(0, 0);

document.body.addEventListener("mouseup", (event) => {
	mouse_point.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse_point.y = -((event.clientY / window.innerHeight) * 2 - 1);

	interactionUI.paintingClickInteractions(mouse_point, camera);
	// event.stopPropagation();
});

function teleportPlayerIfOob() {

	if (camera.position.y <= - 25) {

		playerCollider.start.set(0, 0.35, 0);
		playerCollider.end.set(0, 1, 0);
		playerCollider.radius = 0.35;
		camera.position.copy(playerCollider.end);
		camera.rotation.set(0, 0, 0);

	}

}

function animate() {
	const deltaTime = Math.min(0.05, clock.getDelta() * 3) / STEPS_PER_FRAME;

	if (characterControls) {
		characterControls.update(deltaTime, keysPressed, isFirstPersonView);
		// playerCollisions();
		model.position.set(playerCollider.start.x, playerCollider.start.y - 0.5, playerCollider.start.z);

		// characterControls.updateCamera();
	}
	orbitControls.update();
	videoPlayFlag = interactionUI.paintingInteractions(sceneReady, camera);
	teleportPlayerIfOob();


	composer.render();
	// depthOfFieldEffect.update(renderer, renderer.getRenderTarget(), deltaTime);

	// console.log(camera.position)
	requestAnimationFrame(animate);
}

