import * as THREE from 'three';

/**
 * Lights
 */
const spotAngle: number = Math.PI / 6;
const spotDecay: Number = 2;
// const spotIntensity: Number = 2;
const spotPenumbra: Number = 0.5;
const spotPower: Number = 30;
const spotShadowFocus: Number = 1;

const spotLights: THREE.SpotLight[] = [];
const spotLightHelpers: THREE.SpotLightHelper[] = [];

for (let i = 1; i < 23; i++) {
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
console.log('lights loaded');

export { spotLights, spotLightHelpers };
