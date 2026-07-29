import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { state } from './state.js';
import { createRigidBody, setBodyTransform } from './physics.js';

const RAGDOLL_BODY_MASS = 5.0;

/**
 * Crea el ragdoll simplificado: un solo body rígido que representa al modelo
 * completo, sincronizado con la posición/rotación del modelo. Esto es estable y
 * permite caer, rebotar y ser arrastrado con el mouse.
 */
export function buildRagdoll() {
  const { model } = state;
  if (!model) return;

  clearRagdoll();

  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Caja de colisión que cubre aproximadamente el modelo.
  const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
  const shape = new CANNON.Box(halfExtents);
  const body = createRigidBody(center, shape, RAGDOLL_BODY_MASS);
  body.collisionFilterGroup = 2;
  body.collisionFilterMask = 1;
  body.linearDamping = 0.2;
  body.angularDamping = 0.2;

  // Guardar el body en una clave especial para mantener la API existente.
  state.boneBodies.set('__root__', {
    body,
    bone: null,
    initialMatrix: new THREE.Matrix4().setPosition(center),
  });

  // Almacenar la posición local del centro del body respecto al modelo,
  // para poder sincronizar el modelo con el body en cada frame.
  state.ragdollCenterOffset = center.clone().sub(model.position);

  console.log('[mikurig] buildRagdoll: single body at', center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2), 'size', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));
}

/** Limpia cuerpos y constraints previos. */
export function clearRagdoll() {
  const { physicsWorld, boneBodies } = state;
  if (!physicsWorld) return;

  boneBodies.forEach(({ body }) => {
    physicsWorld.removeBody(body);
  });
  state.boneBodies.clear();
  state.ragdollCenterOffset = null;
}

/** Sincroniza el modelo visual con el body rígido. */
export function syncPhysicsToBones() {
  const { model, boneBodies, ragdollCenterOffset } = state;
  if (!model || !boneBodies.has('__root__')) return;

  const { body } = boneBodies.get('__root__');
  const bodyPos = new THREE.Vector3(body.position.x, body.position.y, body.position.z);
  const bodyQuat = new THREE.Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);

  // Mover el modelo para que coincida con el body; el centro del body sigue al
  // centro del bounding box, así que restamos el offset del centro.
  model.position.copy(bodyPos).sub(ragdollCenterOffset);
  model.quaternion.copy(bodyQuat);
  model.updateMatrixWorld(true);
}

/** Resetea el ragdoll a su posición inicial. */
export function resetRagdoll() {
  const { boneBodies } = state;
  if (!boneBodies.has('__root__')) {
    buildRagdoll();
    return;
  }

  const { body, initialMatrix } = boneBodies.get('__root__');
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  initialMatrix.decompose(pos, quat, new THREE.Vector3());
  setBodyTransform(body, pos, quat);
  syncPhysicsToBones();
}
