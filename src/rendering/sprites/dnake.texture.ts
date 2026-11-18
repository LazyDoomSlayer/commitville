import type Phaser from 'phaser';

import type { DnakeDirection } from '../../simulation/characters/dnake-walk.system';

export const DNAKE_TEXTURE_KEY = 'dnake-directions';
export const DNAKE_SPRITE_WIDTH = 24;
export const DNAKE_SPRITE_HEIGHT = 40;

const DIRECTIONS: DnakeDirection[] = ['south', 'east', 'north', 'west'];

export const dnakeFrame = (direction: DnakeDirection, phase = 0): string => `${direction}-${phase}`;

// One character is one source pixel. Keep the silhouette, lighting and keypad
// deliberately simple so they survive an integer zoom on the office display.
const PIXELS = [
  '.......0000000000.......',
  '......033333333330......',
  '.....02222222222210.....',
  '.....02444444444210.....',
  '.....02444000444210.....',
  '.....02440565404210.....',
  '.....02770505477210.....',
  '.....02440555404210.....',
  '.....02444000444210.....',
  '.....02222222222210.....',
  '.....00000000000010.....',
  '.....01555555555110.....',
  '.....01555555555110.....',
  '.....01558555855110.....',
  '.....01558555855110.....',
  '.....01555555555110.....',
  '.....01555885555110.....',
  '....001555555555110.....',
  '...0310000000000010.00..',
  '...03122222222222100340.',
  '...03127727727727703440.',
  '...03123323323323303300.',
  '...031277277277277010...',
  '..0341233233233233010...',
  '..044127727727727700....',
  '..03312332332332330.....',
  '...0012772772772770.....',
  '.....02332332332330.....',
  '.....02222222222210.....',
  '.....02110110112210.....',
  '.....02222222222210.....',
  '......000000000000......',
  '.......031..031.........',
  '.......031..031.........',
  '......02210.02210.......',
  '......00000.00000.......',
];

const directionPixels = (direction: DnakeDirection): string[][] => {
  const grid = PIXELS.map((row) => [...row]);
  // Neutral arms replace the concept's permanent wave; the gait swings them.
  for (let y = 17; y < 28; y += 1) {
    for (let x = 0; x < 5; x += 1) grid[y]![x] = '.';
    for (let x = 19; x < 24; x += 1) grid[y]![x] = '.';
  }
  if (direction === 'north') {
    for (let y = 3; y < 31; y += 1) {
      for (let x = 6; x <= 18; x += 1) grid[y]![x] = x === 18 ? '1' : '2';
    }
    for (const y of [10, 12, 14]) {
      for (let x = 9; x < 16; x += 1) grid[y]![x] = '1';
    }
    for (let y = 21; y < 27; y += 1) {
      for (let x = 10; x < 15; x += 1) grid[y]![x] = '3';
    }
    for (const [x, y] of [
      [7, 5],
      [16, 5],
      [7, 29],
      [16, 29],
    ])
      grid[y!]![x!] = '7';
  }
  if (direction === 'east' || direction === 'west') {
    grid.forEach((row) => row.fill('.'));
    for (let y = 1; y < 32; y += 1) {
      for (let x = 8; x < 17; x += 1) {
        grid[y]![x] = x === 8 || y === 1 || y === 31 ? '0' : x < 11 ? '3' : '2';
      }
      grid[y]![17] = y > 9 && y < 18 ? '5' : '1';
    }
    for (let y = 4; y < 9; y += 1) grid[y]![18] = '0';
    grid[5]![18] = '6';
    grid[13]![17] = '8';
    for (const y of [20, 22, 24, 26]) grid[y]![18] = '7';
    for (const y of [11, 13, 15]) {
      for (let x = 10; x < 14; x += 1) grid[y]![x] = '1';
    }
    if (direction === 'west') grid.forEach((row) => row.reverse());
  }
  return grid;
};

export const createDnakeTexture = (textures: Phaser.Textures.TextureManager): void => {
  if (textures.exists(DNAKE_TEXTURE_KEY)) return;

  const texture = textures.createCanvas(DNAKE_TEXTURE_KEY, 24 * 4, DNAKE_SPRITE_HEIGHT * 4);
  if (!texture) throw new Error('Unable to create the Dnake sprite texture.');

  const palette: Record<string, string> = {
    0: '#303340',
    1: '#555b68',
    2: '#969da8',
    3: '#707b88',
    4: '#c8cdd0',
    5: '#252f36',
    6: '#8ec6b0',
    7: '#e3e3d6',
    8: '#9cd9b2',
  };
  const context = texture.getContext();

  DIRECTIONS.forEach((direction, rowIndex) => {
    for (let phase = 0; phase < 4; phase += 1) {
      const grid = directionPixels(direction);
      // Two planted-foot poses and two opposite strides. Keep the silhouette
      // and floor anchor fixed; only limbs move, never the whole sprite.
      for (let y = 32; y < 36; y += 1) grid[y]!.fill('.');
      const stride = phase === 1 ? -1 : phase === 3 ? 1 : 0;
      for (const [leg, offset] of [
        [7, stride],
        [13, -stride],
      ]) {
        for (let y = 32; y < 35; y += 1) {
          grid[y]![leg!] = '0';
          grid[y]![leg! + 1] = '3';
          grid[y]![leg! + 2] = '1';
        }
        for (let x = leg! - 1; x <= leg! + 3; x += 1) grid[35 + Math.min(0, offset!)]![x] = '0';
        grid[34 + Math.min(0, offset!)]![leg! + 1 + offset!] = '2';
      }
      const sideOn = direction === 'east' || direction === 'west';
      const arms = sideOn ? [direction === 'east' ? 11 : 10] : [3, 19];
      arms.forEach((x, index) => {
        const swing = index === 0 ? stride : -stride;
        for (let y = 20; y < 26; y += 1) {
          grid[y + swing]![x] = '0';
          grid[y + swing]![x + 1] = '3';
        }
        grid[26 + swing]![x] = '4';
        grid[26 + swing]![x + 1] = '1';
      });
      grid.forEach((row, y) =>
        row.forEach((pixel, x) => {
          const color = palette[pixel];
          if (color) {
            context.fillStyle = color;
            context.fillRect(phase * 24 + x, rowIndex * DNAKE_SPRITE_HEIGHT + y + 2, 1, 1);
          }
        }),
      );
      texture.add(
        dnakeFrame(direction, phase),
        0,
        phase * 24,
        rowIndex * DNAKE_SPRITE_HEIGHT,
        24,
        DNAKE_SPRITE_HEIGHT,
      );
    }
  });
  texture.refresh();
};
