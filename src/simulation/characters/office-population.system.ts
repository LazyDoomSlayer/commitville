import { COWORKERS } from './coworker-roster';
import { CoworkerSystem } from './coworker.system';
import { MascotConversationSystem } from './mascot-conversation.system';
import { MASCOT_IDS } from './mascot-roster';
import { C3PlusWalkSystem } from './c3-plus-walk.system';
import { DnakeWalkSystem } from './dnake-walk.system';
import { PATROL_STEP_MS } from './office-patrol.system';
import { ZktecoWalkSystem } from './zkteco-walk.system';

export { MASCOT_IDS, MASCOT_NAMES, type MascotId } from './mascot-roster';

export class OfficePopulationSystem {
  private readonly patrols = {
    dnake: new DnakeWalkSystem(),
    zkteco: new ZktecoWalkSystem(),
    c3plus: new C3PlusWalkSystem(),
  };
  private readonly coworkers = COWORKERS.map((_, index) => new CoworkerSystem(index));
  private remainderMs = 0;
  private readonly conversations = new MascotConversationSystem();

  advance(elapsedMs: number): ReturnType<OfficePopulationSystem['snapshot']> {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0)
      throw new RangeError('Elapsed time must be a non-negative finite number.');
    this.remainderMs += elapsedMs;
    while (this.remainderMs >= PATROL_STEP_MS) {
      this.conversations.advance(PATROL_STEP_MS, this.patrolSnapshot());
      const chatting = this.conversations.participants();
      // Stable priority plus current/next-cell reservations avoids walking
      // through one another. A blocked patrol replans from a cell center.
      for (const id of MASCOT_IDS) {
        if (chatting.includes(id)) continue;
        const occupied = MASCOT_IDS.filter((other) => other !== id)
          .flatMap((other) => this.patrols[other].reservedCells())
          .concat(this.coworkers.flatMap((person) => person.reservedCells()));
        this.patrols[id].advance(PATROL_STEP_MS, occupied);
      }
      for (const [index, person] of this.coworkers.entries()) {
        const occupied = MASCOT_IDS.flatMap((id) => this.patrols[id].reservedCells()).concat(
          this.coworkers
            .filter((_, other) => other !== index)
            .flatMap((other) => other.reservedCells()),
        );
        person.advance(PATROL_STEP_MS, occupied);
      }
      this.remainderMs -= PATROL_STEP_MS;
    }
    return this.snapshot();
  }

  snapshot() {
    const positions = this.patrolSnapshot();
    return {
      dnake: this.conversations.project('dnake', positions),
      zkteco: this.conversations.project('zkteco', positions),
      c3plus: this.conversations.project('c3plus', positions),
      coworkers: this.coworkers.map((person) => person.snapshot()),
    };
  }

  private patrolSnapshot() {
    return {
      dnake: this.patrols.dnake.snapshot(),
      zkteco: this.patrols.zkteco.snapshot(),
      c3plus: this.patrols.c3plus.snapshot(),
    };
  }
}
