# Add a scene

A **Scene** is one looping room: **Scenery** (drawn, then turned into ASCII) plus the **Axolotl** (solid pixels on top).

Read this when you add a Scene. File names use the words in [CONTEXT.md](../CONTEXT.md).

## How a frame is painted

Every frame in `src/scene/paint-scene.ts` does this, in order:

1. Fill a small offscreen canvas with black.
2. Call `scenery.draw(ctx, width, height, phase)`.
3. Run that canvas through [asciify-engine](https://asciify.org/) (`imageToAsciiFrame` → `renderFrameToCanvas`) as **dots** or **glyphs**.
4. Copy the ASCII onto the visible canvas.
5. Paint the Axolotl last, at `scenery.stand`.

The Axolotl is never asciified, and its pixel is a fixed `SPRITE_PX` rather than one ASCII cell, so it
stays chunky while the Scenery keeps a fine grid. Dots run at a 3 px cell; glyphs get a cell 2.2x
larger, because a character has to be big enough to tell apart. Scenery is drawn at three times the
cell and downsampled, so detail below about two cells will not survive. Fine lines in the Scenery will vanish;
big, bright shapes survive.

`phase` is `(elapsed % loopMs) / loopMs`, so it runs `0 … 1` and wraps. Motion that is a function of `phase` with **integer** cycle counts meets itself at the wrap. That is a seamless loop.

When Preferences say the ScenePlaylist cycles, the loop holds one Scene for about 40 seconds (rounded up to a whole number of `loopMs`), fades 400 ms, then advances. The scene button skips early and shows that Scene's Hugeicon. With cycling off, the Floater holds until the user skips.

## Add one

Walk this with a new id, for example `garden`. Done when the checklist at the bottom is all true.

### 1. Id

Add the id to `SCENE_IDS` in [`src/scene/scene-id.ts`](../src/scene/scene-id.ts).

`SceneId`, `isSceneId`, default Preferences, and the Panel chips all follow this list. You do not edit the Panel.

### 2. Playlist row

Add a row in [`src/scene/playlist.ts`](../src/scene/playlist.ts):

```ts
garden: { id: "garden", name: "Garden", loopMs: 12000, activity: "reading" },
```

| Field | What it is |
| --- | --- |
| `id` | Same string as `SCENE_IDS` |
| `name` | Label on the Panel chip |
| `loopMs` | One full motion cycle. 8–16 seconds is the range the existing Scenes use |
| `activity` | What the Axolotl does. Reuse one if it fits: `reading`, `sleeping`, `dancing`, `guitar`, `gaming`, `cooking` |

TypeScript will fail until `SCENES` has every `SceneId`. That is the check for this step.

### 3. Draw the Scenery

Add [`src/scene/scenery/garden.ts`](../src/scene/scenery/scenery.ts) that exports a `Scenery`:

```ts
import { MINT, TONE, gray, hue, panel, plant, slab, wash, wave } from "../ink.ts";
import type { Scenery } from "./scenery.ts";

export const garden: Scenery = {
  stand: { x: 0.32, y: 0.84 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    wash(ctx, 0, 0, w, h * 0.8, gray(0.18), gray(TONE.back));
    slab(ctx, 0, h * 0.8, w, h * 0.2, u, TONE.near);
    panel(ctx, w * 0.7, h * 0.4, u * 10, h * 0.4, u, TONE.mid);
    // motion: integer cycles so phase 0 matches phase 1
    plant(ctx, w * 0.86, h * 0.8, u, 3, phase, hue(MINT, 0.9));
    const sway = wave(phase, 2) * u;
    panel(ctx, w * 0.72 + sway, h * 0.34, u * 6, u * 6, u, TONE.lit);
  },
};
```

Copy the shape of [`hearth.ts`](../src/scene/scenery/hearth.ts) or [`rain.ts`](../src/scene/scenery/rain.ts). Keep the file under 200 lines. Split helpers in the same file before you grow a second one.

The loop already cleared the canvas to black. Draw the room. Leave the Axolotl out.

### 4. Register it

In [`src/scene/scenery/by-scene.ts`](../src/scene/scenery/by-scene.ts): import the export and add it to the `SCENERY` record.

`sceneryFor` must stay exhaustive. If a `SceneId` is missing, the project will not typecheck.

### 5. Hugeicon

Add a path-only export from `@hugeicons/core-free-icons` to `PICK` in [`scripts/build-icons.mjs`](../scripts/build-icons.mjs), map the Scene id to that slot in [`src/owner/scene-icon.ts`](../src/owner/scene-icon.ts), then run `node scripts/build-icons.mjs`. The Panel chip and the Floater scene button both read that map. Do not import the package at runtime.

### 6. New Activity, only if you need one

Reuse an existing Activity unless the Axolotl must hold something new.

If you add one (say `watering`):

1. Add it to the `Activity` union in `playlist.ts`.
2. Draw the prop in [`src/scene/axolotl-props.ts`](../src/scene/axolotl-props.ts). `drawProps` is a `switch` with a `never` default — handle the new variant.
3. In [`src/scene/axolotl-sprite.ts`](../src/scene/axolotl-sprite.ts), only touch `bobRows` / `eyesClosed` if the motion should differ (sleeping bobs slower and shuts its eyes; dancing hops).

Props are character grids. `.` is empty. Letters map through `PROPS` in `axolotl-props.ts`, which
extends the body's own `AXOLOTL_PALETTE`. `behind` paints before the body, `front` after.

Offsets are in sprite pixels from the sprite's top-left. On the 32 x 20 grid: the face is columns 8–17
and rows 4–11, the eyes are rows 6–8, the earcup is columns 18–22, the back runs rows 13–17, and the
paws sit on rows 18–19.

## Drawing

**Scale.** `const u = w / 100`. Place things with fractions of `w` and `h` (`w * 0.6`, `h * 0.3`) so the room survives resize.

**Ink.** Use [`src/scene/ink.ts`](../src/scene/ink.ts). Shapes: `box`, `frame`, `line`, `disc`, `ring`, `arch`, `poly`, `ellipse`. Forms: `panel` (a lit solid), `slab` (a surface seen edge-on), `courses` (brick or tile). Light: `glow`, `pool`, `wash`, `cast`, `star`. Set dressing: `plant`, `cat`, `books`, `shelf`, `picture`, `steam`. Maths: `wave`, `hash`, `TAU`. Reach for raw canvas only when those cannot say it.

**Tone.** Shapes separate by tone, not by outline — an outline alone becomes one faint dot row. Build
objects out of `panel` and `slab`, and pick levels off the `TONE` scale (`void`, `back`, `mid`, `near`,
`lit`, `edge`, `hot`). Keep neighbouring forms at least one step apart.

**Colour.** `colorMode` is `fullcolor`, so the dots take the Scenery's own colours — but a dim colour
just reads as dim grey. Pass `hue(PINK, 0.85)` and up for anything meant to look coloured, and keep the
area small. The named tints (`PINK`, `ROSE`, `CYAN`, `AMBER`, `MINT`, `VIOLET`) come off `assets/logo.png`.

**Stand.** `{ x, y }` is where the Axolotl's feet sit, in 0–1 of the canvas. The sprite is 32 × 20 of its
own pixels, about 40% of the Floater's width. Leave that much clear. Existing stands sit around
`x: 0.24–0.50`, `y: 0.70–0.88`.

**Loop.** `wave(phase, cycles)` and `(hash(i) + phase * speed) % 1` wrap cleanly when `cycles` and `speed` are integers. A `Math.random()` per frame will flicker and will not loop.

**Reduced motion.** The loop freezes `phase` at `0`. The still frame should still look like the room.

## Checklist

- [ ] `SCENE_IDS` has the new id
- [ ] `playlist.ts` has the matching row
- [ ] `src/scene/scenery/<id>.ts` exports a `Scenery`
- [ ] `by-scene.ts` registers it
- [ ] `scene-icon.ts` and `build-icons.mjs` have the matching Hugeicon
- [ ] New Activity, if any, is handled in `drawProps` (and bob/eyes if needed)
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] Build, reload the extension, open the Floater: the Panel shows the chip with its Hugeicon, the scene button can land on the Scene, the Axolotl stands on the floor, the motion meets itself when the cycle wraps
