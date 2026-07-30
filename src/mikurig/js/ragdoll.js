import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { state } from './state.js';
import { createRigidBody, createPointConstraint, setBodyTransform } from './physics.js';

const BODY_MASS = 1.5;
// Amortiguación base más alta para estabilizar el ragdoll y evitar vibraciones.
const LINEAR_DAMPING = 0.3;
const ANGULAR_DAMPING = 0.6;
// Manos y pies tienden a girar sobre su eje; les damos aún más amortiguación.
const EXTREMITY_ANGULAR_DAMPING = 0.9;

const BONE_PARTS = [
  { name: 'Hips_05', type: 'sphere', radius: 0.13 },
  { name: 'Spine1_06', type: 'capsule', radius: 0.09, length: 0.20, dir: new THREE.Vector3(0, 1, 0) },
  { name: 'Spine2_072', type: 'capsule', radius: 0.09, length: 0.18, dir: new THREE.Vector3(0, 1, 0) },
  { name: 'Chest_073', type: 'capsule', radius: 0.10, length: 0.22, dir: new THREE.Vector3(0, 1, 0) },
  { name: 'Neck_077', type: 'capsule', radius: 0.045, length: 0.08, dir: new THREE.Vector3(0, 1, 0) },
  { name: 'Head_078', type: 'sphere', radius: 0.11 },
  { name: 'Shoulder_Left_0122', type: 'sphere', radius: 0.07 },
  { name: 'Arm_Left_0123', type: 'capsule', radius: 0.06, length: 0.24, dir: new THREE.Vector3(0, -1, 0) },
  { name: 'ForeArm_Left_0124', type: 'capsule', radius: 0.05, length: 0.24, dir: new THREE.Vector3(0, -1, 0) },
  { name: 'Hand_Left_0125', type: 'sphere', radius: 0.055 },
  { name: 'Shoulder_Right_0147', type: 'sphere', radius: 0.07 },
  { name: 'Arm_Right_0148', type: 'capsule', radius: 0.06, length: 0.24, dir: new THREE.Vector3(0, -1, 0) },
  { name: 'ForeArm_Right_0149', type: 'capsule', radius: 0.05, length: 0.24, dir: new THREE.Vector3(0, -1, 0) },
  { name: 'Hand_Right_0150', type: 'sphere', radius: 0.055 },
  { name: 'UpLeg_Left_0177', type: 'capsule', radius: 0.08, length: 0.34, dir: new THREE.Vector3(0, -1, 0) },
  { name: 'Leg_Left_0178', type: 'capsule', radius: 0.07, length: 0.34, dir: new THREE.Vector3(0, -1, 0) },
  { name: 'Foot_Left_0179', type: 'sphere', radius: 0.075 },
  { name: 'UpLeg_Right_0183', type: 'capsule', radius: 0.08, length: 0.34, dir: new THREE.Vector3(0, -1, 0) },
  { name: 'Leg_Right_0184', type: 'capsule', radius: 0.07, length: 0.34, dir: new THREE.Vector3(0, -1, 0) },
  { name: 'Foot_Right_0185', type: 'sphere', radius: 0.075 },
];

const LINKS = [
  ['Hips_05', 'Spine1_06'],
  ['Spine1_06', 'Spine2_072'],
  ['Spine2_072', 'Chest_073'],
  ['Chest_073', 'Neck_077'],
  ['Neck_077', 'Head_078'],
  ['Chest_073', 'Shoulder_Left_0122'],
  ['Shoulder_Left_0122', 'Arm_Left_0123'],
  ['Arm_Left_0123', 'ForeArm_Left_0124'],
  ['ForeArm_Left_0124', 'Hand_Left_0125'],
  ['Chest_073', 'Shoulder_Right_0147'],
  ['Shoulder_Right_0147', 'Arm_Right_0148'],
  ['Arm_Right_0148', 'ForeArm_Right_0149'],
  ['ForeArm_Right_0149', 'Hand_Right_0150'],
  ['Hips_05', 'UpLeg_Left_0177'],
  ['UpLeg_Left_0177', 'Leg_Left_0178'],
  ['Leg_Left_0178', 'Foot_Left_0179'],
  ['Hips_05', 'UpLeg_Right_0183'],
  ['UpLeg_Right_0183', 'Leg_Right_0184'],
  ['Leg_Right_0184', 'Foot_Right_0185'],
];

