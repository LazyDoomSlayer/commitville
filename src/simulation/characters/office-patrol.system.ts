import { findOfficePath, isOfficeWalkable, type GridPoint } from '../office/office-layout';

export type PatrolDirection = 'south' | 'east' | 'north' | 'west';
export interface PatrolStop extends GridPoint {
  readonly activityKind?: 'work' | 'break';
  readonly activity: string;
  readonly pauseMs: number;
}
export interface PatrolSnapshot extends GridPoint {
  readonly activityKind?: 'work' | 'break';
  readonly direction: PatrolDirection;
  readonly walking: boolean;
  readonly walkingMs: number;
  readonly activity: string;
}
interface PatrolOptions {
  readonly allowedSeat?: GridPoint;
  readonly initialActivityKind?: 'work' | 'break';
  readonly start: GridPoint;
  readonly stops: readonly PatrolStop[];
  readonly speed: number;
  readonly pauseMs: number;
  readonly activity: string;
}

export const PATROL_STEP_MS = 50;

// Owns one character's deterministic route, pauses and cell reservations.
export class OfficePatrolSystem {
  private x: number;
  private y: number;
  private cell: GridPoint;
  private direction: PatrolDirection = 'south';
  private path: GridPoint[] = [];
  private stopIndex = -1;
  private needsDestination = true;
  private pauseMs: number;
  private remainderMs = 0;
  private walkingMs = 0;
  private waiting = false;
  private activity: string;
  private activityKind: 'work' | 'break';

  constructor(private readonly options: PatrolOptions) {
    if (
      !isOfficeWalkable(options.start, options.allowedSeat) ||
      options.stops.length === 0 ||
      options.stops.some(
        (stop) =>
          !isOfficeWalkable(stop, options.allowedSeat) ||
          !Number.isFinite(stop.pauseMs) ||
          stop.pauseMs < 0,
      ) ||
      !Number.isFinite(options.speed) ||
      options.speed <= 0 ||
      !Number.isFinite(options.pauseMs) ||
      options.pauseMs < 0
    ) {
      throw new RangeError(
        'A patrol requires walkable cells, stops, positive speed and finite pauses.',
      );
    }
    this.cell = { ...options.start };
    this.x = this.cell.x + 0.5;
    this.y = this.cell.y + 0.5;
    this.pauseMs = options.pauseMs;
    this.activity = options.activity;
    this.activityKind = options.initialActivityKind ?? 'break';
  }

  advance(elapsedMs: number, occupied: readonly GridPoint[] = []): PatrolSnapshot {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0)
      throw new RangeError('Elapsed time must be a non-negative finite number.');
    this.remainderMs += elapsedMs;
    while (this.remainderMs >= PATROL_STEP_MS) {
      this.step(occupied);
      this.remainderMs -= PATROL_STEP_MS;
    }
    return this.snapshot();
  }

  snapshot(): PatrolSnapshot {
    return {
      x: this.x,
      y: this.y,
      direction: this.direction,
      walking: this.path.length > 0 && !this.waiting,
      walkingMs: this.walkingMs,
      activity: this.waiting ? 'Waiting for a clear path' : this.activity,
      activityKind: this.activityKind,
    };
  }

  reservedCells(): GridPoint[] {
    const next = this.path[0];
    return next && !this.atCellCenter() ? [{ ...this.cell }, { ...next }] : [{ ...this.cell }];
  }

  private atCellCenter(): boolean {
    return Math.abs(this.x - this.cell.x - 0.5) + Math.abs(this.y - this.cell.y - 0.5) < 0.000001;
  }

  private arrive(): void {
    const stop = this.options.stops[this.stopIndex]!;
    this.pauseMs = stop.pauseMs;
    this.activity = stop.activity;
    this.activityKind = stop.activityKind ?? 'break';
    this.walkingMs = 0;
    this.waiting = false;
    this.needsDestination = true;
  }

  private step(occupied: readonly GridPoint[]): void {
    if (this.pauseMs > 0) {
      this.pauseMs -= PATROL_STEP_MS;
      return;
    }
    if (this.needsDestination) {
      this.activityKind = 'break';
      this.stopIndex = (this.stopIndex + 1) % this.options.stops.length;
      this.needsDestination = false;
      const stop = this.options.stops[this.stopIndex]!;
      this.activity = `On the way · ${stop.activity.toLowerCase()}`;
    }
    const stop = this.options.stops[this.stopIndex]!;
    let next = this.path[0];
    if (
      this.atCellCenter() &&
      (!next || occupied.some((cell) => cell.x === next!.x && cell.y === next!.y))
    ) {
      this.path = findOfficePath(this.cell, stop, occupied, this.options.allowedSeat);
      next = this.path[0];
      if (!next) {
        if (this.cell.x === stop.x && this.cell.y === stop.y) this.arrive();
        else this.waiting = true;
        return;
      }
    }
    if (!next) return;
    this.waiting = false;
    const dx = next.x + 0.5 - this.x;
    const dy = next.y + 0.5 - this.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    if (Math.abs(dx) > 0.001) this.direction = dx > 0 ? 'east' : 'west';
    else if (Math.abs(dy) > 0.001) this.direction = dy > 0 ? 'south' : 'north';
    const stepDistance = (this.options.speed * PATROL_STEP_MS) / 1_000;
    const fraction = Math.min(1, stepDistance / distance);
    this.x += dx * fraction;
    this.y += dy * fraction;
    this.walkingMs += PATROL_STEP_MS;
    if (distance <= stepDistance) {
      this.x = next.x + 0.5;
      this.y = next.y + 0.5;
      this.cell = next;
      this.path.shift();
      if (this.path.length === 0) this.arrive();
    }
  }
}
