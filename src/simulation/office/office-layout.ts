export interface GridPoint {
  readonly x: number;
  readonly y: number;
}

export interface OfficeFixture extends GridPoint {
  readonly kind: 'desk' | 'chair' | 'coffee' | 'plant' | 'meeting' | 'sofa' | 'shelf';
  readonly width: number;
  readonly depth: number;
}

export const WORKSTATIONS = [
  { x: 3, y: 3, posture: 'seated' },
  { x: 7, y: 3, posture: 'standing' },
  { x: 3, y: 7, posture: 'seated' },
  { x: 7, y: 7, posture: 'seated' },
  { x: 15, y: 2, posture: 'standing' },
  { x: 19, y: 2, posture: 'seated' },
  { x: 15, y: 6, posture: 'seated' },
  { x: 19, y: 6, posture: 'seated' },
  { x: 15, y: 10, posture: 'standing' },
  { x: 19, y: 10, posture: 'seated' },
] as const;
export type WorkPosture = (typeof WORKSTATIONS)[number]['posture'];

// Grid footprints are shared by navigation and rendering so furniture cannot
// accidentally become walkable when its visual placement changes.
export const OFFICE_LAYOUT = {
  width: 24,
  height: 18,
  mainDepth: 12,
  loungeWidth: 14,
  fixtures: [
    ...WORKSTATIONS.flatMap(
      (station) =>
        [
          { kind: 'desk', x: station.x, y: station.y, width: 2, depth: 1 },
          ...(station.posture === 'seated'
            ? [{ kind: 'chair' as const, x: station.x + 1, y: station.y + 1, width: 1, depth: 1 }]
            : []),
        ] satisfies OfficeFixture[],
    ),
    { kind: 'coffee', x: 1, y: 1, width: 2, depth: 1 },
    { kind: 'shelf', x: 6, y: 0, width: 3, depth: 1 },
    { kind: 'plant', x: 12, y: 1, width: 1, depth: 1 },
    { kind: 'meeting', x: 10, y: 6, width: 3, depth: 2 },
    { kind: 'sofa', x: 1, y: 10, width: 3, depth: 1 },
    { kind: 'plant', x: 0, y: 7, width: 1, depth: 1 },
    { kind: 'sofa', x: 1, y: 16, width: 4, depth: 1 },
    { kind: 'coffee', x: 9, y: 16, width: 2, depth: 1 },
    { kind: 'plant', x: 12, y: 16, width: 1, depth: 1 },
    { kind: 'plant', x: 22, y: 1, width: 1, depth: 1 },
  ] satisfies OfficeFixture[],
} as const;

export const isOfficeFloor = ({ x, y }: GridPoint): boolean =>
  Number.isInteger(x) &&
  Number.isInteger(y) &&
  x >= 0 &&
  y >= 0 &&
  x < OFFICE_LAYOUT.width &&
  y < OFFICE_LAYOUT.height &&
  (y < OFFICE_LAYOUT.mainDepth || x < OFFICE_LAYOUT.loungeWidth);

export const isOfficeWalkable = ({ x, y }: GridPoint, allowedSeat?: GridPoint): boolean =>
  isOfficeFloor({ x, y }) &&
  !OFFICE_LAYOUT.fixtures.some(
    (fixture) =>
      !(fixture.kind === 'chair' && allowedSeat?.x === x && allowedSeat.y === y) &&
      x >= fixture.x &&
      x < fixture.x + fixture.width &&
      y >= fixture.y &&
      y < fixture.y + fixture.depth,
  );

// Breadth-first search gives a stable shortest path through four-way floor cells.
export const findOfficePath = (
  start: GridPoint,
  goal: GridPoint,
  occupied: readonly GridPoint[] = [],
  allowedSeat?: GridPoint,
): GridPoint[] => {
  if (!isOfficeWalkable(start, allowedSeat) || !isOfficeWalkable(goal, allowedSeat)) return [];
  const key = (point: GridPoint): string => `${point.x},${point.y}`;
  const queue = [start];
  const previous = new Map<string, GridPoint | null>([[key(start), null]]);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index]!;
    if (current.x === goal.x && current.y === goal.y) {
      const path: GridPoint[] = [];
      let cursor: GridPoint | null = current;
      while (cursor) {
        path.unshift(cursor);
        cursor = previous.get(key(cursor)) ?? null;
      }
      return path.slice(1);
    }
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ] as const) {
      const next = { x: current.x + dx, y: current.y + dy };
      if (
        isOfficeWalkable(next, allowedSeat) &&
        !previous.has(key(next)) &&
        !occupied.some((cell) => cell.x === next.x && cell.y === next.y)
      ) {
        previous.set(key(next), current);
        queue.push(next);
      }
    }
  }
  return [];
};