function createBoneShape(def, bone) {
  if (def.type === 'sphere') {
    return { shape: new CANNON.Sphere(def.radius), offset: new THREE.Vector3(0, 0, 0) };
  }

  const bonePos = new THREE.Vector3();
  const boneQuat = new THREE.Quaternion();
  const boneScale = new THREE.Vector3();
  bone.matrixWorld.decompose(bonePos, boneQuat, boneScale);

  let avgChildPos = null;
  let childCount = 0;
  bone.children.forEach((child) => {
    if (child.isBone) {
      const childPos = new THREE.Vector3();
      child.getWorldPosition(childPos);
      if (!avgChildPos) avgChildPos = childPos.clone();
      else avgChildPos.add(childPos);
      childCount++;
    }
  });

  let halfLength = def.length / 2;
  let center = new THREE.Vector3(0, 0, 0);
  if (avgChildPos && childCount > 0) {
    avgChildPos.multiplyScalar(1 / childCount);
    const boneMatrixInv = bone.matrixWorld.clone().invert();
    const localMid = avgChildPos.clone().applyMatrix4(boneMatrixInv);
    center.copy(localMid).multiplyScalar(0.5);
    halfLength = Math.max(localMid.length() * 0.5, 0.02);
  }

  const dir = def.dir.clone().normalize();
  const capsuleLength = Math.max(def.length, halfLength * 2);
  const shape = new CANNON.Cylinder(def.radius, def.radius, capsuleLength, 8);
  const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const offset = center.clone().add(dir.clone().multiplyScalar(capsuleLength * 0.5 - halfLength));
  return { shape, offset, orientation };
}

export function buildRagdoll() {
  const { model } = state;
  if (!model) return;

  clearRagdoll();
  model.updateMatrixWorld(true);

  const skeleton = state.skeleton;
  if (!skeleton) {
    console.warn('[mikurig] no skeleton found, cannot build ragdoll');
    return;
  }

  const hipsBone = skeleton.bones.find((b) => b.name === 'Hips_05');
  if (!hipsBone) {
    console.warn('[mikurig] Hips bone not found');
    return;
  }
  const armatureObj = hipsBone.parent;
  state.armatureWorldQuat = new THREE.Quaternion();
  armatureObj.getWorldQuaternion(state.armatureWorldQuat);
  state.hipsParentWorldMatInv = armatureObj.parent
    ? armatureObj.parent.matrixWorld.clone().invert()
    : new THREE.Matrix4();

  BONE_PARTS.forEach((def) => {
    const bone = skeleton.bones.find((b) => b.name === def.name);
    if (!bone) {
      console.warn('[mikurig] bone not found:', def.name);
      return;
    }

    const bonePos = new THREE.Vector3();
    const boneQuat = new THREE.Quaternion();
    const boneScale = new THREE.Vector3();
    bone.matrixWorld.decompose(bonePos, boneQuat, boneScale);

    const shapeInfo = createBoneShape(def, bone);
    const body = createRigidBody(bonePos, shapeInfo.shape, BODY_MASS, boneQuat);
    if (shapeInfo.offset) {
      body.shapeOffsets[0].copy(new CANNON.Vec3(shapeInfo.offset.x, shapeInfo.offset.y, shapeInfo.offset.z));
      if (shapeInfo.orientation) {
        const q = shapeInfo.orientation;
        body.shapeOrientations[0].set(q.x, q.y, q.z, q.w);
      }
    }

    const isExtremity = /Hand_|Foot_/.test(def.name);
    body.linearDamping = LINEAR_DAMPING;
    body.angularDamping = isExtremity ? EXTREMITY_ANGULAR_DAMPING : ANGULAR_DAMPING;
    body.collisionFilterGroup = 2;
    body.collisionFilterMask = 1 | 2;
    body.allowSleep = false;

    state.boneBodies.set(def.name, {
      body,
      bone,
      initialWorldPos: bonePos.clone(),
      initialWorldQuat: boneQuat.clone(),
    });
  });

  LINKS.forEach(([aName, bName]) => {
    const a = state.boneBodies.get(aName);
    const b = state.boneBodies.get(bName);
    if (!a || !b) return;

    const bPos = new THREE.Vector3();
    b.bone.getWorldPosition(bPos);

    const pivotA = worldToLocalPivot(bPos, a.body);
    const constraint = createPointConstraint(a.body, b.body, pivotA, new THREE.Vector3(0, 0, 0));
    state.constraints.push(constraint);
  });

  console.log('[mikurig] buildRagdoll:', state.boneBodies.size, 'bodies,', state.constraints.length, 'constraints');
}

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

