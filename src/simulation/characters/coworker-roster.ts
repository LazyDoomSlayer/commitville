import { WORKSTATIONS } from '../office/office-layout';

// Public fictional fixtures: these are not modeled on a real office team.
export const COWORKERS = (
  [
    { id: 'ada', name: 'Ada', task: 'building a feature' },
    { id: 'milo', name: 'Milo', task: 'sketching an interface' },
    { id: 'juno', name: 'Juno', task: 'testing a release' },
    { id: 'theo', name: 'Theo', task: 'reviewing a change' },
    { id: 'nia', name: 'Nia', task: 'solving a small bug' },
    { id: 'remy', name: 'Remy', task: 'writing the docs' },
    { id: 'iris', name: 'Iris', task: 'exploring an idea' },
    { id: 'sol', name: 'Sol', task: 'planning the next iteration' },
    { id: 'lio', name: 'Lio', task: 'tidying a project' },
    { id: 'kai', name: 'Kai', task: 'checking the inbox' },
  ] as const
).map((person, index) => {
  const station = WORKSTATIONS[index]!;
  return { ...person, home: { x: station.x + 1, y: station.y + 1 }, workPosture: station.posture };
});
export type CoworkerId = (typeof COWORKERS)[number]['id'];
