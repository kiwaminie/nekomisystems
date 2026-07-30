import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { state, setPhysicsWorld } from './state.js';

/** Inicializa el mundo de Cannon.js. */
export function initPhysicsWorld() {
  if (state.physicsWorld) return state.physicsWorld;

  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 20;
  world.solver.tolerance = 0.001;

  setPhysicsWorld(world);
  return world;
}

/**
 * Crea un cuerpo rígido y lo añade al mundo.
 * @param {THREE.Vector3} position
 * @param {CANNON.Shape} shape
 * @param {number} mass 0 = estático
 * @param {THREE.Quaternion} [rotation]
 * @returns {CANNON.Body}
 */
export function createRigidBody(position, shape, mass, rotation) {
  if (!state.physicsWorld) throw new Error('El mundo físico no está inicializado');

  const body = new CANNON.Body({
    mass,
    position: new CANNON.Vec3(position.x, position.y, position.z),
    shape,
    material: new CANNON.Material({ friction: 0.3, restitution: 0.1 }),
  });

  if (rotation) {
    body.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  body.linearDamping = 0.2;
  body.angularDamping = 0.2;
  body.allowSleep = false;

  state.physicsWorld.addBody(body);
  return body;
}

/**
 * Crea un constraint de tipo PointToPoint entre dos cuerpos.
 * @param {CANNON.Body} bodyA
 * @param {CANNON.Body} bodyB
 * @param {THREE.Vector3} pivotA
 * @param {THREE.Vector3} pivotB
 * @returns {CANNON.PointToPointConstraint}
 */
export function createPointConstraint(bodyA, bodyB, pivotA, pivotB) {
  if (!state.physicsWorld) throw new Error('El mundo físico no está inicializado');

  const constraint = new CANNON.PointToPointConstraint(
    bodyA,
    new CANNON.Vec3(pivotA.x, pivotA.y, pivotA.z),
    bodyB,
    new CANNON.Vec3(pivotB.x, pivotB.y, pivotB.z)
  );
  state.physicsWorld.addConstraint(constraint);
  return constraint;
}

/**
 * Crea un constraint de tipo Lock entre dos cuerpos.
 * Mantiene la posición y rotación relativa inicial de forma rígida.
 * @param {CANNON.Body} bodyA
 * @param {CANNON.Body} bodyB
 * @returns {CANNON.LockConstraint}
 */
export function createLockConstraint(bodyA, bodyB) {
  if (!state.physicsWorld) throw new Error('El mundo físico no está inicializado');

  const constraint = new CANNON.LockConstraint(bodyA, bodyB);
  state.physicsWorld.addConstraint(constraint);
  return constraint;
}

/**
 * Límites de velocidad para evitar que el solver inyecte energía y las
 * extremidades (manos/pies) giren sobre su propio eje sin control.
 */
const MAX_ANGULAR_VELOCITY = 12; // rad/s
const MAX_LINEAR_VELOCITY = 25; // u/s

/** Recorta velocidades excesivas en todos los cuerpos dinámicos. */
function clampVelocities() {
  const bodies = state.physicsWorld.bodies;
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    if (b.mass <= 0) continue; // estáticos/cinemáticos no se tocan

    const av = b.angularVelocity.length();
    if (av > MAX_ANGULAR_VELOCITY) {
      b.angularVelocity.scale(MAX_ANGULAR_VELOCITY / av, b.angularVelocity);
    }
    const lv = b.velocity.length();
    if (lv > MAX_LINEAR_VELOCITY) {
      b.velocity.scale(MAX_LINEAR_VELOCITY / lv, b.velocity);
    }
  }
}

/** Avanza la simulación física. */
export function updatePhysics(delta) {
  if (!state.physicsWorld) return;
  // Primer argumento: timestep fijo (1/60 s); segundo: tiempo real transcurrido.
  state.physicsWorld.step(1 / 60, delta, 3);
  clampVelocities();
}

/** Aplica una transformación a un cuerpo rígido. */
export function setBodyTransform(body, position, quaternion) {
  body.position.set(position.x, position.y, position.z);
  body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  body.velocity.set(0, 0, 0);
  body.angularVelocity.set(0, 0, 0);
  body.wakeUp();
}
