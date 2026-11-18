import { describe, expect, it } from 'vitest';

import { OFFICE_LAYOUT, isOfficeFloor, isOfficeWalkable } from '../office/office-layout';
import { COWORKERS } from './coworker-roster';
import { CoworkerSystem } from './coworker.system';
import { MASCOT_IDS } from './mascot-roster';
import { OfficePopulationSystem } from './office-population.system';

describe('expanded office and coworkers', () => {
  it('provides ten desks and an L-shaped floor with a walkable lounge wing', () => {
    expect(OFFICE_LAYOUT.fixtures.filter((fixture) => fixture.kind === 'desk')).toHaveLength(10);
    expect(isOfficeFloor({ x: 23, y: 11 })).toBe(true);
    expect(isOfficeFloor({ x: 13, y: 17 })).toBe(true);
    expect(isOfficeFloor({ x: 14, y: 12 })).toBe(false);
    for (const person of COWORKERS) expect(isOfficeWalkable(person.home)).toBe(true);
  });

  it('starts with ten fictional people, six working and four preparing to wander', () => {
    const office = new OfficePopulationSystem();
    expect(office.snapshot().coworkers).toHaveLength(10);
    expect(office.snapshot().coworkers.filter((person) => person.working)).toHaveLength(6);
    expect(office.advance(2_000).coworkers.filter((person) => person.walking)).toHaveLength(4);
  });

  it('has reproducible schedules with a seed, and different break routes with another seed', () => {
    const first = new CoworkerSystem(7, 123);
    const second = new CoworkerSystem(7, 123);
    const other = new CoworkerSystem(7, 456);
    first.advance(16_000);
    other.advance(16_000);
    for (let frame = 0; frame < 1_000; frame += 1) second.advance(16);
    expect(second.snapshot()).toEqual(first.snapshot());
    expect(other.snapshot()).not.toEqual(first.snapshot());
  });

  it('lets every coworker work and walk while keeping all thirteen actors on clear, separate floor cells', () => {
    const office = new OfficePopulationSystem();
    const worked = new Set<number>();
    const walked = new Set<number>();
    let minimumSeparation = Infinity;
    let invalidFloor = false;
    for (let tick = 0; tick < 12_000; tick += 1) {
      const state = office.advance(50);
      state.coworkers.forEach((person, index) => {
        if (person.working) worked.add(index);
        if (person.walking) walked.add(index);
      });
      const actors = [...MASCOT_IDS.map((id) => state[id]), ...state.coworkers];
      invalidFloor ||= actors.some(
        (actor) => !isOfficeWalkable({ x: Math.floor(actor.x), y: Math.floor(actor.y) }),
      );
      for (let first = 0; first < actors.length; first += 1) {
        for (let second = first + 1; second < actors.length; second += 1) {
          const a = actors[first]!;
          const b = actors[second]!;
          minimumSeparation = Math.min(
            minimumSeparation,
            Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
          );
        }
      }
    }
    expect(invalidFloor).toBe(false);
    expect(minimumSeparation).toBeGreaterThanOrEqual(0.99999);
    expect(worked.size).toBe(10);
    expect(walked.size).toBe(10);
  });
});
