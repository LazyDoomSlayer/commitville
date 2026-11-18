import type Phaser from 'phaser';

import type { PatrolDirection } from '../../simulation/characters/office-patrol.system';

export const ZKTECO_TEXTURE_KEY = 'zkteco-c2-260-directions';
export const ZKTECO_SPRITE_SIZE = 36;
const DIRECTIONS: PatrolDirection[] = ['south', 'east', 'north', 'west'];
export const zktecoFrame = (direction: PatrolDirection, phase = 0): string =>
  `${direction}-${phase}`;

// Native solid pixels reconstruct the photographed controller's broad housing,
// recessed corners, terminal rows and three LEDs. No photograph is shipped.
const spritePixels = (direction: PatrolDirection, phase: number): string[][] => {
  const pixels = Array.from({ length: 36 }, () => Array<string>(36).fill('.'));
  const rect = (x: number, y: number, width: number, height: number, color: string): void => {
    for (let row = y; row < y + height; row += 1) {
      for (let column = x; column < x + width; column += 1) pixels[row]![column] = color;
    }
  };
  const side = direction === 'east' || direction === 'west';
  if (!side) {
    // Inset corners and a separate narrow right face suggest the molded shell.
    rect(8, 3, 20, 26, '0');
    rect(4, 7, 28, 18, '0');
    rect(6, 5, 24, 22, '0');
    rect(8, 4, 19, 24, '2');
    rect(5, 8, 26, 16, '2');
    rect(7, 6, 22, 20, '2');
    rect(28, 7, 3, 18, '1');
    rect(9, 5, 17, 1, '3');
    rect(7, 8, 1, 16, '3');
    if (direction === 'south') {
      for (const [y, color] of [
        [9, '6'],
        [14, '7'],
        [19, '8'],
      ] as const) {
        rect(9, y, 3, 2, '0');
        rect(9, y, 2, 1, color);
      }
      // A small invented face, above a pale angular chest mark, adds personality
      // without inventing a screen or a keypad on this screenless device.
      rect(16, 10, 2, 3, '4');
      rect(23, 10, 2, 3, '4');
      rect(18, 14, 1, 1, '7');
      rect(22, 14, 1, 1, '7');
      rect(19, 15, 3, 1, '7');
      rect(16, 18, 5, 1, '3');
      rect(19, 19, 1, 1, '3');
      rect(18, 20, 1, 1, '3');
      rect(16, 21, 5, 1, '3');
      rect(22, 18, 1, 4, '3');
      rect(24, 18, 1, 1, '3');
      rect(23, 19, 1, 1, '3');
      rect(24, 20, 1, 2, '3');
      for (let x = 13; x < 28; x += 3) {
        rect(x, 6, 2, 2, '0');
        rect(x, 7, 1, 1, '5');
        rect(x, 24, 2, 2, '0');
        rect(x, 24, 1, 1, '5');
      }
    } else {
      // Rear mounting bracket and slots are distinct from the front face.
      for (const y of [9, 21]) {
        rect(9, y, 18, 3, '1');
        rect(10, y, 16, 1, '3');
      }
      for (let x = 10; x < 27; x += 4) rect(x, 16, 2, 1, '0');
      for (const x of [8, 27]) for (const y of [7, 24]) rect(x, y, 1, 1, '5');
    }
  } else {
    rect(12, 4, 11, 24, '0');
    rect(11, 8, 14, 16, '0');
    rect(13, 5, 8, 22, '2');
    rect(12, 9, 12, 14, '2');
    rect(13, 6, 2, 20, '3');
    rect(21, 7, 2, 18, '1');
    for (let y = 8; y < 17; y += 3) {
      rect(22, y, 2, 2, '0');
      rect(23, y, 1, 1, '5');
    }
    // Ethernet jack, USB slit and red switch block from the side photographs.
    rect(16, 18, 6, 6, '3');
    rect(17, 19, 4, 4, '0');
    rect(17, 19, 1, 1, '7');
    rect(20, 19, 1, 1, '8');
    rect(13, 19, 1, 4, '0');
    rect(17, 25, 5, 2, '6');
    for (let x = 17; x < 22; x += 2) rect(x, 25, 1, 1, '5');
    if (direction === 'west') pixels.forEach((row) => row.reverse());
  }

  const stride = phase === 1 ? -1 : phase === 3 ? 1 : 0;
  const arms = side ? [direction === 'east' ? 12 : 22] : [2, 32];
  arms.forEach((x, index) => {
    const swing = index === 0 ? stride : -stride;
    rect(x, 17 + swing, 2, 8, '0');
    rect(x, 18 + swing, 1, 5, '3');
    rect(x, 25 + swing, 2, 2, '4');
  });
  for (const [x, offset] of [
    [12, stride],
    [22, -stride],
  ]) {
    rect(x!, 28, 3, 5, '0');
    rect(x! + 1, 28, 1, 4, '3');
    rect(x! - 1 + offset!, 32 + Math.min(0, offset!), 5, 2, '0');
    rect(x! + offset!, 32 + Math.min(0, offset!), 3, 1, '3');
  }
  return pixels;
};

export const createZktecoTexture = (textures: Phaser.Textures.TextureManager): void => {
  if (textures.exists(ZKTECO_TEXTURE_KEY)) return;
  const size = ZKTECO_SPRITE_SIZE;
  const texture = textures.createCanvas(ZKTECO_TEXTURE_KEY, size * 4, size * 4);
  if (!texture) throw new Error('Unable to create the C2-260 sprite texture.');
  const palette: Record<string, string> = {
    0: '#15232d',
    1: '#26343e',
    2: '#384752',
    3: '#657580',
    4: '#c2d0cb',
    5: '#a5aca0',
    6: '#dc756d',
    7: '#9dd6a5',
    8: '#e3c078',
  };
  const context = texture.getContext();
  DIRECTIONS.forEach((direction, row) => {
    for (let phase = 0; phase < 4; phase += 1) {
      spritePixels(direction, phase).forEach((pixels, y) =>
        pixels.forEach((pixel, x) => {
          const color = palette[pixel];
          if (color) {
            context.fillStyle = color;
            context.fillRect(phase * size + x, row * size + y, 1, 1);
          }
        }),
      );
      texture.add(zktecoFrame(direction, phase), 0, phase * size, row * size, size, size);
    }
  });
  texture.refresh();
};
