import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { state } from './state.js';
import { initPhysicsWorld, createRigidBody, updatePhysics } from './physics.js';
import { buildRagdoll, resetRagdoll, syncPhysicsToBones } from './ragdoll.js';
import { initMouseInteraction } from './interaction.js';

export async function InitializeRender() {
  initPhysicsWorld();

  // ─── Escena ───
  const scene = new THREE.Scene();
  state.scene = scene;
  scene.background = new THREE.Color(0x111116);
  scene.fog = new THREE.Fog(0x111116, 10, 60);

  // ─── Cámara ───
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  state.camera = camera;
  camera.position.set(0, 1.6, 4.5);
  camera.lookAt(0, 1, 0);

  // ─── Renderer ───
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer = renderer;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x111116, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // ─── Interacción con mouse ───
  initMouseInteraction(renderer.domElement);

  // ─── Controles ───
  const controls = new OrbitControls(camera, renderer.domElement);
  state.controls = controls;
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.5;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // evitar pasar bajo el suelo
  controls.update();

  // ─── Luces ───
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x8b7bff, 0.4);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // ─── Carga del modelo ───
  await loadModel(scene);

  // ─── Ragdoll ───
  buildRagdoll();

  // Ajustar cámara y entorno al tamaño real del modelo para asegurar
  // que sea visible desde el primer frame.
  fitCameraToModel(camera, controls, state.model);
  createEnvironment(scene, state.model);

  // Levantar el body inicial para que el modelo caiga desde el aire.
  state.boneBodies.forEach(({ body }) => {
    body.position.y += 1.0;
  });
  syncPhysicsToBones();

  console.log('[mikurig] model loaded, scale', state.model.scale.x.toFixed(2), 'model pos', state.model.position.y.toFixed(2), 'camera pos', camera.position.x.toFixed(2), camera.position.y.toFixed(2), camera.position.z.toFixed(2));

  // Fuerza un primer render para que el modelo sea visible antes de que
  // el loop de animación acumule errores de integración numérica.
  renderer.render(scene, camera);

  // ─── Resize ───
  window.addEventListener('resize', onWindowResize);

  // ─── Loop único ───
  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(state.clock.getDelta(), 0.05);

    if (state.model) {
      // La física es la fuente de verdad del ragdoll; solo copiamos de
      // vuelta a los huesos para que el mesh renderizado la siga.
      updatePhysics(delta);
      syncPhysicsToBones();

      // Diagnóstico: delta, posición del modelo y del body cada 10 frames.
      if (state.frameCount === undefined) state.frameCount = 0;
      state.frameCount++;
      if (state.frameCount % 10 === 0) {
        const hips = state.boneBodies.get('Hips_05');
        if (hips) {
          console.log('[mikurig] delta', delta.toFixed(4), 'model pos', state.model.position.y.toFixed(3), 'hips pos', hips.body.position.y.toFixed(3), 'hips vel', hips.body.velocity.y.toFixed(3));
        }
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

/** Carga el modelo GLTF de Miku y lo añade a la escena. */
function loadModel(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/mikurig/models/miku/scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        state.model = model;
        scene.add(model);

        model.position.set(0, 0, 0);
        // El GLTF de Miku viene en escala muy pequeña; normalizamos la altura
        // a ~1.7 unidades para que la cámara y el mundo físico sean coherentes.
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const targetHeight = 1.7;
        const scale = size.y > 0 ? targetHeight / size.y : 100;
        model.scale.set(scale, scale, scale);
        model.updateMatrixWorld(true);

        // Colocar el modelo de pie sobre el suelo (pies en y=0).
        const scaledBox = new THREE.Box3().setFromObject(model);
        const minY = scaledBox.min.y;
        model.position.y = -minY;
        model.updateMatrixWorld(true);

        // Ajustar materiales para sombras
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = false;
          }
          if (child.isSkinnedMesh && !state.skeleton) {
            state.skeleton = child.skeleton;
          }
        });

        if (!state.skeleton) {
          console.warn('[mikurig] no skeleton found in model');
        }

        hideLoading();
        resolve(model);
      },
      undefined,
      (error) => {
        console.error('Error al cargar GLTF:', error);
        reject(error);
      }
    );
  });
}

/** Ajusta cámara y controles para que el modelo sea visible completamente. */
function fitCameraToModel(camera, controls, model) {
  if (!model) return;

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.4;

  camera.position.set(center.x, center.y + maxDim * 0.35, center.z + distance);
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}

/** Crea suelo y paredes invisibles para contener el ragdoll. */
function createEnvironment(scene, model) {
  // Estimar tamaño necesario del entorno a partir del modelo.
  let envSize = 40;
  let envHeight = 20;
  if (model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    envSize = Math.max(40, maxDim * 4);
    envHeight = Math.max(20, maxDim * 2);
  }

  // Suelo
  const floorGeo = new THREE.PlaneGeometry(envSize, envSize);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x22222a,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const groundShape = new CANNON.Plane();
  const groundBody = createRigidBody(new THREE.Vector3(0, 0, 0), groundShape, 0);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  state.staticBodies.push(groundBody);

  // Paredes invisibles (caja grande)
  const wallMat = new THREE.MeshBasicMaterial({
    color: 0x111116,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
  });
  const halfSize = envSize / 2;
  const walls = [
    { pos: [0, envHeight / 2, -halfSize], size: [envSize, envHeight, 0.5] },
    { pos: [0, envHeight / 2, halfSize], size: [envSize, envHeight, 0.5] },
    { pos: [-halfSize, envHeight / 2, 0], size: [0.5, envHeight, envSize] },
    { pos: [halfSize, envHeight / 2, 0], size: [0.5, envHeight, envSize] },
  ];
  walls.forEach(({ pos, size }) => {
    const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(...pos);
    scene.add(mesh);

    const halfExtents = new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2);
    const shape = new CANNON.Box(halfExtents);
    const body = createRigidBody(mesh.position, shape, 0);
    state.staticBodies.push(body);
  });
}

/** Redimensiona renderer y cámara al cambiar el tamaño de ventana. */
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  state.renderer.setSize(width, height);
  state.camera.aspect = width / height;
  state.camera.updateProjectionMatrix();
}

/** Expuesto para el botón de reset en la UI. */
export function resetModel() {
  resetRagdoll();
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
  }
}
