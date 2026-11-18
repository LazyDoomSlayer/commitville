import { describe, expect, it } from 'vitest';

import { findOfficePath, isOfficeWalkable } from '../office/office-layout';
import { DNAKE_STOPS, DnakeWalkSystem } from './dnake-walk.system';

describe('Dnake office navigation', () => {
  it('finds connected four-way routes to every stop without crossing furniture', () => {
    let previous = { x: 12, y: 10 };
    for (const stop of DNAKE_STOPS) {
      const path = findOfficePath(previous, stop);
      expect(path.length).toBeGreaterThan(0);
      for (const cell of path) {
        expect(isOfficeWalkable(cell)).toBe(true);
        expect(Math.abs(cell.x - previous.x) + Math.abs(cell.y - previous.y)).toBe(1);
        previous = cell;
      }
      expect(previous).toEqual({ x: stop.x, y: stop.y });
    }
  });

  it('rejects destinations inside desks and beyond the room', () => {
    expect(findOfficePath({ x: 12, y: 10 }, { x: 3, y: 3 })).toEqual([]);
    expect(findOfficePath({ x: 12, y: 10 }, { x: 14, y: 12 })).toEqual([]);
  });

  it('produces the same state with different frame timing', () => {
    const single = new DnakeWalkSystem();
    const frames = new DnakeWalkSystem();
    single.advance(40_000);
    for (let frame = 0; frame < 2_000; frame += 1) frames.advance(20);
    expect(frames.snapshot()).toEqual(single.snapshot());
  });

  it('walks all four directions, pauses at destinations, and stays on walkable cells', () => {
    const walker = new DnakeWalkSystem();
    const directions = new Set<string>();
    const visited = new Set<string>();
    for (let step = 0; step < 8_000; step += 1) {
      const state = walker.advance(50);
      expect(isOfficeWalkable({ x: Math.floor(state.x), y: Math.floor(state.y) })).toBe(true);
      if (state.walking) directions.add(state.direction);
      else visited.add(state.activity);
    }
    expect([...directions].sort()).toEqual(['east', 'north', 'south', 'west']);
    for (const stop of DNAKE_STOPS) expect(visited.has(stop.activity)).toBe(true);
  });

  it('rejects invalid elapsed time', () => {
    const walker = new DnakeWalkSystem();
    for (const elapsed of [-1, Infinity, NaN])
      expect(() => walker.advance(elapsed)).toThrow(RangeError);
  });
});
