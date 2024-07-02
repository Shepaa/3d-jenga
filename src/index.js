import * as THREE from 'three';
import CANNON from 'cannon';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  floorAlphaTexture,
  floorARMTexture,
  floorColorTexture,
  floorDisplacementTexture,
  floorNormalTexture,
  wallARMTexture,
  wallColorTexture,
  wallNormalTexture,
} from './utilites/assets.js';
import {ambientLight} from './utilites/lights /ambientLight.js';
import {directionalLight} from './utilites/lights /directinalLight.js';
import {resizeFunc} from './utilites/size/resizeFunc.js';
import {sizes} from './utilites/size/size.js';
import {camera} from './utilites/camera/camera.js';
import {buildTower} from './utilites/buildTower/buildTower.js';
import {keys} from './utilites/Controls/Keys/keys.js';

const hitSound = new Audio('/sounds/hit.mp3');

const gltfLoader = new GLTFLoader();
let ballModel;

document.addEventListener('mousemove', (event) => {

    mouseX -= event.movementX * mouseSensitivity;
    mouseY -= event.movementY * mouseSensitivity;

    // Ограничиваем вертикальный поворот камеры
    mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));
});

// В начале файла, после объявления canvas
const instructions = document.getElementById('instructions');

function hideInstructions() {
  instructions.style.display = 'none';
}

function showInstructions() {
  instructions.style.display = 'flex';
}



gltfLoader.load(
    '/models/ball/footballsoccer_ball.glb',
    (gltf) => {
      console.log(gltf.scene);
      ballModel = gltf.scene;
      ballModel.scale.setScalar(0.4);
    },
);
const playHitSound = (collision) => {
  const impactValue = collision.contact.getImpactVelocityAlongNormal();
  if (impactValue > 1.5) {
    hitSound.volume = Math.random();
    hitSound.currentTime = 0;
    hitSound.play();
  }
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 *World
 */
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.gravity.set(0, -9, 0);
/**
 * Shape
 */

const defaultMaterial = new CANNON.Material('defaultMaterial');

const floorMaterial = new CANNON.Material('floorMaterial');
const ballMaterial = new CANNON.Material('ballMaterial');

const floorBallContactMaterial = new CANNON.ContactMaterial(
    ballMaterial, floorMaterial,
    {
      friction: 0.5,
      restitution: 0.7,
    },
);

world.addContactMaterial(floorBallContactMaterial);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body;
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5,
);
floorBody.material = defaultMaterial;
world.addBody(floorBody);

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4), // размер пола
    new THREE.MeshStandardMaterial({
      transparent: true,
      alphaMap: floorAlphaTexture,
      map: floorColorTexture,
      aoMap: floorARMTexture,
      normalMap: floorNormalTexture,
      displacementMap: floorDisplacementTexture,
      displacementScale: 0.001,
      metalnessMap: floorARMTexture,
      roughnessMap: floorARMTexture,
      color: '#777777',
      metalness: 0.3,
      roughness: 0.4,
    }),
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */

scene.add(ambientLight);
scene.add(directionalLight);

/**
 * Sizes
 */

window.addEventListener('resize', () => resizeFunc(sizes, camera, renderer));

/**
 * Camera
 */
// Base camera
const cameraHeight = 0.1; // Высота камеры над полом
scene.add(camera);

// Физическое тело для камеры
const cameraShape = new CANNON.Sphere(0.1); // Радиус сферы коллизии
const cameraBody = new CANNON.Body({
  mass: 0, // Масса тела камеры
  shape: cameraShape,
  material: defaultMaterial,
});

world.addBody(cameraBody);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const objectToUpdate = [];
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  map: wallColorTexture,
  aoMap: wallARMTexture,
  roughnessMap: wallARMTexture,
  metalnessMap: wallARMTexture,
  normalMap: wallNormalTexture,
});

const createBox = (width, height, depth, position) => {

  // Three.js mesh
  const mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.position.set(position.x, position.y, position.z);
  scene.add(mesh);

  // // Cannon.js body
  const shape = new CANNON.Box(
      new CANNON.Vec3(width / 2, height / 2, depth / 2));

  const body = new CANNON.Body({
    mass: 2,
    position: new CANNON.Vec3(position.x, position.y, position.z),
    shape: shape,
    material: defaultMaterial,
  });
  body.sleepSpeedLimit = 1.0;
  body.addEventListener('collide', playHitSound);
  world.addBody(body);

  // Save in objects
  objectToUpdate.push({mesh, body});
};


