# 0008 — Seated and standing workstations

- Status: Accepted
- Date: 2026-11-18
- Extends: 0007 — Expanded office and fictional coworkers

## Context

The first coworker sprites all worked upright beside spare chairs, which did not
read as people using their computers. The owner requested a clear mix of sitting
and standing work with appropriate furniture and posture.

## Decision

`WORKSTATIONS` owns ten desk locations and their work posture: seven seated,
three standing. Coworker home positions and preferred posture derive from these
stations. Rendering uses lower seated desks and raised standing desks, aligns
monitors/keyboards with the worker position and puts chairs at the seated homes.

Seated and standing typing frames are separate native silhouettes. Seated frames
have lower head/shoulders and bent legs; standing frames retain full height.
Both keep the same floor anchor, with hands at the corresponding keyboard height.
Chair backs render separately in front of the seated worker's lower body. Work
posture is exposed only while working; walking uses normal directional frames.

A chair remains an obstacle to general navigation. A seated coworker's patrol
receives permission for its assigned chair cell so it can enter and leave its
workstation. That permission does not override desks or any other chair. Existing
population reservations continue to prevent people occupying the same cell.

## Consequences

- Furniture, assignment and pose share one workstation contract rather than
  independent visual offsets.
- Navigation tests explicitly distinguish clear floor from an authorized seat,
  retain population separation checks, and verify leaving/returning to a seat.
- Posture is assigned per workstation, not a new needs system or an interactive
  sitting command. Work/break schedules and mascot behaviors continue as before.
