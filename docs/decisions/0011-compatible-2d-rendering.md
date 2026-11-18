# 0011 — Compatible 2D rendering

- Status: Accepted
- Date: 2026-11-18

## Context

The Pi 3 kiosk rendered the angled office with Canvas, while Chromium's WebGL
initialization produced context and framebuffer errors. Power throttling is a
separate issue. The device is currently disconnected, so local results cannot
establish its improved frame rate. Preserve the accepted pixel-art presentation
and browser deployment rather than changing engines.

## Decision

Rendering configuration owns a small WebGL 1 capability probe: create an RGBA
framebuffer, clear it and verify pixel readback. Missing, incomplete, incorrect
or throwing contexts select Canvas. Avoid software WebGL contexts reported as a
major performance caveat. Phaser still owns the actual renderer implementation.

The rendering runtime retries with Canvas after WebGL initialization failure,
context loss, a first-frame GL error or a 20-second startup timeout. Recovery
reloads the document with `renderer=canvas`, retaining other URL parameters.
This releases failed driver resources and avoids repeated WebGL recovery loops.
It resets the ambient simulation; durable state is not yet implemented.

Static floor, walls and individual furniture layers are rendered to textures
once. Images replace repeated vector commands on both backends. Chair backs
remain separate depth layers so coworkers retain their seated occlusion.
Textures use nearest-neighbor filtering. Dynamic characters and camera controls
remain live.

`?renderer=canvas` selects Canvas without imposing a frame cap.
`?renderer=webgl` bypasses the probe for diagnostics, while retaining recovery.
`?profile=pi` continues to select Canvas with a 10 FPS cap for local frame-pacing
preview. Normal automatic selection has no added frame cap.

## Consequences

Canvas is a supported renderer rather than an emergency low-frame-rate mode.
Caching trades texture memory and initial rasterization for less per-frame work.
The capability probe does not certify every GPU operation: first-frame checks
and context-loss recovery provide additional coverage. These changes reduce
rendering work but do not promise 60 FPS on the Pi. Hardware acceptance requires
reconnecting the Pi with its power issue resolved and measuring the real kiosk.
