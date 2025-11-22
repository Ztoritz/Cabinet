import * as THREE from 'three';
import { Cabinet } from './src/Cabinet.js';
import { Interaction } from './src/Interaction.js';

// Scene Setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// Position camera to align with the left side of the screen
camera.position.set(1.5, 1.2, 5.5);
camera.lookAt(0, 1.2, 0);

// Renderer with Alpha (Transparency)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000, 0);

document.getElementById('app').appendChild(renderer.domElement);

// Lighting - Atmospheric Library Match
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Very low base ambient
scene.add(ambientLight);

// Environment Light (Hemisphere) - Cool from window, Warm from ground/candles
const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x3d2817, 0.5);
scene.add(hemiLight);

// Window Light (Back/Rim) - Cool Blue/White
// Matches the bright window in the background
const windowLight = new THREE.DirectionalLight(0xcceeff, 2.0);
windowLight.position.set(0, 2, -4); // Behind the cabinet
windowLight.castShadow = true;
scene.add(windowLight);

// Candle Lights (Warm) - Simulating the candles in the room
const candleLeft = new THREE.PointLight(0xffaa00, 1.5, 10);
candleLeft.position.set(-3, 2, 3);
scene.add(candleLeft);

const candleRight = new THREE.PointLight(0xffaa00, 1.5, 10);
candleRight.position.set(3, 2, 3);
scene.add(candleRight);

// Front Fill (Soft Warmth)
const frontFill = new THREE.DirectionalLight(0xffddaa, 0.5);
frontFill.position.set(0, 1, 5);
scene.add(frontFill);

// Cabinet
const cabinet = new Cabinet(scene);

// Shadow Catcher (Floor)
// A transparent plane that only shows shadows
const shadowGeo = new THREE.PlaneGeometry(10, 10);
const shadowMat = new THREE.ShadowMaterial({
    opacity: 0.6,
    color: 0x000000
});
const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = 0; // At the feet of the cabinet
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// Interaction
const interaction = new Interaction(camera, scene, cabinet.drawers);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    interaction.update(delta);

    renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
