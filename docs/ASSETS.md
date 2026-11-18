# Assets and licensing

Commitville supports a generic public build and a richer private build that uses locally purchased assets. The public repository must remain useful without licensed files.

## Pixelwood Valley

The private visual prototype uses Pixelwood Valley v1.1.4 by Gowl:

- Source: <https://gowldev.itch.io/pixelwood-valley>
- License tier: Premium
- Purpose: game runtime environment, furniture, plants, and fictional NPC sprites

The license permits use and modification in personal and commercial games. It does not permit reselling, redistributing, or sharing the original or modified assets as an asset pack. It also prohibits AI-training datasets and NFT projects.

The creator has separately clarified that AI assistants may help with programming, documentation, asset organization, and technical integration, but the artwork must not be used to train or produce AI-generated artwork. Commitville follows that restriction.

## Donarg Office Interior Tileset

The private office composition uses the Office Interior Tileset by Donarg:

- Source: <https://donarg.itch.io/office>
- Archive SHA-256: `1b1f6ff8c52d2c4be953a4bb203fbcd8a53fb6cbb1ed64b768e400dfa452d091`
- Purpose: modern office walls, floors, desks, computers, chairs, meeting areas, appliances, screens, and decorations

The license bundled in the purchased archive permits editing and use in commercial and non-commercial projects. It prohibits resale or redistribution, web3/NFT/crypto/blockchain projects, and AI or machine-learning training. Credit to Donarg is optional and appreciated.

The initial private preview uses the bundled Level 3 composition as a temporary office layout and overlays fictional Pixelwood NPCs. The 16×16 atlas is also prepared for the custom photo-based map that will replace the sample layout.

## Local source layout

Extract the purchased pack into this ignored location:

```text
private/assets/pixelwood-valley/
└── Pixelwood Valley 1.1.4/
    ├── interior/
    ├── NPCs/
    └── ...

private/assets/donarg-office/
└── Office Tileset/
    ├── Office Tileset All 16x16.png
    ├── LICENSE.txt
    └── Office Designs/
```

Alternative extractions can be supplied temporarily with `PIXELWOOD_ASSET_ROOT` and `DONARG_ASSET_ROOT`.

## Runtime preparation

Run:

```bash
npm run assets:prepare
```

The preparation script discovers either or both supported packs, validates their expected markers, clears only the generated `public/assets/private/` cache, copies each curated runtime subset, and writes a manifest. It never modifies a purchased source directory.

The cache and the resulting private `dist/` build are local deployment artifacts. Do not add either to Git.

## Public fallback

The default angled office uses original geometry with optional purchased Pixelwood
characters. Without the private manifest it uses original public fallback people.
In the flat preview, an absent private manifest selects the generic placeholder
office. GitHub Pages runs from a clean checkout, so licensed packs are never
available there.

## Adding another pack

Before integrating another licensed pack:

1. Record its creator, source, version, license tier, and restrictions.
2. Keep source assets under `private/assets/`.
3. Copy only the files needed at runtime.
4. Preserve a functional public fallback.
5. Do not mix packs until their scale, perspective, palette, and license are verified.

## Dnake mascot

`src/rendering/sprites/dnake.texture.ts` owns the original mascot's four-direction
pixel atlas: 24×40 cells, four poses per direction, and a nine-color palette. Each
source grid cell becomes one solid texture pixel. The walking animation alternates
feet and arms; the back has vents and a service panel, while the side views have a
narrow casing and lens profile. The scene selects direction and gait from
simulation state, with integer sprite scale and rounded projected positions.
Continuous camera zoom can change the final screen pixel size.

The design retains the camera, screen face, keypad, and silver casing from the
owner-supplied DNAKE device photos and the initial generated concept. The large
concept image has been replaced by explicit runtime pixels. Neither licensed
artwork nor private device identifiers are used in the texture.

The default angled office uses original projected geometry for the floor, walls
and furniture; no purchased artwork is transformed or used as a generation
reference. The earlier licensed preview is retained at `?view=flat`. It uses the
mascot's idle frame; autonomous walking and camera controls belong to the angled
view. Both views work without private asset files.

## ZKTeco C2-260 mascot

`src/rendering/sprites/zkteco.texture.ts` owns an original 36×36 pixel atlas with
four facing directions, four poses per direction and nine colors. The mascot
keeps the photographed device's broad charcoal housing, inset corners, connector
rows and red/green/amber status lights. Rear frames show a mounting bracket;
profiles show simplified Ethernet, USB and switch details. Small invented eyes,
a smile and limbs give the screenless controller its character.

The sprite is constructed from solid pixel rectangles, without a generated
illustration or a photographic texture. Its references are owner-supplied device
photos, independent of the licensed packs. No photos, wiring, identifiers or
private configuration are shipped. The status lights are fictional artwork,
not a live device-health indicator.

C2-260 roams alongside Dnake in the angled office. Use the mascot selector beside
the activity text to choose which character the camera follows. The earlier flat
preview retains only Dnake.

## ZKTeco C3 Plus mascot

`src/rendering/sprites/c3-plus.texture.ts` owns an original 32×48 pixel atlas with
four directions, four poses per direction and ten colors. Based on owner-supplied
photos, it keeps the tall exposed PCB, deep upper cover, silver coin cell, side
terminal strips, Ethernet jack, relays and paired lower capacitors. Small invented
eyes and a smile sit on the cover; no display is added to the screenless board.
Rear frames show abstract solder pads and traces, while profiles show the thin
board and raised components.

The reference photographs, MAC/serial labels, QR codes and actual circuit wiring
are not shipped. The artwork uses solid native pixels and simplified fictional
traces, independently of the licensed packs. C3 Plus joins Dnake and C2-260 in
the angled office with its own patrol and selectable follow camera. The earlier
flat preview remains unchanged.

## Fictional coworkers

`src/rendering/sprites/coworker.texture.ts` draws ten original 24×40 pixel people
with distinct shirt, hair and skin palettes. Each has front/back/profile walking
frames and separate standing/seated typing poses, including compact legs tucked beneath the desk for seated work. These sprites are independent of the
licensed packs and do not depict real employees. The fictional names, tasks and
home workstations live in `src/simulation/characters/coworker-roster.ts`.

When prepared locally, the angled office instead uses all eight purchased
Pixelwood NPC sheets (`NPCs/1.png` through `8.png`), repeating two designs for the
ten fictional coworkers. The renderer extracts idle and four-frame directional
walks from the native 59×49 cells, mirrors side-facing frames for west, and uses
integer scale with nearest-neighbor filtering. These are technical integrations
of the purchased files, not generated imitations.

The inspected sheets have no seated poses. Seated workers use a seat-aligned idle
upper body with feet cropped behind the chair/desk; standing workers retain the
full body. This is furniture occlusion, not an authored seated or typing animation.
Missing or invalid individual sheets are skipped; absent private art falls back
to the original public people. Private screenshots must remain in ignored local
review folders, never committed with the pack art.
