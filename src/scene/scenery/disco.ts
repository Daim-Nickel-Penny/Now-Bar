import {
  CYAN, PINK, TAU, TONE, VIOLET, box, cast, disc, ellipse, glow, gray, hash, hue, line, panel, poly,
  ring, slab, star, wave, type Canvas2D, type Rgb,
} from "../ink.ts";
import type { Scenery } from "./scenery.ts";

const FLOOR = 0.74;
const CANS: ReadonlyArray<readonly [number, Rgb]> = [
  [0.1, PINK],
  [0.28, CYAN],
  [0.72, VIOLET],
  [0.9, PINK],
];

function drawTruss(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const y = h * 0.04;
  box(ctx, 0, y, w, u * 2.2, gray(TONE.lit));
  box(ctx, 0, y + u * 5, w, u * 2.2, gray(TONE.lit));
  for (let i = 0; i < 13; i += 1) {
    line(ctx, i * (w / 13), y, i * (w / 13) + w / 13, y + u * 7, gray(TONE.mid), u * 1.1);
  }
  for (const [i, [at, color]] of CANS.entries()) {
    const x = w * at;
    panel(ctx, x - u * 2.6, y + u * 7, u * 5.2, u * 5, u, TONE.near);
    const on = 0.55 + 0.45 * Math.max(0, wave(phase, 2, i / 4));
    const angle = Math.PI / 2 + wave(phase, 1, i / 4) * 0.55;
    ctx.fillStyle = hue(color, 0.3 * on);
    ctx.beginPath();
    ctx.moveTo(x, y + u * 12);
    ctx.lineTo(x + Math.cos(angle - 0.11) * h * 1.6, y + Math.sin(angle - 0.11) * h * 1.6);
    ctx.lineTo(x + Math.cos(angle + 0.11) * h * 1.6, y + Math.sin(angle + 0.11) * h * 1.6);
    ctx.fill();
    glow(ctx, x, y + u * 12, u * 9, hue(color, on));
    disc(ctx, x, y + u * 12, u * 2.2, hue(color, 1));
  }
}

function drawBall(ctx: Canvas2D, cx: number, cy: number, r: number, u: number, phase: number): void {
  box(ctx, cx - u, 0, u * 2, cy - r, gray(TONE.lit));
  glow(ctx, cx, cy, r * 3, hue(PINK, 0.55 + 0.15 * wave(phase, 2)));
  disc(ctx, cx, cy, r, gray(TONE.mid));
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.clip();
  const step = r / 3;
  for (let i = -5; i <= 5; i += 1) {
    const x = cx + ((i * step + phase * step * 2) % (r * 2 + step)) - step;
    line(ctx, x, cy - r, x, cy + r, gray(TONE.void), u * 1);
  }
  for (let i = -4; i <= 4; i += 1) {
    line(ctx, cx - r, cy + i * step, cx + r, cy + i * step, gray(TONE.void), u * 1);
  }
  for (let i = 0; i < 16; i += 1) {
    const sparkle = Math.max(0, wave(phase, 3, hash(i)));
    const angle = hash(i + 20) * TAU;
    const dist = hash(i + 40) * r * 0.85;
    box(ctx, cx + Math.cos(angle) * dist - u * 1.2, cy + Math.sin(angle) * dist - u * 1.2, u * 2.4, u * 2.4,
      i % 3 === 0 ? hue(CYAN, 0.8 + sparkle * 0.2) : gray(0.6 + sparkle * 0.4));
  }
  ctx.restore();
  ring(ctx, cx, cy, r, gray(TONE.hot), u * 1.2);
}

function drawStack(ctx: Canvas2D, x: number, w: number, h: number, u: number, phase: number): void {
  const top = h * 0.26;
  const bottom = h * FLOOR;
  panel(ctx, x, top, w, bottom - top, u, TONE.mid);
  box(ctx, x, top + (bottom - top) * 0.44, w, u * 2, gray(TONE.lit));
  const pump = 1 + 0.18 * Math.max(0, wave(phase, 8));
  for (const [i, at] of [0.2, 0.72].entries()) {
    const cy = top + (bottom - top) * at;
    const rr = w * (i === 0 ? 0.2 : 0.34) * pump;
    disc(ctx, x + w / 2, cy, rr, gray(TONE.near));
    ring(ctx, x + w / 2, cy, rr, gray(TONE.hot), u * 1.3);
    ring(ctx, x + w / 2, cy, rr * 0.6, gray(TONE.lit), u * 1);
    disc(ctx, x + w / 2, cy, rr * 0.26, gray(TONE.edge));
  }
  glow(ctx, x + w / 2, top + (bottom - top) * 0.72, w * 1.5,
    hue(CYAN, 0.7 + 0.3 * Math.max(0, wave(phase, 8))));
}

