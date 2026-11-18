import Phaser from 'phaser';

import {
  PRIVATE_ASSETS_REGISTRY_KEY,
  type PrivateAssetsManifest,
} from '../../services/assets/private-assets.service';
import { FlatOfficeScene } from '../scenes/flat-office.scene';
import { OfficeScene } from '../scenes/office.scene';

export const createGameConfig = (
  parent: string,
  view: 'angled' | 'flat' = 'angled',
  privateAssets: PrivateAssetsManifest | null = null,
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#172a32',
  pixelArt: true,
  roundPixels: true,
  scene: view === 'flat' ? [FlatOfficeScene] : [OfficeScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  callbacks: {
    preBoot: (game) => game.registry.set(PRIVATE_ASSETS_REGISTRY_KEY, privateAssets),
  },
  render: {
    antialias: false,
  },
});
