import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Estado compartido entre render y física para evitar variables globales
 * sueltas y loops duplicados.
 */
export const state = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
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
  /** Offset del centro del body rígido respecto al modelo */
  ragdollCenterOffset: null,
};

/** Guarda la referencia del mundo físico una vez inicializado. */
export function setPhysicsWorld(world) {
  state.physicsWorld = world;
}
