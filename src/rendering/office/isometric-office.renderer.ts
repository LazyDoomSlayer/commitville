import type Phaser from 'phaser';

import {
  OFFICE_LAYOUT,
  WORKSTATIONS,
  isOfficeFloor,
  type OfficeFixture,
} from '../../simulation/office/office-layout';

export const projectOfficePoint = (x: number, y: number, z = 0): { x: number; y: number } => ({
  x: Math.round((x - y) * 32),
  y: Math.round((x + y) * 16 - z),
});

// Camera geometry follows the same footprint as the floor, including the cutout.
const roomLeft = projectOfficePoint(0, OFFICE_LAYOUT.height).x - 24;
const roomRight = projectOfficePoint(OFFICE_LAYOUT.width, 0).x + 24;
const roomBottom =
  Math.max(
    projectOfficePoint(OFFICE_LAYOUT.width, OFFICE_LAYOUT.mainDepth).y,
    projectOfficePoint(OFFICE_LAYOUT.loungeWidth, OFFICE_LAYOUT.height).y,
  ) + 20;
export const OFFICE_VIEW = {
  left: roomLeft,
  right: roomRight,
  top: -90,
  bottom: roomBottom,
  centerX: (roomLeft + roomRight) / 2,
  centerY: (roomBottom - 90) / 2,
};

type Graphics = Phaser.GameObjects.Graphics;
type Point = { x: number; y: number };

const polygon = (graphics: Graphics, points: Point[], color: number, alpha = 1): void => {
  graphics.fillStyle(color, alpha);
  graphics.beginPath();
  graphics.moveTo(points[0]!.x, points[0]!.y);
  points.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
  graphics.closePath();
  graphics.fillPath();
};

// Raised boxes share the floor projection: top, left and right faces are real
// separate planes, rather than a skewed image of the previous flat room.
const box = (
  graphics: Graphics,
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  colors: readonly [number, number, number],
  base = 0,
): void => {
  const a = projectOfficePoint(x, y, base + height);
  const b = projectOfficePoint(x + width, y, base + height);
  const c = projectOfficePoint(x + width, y + depth, base + height);
  const d = projectOfficePoint(x, y + depth, base + height);
  polygon(
    graphics,
    [d, c, projectOfficePoint(x + width, y + depth, base), projectOfficePoint(x, y + depth, base)],
    colors[1],
  );
  polygon(
    graphics,
    [b, c, projectOfficePoint(x + width, y + depth, base), projectOfficePoint(x + width, y, base)],
    colors[2],
  );
  polygon(graphics, [a, b, c, d], colors[0]);
};

const WOOD = [0xd1af7b, 0x9c754d, 0x785739] as const;
const METAL = [0x6f8c8c, 0x415b63, 0x304650] as const;

const screen = (g: Graphics, x: number, y: number, base: number): void => {
  box(g, x + 0.24, y + 0.02, 0.16, 0.13, 3, METAL, base);
  box(g, x, y, 0.72, 0.12, 16, [0x566770, 0x273b49, 0x182c37], base + 3);
  polygon(
    g,
    [
      projectOfficePoint(x + 0.06, y + 0.125, base + 17),
      projectOfficePoint(x + 0.66, y + 0.125, base + 17),
      projectOfficePoint(x + 0.66, y + 0.125, base + 6),
      projectOfficePoint(x + 0.06, y + 0.125, base + 6),
    ],
    0x7cc5b6,
  );
  const line = projectOfficePoint(x + 0.12, y + 0.13, base + 13);
  g.lineStyle(1, 0xd4edcf, 0.8);
  g.lineBetween(line.x, line.y, line.x + 7, line.y + 3);
};