function drawBooth(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.26;
  const y = h * 0.46;
  const bw = w * 0.48;
  const bh = h * FLOOR - y;
  panel(ctx, x, y, bw, bh, u, TONE.mid);
  slab(ctx, x - u * 2.5, y - u * 3, bw + u * 5, u * 3, u, TONE.hot);
  for (let i = 0; i < 9; i += 1) {
    box(ctx, x + u * 2 + i * (bw / 9), y + bh * 0.55, bw / 14, bh * 0.4, hue(i % 2 === 0 ? PINK : VIOLET, 0.85));
  }
  for (const [i, at] of [0.14, 0.62].entries()) {
    const cx = x + bw * at + u * 8;
    const cy = y + u * 9;
    panel(ctx, cx - u * 9, cy - u * 7, u * 18, u * 14, u, TONE.near);
    disc(ctx, cx, cy, u * 6, gray(TONE.lit));
    ring(ctx, cx, cy, u * 6, gray(TONE.hot), u * 1.1);
    const spin = phase * TAU * (2 + i);
    disc(ctx, cx + Math.cos(spin) * u * 3.4, cy + Math.sin(spin) * u * 3.4, u * 1.5, gray(TONE.hot));
    disc(ctx, cx, cy, u * 1.5, gray(TONE.void));
  }
  const mx = x + bw * 0.42;
  for (let i = 0; i < 8; i += 1) {
    const level = 0.3 + 0.7 * Math.max(0, wave(phase, 4 + i, hash(i)));
    box(ctx, mx + i * u * 2.6, y + u * 16 - level * u * 12, u * 1.8, level * u * 12,
      hue(i > 5 ? PINK : CYAN, 0.75 + level * 0.25));
  }
}

function drawFloor(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const top = h * FLOOR;
  const cols = 10;
  const rows = 4;
  for (let r = 0; r < rows; r += 1) {
    const y0 = top + (r / rows) * (h - top);
    const y1 = top + ((r + 1) / rows) * (h - top);
    for (let c = 0; c < cols; c += 1) {
      const lit = wave(phase, 4, (c + r * 2) / cols) > 0.45;
      const color = (c + r) % 2 === 0 ? PINK : CYAN;
      box(ctx, c * (w / cols) + u * 0.6, y0 + u * 0.6, w / cols - u * 1.2, y1 - y0 - u * 1.2,
        lit ? hue(color, 1) : gray(0.24));
    }
  }
  slab(ctx, 0, top - u * 1.6, w, u * 3, u, TONE.hot);
}

export const disco: Scenery = {
  stand: { x: 0.5, y: 0.86 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    const cx = w * 0.5;
    const cy = h * 0.2;
    box(ctx, 0, 0, w, h, gray(0.14));
    for (let i = 0; i < 26; i += 1) {
      const twinkle = Math.max(0, wave(phase, 2, hash(i)));
      star(ctx, hash(i + 5) * w, hash(i + 11) * h * 0.66, u * (1 + twinkle * 1.8),
        hue(i % 2 === 0 ? PINK : CYAN, 0.7 + twinkle * 0.3));
    }
    drawTruss(ctx, w, h, u, phase);
    drawBall(ctx, cx, cy, h * 0.11, u, phase);
    drawStack(ctx, w * 0.02, w * 0.15, h, u, phase);
    drawStack(ctx, w * 0.83, w * 0.15, h, u, phase);
    drawBooth(ctx, w, h, u, phase);
    drawFloor(ctx, w, h, u, phase);
    for (let i = 0; i < 14; i += 1) {
      const fall = (hash(i + 60) + phase * 2) % 1;
      poly(ctx, [
        [hash(i + 70) * w, fall * h * FLOOR],
        [hash(i + 70) * w + u * 2, fall * h * FLOOR + u],
        [hash(i + 70) * w + u, fall * h * FLOOR + u * 3],
      ], hue(i % 3 === 0 ? VIOLET : PINK, 1));
    }
    cast(ctx, 0, 0, w, h, VIOLET, 0.06);
    ellipse(ctx, cx, h * 0.9, w * 0.22, u * 5, hue(CYAN, 0.75));
  },
};
