import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { state } from './state.js';
import { initPhysicsWorld, createRigidBody, updatePhysics } from './physics.js';
import { buildRagdoll, resetRagdoll, syncPhysicsToBones } from './ragdoll.js';
import { initMouseInteraction } from './interaction.js';

/**
 * Dimensiones interiores de la "caja" (diorama) que encierra a Miku.
 * La caja está centrada en X, apoyada en el suelo (y = 0) y se extiende hacia
 * el fondo en -Z. La cuarta pared (frente, hacia la cámara) queda abierta en z = 0.
 */
const BOX = {
  width: 4.0,
  height: 3.2,
  depth: 3.6,
  thickness: 0.15,
};

export async function InitializeRender() {
  initPhysicsWorld();

  // ─── Escena ───
  const scene = new THREE.Scene();
  state.scene = scene;
  scene.background = new THREE.Color(0x111116);
  scene.fog = new THREE.Fog(0x111116, 10, 60);

  // ─── Cámara ───
  // Vista fija tipo "cuarta pared": la cámara mira de frente hacia el interior
  // de la caja. Su posición se calcula en fitCameraToBox().
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  state.camera = camera;

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
  // La vista es fija ("cuarta pared"): deshabilitamos rotación, zoom y paneo
  // para que la caja quede pegada al viewport. Mantenemos el objeto de
  // controles porque la interacción con el mouse lo referencia.
  const controls = new OrbitControls(camera, renderer.domElement);
  state.controls = controls;
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.target.set(0, BOX.height / 2, -BOX.depth / 2);
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

  // Construir la caja (diorama) y fijar la cámara en la "cuarta pared" para
  // que la caja quede pegada al viewport desde el primer frame.
  createBoxRoom(scene);
  fitCameraToBox(camera, controls);

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

        // Colocar el modelo de pie sobre el suelo (pies en y=0) y centrado
        // dentro de la caja: en el eje X en el centro y en profundidad a la
        // mitad de la caja para que quede encerrado por las paredes.
        const scaledBox = new THREE.Box3().setFromObject(model);
        const minY = scaledBox.min.y;
        model.position.set(0, -minY, -BOX.depth / 2);
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
 * Fija la cámara en la "cuarta pared": mira de frente hacia el interior de la
 * caja a lo largo de -Z. La distancia se calcula para que la boca de la caja
 * (la abertura frontal en z = 0) cubra todo el viewport, de modo que las
 * paredes interiores queden enmarcando los bordes de la pantalla.
 */
function fitCameraToBox(camera, controls) {
  const aspect = window.innerWidth / window.innerHeight;
  const fov = camera.fov * (Math.PI / 180);
  const tan = Math.tan(fov / 2);

  // Distancia a la que la abertura llena exactamente el viewport en cada eje.
  const distForHeight = (BOX.height / 2) / tan;
  const distForWidth = (BOX.width / 2) / (tan * aspect);

  // Usamos la menor (modo "cover") con un pequeño margen para que la abertura
  // siempre cubra el viewport y no se vea el fondo alrededor de la caja.
  const distance = Math.min(distForHeight, distForWidth) * 0.98;

  const centerX = 0;
  const centerY = BOX.height / 2;
  camera.position.set(centerX, centerY, distance);
  camera.lookAt(centerX, centerY, -BOX.depth / 2);
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.set(centerX, centerY, -BOX.depth / 2);
    controls.update();
  }
}

/**
 * Construye la caja (diorama) que encierra a Miku: cinco caras visibles
 * (fondo, suelo, techo, izquierda y derecha) y una cuarta pared frontal abierta
 * hacia la cámara. Cada cara tiene además un cuerpo físico estático para
 * contener el ragdoll, incluyendo una pared frontal invisible.
 */
function createBoxRoom(scene) {
  const { width: W, height: H, depth: D, thickness: T } = BOX;
  const cz = -D / 2; // centro de la caja en profundidad

  // Materiales interiores (tonos oscuros acordes al tema).
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x262634,
    roughness: 0.9,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x2c2946,
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c24,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // ─── Caras visibles ───
  // Fondo (z = -D), mirando hacia +Z.
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), backMat);
  back.position.set(0, H / 2, -D);
  back.receiveShadow = true;
  scene.add(back);

  // Suelo (y = 0).
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, cz);
  floor.receiveShadow = true;
  scene.add(floor);

  // Techo (y = H).
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), wallMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, H, cz);
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  // Pared izquierda (x = -W/2), mirando hacia +X.
  const left = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
  left.rotation.y = Math.PI / 2;
  left.position.set(-W / 2, H / 2, cz);
  left.receiveShadow = true;
  scene.add(left);

  // Pared derecha (x = W/2), mirando hacia -X.
  const right = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
  right.rotation.y = -Math.PI / 2;
  right.position.set(W / 2, H / 2, cz);
  right.receiveShadow = true;
  scene.add(right);

  // ─── Cuerpos físicos estáticos (cajas finas) ───
  // Cada pared se desplaza hacia afuera media unidad de grosor para que la
  // superficie interior coincida con la cara visible.
  const staticWalls = [
    // suelo: superficie superior en y = 0
    { pos: [0, -T / 2, cz], half: [W / 2, T / 2, D / 2] },
    // techo: superficie inferior en y = H
    { pos: [0, H + T / 2, cz], half: [W / 2, T / 2, D / 2] },
    // fondo: superficie frontal en z = -D
    { pos: [0, H / 2, -D - T / 2], half: [W / 2, H / 2, T / 2] },
    // izquierda: superficie interior en x = -W/2
    { pos: [-W / 2 - T / 2, H / 2, cz], half: [T / 2, H / 2, D / 2] },
    // derecha: superficie interior en x = W/2
    { pos: [W / 2 + T / 2, H / 2, cz], half: [T / 2, H / 2, D / 2] },
    // cuarta pared (frontal, invisible): mantiene a Miku dentro de la caja
    { pos: [0, H / 2, T / 2], half: [W / 2, H / 2, T / 2] },
  ];
  staticWalls.forEach(({ pos, half }) => {
    const shape = new CANNON.Box(new CANNON.Vec3(half[0], half[1], half[2]));
    const body = createRigidBody(new THREE.Vector3(pos[0], pos[1], pos[2]), shape, 0);
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
  // Recalcular la posición de la cámara para que la caja siga cubriendo el
  // viewport tras el cambio de proporción.
  fitCameraToBox(state.camera, state.controls);
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
