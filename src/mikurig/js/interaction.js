import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { state } from './state.js';

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let canvasElement = null;
/** Id del puntero activo para soportar un único drag a la vez (mouse o dedo). */
let activePointerId = null;

/** Grupo de colisión del ragdoll (ver ragdoll.js). */
const RAGDOLL_GROUP = 2;

function updatePointerNDC(event) {
  if (!canvasElement) return;
  const rect = canvasElement.getBoundingClientRect();
  pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

/** Crea un cuerpo cinemático (sin colisiones) que sigue al puntero. */
function createPointerBody(point) {
  const body = new CANNON.Body({
    mass: 0,
    type: CANNON.Body.KINEMATIC,
    position: new CANNON.Vec3(point.x, point.y, point.z),
    shape: new CANNON.Sphere(0.02),
    collisionFilterGroup: 0,
    collisionFilterMask: 0,
  });
  state.physicsWorld.addBody(body);
  return body;
}

/** Convierte un punto world al espacio local de un body Cannon. */
function worldToLocalPivot(point, body) {
  const bodyPos = new THREE.Vector3(body.position.x, body.position.y, body.position.z);
  const bodyQuat = new THREE.Quaternion(
    body.quaternion.x,
    body.quaternion.y,
    body.quaternion.z,
    body.quaternion.w
  );
  return point.clone().sub(bodyPos).applyQuaternion(bodyQuat.clone().invert());
}

/**
 * Determina qué cuerpo arrastrable (hueso del ragdoll o esfera) está bajo el
 * puntero. Ambos comparten el grupo de colisión 2.
 * @returns {{ body: CANNON.Body, point: THREE.Vector3 } | null}
 */
function pickTarget() {
  raycaster.setFromCamera(pointerNDC, state.camera);

  let hitPoint = null;
  let hitBody = null;

  // 1) Raycast físico limitado a objetos arrastrables (ignora suelo/paredes).
  const origin = raycaster.ray.origin;
  const dir = raycaster.ray.direction;
  const rayFrom = new CANNON.Vec3(origin.x, origin.y, origin.z);
  const rayTo = new CANNON.Vec3(
    origin.x + dir.x * 100,
    origin.y + dir.y * 100,
    origin.z + dir.z * 100
  );
  const result = new CANNON.RaycastResult();
  state.physicsWorld.raycastClosest(
    rayFrom,
    rayTo,
    { collisionFilterMask: RAGDOLL_GROUP, skipBackfaces: false },
    result
  );
  if (result.hasHit && result.body) {
    hitBody = result.body;
    hitPoint = new THREE.Vector3(
      result.hitPointWorld.x,
      result.hitPointWorld.y,
      result.hitPointWorld.z
    );
  }

  // 2) Fallback: intersección contra el mesh visible de Miku.
  if (!hitPoint && state.model) {
    const intersections = raycaster.intersectObject(state.model, true);
    if (intersections.length > 0) {
      hitPoint = intersections[0].point.clone();
    }
  }

  if (!hitPoint) return null;

  // 3) El raycast físico ya devuelve el cuerpo golpeado (hueso o esfera).
  if (hitBody) {
    return { body: hitBody, point: hitPoint };
  }

  // Sin body directo (solo golpeó el mesh): elegir el hueso más cercano.
  let nearestBody = null;
  let nearestDist = Infinity;
  state.boneBodies.forEach((e) => {
    const bodyPos = new THREE.Vector3(e.body.position.x, e.body.position.y, e.body.position.z);
    const dist = bodyPos.distanceTo(hitPoint);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestBody = e.body;
    }
  });
  if (!nearestBody) return null;

  return { body: nearestBody, point: hitPoint };
}

function onPointerDown(event) {
  if (activePointerId !== null) return;
  if (!state.camera || !state.physicsWorld) return;

  updatePointerNDC(event);
  const picked = pickTarget();
  if (!picked) return;

  event.preventDefault();
  activePointerId = event.pointerId;
  if (canvasElement && canvasElement.setPointerCapture) {
    try {
      canvasElement.setPointerCapture(event.pointerId);
    } catch (_) {
      /* ignorar */
    }
  }

  const { body, point } = picked;
  state.dragDistance = state.camera.position.distanceTo(point);
  state.draggedBody = body;

  const pointerBody = createPointerBody(point);
  state.mouseBody = pointerBody;

  const pivot = worldToLocalPivot(point, body);
  const constraint = new CANNON.PointToPointConstraint(
    body,
    new CANNON.Vec3(pivot.x, pivot.y, pivot.z),
    pointerBody,
    new CANNON.Vec3(0, 0, 0)
  );
  constraint.collideConnected = false;
  state.physicsWorld.addConstraint(constraint);
  state.mouseConstraint = constraint;

  body.wakeUp();

  // Desactivar OrbitControls mientras se arrastra (evita rotar la cámara).
  if (state.controls) {
    state.controls.enabled = false;
  }
}

function onPointerMove(event) {
  if (activePointerId !== event.pointerId) return;
  if (!state.mouseBody || state.dragDistance == null || !state.camera) return;

  updatePointerNDC(event);
  raycaster.setFromCamera(pointerNDC, state.camera);

  const hit = new THREE.Vector3()
    .copy(raycaster.ray.origin)
    .add(raycaster.ray.direction.clone().multiplyScalar(state.dragDistance));

  state.mouseBody.position.set(hit.x, hit.y, hit.z);
  state.mouseBody.wakeUp();
  if (state.draggedBody) {
    state.draggedBody.wakeUp();
  }
}

function onPointerUp(event) {
  if (activePointerId !== event.pointerId) return;
  activePointerId = null;

  if (canvasElement && canvasElement.releasePointerCapture) {
    try {
      canvasElement.releasePointerCapture(event.pointerId);
    } catch (_) {
      /* ignorar */
    }
  }

  if (!state.physicsWorld) return;

  if (state.mouseConstraint) {
    state.physicsWorld.removeConstraint(state.mouseConstraint);
    state.mouseConstraint = null;
  }
  if (state.mouseBody) {
    state.physicsWorld.removeBody(state.mouseBody);
    state.mouseBody = null;
  }
  state.dragPlane = null;
  state.dragDistance = null;
  state.draggedBody = null;

  if (state.controls) {
    state.controls.enabled = true;
  }
}

export function initMouseInteraction(domElement) {
  canvasElement = domElement;
  // Evita el scroll/zoom nativo del navegador al arrastrar en pantallas táctiles.
  domElement.style.touchAction = 'none';

  // Pointer Events unifican mouse y touch en una sola API.
  domElement.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}
