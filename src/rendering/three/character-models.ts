import * as THREE from 'three';
import type { PatrolSnapshot } from '../../simulation/characters/office-patrol.system';
import type { CoworkerSnapshot } from '../../simulation/characters/coworker.system';
import type { MascotId } from '../../simulation/characters/mascot-roster';
import { block, label } from './model-parts';

const facing = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 };
const joint = (parent: THREE.Object3D, x: number, y: number, z: number) => {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  return group;
};
export const createHumanModel = (index: number) => {
  const root = new THREE.Group();
  const skin = [0xd8a07c, 0xb97b58, 0xf0c4a0, 0x8c5943][index % 4]!;
  const shirt = [0x608f94, 0xc68757, 0x7d77a0, 0x799c72, 0xb87171][index % 5]!;
  const hair = [0x25353e, 0x9c5939, 0x36566e, 0xd0a154, 0x53372d][index % 5]!;
  const body = joint(root, 0, 0, 0);
  block(body, [0.43, 0.5, 0.26], [0, 1.22, 0], shirt);
  block(body, [0.12, 0.12, 0.12], [0, 1.51, 0], skin);
  block(body, [0.23, 0.27, 0.22], [0, 1.77, 0], skin, true);
  block(body, [0.245, 0.17, 0.235], [0, 1.93, -0.035], hair, true);
  block(body, [0.43, 0.23, 0.18], [0, 1.88, -0.13], hair);
  for (const x of [-0.085, 0.085]) block(body, [0.035, 0.043, 0.025], [x, 1.79, 0.211], 0x24323a);
  block(body, [0.065, 0.025, 0.025], [0, 1.68, 0.217], 0xa86d59);
  if (index % 3 === 1)
    for (const side of [-1, 1]) block(body, [0.06, 0.24, 0.15], [side * 0.2, 1.72, -0.06], hair);
  const legs = [-1, 1].map((side) => {
    const thigh = joint(root, side * 0.115, 0.88, 0);
    block(thigh, [0.17, 0.4, 0.18], [0, -0.2, 0], 0x354c60);
    const shin = joint(thigh, 0, -0.4, 0);
    block(shin, [0.15, 0.4, 0.16], [0, -0.2, 0], 0x354c60);
    block(shin, [0.19, 0.12, 0.3], [0, -0.39, 0.06], 0x24343d);
    return { thigh, shin };
  });
  const arms = [-1, 1].map((side) => {
    const upper = joint(body, side * 0.285, 1.42, 0);
    block(upper, [0.16, 0.28, 0.18], [0, -0.14, 0], shirt);
    const lower = joint(upper, 0, -0.28, 0);
    block(lower, [0.125, 0.27, 0.13], [0, -0.135, 0], skin);
    block(lower, [0.14, 0.12, 0.15], [0, -0.28, 0], skin);
    return { upper, lower };
  });
  return {
    root,
    update(state: CoworkerSnapshot, time: number) {
      const seated = state.workPosture === 'seated';
      const stride = state.walking ? Math.sin(state.walkingMs / 130) * 0.55 : 0;
      root.position.set(state.x, 0, state.y);
      root.rotation.y = facing[state.direction];
      body.position.y = seated ? -0.22 : Math.abs(stride) * 0.025;
      legs.forEach(({ thigh, shin }, i) => {
        thigh.position.y = seated ? 0.66 : 0.88;
        thigh.rotation.x = seated ? -1.1 : stride * (i ? 1 : -1);
        shin.rotation.x = seated ? 1.1 : Math.max(0, -stride * (i ? 1 : -1)) * 0.5;
      });
      arms.forEach(({ upper, lower }, i) => {
        upper.rotation.x = state.working
          ? -0.7 + Math.sin(time / 130 + i) * 0.035
          : stride * (i ? -1 : 1) * 0.8;
        lower.rotation.x = state.working ? -0.8 : 0;
      });
    },
  };
};

