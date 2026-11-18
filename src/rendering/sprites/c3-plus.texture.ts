import type Phaser from 'phaser';

import type { PatrolDirection } from '../../simulation/characters/office-patrol.system';

export const C3_PLUS_TEXTURE_KEY = 'c3-plus-directions';
export const C3_PLUS_SPRITE_WIDTH = 32;
export const C3_PLUS_SPRITE_HEIGHT = 48;
const DIRECTIONS: PatrolDirection[] = ['south', 'east', 'north', 'west'];
export const c3PlusFrame = (direction: PatrolDirection, phase = 0): string =>
  `${direction}-${phase}`;

// An original, simplified circuit-board character: photographic identifiers
// and exact wiring are deliberately absent from these native source pixels.
const spritePixels = (direction: PatrolDirection, phase: number): string[][] => {
  const pixels = Array.from({ length: 48 }, () => Array<string>(32).fill('.'));
  const rect = (x: number, y: number, width: number, height: number, color: string): void => {
    for (let row = y; row < y + height; row += 1) {
      for (let column = x; column < x + width; column += 1) pixels[row]![column] = color;
    }
  };
  const side = direction === 'east' || direction === 'west';
  if (!side) {
    rect(6, 2, 21, 39, '0');
    rect(7, 3, 19, 37, '2');
    rect(25, 4, 1, 35, '1');
    for (const x of [8, 24]) for (const y of [4, 38]) rect(x, y, 1, 1, '4');
    if (direction === 'south') {
      // Heavy upper cover, small invented face, and projecting Ethernet jack.
      rect(7, 2, 20, 12, '1');
      rect(8, 3, 17, 9, '9');
      rect(8, 3, 16, 1, '4');
      rect(11, 6, 2, 2, '4');
      rect(20, 6, 2, 2, '4');
      rect(14, 9, 1, 1, '7');
      rect(19, 9, 1, 1, '7');
      rect(15, 10, 4, 1, '7');
      rect(3, 5, 4, 5, '4');
      rect(3, 6, 3, 3, '5');
      rect(3, 5, 1, 1, '7');
      // Two abstract traces hint at the PCB, without reproducing a real circuit.
      rect(8, 15, 1, 18, '3');
      rect(9, 30, 13, 1, '3');
      rect(21, 15, 1, 9, '3');
      rect(18, 23, 4, 1, '3');
      // A stepped circular coin cell is the strongest exposed-board feature.
      rect(11, 16, 5, 7, '1');
      rect(10, 17, 7, 5, '1');
      rect(11, 17, 5, 5, '4');
      rect(12, 16, 3, 1, '4');
      rect(12, 22, 3, 1, '4');
      rect(12, 18, 3, 1, '9');
      rect(19, 17, 5, 4, '5');
      rect(20, 16, 3, 1, '6');
      rect(20, 21, 3, 1, '6');
      rect(10, 25, 6, 4, '8');
      rect(10, 31, 6, 3, '5');
      rect(20, 27, 4, 4, '5');
      rect(20, 26, 4, 1, '4');
      rect(20, 31, 4, 1, '4');
      for (const x of [10, 16]) {
        rect(x, 35, 4, 4, '9');
        rect(x, 34, 4, 2, '4');
        rect(x + 1, 36, 1, 2, '4');
      }
      for (const y of [24, 28, 33]) rect(23, y, 1, 1, '7');
      for (const y of [23, 27, 31, 35]) {
        rect(4, y, 3, 4, '1');
        rect(5, y + 1, 1, 1, '4');
        rect(26, y, 3, 4, '1');
        rect(27, y + 1, 1, 1, '4');
      }
    } else {
      // Rear solder pads and traces, with no front cover, battery or face.
      for (const x of [9, 13, 18, 23]) {
        rect(x, 8, 1, 26, '3');
        rect(x + 1, 27, 1, 8, '3');
      }
      for (const y of [6, 15, 26, 36]) {
        for (const x of [8, 12, 20, 24]) rect(x, y, 1, 1, '4');
      }
      rect(14, 20, 4, 5, '1');
      rect(15, 21, 2, 3, '3');
      rect(26, 5, 3, 5, '4');
      for (const y of [23, 27, 31, 35]) {
        rect(4, y, 3, 4, '1');
        rect(26, y, 3, 4, '1');
      }
    }
  } else {
    // Thin exposed board below a deep vented cap, with component relief.
    rect(13, 2, 3, 39, '0');
    rect(14, 3, 1, 37, '3');
    rect(14, 2, 8, 12, '0');
    rect(15, 3, 6, 10, '9');
    for (const y of [5, 7, 9, 11]) rect(17, y, 4, 1, '1');
    rect(21, 5, 3, 5, '4');
    rect(22, 6, 2, 3, '5');
    rect(16, 17, 3, 6, '4');
    rect(18, 18, 1, 4, '9');
    rect(16, 25, 4, 4, '8');
    rect(16, 31, 3, 3, '5');
    rect(16, 35, 4, 4, '9');
    rect(16, 34, 4, 1, '4');
    for (const y of [24, 28, 32, 36]) {
      rect(10, y, 3, 3, '1');
      rect(11, y, 1, 1, '4');
    }
    if (direction === 'west') pixels.forEach((row) => row.reverse());
  }
  const stride = phase === 1 ? -1 : phase === 3 ? 1 : 0;
  const arms = side ? [direction === 'east' ? 14 : 16] : [2, 29];
  arms.forEach((x, index) => {
    const swing = index === 0 ? stride : -stride;
    rect(x, 24 + swing, 2, 9, '0');
    rect(x, 25 + swing, 1, 6, '9');
    rect(x, 33 + swing, 2, 2, '4');
  });
  for (const [x, offset] of [
    [10, stride],
    [21, -stride],
  ]) {
    rect(x!, 41, 2, 4, '0');
    rect(x!, 41, 1, 3, '9');
    rect(x! - 1 + offset!, 44 + Math.min(0, offset!), 4, 2, '0');
    rect(x! + offset!, 44 + Math.min(0, offset!), 2, 1, '9');
  }
  return pixels;
};

export const createC3PlusTexture = (textures: Phaser.Textures.TextureManager): void => {
  if (textures.exists(C3_PLUS_TEXTURE_KEY)) return;
  const width = C3_PLUS_SPRITE_WIDTH;
  const height = C3_PLUS_SPRITE_HEIGHT;
  const texture = textures.createCanvas(C3_PLUS_TEXTURE_KEY, width * 4, height * 4);
  if (!texture) throw new Error('Unable to create the C3 Plus sprite texture.');
  const palette: Record<string, string> = {
    0: '#172730',
    1: '#26323c',
    2: '#414f52',
    3: '#667b70',
    4: '#bac6c2',
    5: '#243642',
    6: '#a3a17b',
    7: '#9cd9b2',
    8: '#536c87',
    9: '#59636d',
  };
  const context = texture.getContext();
  DIRECTIONS.forEach((direction, row) => {
    for (let phase = 0; phase < 4; phase += 1) {
      spritePixels(direction, phase).forEach((pixels, y) =>
        pixels.forEach((pixel, x) => {
          const color = palette[pixel];
          if (color) {
            context.fillStyle = color;
            context.fillRect(phase * width + x, row * height + y, 1, 1);
          }
        }),
      );
      texture.add(c3PlusFrame(direction, phase), 0, phase * width, row * height, width, height);
    }
  });
  texture.refresh();
};