export function clearRagdoll() {
  const { physicsWorld } = state;
  if (!physicsWorld) return;

  state.constraints.forEach((c) => physicsWorld.removeConstraint(c));
  state.constraints = [];
  state.boneBodies.forEach(({ body }) => {
    physicsWorld.removeBody(body);
  });
  state.boneBodies.clear();
  state.hipsParentWorldMatInv = null;
  state.armatureWorldQuat = null;
}

export function syncPhysicsToBones() {
  const { skeleton, armatureWorldQuat } = state;
  if (!skeleton || !armatureWorldQuat || state.boneBodies.size === 0) return;

  const armatureQuatInv = armatureWorldQuat.clone().invert();
  const targetWorldQuats = new Map();
  state.boneBodies.forEach(({ body, bone }) => {
    const worldQuat = new THREE.Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
    targetWorldQuats.set(bone.uuid, worldQuat);
  });

  skeleton.bones.forEach((bone) => {
    const worldQuat = targetWorldQuats.get(bone.uuid);
    if (worldQuat) {
      let localQuat = worldQuat.clone();
      if (bone.parent) {
        const parentWorldQuat = new THREE.Quaternion();
        bone.parent.getWorldQuaternion(parentWorldQuat);
        localQuat.premultiply(parentWorldQuat.clone().invert());
      } else {
        localQuat.premultiply(armatureQuatInv);
      }
      bone.quaternion.copy(localQuat);
    }
  });

  // Primero refrescamos las matrices con las nuevas rotaciones locales de los
  // huesos, para poder medir dónde queda realmente el hueso Hips en el mundo.
  skeleton.update();
  state.model.updateMatrixWorld(true);

  // Corrección de posición basada en delta: en lugar de derivar la posición del
  // modelo con una matriz (que ignora el offset local del hueso Hips y hacía que
  // Miku "flotara"), calculamos la diferencia entre dónde debería estar el Hips
  // (según la física) y dónde está ahora, y desplazamos el modelo esa cantidad.
  const hipsEntry = state.boneBodies.get('Hips_05');
  if (hipsEntry) {
    const targetHipsWorld = new THREE.Vector3(
      hipsEntry.body.position.x,
      hipsEntry.body.position.y,
      hipsEntry.body.position.z
    );
    const currentHipsWorld = new THREE.Vector3();
    hipsEntry.bone.getWorldPosition(currentHipsWorld);

    const delta = targetHipsWorld.sub(currentHipsWorld);
    state.model.position.add(delta);
    state.model.updateMatrixWorld(true);
  }
}

export function resetRagdoll() {
  if (state.boneBodies.size === 0) {
    buildRagdoll();
    return;
  }

  state.boneBodies.forEach(({ body, initialWorldPos, initialWorldQuat }) => {
    setBodyTransform(body, initialWorldPos, initialWorldQuat);
  });
  syncPhysicsToBones();
}