export const createMascotModel = (id: MascotId) => {
  const root = new THREE.Group();
  const body = joint(root, 0, 0, 0);
  const dark = 0x263840,
    metal = 0x82999e;
  const height = id === 'dnake' ? 1.65 : id === 'c3plus' ? 1.6 : 0.9;
  const width = id === 'zkteco' ? 1.05 : 0.67;
  const center = 0.48 + height / 2;
  block(body, [width, height, 0.22], [0, center, 0], id === 'c3plus' ? 0x223b36 : dark);
  if (id === 'dnake') {
    block(body, [width + 0.035, 0.38, 0.25], [0, 0.48 + height - 0.19, 0], metal);
    block(body, [0.11, 0.11, 0.045], [0, 0.48 + height - 0.18, 0.15], 0x101d25, true);
    block(body, [0.07, 0.07, 0.015], [0, 0.48 + height - 0.18, 0.195], 0x72989b, true);
    for (const side of [-1, 1])
      block(body, [0.12, 0.035, 0.02], [side * 0.22, 0.48 + height - 0.18, 0.135], 0xe6e9cf);
    block(body, [0.55, 0.42, 0.025], [0, 1.48, 0.13], 0x111f2b);
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 3; col++)
        block(body, [0.12, 0.095, 0.035], [(col - 1) * 0.17, 0.72 + row * 0.13, 0.145], metal);
    label(body, 'DNAKE', 0.43, [0, 0.55, 0.14]);
  } else if (id === 'zkteco') {
    for (let n = 0; n < 3; n++)
      block(
        body,
        [0.055, 0.045, 0.025],
        [-0.39, 1.15 - n * 0.13, 0.13],
        [0xeb6960, 0x7ed7a0, 0xf0c565][n]!,
      );
    label(body, 'ZKTeco', 0.75, [0.05, 0.94, 0.135]);
    label(body, 'C2-260', 0.55, [0, 0.62, 0.135]);
    for (const side of [-1, 1])
      for (let n = 0; n < 9; n++)
        block(body, [0.075, 0.05, 0.05], [(n - 4) * 0.105, center + side * 0.4, 0.13], 0x879c9a);
  } else {
    block(body, [0.69, 0.45, 0.3], [0, 1.9, 0], dark);
    label(body, 'C3 PLUS', 0.54, [0, 1.94, 0.16]);
    block(body, [0.135, 0.135, 0.035], [-0.13, 1.5, 0.145], 0xb6bfba, true);
    for (let n = 0; n < 7; n++) {
      block(body, [0.1, 0.09, 0.04], [(n % 2 ? 1 : -1) * 0.15, 0.68 + n * 0.1, 0.14], 0x152b2d);
      for (const side of [-1, 1])
        block(body, [0.1, 0.12, 0.15], [side * 0.36, 0.64 + n * 0.16, 0], dark);
      block(body, [0.009, 0.13, 0.01], [(n - 3) * 0.06, 1.1, 0.12], 0x668878);
    }
    for (const x of [-0.16, 0.08]) block(body, [0.085, 0.13, 0.07], [x, 0.65, 0.16], metal, true);
  }
  // Friendly eyes and smile are shallow meshes attached to the device face.
  if (id !== 'zkteco')
    for (const side of [-1, 1])
      block(
        body,
        [0.045, 0.045, 0.025],
        [side * 0.11, id === 'dnake' ? 1.53 : 1.94, 0.18],
        0x9fe0b2,
      );
  const arms = [-1, 1].map((side) => {
    const arm = joint(body, side * (width / 2 + 0.09), center + 0.1, 0);
    block(arm, [0.09, 0.45, 0.1], [0, -0.22, 0], metal);
    block(arm, [0.12, 0.13, 0.12], [0, -0.46, 0], metal, true);
    return arm;
  });
  const legs = [-1, 1].map((side) => {
    const leg = joint(root, side * width * 0.25, 0.5, 0);
    block(leg, [0.1, 0.37, 0.1], [0, -0.19, 0], metal);
    block(leg, [0.2, 0.12, 0.28], [0, -0.44, 0.07], dark);
    return leg;
  });
  return {
    root,
    update(state: PatrolSnapshot, talking: boolean, time: number) {
      root.position.set(state.x, 0, state.y);
      root.rotation.y = facing[state.direction];
      const stride = state.walking ? Math.sin(state.walkingMs / 135) * 0.5 : 0;
      body.position.y = state.walking ? Math.abs(stride) * 0.06 : 0;
      legs.forEach((leg, i) => (leg.rotation.x = stride * (i ? 1 : -1)));
      arms.forEach((arm, i) => {
        arm.rotation.x = stride * (i ? -1 : 1);
        arm.rotation.z = talking ? Math.sin(time / 230 + i) * 0.25 : 0;
      });
    },
  };
};
