# 0005 — Shared patrols and cell reservations

- Status: Accepted
- Date: 2026-11-18
- Extends: 0004 — Isometric office and autonomous navigation

## Context

The ZKTeco C2-260 mascot joins Dnake in the angled office. Duplicating the movement
engine would make their timing and obstacle behavior diverge. Independent patrols
could also walk through one another. This extends ADR 0004's single-character
navigation without introducing a full crowd simulation.

## Decision

Extract the proven movement behavior into `OfficePatrolSystem`. Each mascot owns
its route, starting cell, speed, pauses and activity text. `OfficeMascotsSystem`
advances both patrols in stable order on the same fixed 50 ms steps.

A moving mascot reserves both ends of its current floor-cell segment. A patrol
can begin a segment only when the other mascot has not reserved its destination.
A blocked patrol replans around occupied cells from a cell center or waits until
a route is clear. A segment already in progress finishes without a mid-cell turn.
The same footprint map continues to prevent furniture collisions.

Rendering owns each mascot's original directional atlas and selects the frame
from its patrol snapshot. A selector chooses which mascot's activity is displayed
and which one the existing follow camera tracks; selection never commands motion.

## Consequences

- The two mascots share tested movement behavior while retaining distinct artwork,
  proportions, pace and routines.
- Stable scheduling and cell reservations are reproducible across frame timings.
  Tests cover both complete routines, spatial separation, blocked-goal recovery
  and determinism.
- This remains a grid-based approximation. It is not continuous physics or a
  general deadlock-free crowd solver. The current open layout and two routes
  are verified; constrained corridors or more actors need further evaluation.
- The earlier flat preview remains a static Dnake preview. Both autonomous
  mascots and the selector belong to the angled view.