const drawFixture = (scene: Phaser.Scene, fixture: OfficeFixture): void => {
  const { x, y, width, depth, kind } = fixture;
  // Sort at the footprint's center: using its far corner would incorrectly
  // hide Dnake when he stands just in front of a wide meeting table.
  const g = scene.add.graphics().setDepth((x + y + (width + depth) / 2) * 100);
  polygon(
    g,
    [
      projectOfficePoint(x + 0.1, y + 0.15),
      projectOfficePoint(x + width + 0.2, y + 0.15),
      projectOfficePoint(x + width + 0.2, y + depth + 0.12),
      projectOfficePoint(x + 0.1, y + depth + 0.12),
    ],
    0x233d43,
    0.16,
  );

  if (kind === 'desk' || kind === 'meeting') {
    const standing =
      kind === 'desk' &&
      WORKSTATIONS.find((station) => station.x === x && station.y === y)?.posture === 'standing';
    const surface = kind === 'meeting' ? 27 : standing ? 35 : 23;
    for (const dx of [0.18, width - 0.33]) {
      for (const dy of [0.18, depth - 0.33]) box(g, x + dx, y + dy, 0.14, 0.14, surface - 4, METAL);
    }
    box(g, x + 0.05, y + 0.05, width - 0.1, depth - 0.1, 4, WOOD, surface - 4);
    if (kind === 'desk') {
      screen(g, x + 1.14, y + 0.16, surface);
      box(g, x + 1.15, y + 0.75, 0.7, 0.2, 1, [0xd0d8ce, 0x7d9394, 0x536b72], surface);
      box(g, x + 0.45, y + 0.55, 0.15, 0.15, 6, [0xf0dab0, 0xdbc59d, 0xb29b7d], surface);
      box(g, x + 0.2, y + 0.2, 0.25, 0.33, 1, [0x6e9f8d, 0x416656, 0x416656], surface);
    } else {
      screen(g, x + 1.5, y + 0.4, 27);
      box(g, x + 0.5, y + 0.7, 0.55, 0.75, 1, [0xe8e2ca, 0xb9b39f, 0xb9b39f], 27);
      box(g, x + 2.25, y + 1.1, 0.2, 0.2, 5, [0xe8d5b1, 0xd4b58a, 0xaf8e64], 27);
    }
  } else if (kind === 'chair') {
    box(g, x + 0.26, y + 0.22, 0.48, 0.48, 4, METAL);
    box(g, x + 0.43, y + 0.38, 0.15, 0.15, 12, METAL);
    box(g, x + 0.13, y + 0.1, 0.74, 0.7, 4, [0x8aa49c, 0x536f70, 0x3e565f], 12);
    // A low back supports the seated torso without masking the native NPC head.
    const back = scene.add.graphics().setDepth(g.depth + 0.5);
    box(back, x + 0.13, y + 0.65, 0.74, 0.15, 6, [0x8aa49c, 0x536f70, 0x3e565f], 16);
  } else if (kind === 'coffee') {
    box(g, x + 0.05, y + 0.05, width - 0.1, 0.9, 26, [0xe3dcc3, 0xb5b59e, 0x909c8c]);
    box(g, x, y, width, 1, 3, WOOD, 26);
    box(g, x + 0.22, y + 0.12, 0.7, 0.62, 18, [0x61727a, 0x354951, 0x253944], 29);
    box(g, x + 0.34, y + 0.68, 0.25, 0.12, 6, [0xd3dfce, 0x9db5a5, 0x7d968d], 30);
    box(g, x + 1.35, y + 0.4, 0.22, 0.22, 6, [0xf0d394, 0xc2a87b, 0x9d8057], 29);
  } else if (kind === 'plant') {
    box(g, x + 0.2, y + 0.2, 0.6, 0.6, 12, [0xd0aa7c, 0x967054, 0x775342]);
    const stem = projectOfficePoint(x + 0.5, y + 0.5, 10);
    g.lineStyle(3, 0x4b745b);
    g.lineBetween(stem.x, stem.y, stem.x, stem.y - 31);
    for (let index = 0; index < 5; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const leafY = stem.y - 8 - index * 5;
      polygon(
        g,
        [
          { x: stem.x, y: leafY },
          { x: stem.x + side * 14, y: leafY - 9 },
          { x: stem.x + side * 11, y: leafY + 1 },
        ],
        index % 2 ? 0x7da378 : 0x5b8a68,
      );
    }
  } else if (kind === 'sofa') {
    box(g, x + 0.1, y + 0.1, width - 0.2, 0.8, 13, [0x709d8e, 0x426b68, 0x345757]);
    box(g, x + 0.1, y + 0.05, width - 0.2, 0.2, 15, [0x88ad99, 0x507a70, 0x42665f], 13);
    box(g, x + 0.05, y + 0.12, 0.25, 0.78, 7, [0x88ad99, 0x507a70, 0x42665f], 13);
    box(g, x + width - 0.3, y + 0.12, 0.25, 0.78, 7, [0x88ad99, 0x507a70, 0x42665f], 13);
  } else if (kind === 'shelf') {
    box(g, x + 0.08, y + 0.08, width - 0.16, 0.72, 42, WOOD);
    for (const level of [5, 20]) {
      box(g, x + 0.18, y + 0.68, width - 0.36, 0.14, 13, [0x484e4e, 0x484e4e, 0x484e4e], level);
      for (let book = 0; book < 9; book += 1) {
        const colors = [0x8caaa0, 0xd4bd87, 0xb67c68];
        const color = colors[book % colors.length]!;
        box(
          g,
          x + 0.25 + book * 0.26,
          y + 0.76,
          0.17,
          0.12,
          9 + (book % 3),
          [color, color, 0x655b51],
          level,
        );
      }
    }
  }
};

