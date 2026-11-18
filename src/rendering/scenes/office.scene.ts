import {
  PRIVATE_ASSETS_REGISTRY_KEY,
  type PrivateAssetsManifest,
} from '../../services/assets/private-assets.service';
import {
  queuePixelwoodCoworkers,
  preparePixelwoodCoworkers,
  applyPixelwoodCoworker,
} from '../sprites/pixelwood-coworkers.renderer';
import { COWORKERS } from '../../simulation/characters/coworker-roster';
import {
  createCoworkerTextures,
  coworkerTextureKey,
  coworkerFrame,
} from '../sprites/coworker.texture';
import Phaser from 'phaser';

import {
  MASCOT_IDS,
  MASCOT_NAMES,
  OfficePopulationSystem,
  type MascotId,
} from '../../simulation/characters/office-population.system';
import type { PatrolDirection } from '../../simulation/characters/office-patrol.system';
import { createMascotSpeech } from '../../ui/mascot-speech';
import { bindOfficeControls } from '../../ui/office-camera';
import {
  OFFICE_VIEW,
  drawIsometricOffice,
  projectOfficePoint,
} from '../office/isometric-office.renderer';
import { createC3PlusTexture, C3_PLUS_TEXTURE_KEY, c3PlusFrame } from '../sprites/c3-plus.texture';
import { createDnakeTexture, DNAKE_TEXTURE_KEY, dnakeFrame } from '../sprites/dnake.texture';
import { createZktecoTexture, ZKTECO_TEXTURE_KEY, zktecoFrame } from '../sprites/zkteco.texture';

export class OfficeScene extends Phaser.Scene {
  private readonly population = new OfficePopulationSystem();
  private selectedMascot: MascotId = 'dnake';
  private readonly coworkers: {
    sprite: Phaser.GameObjects.Sprite;
    shadow: Phaser.GameObjects.Ellipse;
  }[] = [];
  private readonly visuals = new Map<
    MascotId,
    {
      sprite: Phaser.GameObjects.Sprite;
      shadow: Phaser.GameObjects.Ellipse;
      frame: (direction: PatrolDirection, phase: number) => string;
    }
  >();
  private controls: ReturnType<typeof bindOfficeControls> | undefined;
  private speech: ReturnType<typeof createMascotSpeech> | undefined;
  private licensedCoworkers: string[] = [];
  private fitZoom = 1;
  private following = false;
  private dragLast: { x: number; y: number } | undefined;
  private pinchDistance = 0;

  constructor() {
    super('office');
  }

  preload(): void {
    const manifest = this.registry.get(PRIVATE_ASSETS_REGISTRY_KEY) as PrivateAssetsManifest | null;
    queuePixelwoodCoworkers(this, manifest?.packs.pixelwoodValley);
  }

