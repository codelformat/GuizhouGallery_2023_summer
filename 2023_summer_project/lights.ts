import * as THREE from 'three';
import { gui } from './guiPanel'

/**
 * Lights
 */
const spotAngle: number = Math.PI / 6;
const spotDecay: Number = 2;
// const spotIntensity: Number = 2;
const spotPenumbra: Number = 0.5;
const spotPower: Number = 20;
const spotShadowFocus: Number = 1;

const spotLights: THREE.SpotLight[] = [];
const spotLightHelpers: THREE.SpotLightHelper[] = [];

for (let i = 1; i < 26; i++) {
	//const rectLight = new THREE.RectAreaLight(0xffffff, rectIntensity, rectWidth, rectHeight);
	const spotLight = new THREE.SpotLight(0xffffff);
	spotLight.castShadow = false;
	spotLight.distance = 0;

	spotLight.power = spotPower;
	spotLight.penumbra = spotPenumbra;
	spotLight.decay = spotDecay;
	spotLight.angle = spotAngle;
	spotLight.shadow.mapSize.width = 16;
	spotLight.shadow.mapSize.height = 16;
	spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 6;
	spotLight.shadow.focus = 1;
	
    spotLight.position.set(0, 0, 0);
	// spotLight.target(points[i].position);



	spotLights.push(spotLight);
	//scene.add(spotLight)


	const spotLightHelper = new THREE.SpotLightHelper(spotLight);
	spotLightHelpers.push(spotLightHelper);
	//scene.add(spotLightHelper);
}

const spotLightGroup = new THREE.Group();
for(let i = 0; i < spotLights.length; i++) {
	spotLightGroup.add(spotLights[i]);
}

const mouseLight = new THREE.SpotLight(0xffffff);
mouseLight.castShadow = true;
mouseLight.distance = 0;
mouseLight.power = 50;
mouseLight.penumbra = 0.5;
mouseLight.decay = 1;
mouseLight.angle = Math.PI / 6;
mouseLight.shadow.mapSize.width = 16;
mouseLight.shadow.mapSize.height = 16;
mouseLight.shadow.camera.near = 1;
mouseLight.shadow.camera.far = 6;
mouseLight.shadow.focus = 1;
mouseLight.position.set(21.05, 8, -3.05);

const mouseLight_frontup = new THREE.SpotLight(0xffffff);
mouseLight_frontup.castShadow = true;
mouseLight_frontup.distance = 0;
mouseLight_frontup.power = 50;
mouseLight_frontup.penumbra = 0.5;
mouseLight_frontup.decay = 1;
mouseLight_frontup.angle = Math.PI / 6;
mouseLight_frontup.shadow.mapSize.width = 16;
mouseLight_frontup.shadow.mapSize.height = 16;
mouseLight_frontup.shadow.camera.near = 1;
mouseLight_frontup.shadow.camera.far = 6;
mouseLight_frontup.shadow.focus = 1;
mouseLight_frontup.position.set(21.05 - (Math.sqrt(2) * 2.375), 8 - (Math.sqrt(2) * 2.375), -3.05);

const mouseLight_backup = new THREE.SpotLight(0xffffff);
mouseLight_backup.castShadow = true;
mouseLight_backup.distance = 0;
mouseLight_backup.power = 50;
mouseLight_backup.penumbra = 0.5;
mouseLight_backup.decay = 1;
mouseLight_backup.angle = Math.PI / 6;
mouseLight_backup.shadow.mapSize.width = 16;
mouseLight_backup.shadow.mapSize.height = 16;
mouseLight_backup.shadow.camera.near = 1;
mouseLight_backup.shadow.camera.far = 6;
mouseLight_backup.shadow.focus = 1;
mouseLight_backup.position.set(21.05 + (Math.sqrt(2) * 2.375), 8 - (Math.sqrt(2) * 2.375), -3.05);