export const drawIsometricOffice = (scene: Phaser.Scene): void => {
  const { width, height } = OFFICE_LAYOUT;
  const floor = scene.add.graphics().setDepth(-10_000);
  box(floor, 0, 0, width, OFFICE_LAYOUT.mainDepth, 9, [0x89a79e, 0x405e62, 0x304b54], -9);
  box(
    floor,
    0,
    OFFICE_LAYOUT.mainDepth,
    OFFICE_LAYOUT.loungeWidth,
    height - OFFICE_LAYOUT.mainDepth,
    9,
    [0x89a79e, 0x405e62, 0x304b54],
    -9,
  );
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!isOfficeFloor({ x, y })) continue;
      const corners = [
        projectOfficePoint(x, y),
        projectOfficePoint(x + 1, y),
        projectOfficePoint(x + 1, y + 1),
        projectOfficePoint(x, y + 1),
      ];
      polygon(
        floor,
        corners,
        y >= OFFICE_LAYOUT.mainDepth
          ? (x + y) % 2 === 0
            ? 0x99a58f
            : 0xa2ad96
          : (x + y) % 2 === 0
            ? 0x8aa69b
            : 0x91ada1,
      );
      floor.lineStyle(1, 0x718f87, 0.35);
      corners.forEach((point, index) => {
        const next = corners[(index + 1) % corners.length]!;
        floor.lineBetween(point.x, point.y, next.x, next.y);
      });
    }
  }
  // A low entrance mat makes Dnake's starting position easy to spot.
  polygon(
    floor,
    [
      projectOfficePoint(11.2, 10.1),
      projectOfficePoint(13.7, 10.1),
      projectOfficePoint(13.7, 11.6),
      projectOfficePoint(11.2, 11.6),
    ],
    0x5e7e7d,
  );

  const walls = scene.add.graphics().setDepth(-9_000);
  polygon(
    walls,
    [
      projectOfficePoint(0, 0),
      projectOfficePoint(width, 0),
      projectOfficePoint(width, 0, 70),
      projectOfficePoint(0, 0, 70),
    ],
    0xd5d5bd,
  );
  polygon(
    walls,
    [
      projectOfficePoint(0, 0),
      projectOfficePoint(0, height),
      projectOfficePoint(0, height, 70),
      projectOfficePoint(0, 0, 70),
    ],
    0xb9c3b1,
  );
  walls.lineStyle(4, 0x687e77);
  const left = projectOfficePoint(0, height, 70);
  const corner = projectOfficePoint(0, 0, 70);
  const right = projectOfficePoint(width, 0, 70);
  walls.lineBetween(left.x, left.y, corner.x, corner.y);
  walls.lineBetween(corner.x, corner.y, right.x, right.y);

  for (const start of [2.4, 10, 18.5]) {
    const a = projectOfficePoint(start, 0, 61);
    const b = projectOfficePoint(start + 2.4, 0, 61);
    const c = projectOfficePoint(start + 2.4, 0, 27);
    const d = projectOfficePoint(start, 0, 27);
    polygon(walls, [a, b, c, d], 0x597d88);
    polygon(
      walls,
      [
        { x: a.x + 3, y: a.y + 5 },
        { x: b.x - 3, y: b.y + 2 },
        { x: c.x - 3, y: c.y - 4 },
        { x: d.x + 3, y: d.y - 2 },
      ],
      0xa8d0cf,
    );
    walls.lineStyle(3, 0xe1dfc8);
    walls.lineBetween((a.x + b.x) / 2, (a.y + b.y) / 2, (c.x + d.x) / 2, (c.y + d.y) / 2);
  }
  const sign = projectOfficePoint(0, 4.8, 47);
  scene.add
    .text(sign.x, sign.y, 'COMMITVILLE', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e7e4ca',
      backgroundColor: '#3e5c5b',
      padding: { x: 6, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(-8_900);

  for (const [x, y, label] of [
    [17, 0.1, 'STUDIO'],
    [0.1, 14, 'LOUNGE'],
  ] as const) {
    const point = projectOfficePoint(x, y, 45);
    scene.add
      .text(point.x, point.y, label, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#e7e4ca',
        backgroundColor: '#3e5c5b',
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(-8_900);
  }

  OFFICE_LAYOUT.fixtures.forEach((fixture) => drawFixture(scene, fixture));
};
