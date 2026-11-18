# 0004 — Isometric office and autonomous navigation

- Status: Accepted
- Date: 2026-11-18

## Context

The flat office preview was small on a television and gave Dnake no navigation
space or camera controls. The owner requested directional walking, a larger view,
and an angled 2.5D office before considering a fully 3D renderer.

The purchased office composition is a flattened image. Tilting that image would
not create furniture depth or make it possible for a character to pass behind a
desk. Licensed artwork must not be used as generative input or an imitation
reference.

## Decision

Keep Phaser and create an original isometric room from projected floor cells,
raised furniture faces and a depth-sorted pixel character. Do not add a 3D engine
or a new dependency. Retain the earlier flat preview at `?view=flat`, including its
optional licensed asset loading and credits; the default angled view requires no
private files or network request.

Simulation owns the office grid, blocked furniture footprints, shortest-path
navigation and Dnake's autonomous routine. Rendering consumes the same footprint
contracts. The routine uses injected elapsed time in fixed 50 ms steps, visiting
fictional office destinations and pausing between walks. Rendering caps a frame's
elapsed time at 250 ms so background-tab resumes do not create runaway catch-up.

Rendering owns the isometric projection, furniture geometry, four-direction
sprite atlas, walking frames, depth ordering and camera. Each direction has an
idle/plant pose and alternate stepping frames. Source sprite pixels remain solid
and the sprite uses integer scaling; continuous camera zoom may change their
screen size. DOM camera controls belong to `src/ui`. These controls change the
view only; Dnake still decides where to walk without user input.

## Consequences

- The default view is larger and can be zoomed, panned, fitted or set to follow
  Dnake. Narrow screens start following at a readable zoom rather than shrinking
  the whole room to a thumbnail.
- The routine and collision rules are tested without Phaser or browser APIs.
- Original geometry replaces the purchased art in the default angled view. The
  licensed packs remain available in the flat preview and preparation workflow.
- This is a fixed-angle 2.5D projection, with no rotating camera, 3D models or
  perspective renderer. Fully 3D rendering would need a separate decision.
- Navigation is for one character on a static orthogonal grid. Dynamic obstacles,
  multiple-character avoidance, workday needs and save/restore remain future work.
- A furniture object is depth-sorted as one unit. More complicated or intersecting
  furniture may require splitting its visual parts for correct occlusion.
- Raspberry Pi frame rate and touch behavior on physical mobile hardware still
  need device testing; desktop Chromium checks do not establish hardware performance.
