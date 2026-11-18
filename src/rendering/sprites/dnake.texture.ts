import type Phaser from 'phaser';

export const DNAKE_TEXTURE_KEY = 'dnake-pixel';
export const DNAKE_SPRITE_WIDTH = 24;

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

export const createDnakeTexture = (textures: Phaser.Textures.TextureManager): void => {
  if (textures.exists(DNAKE_TEXTURE_KEY)) {
    return;
  }

  const texture = textures.createCanvas(DNAKE_TEXTURE_KEY, DNAKE_SPRITE_WIDTH, PIXELS.length);
  if (!texture) {
    throw new Error('Unable to create the Dnake sprite texture.');
  }

  const palette: Record<string, string> = {
    0: '#303340', // outline
    1: '#555b68', // side and recessed metal
    2: '#969da8', // casing
    3: '#707b88', // shadow
    4: '#c8cdd0', // upper metal face
    5: '#252f36', // glass and lens
    6: '#8ec6b0', // lens glint
    7: '#e3e3d6', // lights and key caps
    8: '#9cd9b2', // display smile
  };
  const context = texture.getContext();

  PIXELS.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = palette[pixel];
      if (color) {
        context.fillStyle = color;
        context.fillRect(x, y, 1, 1);
      }
    });
  });
  texture.refresh();
};
