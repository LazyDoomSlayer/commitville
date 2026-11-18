# Development workflow

## Requirements

- Node.js 24
- npm 11 or newer
- A current Chromium, Firefox, or Safari browser

Use the repository's `.nvmrc` when working with nvm:

```bash
nvm install
nvm use
npm install
```

## Run locally

```bash
npm run dev
```

Vite listens on all interfaces. This is intentional: it allows testing the development build from a Raspberry Pi or another device on the same trusted network. Do not expose the development server directly to the public internet.

## Camera and view controls

Nearby mascots automatically stop, face each other and chat in pairs or as a
three-person group. Speech changes every three seconds, then they resume their
patrols. Cooldowns prevent repeated stops. These encounters need no controls or
network access.

The angled office has ten fictional coworkers in addition to the mascots.
Six begin at their workstations and four begin wandering. Seeded schedules cycle
between work, coffee and lounge breaks; the HUD reports working/walking counts.
The enlarged floor is L-shaped, and Fit office includes both wings. Seven
workstations have chairs and three are standing desks; work poses match the
assigned station, while walking always uses the upright gait. The follow
selector currently tracks the three mascots.

The default office is an angled 2.5D scene. Dnake, C2-260 and C3 Plus walk without user input.

- Zoom with the +/− buttons, mouse wheel or a two-finger pinch.
- Choose Dnake, C2-260 or C3 Plus with the selector beside the activity text.
- Drag the canvas to pan. Panning turns off camera follow.
- Select **Follow Dnake**, **Follow C2-260** or **Follow C3 Plus** (or press F) to keep the selected mascot centered.
- Select **Fit office** (or press 0) to return to an overview.
- Keyboard +/− also zoom. The camera zoom range is bounded.

At mobile widths the scene starts in follow mode. Resizing changes the camera
viewport without restarting Dnake's routine. After a background-tab pause, the
routine resumes without simulating the entire hidden interval.

The earlier flat preview remains available at `/?view=flat` (append `?view=flat`
to the deployed URL when hosted under a base path). It retains the earlier static
layout and has no new camera controls.

## Preview Pi frame pacing locally

Open `/?profile=pi` to use the Canvas renderer and cap the game loop at 10 FPS,
matching the observed Pi 3 presentation. The regular URL keeps its normal frame
rate and automatic renderer selection. This mode approximates frame pacing; it
does not emulate the Pi's CPU, memory, graphics driver or browser startup time.

## Renderer compatibility

The normal URL probes WebGL framebuffer rendering and selects Canvas when that
probe fails. WebGL startup failures, first-frame GL errors and context loss
trigger a reload into Canvas; the ambient routine starts again. Other URL
parameters survive recovery. Static office art is cached as textures on both
renderers, preserving the angled pixel-art view and furniture depth ordering.

Use `/?renderer=canvas` for uncapped Canvas rendering, or `/?renderer=webgl` to
bypass the capability probe for diagnostics. Forced WebGL still recovers into
Canvas after failure. Inspect `data-renderer` on `#game` to see the selected
backend. The Pi preview profile takes precedence over the renderer override.

Local browser checks establish fallback behavior and layout, not Pi performance.
Measure the connected kiosk before choosing a production frame-rate target.
See ADR 0011 for recovery and caching trade-offs.

## Run with licensed local art

The angled office uses the eight purchased Pixelwood NPC designs when available
(two designs repeat across ten coworkers). Its furniture remains original geometry.
The flat preview at `?view=flat` also uses optional licensed furniture and layouts.
The private asset workflow copies a curated runtime subset from the ignored licensed source directory into an ignored Vite public-asset cache:

```bash
npm run dev:private
```

Create a private production build with:

```bash
npm run build:private
```

Remove the generated cache with `npm run assets:clear`. The standard public build works without any licensed pack. See `ASSETS.md` for paths and restrictions.

## Quality checks

The complete local gate is:

```bash
npm run check
```

It runs linting, type-checking, unit tests, formatting verification, and the production build. CI runs the same responsibilities on every pull request and push to `main`.

## GitHub Pages

Merges to `main` build and deploy the generic public version through GitHub Actions. The workflow supplies `/Commitville/` as Vite's base path. Local and alternative deployments default to `/`.

Private configuration is never bundled into the GitHub Pages deployment.

The public workflow also runs from a clean checkout, so licensed private assets cannot enter the Pages artifact. A private Raspberry Pi build is produced locally with `npm run build:private`.

## Raspberry Pi direction

The Pi is a display appliance, not the application server:

1. Raspberry Pi OS Desktop boots with automatic login.
2. Chromium opens the deployed URL in kiosk mode.
3. The browser cache keeps the last successful build available.
4. The kiosk process restarts after a browser crash or device reboot.

Exact kiosk provisioning will be added only after the web runtime is stable enough to test on the target Pi and television.

## Adding code

Use the ownership rules from `AGENTS.md`. If a file has no obvious owner, stop and clarify the responsibility before inventing a generic folder.

Tests live beside the code they verify. Simulation tests should avoid the DOM and Phaser runtime.
