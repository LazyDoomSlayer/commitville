// Public fictional fixtures: these are not modeled on a real office team.
export const COWORKERS = [
  { id: 'ada', name: 'Ada', task: 'building a feature', home: { x: 4, y: 4 } },
  { id: 'milo', name: 'Milo', task: 'sketching an interface', home: { x: 8, y: 4 } },
  { id: 'juno', name: 'Juno', task: 'testing a release', home: { x: 4, y: 8 } },
  { id: 'theo', name: 'Theo', task: 'reviewing a change', home: { x: 8, y: 8 } },
  { id: 'nia', name: 'Nia', task: 'solving a small bug', home: { x: 16, y: 3 } },
  { id: 'remy', name: 'Remy', task: 'writing the docs', home: { x: 20, y: 3 } },
  { id: 'iris', name: 'Iris', task: 'exploring an idea', home: { x: 16, y: 7 } },
  { id: 'sol', name: 'Sol', task: 'planning the next iteration', home: { x: 20, y: 7 } },
  { id: 'lio', name: 'Lio', task: 'tidying a project', home: { x: 16, y: 11 } },
  { id: 'kai', name: 'Kai', task: 'checking the inbox', home: { x: 20, y: 11 } },
] as const;
export type CoworkerId = (typeof COWORKERS)[number]['id'];
