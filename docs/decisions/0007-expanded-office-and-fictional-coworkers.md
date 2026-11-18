# 0007 — Expanded office and fictional coworkers

- Status: Accepted
- Date: 2026-11-18
- Extends: 0004, 0005 and 0006

## Context

The owner requested a larger, differently shaped office with ten people in
addition to the three device mascots, mixing work with casual wandering.
The existing flat rectangle and four desks were not sufficient for this group.

## Decision

Expand the angled office to a 24×18 bounding grid with an L-shaped footprint:
a 24×12 main workspace and a 14×6 lounge extension. The floor contains 372 cells,
compared with the earlier 168. Provide ten workstations and additional lounge
seating, coffee and plants. `isOfficeFloor` is shared by floor drawing and
navigation so the cutout cannot be walked across. Camera fit and pan extents
follow the projected room footprint.

Introduce ten explicitly fictional coworkers with distinct original code-drawn
pixel appearances. Each owns a home workstation, work task, pace and sequence of
work/break destinations. Six start working and four start exploring. A seeded
local generator chooses varied break routes and durations; the simulation never
reads global randomness or device time. Work frames animate typing; walking uses
the existing directional gait convention.

Rename the coordinator to `OfficePopulationSystem`, which advances all thirteen
occupants on the same fixed steps. Every actor reserves its segment against all
other occupants. Mascot conversations continue to pause only their participants;
coworkers navigate around them. The UI reports working and walking counts, while
the existing follow selector remains focused on the three mascots.

## Consequences

- The office has more than twice its previous floor area and visibly separate
  workstation and lounge wings, without adding a rendering engine or dependency.
- Tests cover the missing-floor cutout, ten desks, seeded schedules, initial work
  distribution, complete work/walk behavior, collision and pairwise separation
  for all thirteen actors over ten simulated minutes.
- This is an ambient work/break routine, not a complete workday, needs system,
  productivity metric, personnel model or real employee configuration.
- Coworker conversations, detailed task progress and coworker camera selection
  remain follow-up work. The three mascots retain their social behavior.
- Cell reservations remain an approximation, not a general crowd solver. The
  current enlarged layout and roster are tested together; tighter corridors need
  additional evaluation.
- The previous flat preview remains available separately. Physical Raspberry Pi
  performance remains to be measured with the larger population.
