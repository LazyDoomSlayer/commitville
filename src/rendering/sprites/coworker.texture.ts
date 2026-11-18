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

// Original code-drawn people. Standing and seated work use separate native
// silhouettes; the floor anchor stays fixed when someone sits down or gets up.
export const createCoworkerTextures = (textures: Phaser.Textures.TextureManager): void => {
  for (let index = 0; index < 10; index += 1) {
    const key = coworkerTextureKey(index);
    if (textures.exists(key)) continue;
    const texture = textures.createCanvas(key, 24 * 4, 40 * 6);
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
    for (let row = 0; row < 6; row += 1) {
      const working = row >= 4;
      const seated = row === 5;
      const direction = working ? 'north' : DIRECTIONS[row]!;
      for (let phase = 0; phase < 4; phase += 1) {
        const rect = (x: number, y: number, width: number, height: number, color: string): void => {
          context.fillStyle = color;
          context.fillRect(phase * 24 + x, row * 40 + y, width, height);
        };
        const stride = !working && phase === 1 ? -1 : !working && phase === 3 ? 1 : 0;
        const side = direction === 'east' || direction === 'west';
        const headY = seated ? 10 : 2;
        rect(side ? 9 : 8, headY + 1, side ? 7 : 9, 9, palette.outline);
        rect(side ? 10 : 9, headY + 2, side ? 6 : 7, 7, palette.skin);
        rect(side ? 9 : 8, headY, side ? 7 : 9, 4, palette.hair);
        if (direction === 'north') rect(8, headY + 2, 9, 6, palette.hair);
        else if (direction === 'south') {
          rect(10, headY + 5, 1, 1, palette.outline);
          rect(14, headY + 5, 1, 1, palette.outline);
        } else {
          rect(direction === 'east' ? 15 : 9, headY + 5, 1, 1, palette.outline);
          rect(direction === 'east' ? 9 : 14, headY + 3, 2, 5, palette.hair);
        }
        const shoulderY = seated ? 21 : 13;
        rect(side ? 9 : 7, shoulderY, side ? 7 : 11, seated ? 10 : 14, palette.outline);
        rect(side ? 10 : 8, shoulderY, side ? 5 : 9, seated ? 9 : 13, palette.shirt);
        rect(10, shoulderY - 1, 4, 2, palette.skin);
        if (working) {
          const handsY = seated ? 21 : 15;
          // Bent elbows and alternating hands reach forward to the keyboard.
          rect(6, shoulderY + 1, 2, 5, palette.shirt);
          rect(17, shoulderY + 1, 2, 5, palette.shirt);
          rect(6, handsY + (phase % 2), 4, 2, palette.skin);
          rect(16, handsY + 1 - (phase % 2), 4, 2, palette.skin);
        } else {
          for (const [x, offset] of [
            [6, stride],
            [17, -stride],
          ]) {
            rect(x!, 15 + offset!, 2, 9, palette.shirt);
            rect(x!, 24 + offset!, 2, 2, palette.skin);
          }
        }
        if (seated) {
          // Compact bent legs below the seat; shoes stay together beneath
          // the desk instead of splaying around the chair's wheel base.
          rect(9, 30, 3, 3, palette.trousers);
          rect(13, 30, 3, 3, palette.trousers);
          rect(10, 32, 2, 4, palette.trousers);
          rect(13, 32, 2, 4, palette.trousers);
          rect(10, 36, 3, 2, palette.shoe);
          rect(13, 36, 3, 2, palette.shoe);
        } else {
          for (const [x, offset] of [
            [9, stride],
            [14, -stride],
          ]) {
            rect(x!, 27, 3, 10, palette.trousers);
            rect(x! - 1 + offset!, 36 + Math.min(0, offset!), 4, 2, palette.shoe);
          }
        }
        const name = working
          ? `${seated ? 'seated' : 'standing'}-work-${phase}`
          : coworkerFrame(direction, phase);
        texture.add(name, 0, phase * 24, row * 40, 24, 40);
      }
    }
    texture.refresh();
  }
};
