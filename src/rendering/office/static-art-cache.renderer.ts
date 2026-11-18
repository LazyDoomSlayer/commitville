import Phaser from 'phaser';

export interface StaticArtBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Draw in world coordinates while placing the cached pixels in a tight canvas.
export const createStaticArt = (scene: Phaser.Scene, bounds: StaticArtBounds, depth: number) =>
  scene.add.graphics().setDepth(depth).translateCanvas(-bounds.left, -bounds.top);

export const cacheStaticArt = (
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  bounds: StaticArtBounds,
  key: string,
): void => {
  if (!scene.textures.exists(key)) graphics.generateTexture(key, bounds.width, bounds.height);
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
  scene.add.image(bounds.left, bounds.top, key).setOrigin(0).setDepth(graphics.depth);
  graphics.destroy();
};
