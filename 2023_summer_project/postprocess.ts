import { HalfFloatType } from "three";
import * as THREE from 'three';
import { BlendFunction, SMAAPreset, SelectiveBloomEffect, ToneMappingEffect, ColorDepthEffect, BrightnessContrastEffect, FXAAEffect, SMAAEffect, SSAOEffect, BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { HalfFloatType } from "three";
import {
    EdgeDetectionMode, BlendFunction, SMAAPreset, Selection, KernelSize, PredicationMode,
    SelectiveBloomEffect, ToneMappingEffect, ColorDepthEffect, BrightnessContrastEffect, FXAAEffect, SMAAEffect, SSAOEffect,
    BloomEffect, TextureEffect, DepthOfFieldEffect, VignetteEffect, GodRaysEffect,
    EffectComposer,
    NormalPass, DepthDownsamplingPass, EffectPass, RenderPass
} from "postprocessing";
import { spotLights } from "./lights";


import { gui } from './guiPanel';
import WebGPU from 'three/addons/capabilities/WebGPU.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75,
    window.innerWidth / window.innerHeight,
    0.01,
    100
);
camera.rotation.order = 'YXZ';
camera.position.set(-2.624, 1.9, -8.46);

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl');

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas, powerPreference: "high-performance", antialias: false, stencil: false, depth: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.useLegacyLights = false;

/**
 * Post Processing
 */
const composer = new EffectComposer(renderer, {
    frameBufferType: HalfFloatType
});
composer.addPass(new RenderPass(scene, camera));

const bloomEffect = new SelectiveBloomEffect(scene, camera, {
    blendFunction: BlendFunction.ADD,
    mipmapBlur: true,
    luminanceThreshold: 0.4,
    luminanceSmoothing: 0.2,
    intensity: 0,
});
bloomEffect.selection = new Selection(spotLights);
bloomEffect.inverted = true;
bloomEffect.ignoreBackground = true;

let postProcess = gui.addFolder('Post Process');
let bloomFolder = postProcess.addFolder('Bloom Effect');
bloomFolder.add(bloomEffect, 'intensity').min(0).max(100).step(0.01).name('intensity');
bloomFolder.add(bloomEffect, 'width').min(0).max(1).step(0.01).name('width');
// bloomFolder.add(bloomEffect, 'resolutionScale').min(0).max(1).step(0.01).name('resolutionScale');

bloomFolder.add(bloomEffect.mipmapBlurPass, 'radius').min(0.0).max(100.0).step(0.001).name('radius');
bloomFolder.add(bloomEffect.luminanceMaterial, 'smoothing').min(0).max(1).step(0.01).name('smoothing');
bloomFolder.add(bloomEffect.luminanceMaterial, 'threshold').min(0).max(1).step(0.01).name('threshold');

//const colorDepthEffectEffect = new ColorDepthEffect();
//let colordep = postProcess.addFolder('Color Depth Effect');
//colordep.add(colorDepthEffectEffect, 'bitDepth').min(8).max(64).step(1).name('bitDepth');

const brightnessContrastEffect = new BrightnessContrastEffect();
let brightContrast = postProcess.addFolder('Brightness Contrast Effect');
brightContrast.add(brightnessContrastEffect, 'brightness').min(0).max(10).step(0.01).name('brightness');
brightContrast.add(brightnessContrastEffect, 'contrast').min(0).max(100).step(0.1).name('contrast');

const toneMappingEffect = new ToneMappingEffect();
const smaaEffect = new SMAAEffect({
    preset: SMAAPreset.MEDIUM,
    edgeDetectionMode: EdgeDetectionMode.COLOR,
    predicationMode: PredicationMode.DISABLED
});
// smaaEffect.applyPreset(SMAAPreset.ULTRA);
// smaaEffect.edgeDetectionMode = EdgeDetectionMode.DEPTH;

const normalPass = new NormalPass(scene, camera);
const depthDownsamplingPass = new DepthDownsamplingPass({
    normalBuffer: normalPass.texture,
    resolutionScale: 0.5
});
const capabilities = renderer.capabilities;
const normalDepthBuffer = capabilities.isWebGL2 ?
    depthDownsamplingPass.texture : null;

const ssaoEffect = new SSAOEffect(camera, normalPass.texture, {
    blendFunction: BlendFunction.MULTIPLY,
    distanceScaling: true,
    depthAwareUpsampling: true,
    normalDepthBuffer,
    samples: 9,
    rings: 7,
    distanceThreshold: 0.02,	// Render up to a distance of ~20 world units
    distanceFalloff: 0.0025,	// with an additional ~2.5 units of falloff.
    rangeThreshold: 0.0003,		// Occlusion proximity of ~0.3 world units
    rangeFalloff: 0.0001,			// with ~0.1 units of falloff.
    luminanceInfluence: 0.7,
    minRadiusScale: 0.33,
    radius: 0.1,
    intensity: 1.33,
    bias: 0.025,
    fade: 0.01,
    color: null,
    resolutionScale: 0.5
});

const depthOfFieldEffect = new DepthOfFieldEffect(camera, {
    focusDistance: 0.0,
    focalLength: 0.048,
    bokehScale: 2.0,
    height: 480
});
const cocMaterial = depthOfFieldEffect.circleOfConfusionMaterial;
let depthOfFieldFolder = postProcess.addFolder('Depth Of Field Effect');
depthOfFieldFolder.add(depthOfFieldEffect.resolution, 'height', [240, 360, 480, 720, 1080, 1440]).name('resolution').onChange((value) => {
    depthOfFieldEffect.resolution.height = Number(value);
});
depthOfFieldFolder.add(depthOfFieldEffect, 'bokehScale').min(1).max(5).step(0.001).name('bokehScale');
depthOfFieldFolder.add(depthOfFieldEffect.blurPass, 'kernelSize', KernelSize).name('edge blur').onChange((value) => {
    depthOfFieldEffect.blurPass.kernelSize = Number(value);
});
depthOfFieldFolder.add(cocMaterial, 'worldFocusDistance').min(0.0).max(5.0).step(0.0001).name('focusDistance');
depthOfFieldFolder.add(cocMaterial, 'worldFocusRange').min(0.0).max(2.0).step(0.0001).name('focalLength');
depthOfFieldFolder.add(depthOfFieldEffect.blendMode, 'blendFunction', BlendFunction).name('blend Function')


