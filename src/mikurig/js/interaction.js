import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { state } from './state.js';

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();
let canvasElement = null;

function updateMouseNDC(event) {
  if (!canvasElement) return;
  const rect = canvasElement.getBoundingClientRect();
  mouseNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

/** Crea un cuerpo estático para el cursor del mouse. */
function createMouseBody(point) {
  const mouseBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(point.x, point.y, point.z),
    shape: new CANNON.Sphere(0.01),
    collisionFilterGroup: 0,
    collisionFilterMask: 0,
  });
  state.physicsWorld.addBody(mouseBody);
  return mouseBody;
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

function onMouseDown(event) {
  if (!state.camera || !state.physicsWorld || state.boneBodies.size === 0) return;

  updateMouseNDC(event);
  raycaster.setFromCamera(mouseNDC, state.camera);

  // 1) Intentar intersectar contra el mesh visible primero.
  let hitPoint = null;
  if (state.model) {
    const intersections = raycaster.intersectObject(state.model, true);
    if (intersections.length > 0) {
      hitPoint = intersections[0].point;
    }
  }

  // 2) Fallback: raycast físico contra los cuerpos del ragdoll.
  let hitBody = null;
  if (!hitPoint) {
    const rayFrom = new CANNON.Vec3(raycaster.ray.origin.x, raycaster.ray.origin.y, raycaster.ray.origin.z);
    const rayTo = new CANNON.Vec3(
      raycaster.ray.origin.x + raycaster.ray.direction.x * 100,
      raycaster.ray.origin.y + raycaster.ray.direction.y * 100,
      raycaster.ray.origin.z + raycaster.ray.direction.z * 100
    );
    const rayResult = new CANNON.RaycastResult();
    state.physicsWorld.raycastClosest(rayFrom, rayTo, {}, rayResult);
    if (rayResult.body) {
      hitBody = rayResult.body;
      hitPoint = new THREE.Vector3(rayResult.hitPointWorld.x, rayResult.hitPointWorld.y, rayResult.hitPointWorld.z);
    }
  }

  if (!hitPoint) return;

  // 3) Determinar cuál body del ragdoll vamos a arrastrar.
  let targetEntry = null;
  if (hitBody) {
    state.boneBodies.forEach((entry) => {
      if (entry.body === hitBody) targetEntry = entry;
    });
  }
  if (!targetEntry) {
    // Si no hay body directo, elegir el body más cercano al punto de impacto.
    let nearestDist = Infinity;
    state.boneBodies.forEach((entry) => {
      const bodyPos = new THREE.Vector3(entry.body.position.x, entry.body.position.y, entry.body.position.z);
      const dist = bodyPos.distanceTo(hitPoint);
      if (dist < nearestDist) {
        nearestDist = dist;
        targetEntry = entry;
      }
    });
  }
  if (!targetEntry) return;

  state.dragDistance = state.camera.position.distanceTo(hitPoint);
  state.draggedBone = targetEntry;

  const mouseBody = createMouseBody(hitPoint);
  state.mouseBody = mouseBody;

  const pivot = worldToLocalPivot(hitPoint, targetEntry.body);
  const constraint = new CANNON.PointToPointConstraint(
    targetEntry.body,
    new CANNON.Vec3(pivot.x, pivot.y, pivot.z),
    mouseBody,
    new CANNON.Vec3(0, 0, 0)
  );
  state.physicsWorld.addConstraint(constraint);
  state.mouseConstraint = constraint;

  if (state.controls) {
    state.controls.enabled = false;
  }
}

function onMouseMove(event) {
  if (!state.mouseBody || state.dragDistance == null || !state.camera) return;

  updateMouseNDC(event);
  raycaster.setFromCamera(mouseNDC, state.camera);

  const hit = new THREE.Vector3()
    .copy(raycaster.ray.origin)
    .add(raycaster.ray.direction.clone().multiplyScalar(state.dragDistance));

  state.mouseBody.position.set(hit.x, hit.y, hit.z);
  state.mouseBody.wakeUp();
}

function onMouseUp() {
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
  state.draggedBone = null;

  if (state.controls) {
    state.controls.enabled = true;
  }
}

export function initMouseInteraction(domElement) {
  canvasElement = domElement;
  domElement.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
