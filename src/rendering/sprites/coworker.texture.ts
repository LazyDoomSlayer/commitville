import type Phaser from 'phaser';
import type { PatrolDirection } from '../../simulation/characters/office-patrol.system';

export const coworkerTextureKey = (index: number): string => `coworker-${index}`;
export const coworkerFrame = (direction: PatrolDirection, phase = 0): string =>
  `${direction}-${phase}`;
const DIRECTIONS: PatrolDirection[] = ['south', 'east', 'north', 'west'];
const SHIRTS = [
  '#669b98',
  '#c49b67',
  '#aa7d92',
  '#6385a1',
  '#789c6b',
  '#b87e66',
  '#8b85b1',
  '#60968c',
  '#bb9f62',
  '#8296ab',
];
const HAIR = [
  '#384653',
  '#7b5643',
  '#caa477',
  '#2d3541',
  '#b66a4a',
  '#606a79',
  '#b9b4a6',
  '#4b3b4c',
  '#85534a',
  '#cab57f',
];
const SKIN = ['#e3bc99', '#bf8c68', '#a87454', '#edcaaa', '#d6a57c'];

// Original code-drawn people, independent of any licensed character pack.
export const createCoworkerTextures = (textures: Phaser.Textures.TextureManager): void => {
  for (let index = 0; index < 10; index += 1) {
    const key = coworkerTextureKey(index);
    if (textures.exists(key)) continue;
    const texture = textures.createCanvas(key, 20 * 4, 32 * 5);
    if (!texture) throw new Error('Unable to create a coworker texture.');
    const context = texture.getContext();
    const palette = {
      outline: '#263540',
      hair: HAIR[index]!,
      skin: SKIN[index % SKIN.length]!,
      shirt: SHIRTS[index]!,
      trousers: '#49596b',
      shoe: '#263540',
    };
    for (let row = 0; row < 5; row += 1) {
      const working = row === 4;
      const direction = working ? 'north' : DIRECTIONS[row]!;
      for (let phase = 0; phase < 4; phase += 1) {
        const rect = (x: number, y: number, width: number, height: number, color: string): void => {
          context.fillStyle = color;
          context.fillRect(phase * 20 + x, row * 32 + y, width, height);
        };
        const stride = !working && phase === 1 ? -1 : !working && phase === 3 ? 1 : 0;
        const side = direction === 'east' || direction === 'west';
        rect(side ? 7 : 6, 3, side ? 7 : 9, 9, palette.outline);
        rect(side ? 8 : 7, 4, side ? 6 : 7, 7, palette.skin);
        rect(side ? 7 : 6, 2, side ? 7 : 9, 4, palette.hair);
        if (direction === 'north') rect(6, 4, 9, 6, palette.hair);
        else if (direction === 'south') {
          rect(8, 7, 1, 1, palette.outline);
          rect(12, 7, 1, 1, palette.outline);
        } else {
          rect(direction === 'east' ? 13 : 7, 7, 1, 1, palette.outline);
          rect(direction === 'east' ? 7 : 12, 5, 2, 5, palette.hair);
        }
        rect(side ? 7 : 5, 12, side ? 7 : 11, 12, palette.outline);
        rect(side ? 8 : 6, 12, side ? 5 : 9, 11, palette.shirt);
        rect(8, 11, 4, 2, palette.skin);
        if (working) {
          rect(4, 14, 2, 5, palette.shirt);
          rect(15, 14, 2, 5, palette.shirt);
          rect(3, 13 + (phase % 2), 3, 2, palette.skin);
          rect(15, 14 - (phase % 2), 3, 2, palette.skin);
        } else {
          for (const [x, offset] of [
            [4, stride],
            [15, -stride],
          ]) {
            rect(x!, 14 + offset!, 2, 7, palette.shirt);
            rect(x!, 21 + offset!, 2, 2, palette.skin);
          }
        }
        for (const [x, offset] of [
          [7, stride],
          [12, -stride],
        ]) {
          rect(x!, 24, 3, 6, palette.trousers);
          rect(x! - 1 + offset!, 29 + Math.min(0, offset!), 4, 2, palette.shoe);
        }
        const name = working ? `work-${phase}` : coworkerFrame(direction, phase);
        texture.add(name, 0, phase * 20, row * 32, 20, 32);
      }
    }
    texture.refresh();
  }
};
