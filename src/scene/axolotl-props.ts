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
  K: "#22222b",
  A: "#f7f0dd",
  D: "#3f5fd0",
  Z: "#e9f0ff",
  O: "#ff5a5a",
  U: "#6f8fd8",
  V: "#b9bcc8",
  X: "#9a6134",
  Y: "#2a1a10",
  T: "#e6d3a3",
  Q: "#4a4a55",
  I: "#ffd36b",
  J: "#7fd48a",
  F: "#fbfbff",
};

const GLASSES: Pixels = [
  "KKKKKKKKKK",
  "K...KK...K",
  "K...KK...K",
  "K...KK...K",
  "KKKKKKKKKK",
];

const BOOK: Pixels = ["AAAAADAAAAA", ".AAAADAAAA.", "..AAADAAA..", "DDDDDDDDDDD"];
const BOOK_FLIP: Pixels = ["AAAAAD..AAA", ".AAAAD.AAAA", "..AAADAAAA.", "DDDDDDDDDDD"];
const BOOK_STACK: Pixels = ["..DDDDD", "..AAAAA", ".OOOOOO", ".AAAAAA", "DDDDDDD", "AAAAAAA"];
const MUG: Pixels = ["FFFF.", "FOOFV", "FFFFV", ".FF.."];

const PILLOW: Pixels = [
  "..AAAAAAAA..",
  ".AAAAAAAAAA.",
  "AAAAAAAAAAAA",
  ".AAAAAAAAAA.",
  "..AAAAAAAA..",
];

const BLANKET: Pixels = [
  "UUUUUUUUUUUUUUUUU",
  "UFUUUFUUUFUUUFUUU",
  "UUUUUUUUUUUUUUUUU",
  ".UUUUUUUUUUUUUUU.",
  "..UUUUUUUUUUUUU..",
];

const ZEE: Pixels = ["ZZZZ", "..Z.", ".Z..", "ZZZZ"];

const SHADES: Pixels = ["KKKKKKKKKK", "KKFKKKKFKK", "KKKKKKKKKK", ".KKK..KKK."];
const NOTE: Pixels = ["..NN", "..NN", "..NN", "NNNN", "NNN."];
const PAW: Pixels = ["PPP", "BBB", "BBB", "SSS"];

const GUITAR: Pixels = [
  "..XXXXX..",
  ".XXXXXXX.",
  "XXXXXXXXX",
  "XXXYYYXXX",
  "XXXYYYXXX",
  "XXXXXXXXX",
  ".XXXXXXX.",
  "..XXXXX..",
];
const HEADSTOCK: Pixels = ["TT", "TT", "TT"];

const PAD_LIT: Pixels = [
  ".KKKKKKKKKKK.",
  "KVVVVVVVVVVVK",
  "KVQVVVVVVOVVK",
  "KQQQVVVVVVUVK",
  "KVQVVVVVVVVVK",
  ".KKVVVVVVVKK.",
];
const PAD_DIM: Pixels = [
  ".KKKKKKKKKKK.",
  "KVVVVVVVVVVVK",
  "KVQVVVVVVVVVK",
  "KQQQVVVVVVVVK",
  "KVQVVVVVVVVVK",
  ".KKVVVVVVVKK.",
];

const HAT: Pixels = [
  "..FFFFFFFFFF..",
  ".FFFFFFFFFFFF.",
  "FFFFFFFFFFFFFF",
  "FFFFFFFFFFFFFF",
  ".VVVVVVVVVVVV.",
];

const POT: Pixels = [
  "VVVVVVVVVVVVV",
  ".QQQQQQQQQQQ.",
  ".QJQQOQQJQQQ.",
  ".QQQQQQQQQQQ.",
  ".QQQQQQQQQQQ.",
  "..QQQQQQQQQ..",
  "...QQQQQQQ...",
];

function paint(frame: PropFrame, pixels: Pixels, dx: number, dy: number): void {
  paintPixels(frame.ctx, pixels, PROPS, frame.cell, frame.col + dx, frame.row + dy);
}

/** Puffs climb on a per-puff loop so the trail keeps drifting through a seamless Scene loop. */
function puffs(frame: PropFrame, dx: number, dy: number, count: number, char: string): void {
  for (let i = 0; i < count; i += 1) {
    const life = (i / count + frame.beat / 6) % 1;
    const drift = Math.round(Math.sin(life * Math.PI * 2 + i) * 2);
    paint(frame, [char.repeat(life < 0.5 ? 1 : 2)], dx + drift, dy - Math.round(life * 7));
  }
}

