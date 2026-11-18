import { OfficePatrolSystem } from './office-patrol.system';

export type {
  PatrolDirection as DnakeDirection,
  PatrolSnapshot as DnakeWalkSnapshot,
} from './office-patrol.system';

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

export class DnakeWalkSystem extends OfficePatrolSystem {
  constructor() {
    super({
      start: { x: 12, y: 10 },
      stops: DNAKE_STOPS,
      speed: 1.5,
      pauseMs: 1_500,
      activity: 'Welcoming you to the office',
    });
  }
}
