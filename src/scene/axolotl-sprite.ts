import type { Activity } from "./playlist.ts";
import { drawProps, type PropFrame } from "./axolotl-props.ts";
import { AXOLOTL_PALETTE, paintPixels, type Pixels } from "./pixels.ts";

export const SPRITE_W = 22;
export const SPRITE_H = 15;

export const BODY: Pixels = [
  "........HHHHHHH.......",
  "......HHH.....HHH.....",
  ".....HH.........HH....",
  ".....H..BBBBBBBB.H....",
  "....HHH.BBBBBBBBBHHH..",
  "....HLHBBBBBBBBBBHLH..",
  "....HHHBEEBBBBEEBHHH..",
  ".....BBBEEBBBBEEBBB...",
  ".....BCCBBBBBBBBCCBB..",
  ".....BBBBBMMBBBBBBBBB.",
  ".....BBBBBBBBBBBBBBBBS",
  ".....SBBBBBBBBBBBBBBSS",
  "......SBBBBBBBBBBBBSS.",
  "......BBB..BBB..BBB...",
  "......SSS..SSS..SSS...",
];

const GILLS_REST: Pixels = ["...G..", "..GG..", ".GGG..", "..GG..", "...G.."];
const GILLS_SWAY: Pixels = ["..GG..", ".GGG..", "..GG..", "...G..", "......"];

function eyesClosed(activity: Activity, beat: number): boolean {
  return activity === "sleeping" || Math.floor(beat) % 8 === 7;
}

function bodyFrame(closed: boolean): Pixels {
  if (!closed) {
    return BODY;
  }
  return BODY.map((line, y) => (y === 6 ? line.replaceAll("E", "B") : line));
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
  paintPixels(ctx, bodyFrame(eyesClosed(activity, beat)), AXOLOTL_PALETTE, cell, col, top);
  const gills = Math.floor(beat) % 2 === 0 ? GILLS_REST : GILLS_SWAY;
  paintPixels(ctx, gills, AXOLOTL_PALETTE, cell, col - 1, top + 6);
  drawProps(activity, "front", frame);
}