function drawReadingBehind(frame: PropFrame): void {
  paint(frame, BOOK_STACK, 0, 14);
}

function drawReadingFront(frame: PropFrame): void {
  paint(frame, GLASSES, 8, 5);
  paint(frame, Math.floor(frame.beat) % 8 === 3 ? BOOK_FLIP : BOOK, 8, 14);
  paint(frame, MUG, 27, 15);
  puffs(frame, 29, 14, 3, "Z");
}

function drawSleepingBehind(frame: PropFrame): void {
  paint(frame, PILLOW, 2, 12);
}

function drawSleepingFront(frame: PropFrame): void {
  paint(frame, BLANKET, 7, 15);
  const step = Math.floor(frame.beat) % 6;
  const zees: Array<[number, number]> = [
    [24, 1],
    [27, -3],
    [30, -8],
  ];
  for (const [i, [dx, dy]] of zees.entries()) {
    if (step >= i * 2) {
      paint(frame, ZEE, dx, dy);
    }
  }
}

function drawDancingBehind(frame: PropFrame): void {
  const notes: Array<[number, number]> = [
    [-5, 2],
    [28, -1],
    [1, -6],
  ];
  for (const [i, [dx, dy]] of notes.entries()) {
    if (Math.floor(frame.beat / 2) % 3 === i) {
      paint(frame, NOTE, dx, dy);
    }
  }
}

function drawDancingFront(frame: PropFrame): void {
  paint(frame, SHADES, 8, 6);
  const up = Math.floor(frame.beat) % 2 === 0;
  paint(frame, PAW, 3, up ? 9 : 14);
  paint(frame, PAW, 26, up ? 14 : 9);
}

/** The neck runs up-left out of the body, one pixel per step, with a fret every third. */
function drawNeck(frame: PropFrame): void {
  for (let i = 0; i < 8; i += 1) {
    const dx = 11 - i;
    const dy = 13 - Math.round(i * 0.7);
    paint(frame, ["YY", "YY"], dx, dy);
    if (i % 3 === 2) {
      paint(frame, ["TT"], dx, dy);
    }
  }
  paint(frame, HEADSTOCK, 2, 6);
}

function drawGuitar(frame: PropFrame): void {
  drawNeck(frame);
  paint(frame, GUITAR, 11, 12);
  for (let i = 0; i < 3; i += 1) {
    paint(frame, ["T"], 12 + i * 3, 14);
    paint(frame, ["T"], 12 + i * 3, 17);
  }
  const strum = Math.floor(frame.beat) % 2;
  paint(frame, PAW, 18, 13 + strum);
  paint(frame, PAW, 1, 8);
}

function drawGaming(frame: PropFrame): void {
  paint(frame, Math.floor(frame.beat) % 2 === 0 ? PAD_LIT : PAD_DIM, 8, 14);
  paint(frame, PAW, 6, 13);
  paint(frame, PAW, 19, 13);
  for (let i = 0; i < 7; i += 1) {
    paint(frame, ["K"], 21 + i, 15 + Math.round(Math.sin(i / 2) * 2));
  }
}

function drawCooking(frame: PropFrame): void {
  paint(frame, HAT, 7, -4);
  paint(frame, POT, 0, 13);
  const stir = Math.floor(frame.beat) % 2;
  paint(frame, PAW, 7, 10 + stir);
  for (let i = 0; i < 5; i += 1) {
    paint(frame, ["V"], 7 - i + stir, 11 + i + stir);
  }
  puffs(frame, 5, 12, 4, "F");
}

export function drawProps(activity: Activity, layer: PropLayer, frame: PropFrame): void {
  const front = layer === "front";
  switch (activity) {
    case "reading":
      return front ? drawReadingFront(frame) : drawReadingBehind(frame);
    case "sleeping":
      return front ? drawSleepingFront(frame) : drawSleepingBehind(frame);
    case "dancing":
      return front ? drawDancingFront(frame) : drawDancingBehind(frame);
    case "guitar":
      return front ? drawGuitar(frame) : undefined;
    case "gaming":
      return front ? drawGaming(frame) : undefined;
    case "cooking":
      return front ? drawCooking(frame) : undefined;
    default: {
      const _never: never = activity;
      return _never;
    }
  }
}
