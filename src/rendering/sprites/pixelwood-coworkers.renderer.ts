import type Phaser from 'phaser';

import type { PixelwoodPackManifest } from '../../services/assets/private-assets.service';
import type { CoworkerSnapshot } from '../../simulation/characters/coworker.system';

const NPC_NAMES = [
  'npcOne',
  'npcTwo',
  'npcThree',
  'npcFour',
  'npcFive',
  'npcSix',
  'npcSeven',
  'npcEight',
] as const;
export const PIXELWOOD_COWORKER_KEYS = NPC_NAMES.map((name) => `coworker-pixelwood-${name}`);

export const queuePixelwoodCoworkers = (
  scene: Phaser.Scene,
  pack: PixelwoodPackManifest | undefined,
): void => {
  if (!pack) return;
  NPC_NAMES.forEach((name, index) => {
    const path = pack.assets[name];
    const key = PIXELWOOD_COWORKER_KEYS[index]!;
    if (path && !scene.textures.exists(key))
      scene.load.image(key, `${import.meta.env.BASE_URL}assets/private/${path}`);
  });
};

// Technical frame integration only: no image generation, palette imitation or
// licensed image files enter source control. NPC sheets use 59×49 source cells.
export const preparePixelwoodCoworkers = (textures: Phaser.Textures.TextureManager): string[] => {
  const available: string[] = [];
  for (const key of PIXELWOOD_COWORKER_KEYS) {
    if (!textures.exists(key)) continue;
    const texture = textures.get(key);
    const source = texture.getSourceImage();
    if (source.width !== 236 || source.height !== 343) continue;
    if (!texture.has('idle-south')) {
      for (const [direction, idleColumn, walkRow] of [
        ['south', 0, 1],
        ['east', 1, 5],
        ['north', 2, 3],
        ['west', 1, 5],
      ] as const) {
        texture.add(`idle-${direction}`, 0, idleColumn * 59 + 18, 9, 24, 28);
        for (let phase = 0; phase < 4; phase += 1)
          texture.add(`${direction}-${phase}`, 0, phase * 59 + 18, walkRow * 49 + 9, 24, 28);
      }
    }
    available.push(key);
  }
  return available;
};

export const applyPixelwoodCoworker = (
  sprite: Phaser.GameObjects.Sprite,
  key: string,
  person: CoworkerSnapshot,
): number => {
  const seated = person.workPosture === 'seated';
  const frame = person.walking
    ? `${person.direction}-${Math.floor(person.walkingMs / 160) % 4}`
    : `idle-${person.direction}`;
  sprite
    .setTexture(key, frame)
    .setOrigin(0.5, 27 / 28)
    .setScale(2)
    .setFlipX(person.direction === 'west');
  // The pack has no seated frames. Keep its original upper body intact and
  // hide its feet behind the independently drawn chair and desk.
  if (seated) sprite.setCrop(0, 0, 24, 23);
  else sprite.setCrop();
  return seated ? -12 : 0;
};
