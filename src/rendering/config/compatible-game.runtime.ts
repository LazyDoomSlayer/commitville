import Phaser from 'phaser';
import type { PrivateAssetsManifest } from '../../services/assets/private-assets.service';
import { createGameConfig } from './game.config';
import { detectOfficeRenderer, type RendererPreference } from './renderer-capability.config';

// Own renderer boot and one-way recovery; the simulation stays renderer-agnostic.
export const createCompatibleGame = (
  parent: HTMLElement,
  view: 'angled' | 'flat',
  assets: PrivateAssetsManifest | null,
  piPreview: boolean,
  preference: RendererPreference,
) => {
  let current: Phaser.Game | undefined;
  let destroyed = false;
  let recoveryPending = false;
  let bootTimeout: ReturnType<typeof setTimeout> | undefined;
  const abort = new AbortController();
  const renderer =
    piPreview || preference === 'canvas'
      ? 'canvas'
      : preference === 'webgl'
        ? 'webgl'
        : detectOfficeRenderer();
  parent.dataset.renderer = renderer;
  const recover = () => {
    if (destroyed || renderer === 'canvas' || recoveryPending) return;
    recoveryPending = true;
    // A fresh document releases failed driver contexts and all Phaser resources.
    // Preserve view/profile parameters and explicitly select Canvas to avoid loops.
    setTimeout(() => {
      if (destroyed) return;
      const url = new URL(window.location.href);
      url.searchParams.set('renderer', 'canvas');
      window.location.replace(url.href);
    }, 0);
  };
  const config = createGameConfig(parent, view, assets, piPreview, renderer);
  const preBoot = config.callbacks!.preBoot;
  config.callbacks!.preBoot = (game) => {
    current = game;
    preBoot?.(game);
  };
  config.callbacks!.postBoot = (game) => {
    if (renderer !== 'webgl') return;
    game.canvas.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault();
        recover();
      },
      { signal: abort.signal },
    );
    const verifyFirstFrame = () => {
      if (!game.scene.getScenes(true).some((scene) => scene.children.list.length > 0)) return;
      clearTimeout(bootTimeout);
      game.events.off(Phaser.Core.Events.POST_RENDER, verifyFirstFrame);
      const gl = (game.renderer as Phaser.Renderer.WebGL.WebGLRenderer).gl;
      if (gl.isContextLost() || gl.getError() !== gl.NO_ERROR) recover();
    };
    game.events.on(Phaser.Core.Events.POST_RENDER, verifyFirstFrame);
  };
  try {
    current = new Phaser.Game(config);
    if (renderer === 'webgl') bootTimeout = setTimeout(recover, 20_000);
  } catch (error) {
    if (renderer === 'canvas') throw error;
    console.warn('WebGL initialization failed; retrying with Canvas.', error);
    recover();
  }
  return {
    get game() {
      return current!;
    },
    destroy() {
      destroyed = true;
      clearTimeout(bootTimeout);
      abort.abort();
      current?.destroy(true);
    },
  };
};
