import * as THREE from 'three';

// Four lighting bands keep the shared palette readable on the pixel grid.
const ramp = new THREE.DataTexture(new Uint8Array([70, 135, 205, 255]), 4, 1, THREE.RedFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
ramp.generateMipmaps = false;
ramp.needsUpdate = true;
const materials = new Map<number, THREE.MeshToonMaterial>();
export const material = (color: number) => {
  if (!materials.has(color))
    materials.set(color, new THREE.MeshToonMaterial({ color, gradientMap: ramp }));
  return materials.get(color)!;
};
const cube = new THREE.BoxGeometry(1, 1, 1);
const ball = new THREE.SphereGeometry(1, 12, 8);
export const block = (
  parent: THREE.Object3D,
  size: readonly number[],
  position: readonly number[],
  color: number,
  round = false,
) => {
  const mesh = new THREE.Mesh(round ? ball : cube, material(color));
  mesh.scale.set(size[0]!, size[1]!, size[2]!);
  mesh.position.set(position[0]!, position[1]!, position[2]!);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};
export const label = (
  parent: THREE.Object3D,
  text: string,
  width: number,
  position: readonly number[],
  color = '#d8eee0',
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = 'bold 56px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width / 4),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  mesh.position.set(position[0]!, position[1]!, position[2]!);
  parent.add(mesh);
  return mesh;
};
