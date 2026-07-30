import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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

  // ─── Cámara fija (sin OrbitControls) ───
  // La cámara permanece estática para dar la ilusión de que Miku está dentro
  // de una caja y el usuario observa desde la "cuarta pared". No hay controles
  // orbitales: no se puede rotar, hacer zoom ni desplazar la vista.
  state.controls = null;

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

  // Construir la caja y encuadrar la cámara fija para ver todo el interior
  // desde el primer frame.
  createEnvironment(scene, state.model);
  fitCameraToBox(camera);

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

/**
 * Coloca la cámara en una posición fija frente a la "cuarta pared" abierta,
 * encuadrando toda la caja (ancho y alto) según el aspect ratio actual.
 */
function fitCameraToBox(camera) {
  const size = state.boxSize;
  if (!size) return;

  const { W, H } = size;
  const aspect = camera.aspect || window.innerWidth / window.innerHeight;
  const fov = camera.fov * (Math.PI / 180);
  const tan = Math.tan(fov / 2);

  // Distancia necesaria para que quepan tanto el alto como el ancho.
  const distForHeight = (H / 2) / tan;
  const distForWidth = (W / 2) / (tan * aspect);
  const margin = 1.12;
  const distance = Math.max(distForHeight, distForWidth) * margin;

  // Centro vertical de la caja; la cámara mira recto hacia el interior (-z).
  const targetY = H / 2;
  camera.position.set(0, targetY, W / 2 + distance);
  camera.lookAt(0, targetY, 0);
  camera.updateProjectionMatrix();
}

/**
 * Crea la "caja" que contiene a Miku: suelo, techo y cuatro paredes.
 * La pared frontal (hacia la cámara) es la "cuarta pared": existe físicamente
 * para contener el ragdoll, pero es invisible para que el usuario mire dentro.
 */
function createEnvironment(scene, model) {
  // Dimensionar la caja de forma ajustada al modelo para que Miku realmente
  // choque contra las paredes en lugar de flotar en un espacio enorme.
  let modelHeight = 1.7;
  let modelWidth = 0.6;
  if (model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    modelHeight = size.y || modelHeight;
    modelWidth = Math.max(size.x, size.z) || modelWidth;
  }

  // Interior de la caja (ancho/profundo cuadrado + alto).
  const W = Math.max(2.4, modelWidth * 3.2);
  const H = Math.max(2.6, modelHeight * 1.7);
  const half = W / 2;
  const t = 0.2; // grosor de pared

  // Guardar dimensiones para encuadrar la cámara fija (y recalcular en resize).
  state.boxSize = { W, H };

  // ─── Suelo visible ───
  const floorGeo = new THREE.PlaneGeometry(W, W);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x22222a,
    roughness: 0.85,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Suelo físico: plano infinito a y = 0 (coincide con el suelo visible).
  const groundShape = new CANNON.Plane();
  const groundBody = createRigidBody(new THREE.Vector3(0, 0, 0), groundShape, 0);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  state.staticBodies.push(groundBody);

  // Materiales de paredes: paneles semitransparentes visibles vs. invisibles.
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a38,
    roughness: 0.9,
    metalness: 0.05,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const invisibleMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  // La cámara mira hacia -z desde +z, así que el frente abierto es +z.
  const walls = [
    { pos: [0, H / 2, -half], size: [W, H, t], mat: panelMat },       // fondo
    { pos: [-half, H / 2, 0], size: [t, H, W], mat: panelMat },       // izquierda
    { pos: [half, H / 2, 0], size: [t, H, W], mat: panelMat },        // derecha
    { pos: [0, H / 2, half], size: [W, H, t], mat: invisibleMat },    // cuarta pared (abierta)
    { pos: [0, H, 0], size: [W, t, W], mat: invisibleMat },           // techo
  ];
  walls.forEach(({ pos, size, mat }) => {
    const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.receiveShadow = true;
    scene.add(mesh);

    const halfExtents = new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2);
    const shape = new CANNON.Box(halfExtents);
    const body = createRigidBody(new THREE.Vector3(pos[0], pos[1], pos[2]), shape, 0);
    state.staticBodies.push(body);
  });

  // Contorno tipo wireframe para que la caja se lea claramente.
  const cageGeo = new THREE.BoxGeometry(W, H, W);
  const edges = new THREE.EdgesGeometry(cageGeo);
  const cage = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x5f3fff, transparent: true, opacity: 0.5 })
  );
  cage.position.set(0, H / 2, 0);
  scene.add(cage);
}

/** Redimensiona renderer y cámara al cambiar el tamaño de ventana. */
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  state.renderer.setSize(width, height);
  state.camera.aspect = width / height;
  state.camera.updateProjectionMatrix();
  // Reencuadrar la caja para que siga vista completa (importante en móvil).
  fitCameraToBox(state.camera);
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