const mouseLightPanel = gui.addFolder('Mouse Light');
mouseLightPanel.add(mouseLight.position, 'x', 19, 22, 0.01);
mouseLightPanel.add(mouseLight.position, 'y', 6, 10, 0.01);
mouseLightPanel.add(mouseLight.position, 'z', -5, -2, 0.01);
mouseLightPanel.add(mouseLight, 'power', 0, 200, 0.01);
mouseLightPanel.add(mouseLight, 'penumbra', 0, 1, 0.01);
mouseLightPanel.add(mouseLight, 'decay', 0, 10, 0.01);
mouseLightPanel.add(mouseLight, 'angle', 0, Math.PI / 2, 0.01);
mouseLightPanel.add(mouseLight, 'distance', 0, 100, 0.01);
mouseLightPanel.add(mouseLight.shadow.camera, 'near', 0, 100, 0.01);
mouseLightPanel.add(mouseLight.shadow.camera, 'far', 0, 100, 0.01);
mouseLightPanel.add(mouseLight.shadow, 'focus', 0, 1, 0.01);


const bagLight = new THREE.SpotLight(0xffffff);
bagLight.castShadow = true;
bagLight.distance = 0;
bagLight.power = 50;
bagLight.penumbra = 0.5;
bagLight.decay = 1;
bagLight.angle = Math.PI / 6;
bagLight.shadow.mapSize.width = 16;
bagLight.shadow.mapSize.height = 16;
bagLight.shadow.camera.near = 1;
bagLight.shadow.camera.far = 6;
bagLight.shadow.focus = 1;
bagLight.position.set(24.05, 8, -3.05);

const bagLight_frontup = new THREE.SpotLight(0xffffff);
bagLight_frontup.castShadow = true;
bagLight_frontup.distance = 0;
bagLight_frontup.power = 50;
bagLight_frontup.penumbra = 0.5;
bagLight_frontup.decay = 1;
bagLight_frontup.angle = Math.PI / 6;
bagLight_frontup.shadow.mapSize.width = 16;
bagLight_frontup.shadow.mapSize.height = 16;
bagLight_frontup.shadow.camera.near = 1;
bagLight_frontup.shadow.camera.far = 6;
bagLight_frontup.shadow.focus = 1;
bagLight_frontup.position.set(24.05 - (Math.sqrt(2) * 2.375), 8 - (Math.sqrt(2) * 2.375), -3.05);

const bagLight_backup = new THREE.SpotLight(0xffffff);
bagLight_backup.castShadow = true;
bagLight_backup.distance = 0;
bagLight_backup.power = 50;
bagLight_backup.penumbra = 0.5;
bagLight_backup.decay = 1;
bagLight_backup.angle = Math.PI / 6;
bagLight_backup.shadow.mapSize.width = 16;
bagLight_backup.shadow.mapSize.height = 16;
bagLight_backup.shadow.camera.near = 1;
bagLight_backup.shadow.camera.far = 6;
bagLight_backup.shadow.focus = 1;
bagLight_backup.position.set(24.05 + (Math.sqrt(2) * 2.375), 8 - (Math.sqrt(2) * 2.375), -3.05);

const bagLightPanel = gui.addFolder('Bag Light');
bagLightPanel.add(bagLight.position, 'x', 22, 26, 0.01);
bagLightPanel.add(bagLight.position, 'y', 6, 10, 0.01);
bagLightPanel.add(bagLight.position, 'z', -5, -2, 0.01);
bagLightPanel.add(bagLight, 'power', 0, 200, 0.01);
bagLightPanel.add(bagLight, 'penumbra', 0, 1, 0.01);
bagLightPanel.add(bagLight, 'decay', 0, 10, 0.01);
bagLightPanel.add(bagLight, 'angle', 0, Math.PI / 2, 0.01);
bagLightPanel.add(bagLight, 'distance', 0, 100, 0.01);
bagLightPanel.add(bagLight.shadow.camera, 'near', 0, 100, 0.01);
bagLightPanel.add(bagLight.shadow.camera, 'far', 0, 100, 0.01);
bagLightPanel.add(bagLight.shadow, 'focus', 0, 1, 0.01);


