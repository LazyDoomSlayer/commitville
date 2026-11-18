# Architecture

Commitville separates the deterministic simulation from its Phaser presentation. The browser shell composes both and owns lifecycle concerns.

```text
Browser shell (`src/main.ts`)
├── Simulation (`src/simulation`)
│   ├── time
│   ├── characters
│   ├── needs
│   ├── tasks
│   └── events
├── Rendering (`src/rendering`)
│   ├── config
│   ├── scenes
│   ├── sprites
│   └── effects
├── UI (`src/ui`, when justified)
└── Services (`src/services`, when justified)
    ├── persistence
    └── external communication
```

## Structure: responsibility first, domain second

Top-level folders answer “what does this code own?” Nested folders answer “which part of Commitville does it serve?”

This is intentionally hybrid. A purely file-type structure would scatter one simulation domain across the repository. A purely feature-based structure would make shared rendering, persistence, and application lifecycle responsibilities unclear.

## Boundaries

### Simulation

Simulation code owns the world model and its rules. It should be pure TypeScript and deterministic wherever practical.

It may depend on:

- Domain contracts in `src/simulation`
- Injected clocks, random sources, and configuration

It must not depend on:

- Phaser
- DOM APIs
- Browser storage
- Network requests

This boundary lets simulation systems run quickly in tests and makes future save/replay tooling possible.

### Rendering

Rendering code projects world state onto the screen. It owns Phaser scenes, cameras, sprite animation, map layers, lighting, and effects. It may translate visual events into simulation commands, but it must not own domain rules.

### Services

Services will own browser storage and external communication. A scene or simulation system should ask a service to load or save data rather than knowing where that data lives.

The asset service validates and loads optional local manifests for the flat
preview. The default angled view does not need an external asset manifest.
Durable persistence has not been implemented.

### Application shell

`src/main.ts` creates the game, simulation runtime, and UI adapters. It owns startup and teardown. It should stay small and must not accumulate simulation rules.

## Simulation loop direction

The world clock remains independent. Mascot navigation consumes elapsed time
in fixed 50 ms steps, with rendering projecting its position and facing direction.
Furniture footprints in `src/simulation/office` drive both pathfinding and visual
placement. No Phaser or DOM APIs enter simulation code. The larger world runtime
will build on this direction:

```text
real elapsed time
      ↓
fixed simulation steps
      ↓
immutable/read-only world snapshot
      ↓
Phaser visual projection + DOM HUD
```

A fixed step keeps navigation reproducible as frame timing varies. Rendering
caps catch-up after background pauses. `OfficePatrolSystem` owns one routine;
`OfficePopulationSystem` coordinates Dnake, C2-260, C3 Plus and ten fictional coworkers with cell reservations. See
ADR 0005 for deterministic scheduling and shared-path behavior. The current
roster advances in a stable order and reserves against every other mascot's
current segment; the thirteen routes are verified together for separation and
progress through all destinations. Camera changes and resizing do not reset
the simulation. `MascotConversationSystem` owns proximity encounters and dialogue;
the patrol coordinator pauses participants while preserving their routes and
reserved cells. Social snapshots expose facing, idle and speech state. The UI
owns the clamped screen-space speech bubble. See ADR 0006 for encounter timing
and ownership. `CoworkerSystem` uses seeded work/break routes from the fictional
roster. The shared L-shaped floor predicate drives both navigation and floor
rendering; camera extents follow the projected footprint. See ADR 0007 for the
expanded office and population. See ADR 0004 for the isometric and navigation decisions.

## Configuration

The public build uses generic defaults and fictional fixtures. Private deployments may load ignored local configuration, but code must behave sensibly when that configuration is absent. See `PRIVACY.md`.

## Decision records

Architectural decisions live in `docs/decisions`. Add an ADR when a change introduces a lasting constraint, substantial dependency, or difficult-to-reverse direction. Do not write an ADR for routine implementation details.
