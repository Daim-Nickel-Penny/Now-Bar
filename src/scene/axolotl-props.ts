import type { Activity } from "./playlist.ts";
import { AXOLOTL_PALETTE, paintPixels, type Palette, type Pixels } from "./pixels.ts";

export type PropFrame = {
  ctx: CanvasRenderingContext2D;
  cell: number;
  col: number;
  row: number;
  beat: number;
};

export type PropLayer = "behind" | "front";

const PROPS: Palette = {
  ...AXOLOTL_PALETTE,
  P: "#f6efe0",
  K: "#4a63c8",
  R: "#7a2a3a",
  Z: "#f5f5f7",
  N: "#f5f5f7",
  W: "#fafafa",
  X: "#8b5a2b",
  D: "#3a2414",
  T: "#d8c8a0",
  Q: "#5a5a60",
  V: "#9a9aa2",
  O: "#e84a4a",
  U: "#4a7be8",
  Y: "#2c2c30",
};

const BOOK: Pixels = ["PPP.PPP", "PPPKPPP", "PPPKPPP", "KKKKKKK"];
const BOOK_FLIP: Pixels = ["PPP.P..", "PPPKP..", "PPPKPPP", "KKKKKKK"];
const GLASSES: Pixels = ["RRRR..RRRR", "R..RRRR..R", "R..R..R..R", "RRRR..RRRR"];
const ZEE: Pixels = ["ZZZZ", "..Z.", ".Z..", "ZZZZ"];
const NOTE: Pixels = ["..N", "..N", "NNN", "NN."];
const ARM_UP: Pixels = ["B", "B"];
const GUITAR: Pixels = ["..XXXX.", ".XXXXXX", "XXXDXXX", ".XXXXXX", "..XXXX."];
const PAD_LIT: Pixels = ["QQQQQQQQQ", "QVQQQQOQQ", "QQQQQQQUQ"];
const PAD_DIM: Pixels = ["QQQQQQQQQ", "QVQQQQQQQ", "QQQQQQQQQ"];
const HAT: Pixels = [".WWWW.", "WWWWWW", "WWWWWW", ".WWWW."];
const BOWL: Pixels = ["VVVVVVV", ".YYYYY.", "..YYY.."];

function paint(frame: PropFrame, pixels: Pixels, dx: number, dy: number): void {
  paintPixels(frame.ctx, pixels, PROPS, frame.cell, frame.col + dx, frame.row + dy);
}

function drawReading(frame: PropFrame): void {
  paint(frame, GLASSES, 7, 5);
  paint(frame, Math.floor(frame.beat) % 8 === 3 ? BOOK_FLIP : BOOK, 1, 10);
}

function drawSleeping(frame: PropFrame): void {
  const step = Math.floor(frame.beat) % 6;
  const zees: Array<[number, number]> = [
    [21, 1],
    [24, -3],
    [27, -8],
  ];
  for (const [i, [dx, dy]] of zees.entries()) {
    if (step >= i * 2) {
      paint(frame, ZEE, dx, dy);
    }
  }
}

function drawDancing(frame: PropFrame): void {
  const left = Math.floor(frame.beat) % 2 === 0;
  paint(frame, ARM_UP, left ? 3 : 4, left ? 4 : 6);
  paint(frame, ARM_UP, left ? 21 : 20, left ? 6 : 4);
  const notes: Array<[number, number]> = [
    [-3, 2],
    [24, 0],
    [-1, -4],
  ];
  for (const [i, [dx, dy]] of notes.entries()) {
    if (Math.floor(frame.beat / 2) % 3 === i) {
      paint(frame, NOTE, dx, dy);
    }
  }
}

function drawGuitar(frame: PropFrame): void {
  for (let i = 0; i < 9; i += 1) {
    paint(frame, ["D"], 11 - i, 9 - Math.round(i * 0.5));
    if (i % 3 === 1) {
      paint(frame, ["T"], 11 - i, 8 - Math.round(i * 0.5));
    }
  }
  paint(frame, GUITAR, 11, 8);
  paint(frame, ["B"], 3, 4 + (Math.floor(frame.beat) % 2));
  paint(frame, ["B"], 14, 7 + (Math.floor(frame.beat) % 2));
}

function drawGaming(frame: PropFrame): void {
  paint(frame, Math.floor(frame.beat) % 2 === 0 ? PAD_LIT : PAD_DIM, 7, 11);
  paint(frame, ["B"], 6, 11);
  paint(frame, ["B"], 16, 11);
}

function drawCooking(frame: PropFrame): void {
  paint(frame, HAT, 8, -4);
  const stir = Math.floor(frame.beat) % 2;
  paint(frame, ["VVV"], 2 + stir, 7);
  paint(frame, ["V", "V", "V", "V", "V"], 3 + stir, 8);
  paint(frame, BOWL, 0, 12);
}

export function drawProps(activity: Activity, layer: PropLayer, frame: PropFrame): void {
  switch (activity) {
    case "reading":
      return layer === "front" ? drawReading(frame) : undefined;
    case "sleeping":
      return layer === "behind" ? drawSleeping(frame) : undefined;
    case "dancing":
      return layer === "behind" ? drawDancing(frame) : undefined;
    case "guitar":
      return layer === "front" ? drawGuitar(frame) : undefined;
    case "gaming":
      return layer === "front" ? drawGaming(frame) : undefined;
    case "cooking":
      return layer === "front" ? drawCooking(frame) : undefined;
    default: {
      const _never: never = activity;
      return _never;
    }
  }
}
