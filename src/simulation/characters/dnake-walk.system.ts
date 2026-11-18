import { findOfficePath, type GridPoint } from '../office/office-layout';

export type DnakeDirection = 'south' | 'east' | 'north' | 'west';

export const DNAKE_STOPS = [
  { x: 3, y: 2, activity: 'Checking the coffee station', pauseMs: 3_000 },
  { x: 5, y: 4, activity: 'Saying hello at the workstations', pauseMs: 2_500 },
  { x: 9, y: 4, activity: 'Checking in with the team', pauseMs: 2_500 },
  { x: 11, y: 2, activity: 'Taking a little plant break', pauseMs: 3_000 },
  { x: 11, y: 8, activity: 'Getting the meeting room ready', pauseMs: 3_500 },
  { x: 9, y: 8, activity: 'Making the office rounds', pauseMs: 2_000 },
  { x: 5, y: 8, activity: 'Visiting the afternoon desks', pauseMs: 2_500 },
  { x: 4, y: 10, activity: 'Resting by the lounge', pauseMs: 4_000 },
  { x: 12, y: 10, activity: 'Welcoming the next visitor', pauseMs: 3_000 },
] as const;

export interface DnakeWalkSnapshot extends GridPoint {
  readonly direction: DnakeDirection;
  readonly walking: boolean;
  readonly walkingMs: number;
  readonly activity: string;
}

const STEP_MS = 50;
const DISTANCE_PER_STEP = (1.5 * STEP_MS) / 1_000;

export class DnakeWalkSystem {
  private x = 12.5;
  private y = 10.5;
  private direction: DnakeDirection = 'south';
  private path: GridPoint[] = [];
  private stopIndex = -1;
  private pauseMs = 1_500;
  private remainderMs = 0;
  private walkingMs = 0;
  private activity = 'Welcoming you to the office';

  advance(elapsedMs: number): DnakeWalkSnapshot {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
      throw new RangeError('Elapsed time must be a non-negative finite number.');
    }
    this.remainderMs += elapsedMs;
    while (this.remainderMs >= STEP_MS) {
      this.step();
      this.remainderMs -= STEP_MS;
    }
    return this.snapshot();
  }

  snapshot(): DnakeWalkSnapshot {
    return {
      x: this.x,
      y: this.y,
      direction: this.direction,
      walking: this.path.length > 0,
      walkingMs: this.walkingMs,
      activity: this.activity,
    };
  }

  private step(): void {
    if (this.pauseMs > 0) {
      this.pauseMs -= STEP_MS;
      return;
    }
    if (this.path.length === 0) {
      this.stopIndex = (this.stopIndex + 1) % DNAKE_STOPS.length;
      const stop = DNAKE_STOPS[this.stopIndex]!;
      this.path = findOfficePath({ x: Math.floor(this.x), y: Math.floor(this.y) }, stop);
      this.activity = `On the way · ${stop.activity.toLowerCase()}`;
    }
    const next = this.path[0];
    if (!next) return;

    const dx = next.x + 0.5 - this.x;
    const dy = next.y + 0.5 - this.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    if (Math.abs(dx) > 0.001) this.direction = dx > 0 ? 'east' : 'west';
    else if (Math.abs(dy) > 0.001) this.direction = dy > 0 ? 'south' : 'north';

    const fraction = Math.min(1, DISTANCE_PER_STEP / distance);
    this.x += dx * fraction;
    this.y += dy * fraction;
    this.walkingMs += STEP_MS;

    if (distance <= DISTANCE_PER_STEP) {
      this.x = next.x + 0.5;
      this.y = next.y + 0.5;
      this.path.shift();
      if (this.path.length === 0) {
        const stop = DNAKE_STOPS[this.stopIndex]!;
        this.pauseMs = stop.pauseMs;
        this.activity = stop.activity;
        this.walkingMs = 0;
      }
    }
  }
}
