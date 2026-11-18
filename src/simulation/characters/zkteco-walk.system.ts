import { OfficePatrolSystem } from './office-patrol.system';

export const ZKTECO_STOPS = [
  { x: 10, y: 1, activity: 'Checking the connection lights', pauseMs: 3_000 },
  { x: 13, y: 4, activity: 'Keeping the east side connected', pauseMs: 2_500 },
  { x: 13, y: 9, activity: 'Checking the meeting area', pauseMs: 3_000 },
  { x: 6, y: 10, activity: 'Taking a little network break', pauseMs: 3_500 },
  { x: 1, y: 8, activity: 'Visiting the lounge', pauseMs: 2_500 },
  { x: 1, y: 3, activity: 'Recharging near the coffee station', pauseMs: 4_000 },
  { x: 10, y: 10, activity: 'Ready to welcome a connection', pauseMs: 2_500 },
] as const;

export class ZktecoWalkSystem extends OfficePatrolSystem {
  constructor() {
    super({
      start: { x: 10, y: 10 },
      stops: ZKTECO_STOPS,
      speed: 1.2,
      pauseMs: 2_300,
      activity: 'Connected and ready for the day',
    });
  }
}
