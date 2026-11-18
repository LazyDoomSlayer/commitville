import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { createHumanModel } from './character-models';
import type { CoworkerSnapshot } from '../../simulation/characters/coworker.system';

const state: CoworkerSnapshot = {
  x: 4.5,
  y: 4.5,
  direction: 'north',
  walking: false,
  walkingMs: 0,
  working: true,
  workPosture: 'seated',
  activity: 'Working',
};
describe('3D coworker posture', () => {
  it('bends knees toward the desk with feet above the floor, then restores standing limbs', () => {
    const model = createHumanModel(0);
    model.update(state, 0);
    model.root.updateMatrixWorld(true);
    const thigh = model.root.children[1]!;
    const shin = thigh.children[1]!;
    const hip = thigh.getWorldPosition(new Vector3());
    const knee = shin.getWorldPosition(new Vector3());
    const shoe = shin.children[1]!.getWorldPosition(new Vector3());
    expect(knee.z).toBeLessThan(hip.z);
    expect(knee.y).toBeLessThan(hip.y);
    expect(shoe.y).toBeGreaterThan(0.05);
    expect(shoe.y).toBeLessThan(0.15);
    model.update({ ...state, workPosture: 'standing' }, 0);
    model.root.updateMatrixWorld(true);
    expect(thigh.rotation.x).toBeCloseTo(0);
    expect(shin.rotation.x).toBe(0);
    expect(thigh.getWorldPosition(new Vector3()).y).toBeGreaterThan(hip.y);
  });
  it('uses actual 3D facing and alternating leg motion when walking', () => {
    const model = createHumanModel(3);
    model.update(
      {
        ...state,
        workPosture: null,
        working: false,
        walking: true,
        direction: 'east',
        walkingMs: 160,
      },
      0,
    );
    expect(model.root.position.toArray()).toEqual([4.5, 0, 4.5]);
    expect(model.root.rotation.y).toBeCloseTo(Math.PI / 2);
    expect(model.root.children[1]!.rotation.x).toBeCloseTo(-model.root.children[2]!.rotation.x);
    expect(Math.abs(model.root.children[1]!.rotation.x)).toBeGreaterThan(0.3);
  });
});