function createSphere(position, velocity) {
  if (!ballModel) {
    console.error('Ball model not loaded yet');
    return;
  }

  const ballMesh = ballModel.clone();
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  ballMesh.position.copy(position);
  scene.add(ballMesh);

  const shape = new CANNON.Sphere(0.035);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(position.x, position.y, position.z),
    shape: shape,
    material: ballMaterial,
  });
  body.velocity.copy(velocity);
  body.linearDamping = 0.4; // Добавление угасания скорости
  body.angularDamping = 0.4; // Добавление угасания угловой скорости
  body.addEventListener('collide', playHitSound);
  world.addBody(body);

  objectToUpdate.push({mesh: ballMesh, body: body});



}

window.addEventListener('click', () => {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  // Создаем вектор скорости (направление * скорость)
  const speed = 5; // Настройте скорость по вашему усмотрению
  const velocity = cameraDirection.multiplyScalar(speed); // TODO понять как

  createSphere(camera.position, velocity);
});

const towerWidth = 4;
const towerHeight = 3;
const cubeSize = 0.1; // Размер каждого куба
const startX = -0.3; // Начальная позиция по X
const startY = cubeSize / 2; // Начальная позиция по Y (половина высоты куба)
const startZ = -1; // Начальная позиция по Z

buildTower(towerHeight, towerWidth, startX, startY, startZ, cubeSize,
    createBox);
/**
 * Controls
 */
const moveSpeed = 0.005;
const mouseSensitivity = 0.002;
const jumpForce = 0.1;
const gravity = 0.01;
let verticalVelocity = 0;
let isOnGround = true;

document.addEventListener('keydown', (event) => {
  if (event.code in keys) {
    keys[event.code] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.code in keys) {
    keys[event.code] = false;
  }
});

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX -= event.movementX * mouseSensitivity;
  mouseY -= event.movementY * mouseSensitivity;

  // Ограничиваем вертикальный поворот камеры
  mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));
});
showInstructions()
// Обработчик клика на canvas
window.addEventListener('click', () => {
  if (!document.pointerLockElement) {
    canvas.requestPointerLock();
    hideInstructions()
  }
});



/**
 * Animate
 */
world.allowSleep = true;

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Обновление поворота камеры
  camera.rotation.order = 'YXZ';
  camera.rotation.y = mouseX;
  camera.rotation.x = mouseY;

  // Обновление позиции камеры
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  // console.log(cameraDirection);

  // Проецируем направление камеры на горизонтальную плоскость
  cameraDirection.y = 0;
  cameraDirection.normalize();
  const cameraRight = new THREE.Vector3(-cameraDirection.z, -1,
      cameraDirection.x).normalize();

  if (keys.KeyW || keys.ArrowUp) {
    camera.position.addScaledVector(cameraDirection, moveSpeed);
  }
  if (keys.KeyS || keys.ArrowDown) {
    camera.position.addScaledVector(cameraDirection, -moveSpeed);
  }
  if (keys.KeyA || keys.ArrowLeft) {
    camera.position.addScaledVector(cameraRight, -moveSpeed);
  }
  if (keys.KeyD || keys.ArrowRight) {
    camera.position.addScaledVector(cameraRight, moveSpeed);
  }

  // Прыжок
  if (keys.Space && isOnGround) {
    verticalVelocity = jumpForce;
    isOnGround = false;
  }

  // Применяем гравитацию
  verticalVelocity -= gravity;
  camera.position.y += verticalVelocity;

  // Проверяем столкновение с землей
  if (camera.position.y < cameraHeight) {
    camera.position.y = cameraHeight;
    verticalVelocity = 0;
    isOnGround = true;
  }

  objectToUpdate.forEach((object, index) => {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);


  });
  // controls.update();
  cameraBody.position.copy(camera.position);
  // Render
  renderer.render(scene, camera);

  world.step(1 / 60, deltaTime, 3);
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();