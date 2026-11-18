import * as THREE from 'three';
import { OFFICE_LAYOUT, WORKSTATIONS, isOfficeFloor } from '../../simulation/office/office-layout';
import { block, label, material } from './model-parts';

export const createOfficeModel = (scene: THREE.Scene) => {
  const floor = new THREE.Group();
  scene.add(floor);
  const cells = [];
  for (let x = 0; x < OFFICE_LAYOUT.width; x++)
    for (let z = 0; z < OFFICE_LAYOUT.height; z++)
      if (isOfficeFloor({ x, y: z })) cells.push({ x, z });
  const tiles = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.985, 0.14, 0.985),
    material(0x91aaa0),
    cells.length,
  );
  tiles.receiveShadow = true;
  const transform = new THREE.Matrix4();
  cells.forEach(({ x, z }, index) => {
    transform.makeTranslation(x + 0.5, -0.07, z + 0.5);
    tiles.setMatrixAt(index, transform);
    tiles.setColorAt(index, new THREE.Color((x + z) % 2 ? 0x91aaa0 : 0x9fb6a9));
  });
  floor.add(tiles);
  block(floor, [24, 0.3, 12], [12, -0.3, 6], 0x344f50);
  block(floor, [14, 0.3, 6], [7, -0.3, 15], 0x344f50);
  const north = new THREE.Group();
  scene.add(north);
  const west = new THREE.Group();
  scene.add(west);
  block(north, [24, 2.8, 0.16], [12, 1.4, 0], 0xe0dfce);
  block(west, [0.16, 2.8, 18], [0, 1.4, 9], 0xc4d0c2);
  for (const x of [4, 11, 18, 22]) {
    block(north, [2, 0.95, 0.04], [x, 1.8, 0.1], 0x426f75);
    block(north, [1.82, 0.78, 0.05], [x, 1.8, 0.13], 0x9fd4ce);
    block(north, [0.035, 0.8, 0.06], [x, 1.8, 0.16], 0xe6e9d8);
  }
  label(north, 'COMMITVILLE', 3.6, [6.2, 2.25, 0.16], '#345b56');
  label(west, 'LOUNGE', 1.9, [0.1, 2.1, 13]).rotation.y = Math.PI / 2;
  for (const station of WORKSTATIONS) {
    const { x, y: z, posture } = station;
    const top = posture === 'standing' ? 1.12 : 0.86;
    const desk = new THREE.Group();
    scene.add(desk);
    block(desk, [1.95, 0.1, 0.96], [x + 1, top, z + 0.5], 0xc79760);
    for (const dx of [0.12, 1.88])
      for (const dz of [0.12, 0.88])
        block(desk, [0.08, top, 0.08], [x + dx, top / 2, z + dz], 0x384f54);
    block(desk, [0.13, 0.18, 0.13], [x + 1.5, top + 0.14, z + 0.33], 0x344952);
    block(desk, [0.66, 0.43, 0.08], [x + 1.5, top + 0.43, z + 0.28], 0x263b43);
    block(desk, [0.57, 0.33, 0.015], [x + 1.5, top + 0.43, z + 0.326], 0x75c6ba);
    block(desk, [0.55, 0.035, 0.19], [x + 1.5, top + 0.07, z + 0.82], 0xd6ded5);
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 8; col++)
        block(
          desk,
          [0.045, 0.008, 0.035],
          [x + 1.27 + col * 0.063, top + 0.09, z + 0.76 + row * 0.05],
          0x5d7979,
        );
    block(desk, [0.3, 0.035, 0.35], [x + 0.4, top + 0.07, z + 0.4], 0x5f8777);
    if (posture === 'seated') {
      const cx = x + 1.5,
        cz = z + 1.5;
      block(desk, [0.65, 0.13, 0.62], [cx, 0.53, cz], 0x406e70);
      block(desk, [0.62, 0.45, 0.1], [cx, 0.85, cz + 0.27], 0x406e70);
      block(desk, [0.09, 0.45, 0.09], [cx, 0.25, cz], 0x42565d);
      block(desk, [0.64, 0.06, 0.08], [cx, 0.07, cz], 0x344950);
      block(desk, [0.08, 0.06, 0.6], [cx, 0.07, cz], 0x344950);
      for (const side of [-1, 1])
        block(desk, [0.07, 0.1, 0.12], [cx + side * 0.27, 0.06, cz], 0x1f3038);
    }
  }
  for (const fixture of OFFICE_LAYOUT.fixtures) {
    const { kind, x, y: z, width, depth } = fixture;
    if (kind === 'desk' || kind === 'chair') continue;
    const prop = new THREE.Group();
    scene.add(prop);
    if (kind === 'plant') {
      block(prop, [0.46, 0.5, 0.46], [x + 0.5, 0.25, z + 0.5], 0xb98454);
      block(prop, [0.05, 1.1, 0.05], [x + 0.5, 0.95, z + 0.5], 0x446f4e);
      for (let n = 0; n < 7; n++) {
        const a = n * 2.4;
        const leaf = block(
          prop,
          [0.32, 0.1, 0.15],
          [x + 0.5 + Math.cos(a) * 0.2, 0.65 + n * 0.11, z + 0.5 + Math.sin(a) * 0.2],
          n % 2 ? 0x7aa16c : 0x4b805b,
          true,
        );
        leaf.rotation.z = Math.sin(a) * 0.5;
      }
    } else if (kind === 'shelf') {
      block(prop, [width, 0.1, 0.75], [x + width / 2, 0.08, z + 0.4], 0x805b42);
      block(prop, [width, 1.65, 0.1], [x + width / 2, 0.88, z + 0.07], 0xa98259);
      for (let level = 0; level < 3; level++) {
        block(prop, [width, 0.08, 0.72], [x + width / 2, 0.2 + level * 0.56, z + 0.4], 0xb28b5f);
        for (let n = 0; n < 14; n++)
          block(
            prop,
            [0.12, 0.28 + (n % 3) * 0.06, 0.37],
            [x + 0.13 + n * 0.2, 0.4 + level * 0.56, z + 0.43],
            [0x799187, 0xc99967, 0xddd3ae, 0x5d7882][n % 4]!,
          );
      }
    } else if (kind === 'sofa') {
      block(prop, [width, 0.4, 0.82], [x + width / 2, 0.42, z + 0.5], 0x4a8079);
      block(prop, [width, 0.58, 0.18], [x + width / 2, 0.82, z + 0.13], 0x568d83);
      for (const dx of [0.12, width - 0.12])
        block(prop, [0.24, 0.6, 0.9], [x + dx, 0.65, z + 0.5], 0x65978a);
      for (let n = 0; n < width - 1; n++)
        block(prop, [0.85, 0.12, 0.61], [x + 0.6 + n, 0.66, z + 0.53], 0x80ab94);
    } else if (kind === 'coffee') {
      block(prop, [width, 0.9, 0.85], [x + width / 2, 0.45, z + 0.5], 0xb5b59c);
      block(prop, [width + 0.1, 0.1, 0.95], [x + width / 2, 0.95, z + 0.5], 0xd6b782);
      block(prop, [0.7, 0.7, 0.6], [x + 0.55, 1.35, z + 0.4], 0x344a53);
      block(prop, [0.4, 0.3, 0.02], [x + 0.55, 1.37, z + 0.71], 0x172b34);
      block(prop, [0.18, 0.2, 0.18], [x + 1.3, 1.1, z + 0.5], 0xe5cf9e);
    } else if (kind === 'meeting') {
      block(prop, [width, 0.12, depth], [x + width / 2, 0.86, z + depth / 2], 0xd2b67c);
      for (const dx of [0.2, width - 0.2])
        block(prop, [0.12, 0.82, depth - 0.4], [x + dx, 0.41, z + depth / 2], 0x4a6162);
      for (let i = 0; i < 3; i++)
        block(prop, [0.4, 0.015, 0.55], [x + 0.5 + i, 0.94, z + depth / 2], 0xeee8d2);
    }
  }
  return { north, west };
};
