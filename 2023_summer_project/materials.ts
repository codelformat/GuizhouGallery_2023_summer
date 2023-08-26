import { wrap } from 'gsap';
import * as THREE from 'three';

/**
 * Loaders
 */

export let sceneReady = false;
const loadingBarElement = document.getElementById('loading-bar');
const loadingBarContainer = document.querySelector('.loading-bar-container');
export const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = (url, item, total) => {
	console.log('Started loading file: ' + url + '.\nLoaded ' + item + ' of ' + total + ' files.');
}

loadingManager.onProgress = (url, loaded, total) => {
	console.log('Loading file: ' + url + '.\nLoaded ' + loaded + ' of ' + total + ' files.');
	loadingBarElement.value = (loaded / total) * 100;
}

loadingManager.onLoad = () => {
	loadingBarContainer.classList.add("fade-out");
	window.setTimeout(() => {
		loadingBarContainer.style.display = 'none';
	}, 2000);

	sceneReady = true;
};


/**
 * Textures & Materials
 */
export const textureLoader = new THREE.TextureLoader(loadingManager);

/**
 *  Glass material
 */
export const glassMaterial = new THREE.MeshPhysicalMaterial({
	color: 0xffffff,
	transparent: true,
	opacity: 0.6,
	roughness: 0.1,
	metalness: 0.1,
	envMapIntensity: 0.5,
	transmission: 1,
	// clearcoat: 0.01,
	// clearcoatRoughness: 0.4,
	refractionRatio: 1.5,
});

/**
 *  Blue Glass material
 */
export const blueGlassMaterial = new THREE.MeshPhysicalMaterial({
	color: 0x87cefa,
	transparent: true,
	opacity: 0.8,
	roughness: 0,
	metalness: 0.4,
	envMapIntensity: 0.5,
	transmission: 0.6,
	clearcoat: 0.1,
	clearcoatRoughness: 0.4,
	refractionRatio: 1.5,
});

/**
 * Dragon Painting Texture
 */
const dragonColorTexture = textureLoader.load('/textures/dragon_Model_5_u1_v1_diffuse_2.png');
const dragonNormalTexture = textureLoader.load('/textures/dragon_Model_5_u1_v1_normal.png');
export const dragonMaterial = new THREE.MeshPhysicalMaterial({
	map: dragonColorTexture,
	normalMap: dragonNormalTexture,
	side: THREE.FrontSide,
	envMapIntensity: 0.1,
	// roughness: 0.4,
});

/**
 * Jade Marble Texture
 */


const whiteMarbleColorTexture = textureLoader.load('/textures/Ziarat White Marble_tgzkdehv/Albedo_4K__tgzkdehv.jpg');
whiteMarbleColorTexture.wrapS = THREE.RepeatWrapping;
whiteMarbleColorTexture.wrapT = THREE.RepeatWrapping;
whiteMarbleColorTexture.repeat.set(8, 16);

const whiteMarbleNormalTexture = textureLoader.load('/textures/Ziarat White Marble_tgzkdehv/Normal_4K__tgzkdehv.jpg');
whiteMarbleNormalTexture.wrapS = THREE.RepeatWrapping;
whiteMarbleNormalTexture.wrapT = THREE.RepeatWrapping;
whiteMarbleNormalTexture.repeat.set(8, 16);

const whiteMarbleRoughnessTexture = textureLoader.load('/textures/Ziarat White Marble_tgzkdehv/Roughness_4K__tgzkdehv.jpg');
whiteMarbleRoughnessTexture.wrapS = THREE.RepeatWrapping;
whiteMarbleRoughnessTexture.wrapT = THREE.RepeatWrapping;
whiteMarbleRoughnessTexture.repeat.set(8, 16);

export const whiteMarbleMaterial = new THREE.MeshPhysicalMaterial({
	map: whiteMarbleColorTexture,
	normalMap: whiteMarbleNormalTexture,
	roughnessMap: whiteMarbleRoughnessTexture,
	side: THREE.DoubleSide,
	metalness: 0.8,
});

/**
 * 2F Stone Marble Wall Material
 */
