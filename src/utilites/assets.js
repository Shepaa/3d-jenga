import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

export const floorAlphaTexture = textureLoader.load('./textures/floor/alpha.webp');
export const floorColorTexture = textureLoader.load(
    './textures/floor/aerial_grass_rock_1k/aerial_grass_rock_diff_1k.webp');
export const floorARMTexture = textureLoader.load(
    './textures/floor/aerial_grass_rock_1k/aerial_grass_rock_arm_1k.webp');
export const floorNormalTexture = textureLoader.load(
    './textures/floor/aerial_grass_rock_1k/aerial_grass_rock_nor_gl_1k.webp');
export const floorDisplacementTexture = textureLoader.load(
    './textures/floor/aerial_grass_rock_1k/aerial_grass_rock_disp_1k.webp');

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

floorColorTexture.repeat.set(8, 8);
floorARMTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.repeat.set(8, 8);

floorColorTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;

floorColorTexture.wrapT = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;
floorColorTexture.repeat.set(8, 8);
floorARMTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.repeat.set(8, 8);

export const wallColorTexture = textureLoader.load(
    './textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp');

wallColorTexture.colorSpace = THREE.SRGBColorSpace;
export const wallARMTexture = textureLoader.load(
    './textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp');
export const wallNormalTexture = textureLoader.load(
    './textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp');




