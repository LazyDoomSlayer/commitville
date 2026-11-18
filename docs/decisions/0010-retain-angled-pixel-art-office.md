# 0010 — Retain the angled pixel-art office

- Status: Accepted
- Date: 2026-11-18

## Context

The owner tried a real 3D presentation, rejected the visual result, and explicitly
requested returning to the previous 2.5D office. The experimental Three.js and
pixel-rendered 3D branches were never merged into the retained office branch.

## Decision

Restore the pre-experiment implementation from commit `712d07f`. Keep the angled
Phaser office as the default, with optional purchased NPC sprites, the ten-person
population, seated/standing workstations, zoom/pan/follow and the three social
mascots. Preserve `?view=flat` as before.

Close the two experimental 3D pull requests. The retained application has no
Three.js dependency, 3D runtime, orbit controls or postprocessing passes. Earlier
experimental branches remain historical work rather than a deployment path.

## Consequences

The implementation and visuals return to the state before the 3D experiment.
No navigation, schedule, mascot or private-asset behavior is changed by this
restoration. Future presentation changes should preserve the pixel-art identity.
