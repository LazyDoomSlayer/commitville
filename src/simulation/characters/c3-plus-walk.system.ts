import { OfficePatrolSystem } from './office-patrol.system';

export const C3_PLUS_STOPS = [
  { x: 9, y: 1, activity: 'Checking the shelf-side connections', pauseMs: 3_000 },
  { x: 6, y: 3, activity: 'Helping at the workstations', pauseMs: 2_500 },
  { x: 2, y: 6, activity: 'Taking the scenic route', pauseMs: 2_000 },
  { x: 5, y: 9, activity: 'Keeping the lounge connected', pauseMs: 3_500 },
  { x: 10, y: 9, activity: 'Checking in by the meeting table', pauseMs: 3_000 },
  { x: 12, y: 5, activity: 'Taking a quiet circuit break', pauseMs: 3_000 },
  { x: 8, y: 10, activity: 'Ready for another office circuit', pauseMs: 2_500 },
] as const;

export class C3PlusWalkSystem extends OfficePatrolSystem {
  constructor() {
    super({
      start: { x: 8, y: 10 },
      stops: C3_PLUS_STOPS,
      speed: 1.35,
      pauseMs: 3_100,
      activity: 'Powered up for a new office circuit',
    });
  }
}
