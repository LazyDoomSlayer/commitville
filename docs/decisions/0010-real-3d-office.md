# 0010 — Real 3D office presentation

- Status: Accepted
- Date: 2026-11-18
- Supersedes: the 2.5D-only presentation direction in 0004 and the original 3D non-goal

## Context

The owner explicitly requested moving from the angled sprite office to real 3D.
Sprite/furniture proportions and missing native seated poses limited the previous
presentation. The autonomous population and navigation already have an independent
simulation boundary and can drive another renderer unchanged.

## Decision

Use Three.js for the default view, with perspective projection, OrbitControls,
solid low-poly furniture, articulated humans and three distinct device mascot
models. Three.js is the only new runtime dependency; its type package is a build
dependency. Phaser remains for explicit `?view=angled` and `?view=flat` views and
as automatic fallback after WebGL initialization failure or context loss. Both
renderers are lazy imports, so the default does not boot or download Phaser.

`src/rendering/three` owns model construction, joint poses, lights, camera and
frame projection. Existing deterministic population snapshots remain the sole
source of routes, work posture and conversations. Sitting bends actual hip/knee
joints; the 3D view never crops a standing sprite. Procedural models are original
geometry and do not use purchased pixel art as generation or imitation references.
The licensed private workflow remains available in the legacy views.

The camera supports rotation, pan, zoom, fit and mascot follow. Camera-facing
walls become cutaways. Narrow screens begin in follow mode. A background pause
caps catch-up, and teardown releases the loop, listeners, controls and GPU assets.
Floor tiles are instanced, primitive geometry/materials are shared, device pixel
ratio is capped at 1.5, and a single directional light owns the shadow map.

## Consequences

The product now supports a stylized 3D presentation, rather than requiring pixel
art in every view. No simulation rule, privacy boundary or navigation footprint
changes. Automatic fallback starts a fresh population in the angled view; this
is preferable to a blank unattended display. Devices without WebGL2 continue
through the legacy renderer. Performance must still be measured on the actual
Raspberry Pi/TV; desktop browser checks do not establish a kiosk frame-rate target.
