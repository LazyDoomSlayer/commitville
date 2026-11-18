import { DnakeWalkSystem } from './dnake-walk.system';
import { PATROL_STEP_MS } from './office-patrol.system';
import { ZktecoWalkSystem } from './zkteco-walk.system';

export type MascotId = 'dnake' | 'zkteco';
export const MASCOT_NAMES: Record<MascotId, string> = { dnake: 'Dnake', zkteco: 'C2-260' };

export class OfficeMascotsSystem {
  private readonly dnake = new DnakeWalkSystem();
  private readonly zkteco = new ZktecoWalkSystem();
  private remainderMs = 0;

  advance(elapsedMs: number): ReturnType<OfficeMascotsSystem['snapshot']> {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0)
      throw new RangeError('Elapsed time must be a non-negative finite number.');
    this.remainderMs += elapsedMs;
    while (this.remainderMs >= PATROL_STEP_MS) {
      // Stable priority plus current/next-cell reservations avoids walking
      // through one another. A blocked patrol replans from a cell center.
      this.dnake.advance(PATROL_STEP_MS, this.zkteco.reservedCells());
      this.zkteco.advance(PATROL_STEP_MS, this.dnake.reservedCells());
      this.remainderMs -= PATROL_STEP_MS;
    }
    return this.snapshot();
  }

  snapshot() {
    return { dnake: this.dnake.snapshot(), zkteco: this.zkteco.snapshot() };
  }
}