const stoneMarbleColorTexture = textureLoader.load("/textures/pkcnJ_4K_Albedo.jpg");
stoneMarbleColorTexture.wrapS = THREE.RepeatWrapping;
stoneMarbleColorTexture.wrapT = THREE.RepeatWrapping;
stoneMarbleColorTexture.repeat.set(16, 16);
const stoneMarbleNormalTexture = textureLoader.load("/textures/pkcnJ_4K_Normal.jpg");
stoneMarbleNormalTexture.wrapS = THREE.RepeatWrapping;
stoneMarbleNormalTexture.wrapT = THREE.RepeatWrapping;
stoneMarbleNormalTexture.repeat.set(16, 16);
const stoneMarbleRoughnessTexture = textureLoader.load("/textures/pkcnJ_4K_Roughness.jpg");
stoneMarbleRoughnessTexture.wrapS = THREE.RepeatWrapping;
stoneMarbleRoughnessTexture.wrapT = THREE.RepeatWrapping;
stoneMarbleRoughnessTexture.repeat.set(16, 16);
const stoneMarbleAOTexture = textureLoader.load("/textures/pkcnJ_4K_AO.jpg");
stoneMarbleAOTexture.wrapS = THREE.RepeatWrapping;
stoneMarbleAOTexture.wrapT = THREE.RepeatWrapping;
stoneMarbleAOTexture.repeat.set(16, 16);
const stoneMarbleDisplacementTexture = textureLoader.load("/textures/pkcnJ_4K_Displacement.jpg");
export const stoneMarbleMaterial = new THREE.MeshPhysicalMaterial({
	map: stoneMarbleColorTexture,
	normalMap: stoneMarbleNormalTexture,
	roughnessMap: stoneMarbleRoughnessTexture,
	aoMap: stoneMarbleAOTexture,
	//displacementMap: stoneMarbleDisplacementTexture,

	envMapIntensity: 0.4,
	side: THREE.FrontSide
});

/**
 * Concrete material (1F ceiling)
 */
const concreteColorTexture = textureLoader.load('/textures/Albedo_2K__uflmfixs.jpg');
concreteColorTexture.wrapS = THREE.RepeatWrapping;
concreteColorTexture.wrapT = THREE.RepeatWrapping;
concreteColorTexture.repeat.set(8, 16);
const concreteNormalTexture = textureLoader.load('/textures/Normal_2K__uflmfixs.jpg');
concreteNormalTexture.wrapS = THREE.RepeatWrapping;
concreteNormalTexture.wrapT = THREE.RepeatWrapping;
concreteNormalTexture.repeat.set(8, 16);
const concreteRoughnessTexture = textureLoader.load('/textures/Roughness_2K__uflmfixs.jpg');
concreteRoughnessTexture.wrapS = THREE.RepeatWrapping;
concreteRoughnessTexture.wrapT = THREE.RepeatWrapping;
concreteRoughnessTexture.repeat.set(8, 16);
const concreteAOTexture = textureLoader.load('/textures/AO_2K__uflmfixs.jpg');
concreteAOTexture.wrapS = THREE.RepeatWrapping;
concreteAOTexture.wrapT = THREE.RepeatWrapping;
concreteAOTexture.repeat.set(8, 16);
export const concreteMaterial = new THREE.MeshPhysicalMaterial({
	map: concreteColorTexture,
	normalMap: concreteNormalTexture,
	roughnessMap: concreteRoughnessTexture,
	aoMap: concreteAOTexture,
	envMapIntensity: 0.4,
	side: THREE.FrontSide
});

/**
 * White wool material (1F ceiling)
 */
const whiteWoolColorTexture = textureLoader.load('/textures/White Cloth_sbklx0p0/Albedo_2K__sbklx0p0.jpg');
const whiteWoolNormalTexture = textureLoader.load('/textures/White Cloth_sbklx0p0/Normal_2K__sbklx0p0.jpg');
const whiteWoolRoughnessTexture = textureLoader.load('/textures/White Cloth_sbklx0p0/Roughness_2K__sbklx0p0.jpg');
const whiteWoolAOTexture = textureLoader.load('/textures/White Cloth_sbklx0p0/AO_2K__sbklx0p0.jpg');
export const whiteWoolMaterial = new THREE.MeshPhysicalMaterial({
	map: whiteWoolColorTexture,
	normalMap: whiteWoolNormalTexture,
	roughnessMap: whiteWoolRoughnessTexture,
	aoMap: whiteWoolAOTexture,
	envMapIntensity: 0.6,
	side: THREE.FrontSide
});
/**
 * Plywood material 
 */
const plywoodColorTexture = textureLoader.load('/textures/Plywood_vdcjecc/Albedo_4K__vdcjecc.jpg');
const plywoodNormalTexture = textureLoader.load('/textures/Plywood_vdcjecc/Normal_4K__vdcjecc.jpg');
const plywoodRoughnessTexture = textureLoader.load('/textures/Plywood_vdcjecc/Roughness_4K__vdcjecc.jpg');
const plywoodAOTexture = textureLoader.load('/textures/Plywood_vdcjecc/AO_4K__vdcjecc.jpg');
export const plywoodMaterial = new THREE.MeshPhysicalMaterial({
	map: plywoodColorTexture,
	normalMap: plywoodNormalTexture,
	roughnessMap: plywoodRoughnessTexture,
	aoMap: plywoodAOTexture,
	envMapIntensity: 0.6,
	side: THREE.FrontSide
});

