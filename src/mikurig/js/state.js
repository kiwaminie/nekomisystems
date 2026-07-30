import * as THREE from 'three';

/**
 * Estado compartido entre render y física para evitar variables globales
 * sueltas y loops duplicados.
 */
export const state = {
  scene: null,
  camera: null,
  renderer: null,
  /** OrbitControls o null cuando la cámara es fija (vista "cuarta pared"). */
  controls: null,
  /** { W, H } de la caja para encuadrar la cámara fija. */
  boxSize: null,
  clock: new THREE.Clock(),
  physicsWorld: null,
  model: null,
  skeleton: null,
  /** Map<bone.uuid, { body, bone, initialMatrix }> */
  boneBodies: new Map(),
  constraints: [],
  /** Lista de bodies estáticos (suelo, paredes) para no mezclarlos con el ragdoll */
  staticBodies: [],
  /** Estado del drag con mouse */
  mouseBody: null,
  mouseConstraint: null,
  dragPlane: null,
  dragDistance: null,
  draggedBone: null,
  /** Matriz inversa del padre de Hips para transformar world -> local del armature */
  hipsParentWorldMatInv: null,
  /** Quaternion world del armature para transformar world -> local del armature */
  armatureWorldQuat: null,
};

/** Guarda la referencia del mundo físico una vez inicializado. */
export function setPhysicsWorld(world) {
  state.physicsWorld = world;
}
