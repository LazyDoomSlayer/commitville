# 0009 — Purchased characters in the angled office

- Status: Accepted
- Date: 2026-11-18
- Extends: 0003 — Private asset integration; 0008 — Seated and standing workstations

## Context

The owner preferred purchased character art to the original blocky coworkers and
requested natural seating. Pixelwood Valley includes eight NPC designs with idle
and directional walking frames, but the inspected sheets have no seated frames.

## Decision

Load the optional private manifest for both views through the asset service,
bounding the startup request to 1.5 seconds. In the angled scene, a rendering
adapter selects validated native NPC cells, integer scale and directional frames.
Eight designs serve ten fictional people, with two repeated designs. Existing
four-sheet manifests remain valid. No simulation rule depends on the artwork.

For seated work, align the idle sprite with the seat and hide its feet behind the chair and
desk. Keep the full standing body at raised workstations and restore full frames
when walking. This does not claim to supply missing native sitting/typing art.
The public fallback retains original people with compact seated legs.

## Consequences

Purchased files and screenshots stay in ignored local directories. Only source
paths and frame-integration code enter Git. Missing/invalid sheets are skipped;
without usable private character art the scene remains runnable with public art.
Furniture and projected floor remain original geometry. Bespoke seated frames
would require separately licensed or independently authored artwork later.

## Seating alignment correction

Close-up review exposed that the initial tall backrests covered the purchased
characters' heads. Use low backrests above the 16-pixel seat, and align the
cropped body edge with that seat: a 23-pixel crop at scale two ends eight pixels
above the sprite origin, so an additional eight-pixel lift lands it at seat
height. This replaces the initial twelve-pixel offset and oversized backrest.

## Character and desk proportions

TV close-ups showed the native chibi characters were too small beside standing
desks. Use integer scale three for purchased NPCs, with 24-pixel standing desks
and 18-pixel seated desks. The public fallback retains its taller furniture to
match its different body proportions. At scale three the cropped body ends
12 pixels above the origin, so the seat alignment now needs a four-pixel lift.
The low backrests remain below the heads. Furniture dimensions remain a rendering
concern; navigation footprints and work assignments are unchanged.
