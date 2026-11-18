import { C3PlusWalkSystem } from './c3-plus-walk.system';
import { DnakeWalkSystem } from './dnake-walk.system';
import { PATROL_STEP_MS } from './office-patrol.system';
import { ZktecoWalkSystem } from './zkteco-walk.system';

export const MASCOT_IDS = ['dnake', 'zkteco', 'c3plus'] as const;
export type MascotId = (typeof MASCOT_IDS)[number];
export const MASCOT_NAMES: Record<MascotId, string> = {
  dnake: 'Dnake',
  zkteco: 'C2-260',
  c3plus: 'C3 Plus',
};

export class OfficeMascotsSystem {
  private readonly patrols = {
    dnake: new DnakeWalkSystem(),
    zkteco: new ZktecoWalkSystem(),
    c3plus: new C3PlusWalkSystem(),
  };
  private remainderMs = 0;

  advance(elapsedMs: number): ReturnType<OfficeMascotsSystem['snapshot']> {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0)
      throw new RangeError('Elapsed time must be a non-negative finite number.');
    this.remainderMs += elapsedMs;
    while (this.remainderMs >= PATROL_STEP_MS) {
      // Stable priority plus current/next-cell reservations avoids walking
      // through one another. A blocked patrol replans from a cell center.
      for (const id of MASCOT_IDS) {
        const occupied = MASCOT_IDS.filter((other) => other !== id).flatMap((other) =>
          this.patrols[other].reservedCells(),
        );
        this.patrols[id].advance(PATROL_STEP_MS, occupied);
      }
      this.remainderMs -= PATROL_STEP_MS;
    }
    return this.snapshot();
  }

  snapshot() {
    return {
      dnake: this.patrols.dnake.snapshot(),
      zkteco: this.patrols.zkteco.snapshot(),
      c3plus: this.patrols.c3plus.snapshot(),
    };
  }
}