  create(): void {
    this.licensedCoworkers = preparePixelwoodCoworkers(this.textures);
    createDnakeTexture(this.textures);
    createZktecoTexture(this.textures);
    createC3PlusTexture(this.textures);
    this.cameras.main.setBackgroundColor('#172a32');
    drawIsometricOffice(this);
    createCoworkerTextures(this.textures);
    COWORKERS.forEach((_, index) =>
      this.coworkers.push({
        sprite: this.add
          .sprite(0, 0, coworkerTextureKey(index), 'south-0')
          .setOrigin(0.5, 38 / 40)
          .setScale(2),
        shadow: this.add.ellipse(0, 0, 20, 9, 0x1d3e43, 0.25),
      }),
    );
    this.addMascot('dnake', DNAKE_TEXTURE_KEY, dnakeFrame, 0.95, 27);
    this.addMascot('zkteco', ZKTECO_TEXTURE_KEY, zktecoFrame, 34 / 36, 40);
    this.addMascot('c3plus', C3_PLUS_TEXTURE_KEY, c3PlusFrame, 46 / 48, 33);

    this.speech = createMascotSpeech();
    this.controls = bindOfficeControls({
      select: (id) => {
        this.selectedMascot = id;
        this.updateControls();
      },
      zoom: (steps) => this.zoomTo(this.cameras.main.zoom + steps * 0.25),
      fit: () => this.fitOffice(),
      follow: () => {
        this.following = !this.following;
        if (this.following) this.zoomTo(Math.max(1.5, this.cameras.main.zoom));
        this.updateControls();
      },
    });
    this.resizeCamera(true);
    this.scale.on('resize', this.onResize, this);
    this.bindPointerControls();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
      this.controls?.destroy();
      this.speech?.destroy();
    });
    this.update(0, 0);
  }

  update(_time: number, delta: number): void {
    // A background-tab resume pauses the ambient routine instead of racing
    // through minutes of movement. The domain consumes fixed 50 ms steps.
    const states = this.population.advance(Math.min(delta, 250));
    for (const id of MASCOT_IDS) {
      const state = states[id];
      const position = projectOfficePoint(state.x, state.y);
      const depth = (state.x + state.y) * 100;
      const phase = state.walking ? Math.floor(state.walkingMs / 140) % 4 : 0;
      const { sprite, shadow, frame } = this.visuals.get(id)!;
      sprite
        .setPosition(position.x, position.y)
        .setDepth(depth)
        .setFrame(frame(state.direction, phase));
      shadow.setPosition(position.x, position.y).setDepth(depth - 1);
      if (this.following && id === this.selectedMascot)
        this.cameras.main.centerOn(position.x, position.y - 25);
    }
    states.coworkers.forEach((person, index) => {
      const point = projectOfficePoint(person.x, person.y);
      const { sprite, shadow } = this.coworkers[index]!;
      const frame = person.working
        ? `${person.workPosture}-work-${Math.floor(_time / 300 + index) % 2}`
        : coworkerFrame(
            person.direction,
            person.walking ? Math.floor(person.walkingMs / 140) % 4 : 0,
          );
      sprite.setPosition(point.x, point.y).setDepth((person.x + person.y) * 100);
      if (this.licensedCoworkers.length === 0) sprite.setFrame(frame);
      else {
        const key = this.licensedCoworkers[index % this.licensedCoworkers.length]!;
        const seatedOffset = applyPixelwoodCoworker(sprite, key, person);
        sprite.setPosition(point.x, point.y + seatedOffset);
      }
      shadow.setPosition(point.x, point.y).setDepth(sprite.depth - 1);
    });
    const speaker = MASCOT_IDS.find((id) => states[id].speech !== null);
    if (speaker) {
      const camera = this.cameras.main;
      const sprite = this.visuals.get(speaker)!.sprite;
      const centerX = camera.scrollX + camera.width / 2;
      const centerY = camera.scrollY + camera.height / 2;
      this.speech?.update({
        name: MASCOT_NAMES[speaker],
        text: states[speaker].speech!,
        x: camera.x + camera.width / 2 + (sprite.x - centerX) * camera.zoom,
        headY:
          camera.y +
          camera.height / 2 +
          (sprite.y - sprite.displayHeight * sprite.originY - centerY) * camera.zoom,
        left: camera.x,
        top: camera.y,
        width: camera.width,
        bottom: camera.y + camera.height,
      });
    } else this.speech?.update(null);
    this.updateControls();
  }

  private addMascot(
    id: MascotId,
    texture: string,
    frame: (direction: PatrolDirection, phase?: number) => string,
    originY: number,
    shadowWidth: number,
  ): void {
    this.visuals.set(id, {
      sprite: this.add.sprite(0, 0, texture, frame('south')).setOrigin(0.5, originY).setScale(2),
      shadow: this.add.ellipse(0, 0, shadowWidth, 12, 0x1d3e43, 0.3),
      frame,
    });
  }

  private readonly onResize = (): void => this.resizeCamera(false);

  private resizeCamera(initial: boolean): void {
    const { width, height } = this.scale;
    const top = width <= 480 ? 66 : 100;
    const bottom = width <= 900 ? 152 : 100;
    const viewportHeight = Math.max(120, height - top - bottom);
    const camera = this.cameras.main;
    camera.setViewport(0, top, width, viewportHeight);
    const previousFit = this.fitZoom;
    this.fitZoom =
      Math.min(
        (width - 32) / (OFFICE_VIEW.right - OFFICE_VIEW.left),
        viewportHeight / (OFFICE_VIEW.bottom - OFFICE_VIEW.top),
      ) * 0.96;
    if (initial) {
      if (width <= 600) {
        this.following = true;
        camera.setZoom(1.5);
      } else this.fitOffice();
    } else if (!this.following) {
      // Keep a manually zoomed view when the display rotates; an overview
      // remains an overview without restarting Dnake's day.
      if (Math.abs(camera.zoom - previousFit) < 0.01) this.fitOffice();
    }
    this.updateControls();
  }

  private fitOffice(): void {
    this.following = false;
    this.cameras.main.setZoom(this.fitZoom).centerOn(OFFICE_VIEW.centerX, OFFICE_VIEW.centerY);
    this.updateControls();
  }

  private zoomTo(zoom: number, anchor?: { x: number; y: number }): void {
    const camera = this.cameras.main;
    const next = Phaser.Math.Clamp(zoom, Math.min(0.5, this.fitZoom), 4);
    if (anchor && !this.following) {
      const before = camera.getWorldPoint(anchor.x, anchor.y);
      camera.setZoom(next);
      // preRender refreshes the inverse projection before measuring the same
      // screen anchor, so the floor under the wheel/pinch stays in place.
      camera.preRender();
      const after = camera.getWorldPoint(anchor.x, anchor.y);
      camera.scrollX += before.x - after.x;
      camera.scrollY += before.y - after.y;
    } else camera.setZoom(next);
    this.updateControls();
  }

  private bindPointerControls(): void {
    this.input.addPointer(1);
    this.input.on(
      'wheel',
      (pointer: Phaser.Input.Pointer, _objects: unknown[], _dx: number, dy: number) => {
        if (dy !== 0) this.zoomTo(this.cameras.main.zoom * (dy > 0 ? 0.9 : 1.1), pointer);
      },
    );
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragLast = { x: pointer.x, y: pointer.y };
      this.pinchDistance = 0;
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const touches = [this.input.pointer1, this.input.pointer2].filter((touch) => touch.isDown);
      if (touches.length === 2) {
        const first = touches[0]!;
        const second = touches[1]!;
        const distance = Phaser.Math.Distance.Between(first.x, first.y, second.x, second.y);
        if (this.pinchDistance > 0) {
          this.zoomTo((this.cameras.main.zoom * distance) / this.pinchDistance, {
            x: (first.x + second.x) / 2,
            y: (first.y + second.y) / 2,
          });
        }
        this.pinchDistance = distance;
        this.dragLast = undefined;
      } else if (pointer.isDown) {
        if (this.dragLast) {
          const dx = pointer.x - this.dragLast.x;
          const dy = pointer.y - this.dragLast.y;
          if (dx !== 0 || dy !== 0) {
            this.following = false;
            const camera = this.cameras.main;
            camera.centerOn(
              Phaser.Math.Clamp(
                camera.scrollX + camera.width / 2 - dx / camera.zoom,
                OFFICE_VIEW.left,
                OFFICE_VIEW.right,
              ),
              Phaser.Math.Clamp(
                camera.scrollY + camera.height / 2 - dy / camera.zoom,
                OFFICE_VIEW.top,
                OFFICE_VIEW.bottom,
              ),
            );
            this.updateControls();
          }
        }
        this.dragLast = { x: pointer.x, y: pointer.y };
      }
    });
    this.input.on('pointerup', () => {
      this.dragLast = undefined;
      this.pinchDistance = 0;
    });
  }

  private updateControls(): void {
    const population = this.population.snapshot();
    const state = population[this.selectedMascot];
    this.controls?.update({
      zoom: this.cameras.main.zoom,
      minimumZoom: Math.min(0.5, this.fitZoom),
      following: this.following,
      target: this.selectedMascot,
      activity: state.activity,
      walking: state.walking,
      talking: state.talking,
      workers: population.coworkers.filter((person) => person.working).length,
      walkers: population.coworkers.filter((person) => person.walking).length,
    });
  }
}