/**
 * Taj Mahal Granite material
 */
const tajMahalGraniteColorTexture = textureLoader.load('/textures/Taj Mahal Granite_wjmkahbl/Albedo_4K__wjmkahbl.jpg');
const tajMahalGraniteRoughnessTexture = textureLoader.load('/textures/Taj Mahal Granite_wjmkahbl/Roughness_4K__wjmkahbl.jpg');
export const tajMahalGraniteMaterial = new THREE.MeshPhysicalMaterial({
	map: tajMahalGraniteColorTexture,
	roughnessMap: tajMahalGraniteRoughnessTexture,
	envMapIntensity: 0.6,
	side: THREE.FrontSide
});

/**
 * Painted Concrete material
 */
const paintedConcreteColorTexture = textureLoader.load('/textures/Painted Concrete Wall_ulxedaag/Albedo_4K__ulxedaag.jpg');
paintedConcreteColorTexture.wrapS = THREE.RepeatWrapping;
paintedConcreteColorTexture.wrapT = THREE.RepeatWrapping;
paintedConcreteColorTexture.repeat.set(4, 16);
const paintedConcreteNormalTexture = textureLoader.load('/textures/Painted Concrete Wall_ulxedaag/Normal_4K__ulxedaag.jpg');
paintedConcreteNormalTexture.wrapS = THREE.RepeatWrapping;
paintedConcreteNormalTexture.wrapT = THREE.RepeatWrapping;
paintedConcreteNormalTexture.repeat.set(4, 16);
const paintedConcreteRoughnessTexture = textureLoader.load('/textures/Painted Concrete Wall_ulxedaag/Roughness_4K__ulxedaag.jpg');
paintedConcreteRoughnessTexture.wrapS = THREE.RepeatWrapping;
paintedConcreteRoughnessTexture.wrapT = THREE.RepeatWrapping;
paintedConcreteRoughnessTexture.repeat.set(4, 16);
const paintedConcreteAOTexture = textureLoader.load('/textures/Painted Concrete Wall_ulxedaag/AO_4K__ulxedaag.jpg');
paintedConcreteAOTexture.wrapS = THREE.RepeatWrapping;
paintedConcreteAOTexture.wrapT = THREE.RepeatWrapping;
paintedConcreteAOTexture.repeat.set(4, 16);
export const paintedConcreteMaterial = new THREE.MeshPhysicalMaterial({
	map: paintedConcreteColorTexture,
	normalMap: paintedConcreteNormalTexture,
	roughnessMap: paintedConcreteRoughnessTexture,
	aoMap: paintedConcreteAOTexture,
	envMapIntensity: 0.6,
	side: THREE.FrontSide,
	
});

/**
 * Aluminum material
 */
const aluminumColorTexture = textureLoader.load('/textures/Brushed Aluminum_shkaaafc/Albedo_4K__shkaaafc.jpg');
const aluminumNormalTexture = textureLoader.load('/textures/Brushed Aluminum_shkaaafc/Normal_4K__shkaaafc.jpg');
const aluminumRoughnessTexture = textureLoader.load('/textures/Brushed Aluminum_shkaaafc/Roughness_4K__shkaaafc.jpg');
const aluminumMetalnessTexture = textureLoader.load('/textures/Brushed Aluminum_shkaaafc/Metalness_4K__shkaaafc.jpg');
export const aluminumMaterial = new THREE.MeshPhysicalMaterial({
	map: aluminumColorTexture,
	normalMap: aluminumNormalTexture,
	roughnessMap: aluminumRoughnessTexture,
	metalnessMap: aluminumMetalnessTexture,
	envMapIntensity: 1,
	side: THREE.FrontSide
});

/**
 * 1F Documentary Video Materials
 */
const DOCUMENTARY_VIDEO_INDEX = 0;
export const videos = [
	{
		video: document.createElement('video'),
		source: '/videos/documentary_compressed.mp4',
	}
];
const videoTextures : THREE.VideoTexture[] = [];

export const videoMaterials : THREE.MeshBasicMaterial[] = [];

for (const video of videos) {
	video.video.src = video.source;
	video.video.loop = false;
	video.video.muted = false;
	video.video.load();
	//video.video.autoplay = true;
	//video.video.play();


	videoTextures.push(new THREE.VideoTexture(video.video));
	videoMaterials.push(new THREE.MeshBasicMaterial({ map: videoTextures[videoTextures.length - 1] }));
}


