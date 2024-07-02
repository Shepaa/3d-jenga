import * as THREE from 'three';
import {sizes} from '../size/size.js';

export const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.05,
    100);
const cameraHeight = 0.1; // Высота камеры над полом
camera.position.set(0, cameraHeight, 0); // Устанавливаем камеру прямо над полом