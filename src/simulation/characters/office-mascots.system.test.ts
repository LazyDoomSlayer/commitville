import { describe, expect, it } from 'vitest';

import { isOfficeWalkable } from '../office/office-layout';
import { C3_PLUS_STOPS } from './c3-plus-walk.system';
import { DNAKE_STOPS } from './dnake-walk.system';
import { MASCOT_IDS, OfficeMascotsSystem } from './office-mascots.system';
import { OfficePatrolSystem } from './office-patrol.system';
import { ZKTECO_STOPS } from './zkteco-walk.system';

describe('office mascots', () => {
  it('keeps all three patrols moving, visits every stop, and avoids furniture and one another', () => {
    const system = new OfficeMascotsSystem();
    const activities = {
      dnake: new Set<string>(),
      zkteco: new Set<string>(),
      c3plus: new Set<string>(),
    };
    const directions = {
      dnake: new Set<string>(),
      zkteco: new Set<string>(),
      c3plus: new Set<string>(),
    };
    for (let step = 0; step < 12_000; step += 1) {
      const states = system.advance(50);
      for (const id of MASCOT_IDS) {
        const state = states[id];
        expect(isOfficeWalkable({ x: Math.floor(state.x), y: Math.floor(state.y) })).toBe(true);
        if (state.walking) directions[id].add(state.direction);
        else activities[id].add(state.activity);
      }
      for (let first = 0; first < MASCOT_IDS.length; first += 1) {
        for (let second = first + 1; second < MASCOT_IDS.length; second += 1) {
          const a = states[MASCOT_IDS[first]!];
          const b = states[MASCOT_IDS[second]!];
          expect(Math.abs(a.x - b.x) + Math.abs(a.y - b.y)).toBeGreaterThanOrEqual(0.99999);
        }
      }
    }
    for (const stop of DNAKE_STOPS) expect(activities.dnake.has(stop.activity)).toBe(true);
    for (const stop of C3_PLUS_STOPS) expect(activities.c3plus.has(stop.activity)).toBe(true);
    for (const stop of ZKTECO_STOPS) expect(activities.zkteco.has(stop.activity)).toBe(true);
    for (const id of MASCOT_IDS)
      expect([...directions[id]].sort()).toEqual(['east', 'north', 'south', 'west']);
  });

  it('coordinates all three characters independently of display frame timing', () => {
    const single = new OfficeMascotsSystem();
    const frames = new OfficeMascotsSystem();
    single.advance(160_000);
    for (let index = 0; index < 10_000; index += 1) frames.advance(16);
    expect(frames.snapshot()).toEqual(single.snapshot());
  });

  it('waits when a destination is occupied and resumes when the cell clears', () => {
    const patrol = new OfficePatrolSystem({
      start: { x: 10, y: 10 },
      stops: [{ x: 11, y: 10, pauseMs: 500, activity: 'Arrived' }],
      speed: 1,
      pauseMs: 0,
      activity: 'Ready',
    });
    const state = patrol.advance(1_000, [{ x: 11, y: 10 }]);
    expect(state.x).toBe(10.5);
    expect(state.walking).toBe(false);
    expect(state.activity).toBe('Waiting for a clear path');
    expect(patrol.advance(1_000).activity).toBe('Arrived');
  });
});
