import type { Activity } from "./playlist.ts";
import { drawProps, type PropFrame } from "./axolotl-props.ts";
import { AXOLOTL_PALETTE, mirrorPixels, paintPixels, recolor, type Pixels } from "./pixels.ts";

export const SPRITE_W = 32;
export const SPRITE_H = 20;

/**
 * Traced off assets/logo.png. The headphone band caps the head cube on rows 0-3 and comes down
 * into one earcup on rows 5-10, with the logo's music note on the cup. Back and tail fin run
 * 11-17, three paws sit on 18-19.
 */
export const BODY: Pixels = [
  "..........HHHHHHHHHHH...........",
  "........HHLLLLLLLLLLLHH.........",
  ".......HWWWWWWWWWWWWWWH.........",
  ".......HWWWWWWWWWWWWWWH.........",
  ".......HBBBBBBBBBBBBBBH.........",
  "........BBBBBBBBBBHHHHH.........",
  "........BBEEBBEEBBHHHNH.........",
  "........BBEEBBEEBBHHHNH.........",
  "........BBEEBBEEBBHNNNH.........",
  "........CCBBBBBBCCHNNHH.........",
  "........BBBMBBMBBBHHHHH.PP......",
  "........BBBBMMBBBBBBBS..PPP.....",
  "........SSSSSSSSSSSSSS..PPPP....",
  "........WWWWWWWWWWWWWWWWPPPP....",
  ".......bBBBBBBBBBBBBBBBBPPP.....",
  ".......BBBBBBBBBBBBBBBBBPP......",
  ".......bBBBBBBBBBBBBBBBSS.......",
  "........SSSSSSSSSSSSSSS.........",
  ".........BBB..BBB...bbb.........",
  ".........PPP..PPP...SSS.........",
];

/** Three feathery fronds, drawn pointing right and mirrored for the far side. */
const GILL_REST: Pixels = [
  "..GGGg..",
  ".GGGGG..",
  "GGGGR...",
  "..GG....",
  "..GGGGGg",
  ".GGGGGG.",
  "GGGGR...",
  "..GG....",
  "..GGGGg.",
  ".GGGGG..",
  "GGGGR...",
];

const GILL_SWAY: Pixels = [
  "..GGg...",
  ".GGGGGg.",
  "GGGGR...",
  "..GGG...",
  "..GGGGg.",
  ".GGGGGGg",
  "GGGGR...",
  "..GG....",
  "..GGGGGg",
  ".GGGGG..",
  "GGGR....",
];

const GILL_ROW = 2;
const GILL_RIGHT_COL = 21;
const EYE_ROWS = [6, 7, 8];

function eyesClosed(activity: Activity, beat: number): boolean {
  return activity === "sleeping" || Math.floor(beat) % 9 === 8;
}

/** A blink reads as one dark line, so the outer eye rows go back to skin and the middle stays dark. */
function bodyFrame(closed: boolean): Pixels {
  if (!closed) {
    return BODY;
  }
  return BODY.map((line, y) => {
    if (y === EYE_ROWS[0] || y === EYE_ROWS[2]) {
      return line.replaceAll("E", "B");
    }
    if (y === EYE_ROWS[1]) {
      return line.replaceAll("E", "M");
    }
    return line;
  });
}

function bobRows(activity: Activity, beat: number): number {
  if (activity === "dancing") {
    return Math.floor(beat) % 2 === 0 ? 0 : -1;
  }
  if (activity === "sleeping") {
    return Math.floor(beat / 4) % 2 === 0 ? 0 : 1;
  }
  return Math.floor(beat / 2) % 2 === 0 ? 0 : -1;
}

/** Sleeping darkens the fronds so they read as tucked; everything else fans them on the off beat. */
function gillFrame(activity: Activity, beat: number): Pixels {
  if (activity === "sleeping") {
    return recolor(GILL_REST, "g", "G");
  }
  return Math.floor(beat) % 2 === 0 ? GILL_REST : GILL_SWAY;
}

export function drawAxolotl(
  ctx: CanvasRenderingContext2D,
  cell: number,
  col: number,
  row: number,
  beat: number,
  activity: Activity,
): void {
  const top = row + bobRows(activity, beat);
  const frame: PropFrame = { ctx, cell, col, row: top, beat };
  drawProps(activity, "behind", frame);
  const gills = gillFrame(activity, beat);
  paintPixels(ctx, mirrorPixels(gills), AXOLOTL_PALETTE, cell, col, top + GILL_ROW);
  paintPixels(ctx, gills, AXOLOTL_PALETTE, cell, col + GILL_RIGHT_COL, top + GILL_ROW);
  paintPixels(ctx, bodyFrame(eyesClosed(activity, beat)), AXOLOTL_PALETTE, cell, col, top);
  drawProps(activity, "front", frame);
}
