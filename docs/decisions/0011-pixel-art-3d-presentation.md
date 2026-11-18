# 0011 — Pixel-art presentation of the 3D office

- Status: Accepted
- Date: 2026-11-18
- Supersedes: smooth low-poly shading and perspective projection in 0010

## Context

The owner rejected the first 3D result because it abandoned the pixel-art style
and looked like a blocky avatar game. The request for real 3D did not authorize
losing the original pixel-art visual identity.

## Decision

Keep solid 3D geometry, articulated seating, rotating camera and the autonomous
simulation. Render the scene through Three.js's bundled RenderPixelatedPass,
with normal/depth edge accents and nearest-filtered low-resolution scene buffers.
Use integer pixel sizes (three at 1080p, two at 720p and narrow mobile sizes),
no antialiasing, and device pixel ratio one. The DOM HUD stays crisp at display
resolution. OutputPass applies the final color transform.

Use orthographic projection to preserve diorama proportions while orbiting.
OrbitControls still rotates/pans the real scene; zoom now changes orthographic
magnification rather than camera distance. Fit and mascot-follow initialize
appropriate magnifications for wide and narrow displays.

Shared toon materials use a four-band nearest-filtered lighting ramp. Human
heads use stepped extruded silhouettes, layered hair and larger faces with
shorter arms/legs. Gait phases advance in coarse steps to suit the pixel grid.
These meshes and palettes are original work, independent of licensed sprite art.

## Consequences

This is a pixel-art-directed 3D renderer, not a replacement pack of hand-authored
2D sprites. Pixel edges and shading stay visible through zoom and camera orbit.
The pixel pass adds a low-resolution normal pass and render targets; all added
passes/targets are disposed during recovery/teardown. No new package is needed.
The earlier default 3D image is replaced in the README with the revised result.
Simulation rules, legacy views and WebGL recovery remain unchanged.