const xiaoLight = new THREE.SpotLight(0xffffff);
xiaoLight.castShadow = true;
xiaoLight.distance = 0;
xiaoLight.power = 50;
xiaoLight.penumbra = 0.5;
xiaoLight.decay = 1;
xiaoLight.angle = Math.PI / 6;
xiaoLight.shadow.mapSize.width = 16;
xiaoLight.shadow.mapSize.height = 16;
xiaoLight.shadow.camera.near = 1;
xiaoLight.shadow.camera.far = 6;
xiaoLight.shadow.focus = 1;
xiaoLight.position.set(27.05, 8, -3.05);

const xiaoLight_frontup = new THREE.SpotLight(0xffffff);
xiaoLight_frontup.castShadow = true;
xiaoLight_frontup.distance = 0;
xiaoLight_frontup.power = 50;
xiaoLight_frontup.penumbra = 0.5;
xiaoLight_frontup.decay = 1;
xiaoLight_frontup.angle = Math.PI / 6;
xiaoLight_frontup.shadow.mapSize.width = 16;
xiaoLight_frontup.shadow.mapSize.height = 16;
xiaoLight_frontup.shadow.camera.near = 1;
xiaoLight_frontup.shadow.camera.far = 6;
xiaoLight_frontup.shadow.focus = 1;
xiaoLight_frontup.position.set(27.05 - (Math.sqrt(2) * 2.375), 8 - (Math.sqrt(2) * 2.375), -3.05);

const xiaoLight_backup = new THREE.SpotLight(0xffffff);
xiaoLight_backup.castShadow = true;
xiaoLight_backup.distance = 0;
xiaoLight_backup.power = 50;
xiaoLight_backup.penumbra = 0.5;
xiaoLight_backup.decay = 1;
xiaoLight_backup.angle = Math.PI / 6;
xiaoLight_backup.shadow.mapSize.width = 16;
xiaoLight_backup.shadow.mapSize.height = 16;
xiaoLight_backup.shadow.camera.near = 1;
xiaoLight_backup.shadow.camera.far = 6;
xiaoLight_backup.shadow.focus = 1;
xiaoLight_backup.position.set(27.05 + (Math.sqrt(2) * 2.375), 8 - (Math.sqrt(2) * 2.375), -3.05);

const xiaoLightPanel = gui.addFolder('Xiao Light');
xiaoLightPanel.add(xiaoLight.position, 'x', 25, 29, 0.01);
xiaoLightPanel.add(xiaoLight.position, 'y', 6, 10, 0.01);
xiaoLightPanel.add(xiaoLight.position, 'z', -5, -2, 0.01);
xiaoLightPanel.add(xiaoLight, 'power', 0, 200, 0.01);
xiaoLightPanel.add(xiaoLight, 'penumbra', 0, 1, 0.01);
xiaoLightPanel.add(xiaoLight, 'decay', 0, 10, 0.01);
xiaoLightPanel.add(xiaoLight, 'angle', 0, Math.PI / 2, 0.01);
xiaoLightPanel.add(xiaoLight, 'distance', 0, 100, 0.01);
xiaoLightPanel.add(xiaoLight.shadow.camera, 'near', 0, 100, 0.01);
xiaoLightPanel.add(xiaoLight.shadow.camera, 'far', 0, 100, 0.01);
xiaoLightPanel.add(xiaoLight.shadow, 'focus', 0, 1, 0.01);



console.log('lights loaded');

export { spotLights, spotLightHelpers, spotLightGroup, mouseLight, bagLight, xiaoLight, mouseLight_frontup, mouseLight_backup, bagLight_frontup, bagLight_backup, xiaoLight_frontup, xiaoLight_backup };
