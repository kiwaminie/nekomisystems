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

/** Encuentra el rigid body del ragdoll más cercano a un punto world. */
function findNearestBoneBody(point) {
  let nearest = null;
  let nearestDist = Infinity;

  state.boneBodies.forEach((entry) => {
    const bodyPos = new THREE.Vector3(
      entry.body.position.x,
      entry.body.position.y,
      entry.body.position.z
    );
    const dist = bodyPos.distanceTo(point);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = entry;
    }
  });

  return nearest;
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
  if (!state.camera || !state.model || !state.physicsWorld) return;

  updateMouseNDC(event);
  raycaster.setFromCamera(mouseNDC, state.camera);

  const intersections = raycaster.intersectObject(state.model, true);
  console.log('[mikurig] mousedown intersections:', intersections.length, 'model pos', state.model.position.y.toFixed(3));
  if (intersections.length === 0) return;

  const hitPoint = intersections[0].point;
  const rootEntry = state.boneBodies.get('__root__');
  if (!rootEntry) return;

  // Distancia fija del objeto al clickear, usada para arrastrar en 3D.
  state.dragDistance = state.camera.position.distanceTo(hitPoint);

  // Body estático que representa el cursor del mouse en el mundo físico.
  const mouseBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(hitPoint.x, hitPoint.y, hitPoint.z),
    shape: new CANNON.Sphere(0.01),
  });
  mouseBody.collisionFilterGroup = 0;
  mouseBody.collisionFilterMask = 0;
  state.physicsWorld.addBody(mouseBody);
  state.mouseBody = mouseBody;

  // Constraint que une el body raíz con el cursor.
  const pivot = worldToLocalPivot(hitPoint, rootEntry.body);
  const constraint = new CANNON.PointToPointConstraint(
    rootEntry.body,
    new CANNON.Vec3(pivot.x, pivot.y, pivot.z),
    mouseBody,
    new CANNON.Vec3(0, 0, 0)
  );
  state.physicsWorld.addConstraint(constraint);
  state.mouseConstraint = constraint;
  state.draggedBone = null;

  // Desactivar temporalmente los controles de cámara para no girar la vista.
  if (state.controls) {
    state.controls.enabled = false;
  }
}

function onMouseMove(event) {
  if (!state.mouseBody || state.dragDistance == null || !state.camera) return;

  updateMouseNDC(event);
  raycaster.setFromCamera(mouseNDC, state.camera);

  // Colocar el cursor físico a la distancia fija del clic inicial, permitiendo
  // arrastrar el objeto hacia y desde la cámara.
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
