import Phaser from 'phaser';

import {
  OfficeMascotsSystem,
  type MascotId,
} from '../../simulation/characters/office-mascots.system';
import { bindOfficeControls } from '../../ui/office-camera';
import { drawIsometricOffice, projectOfficePoint } from '../office/isometric-office.renderer';
import { createDnakeTexture, DNAKE_TEXTURE_KEY, dnakeFrame } from '../sprites/dnake.texture';
import { createZktecoTexture, ZKTECO_TEXTURE_KEY, zktecoFrame } from '../sprites/zkteco.texture';

export class OfficeScene extends Phaser.Scene {
  private readonly mascots = new OfficeMascotsSystem();
  private selectedMascot: MascotId = 'dnake';
  private dnake!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Ellipse;
  private zkteco!: Phaser.GameObjects.Sprite;
  private zktecoShadow!: Phaser.GameObjects.Ellipse;
  private controls: ReturnType<typeof bindOfficeControls> | undefined;
  private fitZoom = 1;
  private following = false;
  private dragLast: { x: number; y: number } | undefined;
  private pinchDistance = 0;

  constructor() {
    super('office');
  }

  create(): void {
    createDnakeTexture(this.textures);
    createZktecoTexture(this.textures);
    this.cameras.main.setBackgroundColor('#172a32');
    drawIsometricOffice(this);
    this.shadow = this.add.ellipse(0, 0, 27, 11, 0x1d3e43, 0.3);
    this.dnake = this.add
      .sprite(0, 0, DNAKE_TEXTURE_KEY, dnakeFrame('south'))
      .setOrigin(0.5, 0.95)
      .setScale(2);

    this.zktecoShadow = this.add.ellipse(0, 0, 40, 13, 0x1d3e43, 0.3);
    this.zkteco = this.add
      .sprite(0, 0, ZKTECO_TEXTURE_KEY, zktecoFrame('south'))
      .setOrigin(0.5, 34 / 36)
      .setScale(2);

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
    });
    this.update(0, 0);
  }

  update(_time: number, delta: number): void {
    // A background-tab resume pauses the ambient routine instead of racing
    // through minutes of movement. The domain consumes fixed 50 ms steps.
    const states = this.mascots.advance(Math.min(delta, 250));
    for (const id of ['dnake', 'zkteco'] as const) {
      const state = states[id];
      const position = projectOfficePoint(state.x, state.y);
      const depth = (state.x + state.y) * 100;
      const phase = state.walking ? Math.floor(state.walkingMs / 140) % 4 : 0;
      const sprite = id === 'dnake' ? this.dnake : this.zkteco;
      const shadow = id === 'dnake' ? this.shadow : this.zktecoShadow;
      const frame = id === 'dnake' ? dnakeFrame : zktecoFrame;
      sprite
        .setPosition(position.x, position.y)
        .setDepth(depth)
        .setFrame(frame(state.direction, phase));
      shadow.setPosition(position.x, position.y).setDepth(depth - 1);
      if (this.following && id === this.selectedMascot)
        this.cameras.main.centerOn(position.x, position.y - 25);
    }
    this.updateControls();
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
    this.fitZoom = Math.min((width - 32) / 880, viewportHeight / 510) * 0.96;
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
    this.cameras.main.setZoom(this.fitZoom).centerOn(32, 170);
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
              Phaser.Math.Clamp(camera.scrollX + camera.width / 2 - dx / camera.zoom, -420, 480),
              Phaser.Math.Clamp(camera.scrollY + camera.height / 2 - dy / camera.zoom, -100, 450),
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
    const state = this.mascots.snapshot()[this.selectedMascot];
    this.controls?.update({
      zoom: this.cameras.main.zoom,
      minimumZoom: Math.min(0.5, this.fitZoom),
      following: this.following,
      target: this.selectedMascot,
      activity: state.activity,
      walking: state.walking,
    });
  }
}