const vignetteEffect = new VignetteEffect({
    eskil: false,
    offset: 0.35,
    darkness: 0.5
});

let vignetteFolder = postProcess.addFolder('Vignette Effect');
vignetteFolder.add(vignetteEffect.uniforms.get("offset"), 'value').min(0).max(1).step(0.01).name('offset');
vignetteFolder.add(vignetteEffect.uniforms.get("darkness"), 'value').min(0).max(1).step(0.01).name('darkness');
vignetteFolder.add(vignetteEffect, 'eskil').name('eskil');
vignetteFolder.add(vignetteEffect.blendMode, 'blendFunction', BlendFunction).name('blend Function');
const textureEffect = new TextureEffect({
    blendFunction: BlendFunction.SKIP,
    texture: depthDownsamplingPass.texture
});

const mainLight = new THREE.DirectionalLight(0xffefd5, 200);
mainLight.position.set(-1, 5, -4.775);
mainLight.castShadow = true;
mainLight.shadow.bias = 0.0000125;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;


if (window.innerWidth < 720) {

    mainLight.shadow.mapSize.width = 512;
    mainLight.shadow.mapSize.height = 512;

} else if (window.innerWidth < 1280) {

    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
}
scene.add(mainLight);

const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffddaa,
    transparent: true,
    fog: false
});

const sunGeometry = new THREE.SphereGeometry(0.75, 32, 32);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.frustumCulled = false;
sun.matrixAutoUpdate = false;

const group = new THREE.Group();
group.position.copy(mainLight.position);
group.add(mainLight);
group.add(sun);

const godRaysEffect = new GodRaysEffect(camera, sun, {
    height: 1440,
    kernelSize: KernelSize.SMALL,
    density: 0.96,
    decay: 0.92,
    weight: 0.3,
    exposure: 0.54,
    samples: 60,
    clampMax: 1.0
});
const params = {
    "resolution": godRaysEffect.height,
    "blurriness": godRaysEffect.blurPass.kernelSize + 1,
    "density": godRaysEffect.godRaysMaterial.uniforms.density.value,
    "decay": godRaysEffect.godRaysMaterial.uniforms.decay.value,
    "weight": godRaysEffect.godRaysMaterial.uniforms.weight.value,
    "exposure": godRaysEffect.godRaysMaterial.uniforms.exposure.value,
    "clampMax": godRaysEffect.godRaysMaterial.uniforms.clampMax.value,
    "samples": godRaysEffect.samples,
    "color": sun.material.color.getHex(),
    "opacity": godRaysEffect.blendMode.opacity.value,
    "blend mode": godRaysEffect.blendMode.blendFunction
};

let godRaysFolder = postProcess.addFolder('God Rays Effect');
// godRaysFolder.add(pass, "dithering");

godRaysFolder.add(params, "blurriness",
    KernelSize.VERY_SMALL, KernelSize.HUGE + 1, 1).onChange((value) => {

        godRaysEffect.blur = (value > 0);
        godRaysEffect.blurPass.kernelSize = value - 1;

    });

godRaysFolder.add(params, "density", 0.0, 1.0, 0.01).onChange((value) => {

    godRaysEffect.godRaysMaterial.uniforms.density.value = value;

});

godRaysFolder.add(params, "decay", 0.0, 1.0, 0.01).onChange((value) => {

    godRaysEffect.godRaysMaterial.uniforms.decay.value = value;

});

godRaysFolder.add(params, "weight", 0.0, 1.0, 0.01).onChange((value) => {

    godRaysEffect.godRaysMaterial.uniforms.weight.value = value;

});

godRaysFolder.add(params, "exposure", 0.0, 1.0, 0.01).onChange((value) => {

    godRaysEffect.godRaysMaterial.uniforms.exposure.value = value;

});

godRaysFolder.add(params, "clampMax", 0.0, 1.0, 0.01).onChange((value) => {

    godRaysEffect.godRaysMaterial.uniforms.clampMax.value = value;

});

godRaysFolder.add(godRaysEffect, "samples", 15, 200, 1);

godRaysFolder.addColor(params, "color").onChange((value) => {

    sun.material.color.setHex(value);
    mainLight.color.setHex(value);

});

godRaysFolder.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {

    godRaysEffect.blendMode.opacity.value = value;

});

godRaysFolder.add(params, "blend mode", BlendFunction).onChange((value) => {

    godRaysEffect.blendMode.setBlendFunction(Number(value));

});

godRaysFolder.add(group.position, "x", -10.0, 2.0, 0.01).name("light x");
godRaysFolder.add(group.position, "y", 0.0, 10.0, 0.01).name("light y");
godRaysFolder.add(group.position, "z", -9.0, 0, 0.01).name("light z");
godRaysFolder.add(mainLight, "intensity", 0.0, 1000.0, 0.01).name("light intensity");




composer.addPass(depthDownsamplingPass);
composer.addPass(normalPass);
composer.addPass(new EffectPass(camera, bloomEffect, smaaEffect, ssaoEffect, toneMappingEffect, brightnessContrastEffect, textureEffect,
    godRaysEffect
));

export { scene, camera, composer, renderer, depthOfFieldEffect, mainLight};