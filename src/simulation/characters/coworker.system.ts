import { OfficePatrolSystem, type PatrolSnapshot } from './office-patrol.system';
import { COWORKERS } from './coworker-roster';
import type { GridPoint, WorkPosture } from '../office/office-layout';

const BREAKS = [
  { x: 3, y: 2, activity: 'Getting a coffee' },
  { x: 6, y: 15, activity: 'Stretching in the lounge' },
  { x: 11, y: 14, activity: 'Taking a quiet break' },
  { x: 2, y: 14, activity: 'Relaxing by the lounge' },
  { x: 18, y: 4, activity: 'Walking around the studio' },
  { x: 22, y: 8, activity: 'Taking a window break' },
  { x: 13, y: 3, activity: 'Looking for a fresh idea' },
  { x: 6, y: 12, activity: 'Going for a little walk' },
] as const;

export interface CoworkerSnapshot extends PatrolSnapshot {
  readonly working: boolean;
  readonly workPosture: WorkPosture | null;
}

// Each person's route is generated from an injected seed, never global random.
// Most start at work; four start in the lounge and wander before returning home.
export class CoworkerSystem extends OfficePatrolSystem {
  private readonly preferredPosture: WorkPosture;
  constructor(index: number, seed = 260_160) {
    const person = COWORKERS[index];
    if (!person) throw new RangeError('Unknown coworker index.');
    let randomState = (seed + index * 7_919) >>> 0;
    const random = (): number => {
      randomState = (Math.imul(1_664_525, randomState) + 1_013_904_223) >>> 0;
      return randomState / 0x1_0000_0000;
    };
    const work = `Working · ${person.task}`;
    const stops = Array.from({ length: 6 }, () => {
      const first = Math.floor(random() * BREAKS.length);
      const second = (first + 1 + Math.floor(random() * (BREAKS.length - 1))) % BREAKS.length;
      return [
        { ...BREAKS[first]!, pauseMs: 3_000 + Math.floor(random() * 5_000) },
        { ...BREAKS[second]!, pauseMs: 3_000 + Math.floor(random() * 5_000) },
        {
          ...person.home,
          activity: work,
          activityKind: 'work' as const,
          pauseMs: 35_000 + Math.floor(random() * 45_000),
        },
      ];
    }).flat();
    const start = index < 6 ? person.home : { x: 2 + (index - 6) * 3, y: 14 + (index % 2) };
    // Skip a no-op break if a wanderer already spawns at that destination.
    if (stops[0]?.x === start.x && stops[0]?.y === start.y) stops.shift();
    super({
      ...(person.workPosture === 'seated' ? { allowedSeat: person.home } : {}),
      initialActivityKind: index < 6 ? 'work' : 'break',
      start,
      stops,
      speed: 1.05 + random() * 0.3,
      pauseMs: index < 6 ? 35_000 + index * 5_000 : 500 + (index - 6) * 300,
      activity: index < 6 ? work : 'Getting ready for a wander',
    });
    this.preferredPosture = person.workPosture;
  }

  override advance(elapsedMs: number, occupied: readonly GridPoint[] = []): CoworkerSnapshot {
    super.advance(elapsedMs, occupied);
    return this.snapshot();
  }

  override snapshot(): CoworkerSnapshot {
    const state = super.snapshot();
    const working = !state.walking && state.activityKind === 'work';
    return {
      ...state,
      working,
      workPosture: working ? this.preferredPosture : null,
      direction: working ? 'north' : state.direction,
    };
  }
}
