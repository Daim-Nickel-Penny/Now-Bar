import {
  AMBER, CYAN, MINT, PINK, ROSE, TONE, VIOLET, box, cast, disc, ellipse, glow, gray, hash, hue,
  line, panel, plant, poly, pool, ring, slab, steam, wash, wave, type Canvas2D, type Rgb,
} from "../ink.ts";
import type { Scenery } from "./scenery.ts";

const COUNTER = 0.66;
const FLOOR = 0.88;
const JAR_TINTS: readonly Rgb[] = [AMBER, MINT, ROSE, VIOLET, CYAN];

function drawFloor(ctx: Canvas2D, w: number, h: number, u: number): void {
  box(ctx, 0, h * FLOOR, w, h - h * FLOOR, gray(0.12));
  slab(ctx, 0, h * FLOOR, w, u * 2.6, u, TONE.edge);
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 12; c += 1) {
      if ((r + c) % 2 === 0) {
        box(ctx, c * (w / 12), h * FLOOR + u * 2.6 + r * ((h - h * FLOOR) / 2), w / 12,
          (h - h * FLOOR) / 2, gray(TONE.mid));
      }
    }
  }
}

function drawSplash(ctx: Canvas2D, w: number, h: number, u: number): void {
  const top = h * 0.42;
  const bottom = h * COUNTER;
  box(ctx, 0, top, w, bottom - top, gray(0.24));
  const size = u * 7;
  for (let y = top; y < bottom; y += size) {
    for (let x = 0; x < w; x += size) {
      box(ctx, x + u * 0.6, y + u * 0.6, size - u * 1.2, size - u * 1.2, gray(0.32 + hash(x + y) * 0.08));
    }
  }
}

function drawWindow(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.28;
  const y = h * 0.06;
  const ww = w * 0.3;
  const wh = h * 0.3;
  box(ctx, x - u * 2.6, y - u * 2.6, ww + u * 5.2, wh + u * 5.2, gray(TONE.lit));
  wash(ctx, x, y, ww, wh, hue(CYAN, 0.72), gray(0.44));
  glow(ctx, x + ww * 0.26, y + wh * 0.26, u * 11, gray(TONE.lit));
  disc(ctx, x + ww * 0.26, y + wh * 0.26, u * 3.4, gray(TONE.hot));
  for (let i = 0; i < 4; i += 1) {
    const drift = ((hash(i) + phase) % 1) * (ww + u * 18) - u * 9;
    ellipse(ctx, x + drift, y + wh * (0.16 + i * 0.18), u * (4 + hash(i + 3) * 2.5), u * 1.6, gray(TONE.lit));
  }
  for (let i = 0; i < 8; i += 1) {
    const bh = wh * (0.12 + hash(i + 20) * 0.16);
    box(ctx, x + i * (ww / 8), y + wh - bh, ww / 10, bh, gray(0.3));
  }
  box(ctx, x + ww / 2 - u * 1.3, y, u * 2.6, wh, gray(TONE.edge));
  box(ctx, x, y + wh / 2 - u * 1.3, ww, u * 2.6, gray(TONE.edge));
  slab(ctx, x - u * 4, y + wh, ww + u * 8, u * 3, u, TONE.edge);
  plant(ctx, x + u * 6, y + wh, u * 0.7, 7, phase, hue(MINT, 0.9));
  plant(ctx, x + ww - u * 6, y + wh, u * 0.6, 13, phase, hue(MINT, 0.8));
  pool(ctx, x + ww * 0.5, h * COUNTER, ww, u * 16, hue(CYAN, 0.8));
}

function drawRail(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const y = h * 0.08;
  box(ctx, w * 0.64, y, w * 0.35, u * 1.8, gray(TONE.edge));
  for (let i = 0; i < 4; i += 1) {
    const x = w * 0.68 + i * u * 9;
    const sway = wave(phase, 1, i * 0.25) * u * 0.9;
    line(ctx, x, y, x + sway, y + u * 5, gray(TONE.lit), u * 1);
    const rr = u * 4.2 - i * u * 0.4;
    disc(ctx, x + sway, y + u * 9, rr, gray(TONE.near));
    ring(ctx, x + sway, y + u * 9, rr, gray(TONE.hot), u * 1.2);
    box(ctx, x + sway + rr * 0.8, y + u * 8, u * 4, u * 1.4, gray(TONE.lit));
  }
}

function drawJars(ctx: Canvas2D, x: number, y: number, w: number, u: number, seed: number): void {
  slab(ctx, x, y, w, u * 2.4, u, TONE.edge);
  let cursor = x + u * 2;
  let i = 0;
  while (cursor < x + w - u * 6) {
    const jw = u * (5 + hash(seed + i) * 2.5);
    const jh = u * (6 + hash(seed + i + 40) * 5);
    panel(ctx, cursor, y - jh, jw, jh, u, TONE.near);
    const tint = JAR_TINTS[Math.floor(hash(seed + i + 70) * JAR_TINTS.length)] ?? AMBER;
    box(ctx, cursor + u * 0.6, y - jh * 0.5, jw - u * 1.2, jh * 0.5 - u, hue(tint, 1));
    box(ctx, cursor - u * 0.4, y - jh - u * 1.6, jw + u * 0.8, u * 1.6, gray(TONE.lit));
    cursor += jw + u * 2;
    i += 1;
  }
}

function drawCounter(ctx: Canvas2D, w: number, h: number, u: number): void {
  const top = h * COUNTER;
  slab(ctx, 0, top, w, u * 3.4, u, TONE.edge);
  box(ctx, 0, top + u * 3.4, w, h * FLOOR - top - u * 3.4, gray(TONE.back));
  for (let i = 0; i < 5; i += 1) {
    const x = u * 2 + i * (w / 5);
    panel(ctx, x, top + u * 6, w / 5 - u * 4, h * 0.15, u, TONE.mid);
    box(ctx, x + w / 10 - u * 4, top + u * 6 + h * 0.075, u * 6, u * 1.4, gray(TONE.hot));
  }
  const bx = w * 0.04;
  slab(ctx, bx, top - u * 2.4, u * 24, u * 2.4, u, TONE.lit);
  for (let i = 0; i < 5; i += 1) {
    disc(ctx, bx + u * 4 + i * u * 4.5, top - u * 4, u * 2.4,
      hue(JAR_TINTS[i % JAR_TINTS.length] ?? PINK, 1));
  }
  box(ctx, bx + u * 19, top - u * 10, u * 1.6, u * 8, gray(TONE.hot));
  poly(ctx, [[bx + u * 17, top - u * 10], [bx + u * 22.5, top - u * 10], [bx + u * 20, top - u * 14]], gray(TONE.hot));
}

function drawStove(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.58;
  const top = h * COUNTER;
  box(ctx, x, top - u * 2.4, w * 0.32, u * 2.4, gray(TONE.near));
  for (let i = 0; i < 2; i += 1) {
    ring(ctx, x + w * 0.08 + i * w * 0.14, top - u * 1.2, u * 4.4, gray(TONE.lit), u * 1);
  }
  const potX = x + w * 0.08;
  glow(ctx, potX, top - u * 2, u * 13, hue(AMBER, 0.9 + 0.1 * wave(phase, 6)));
  panel(ctx, potX - u * 7, top - u * 13, u * 14, u * 10.6, u, TONE.mid);
  slab(ctx, potX - u * 8.4, top - u * 14.6, u * 16.8, u * 2, u, TONE.hot);
  for (const dx of [-u * 11, u * 7]) {
    box(ctx, potX + dx, top - u * 10, u * 4, u * 1.8, gray(TONE.lit));
  }
  const bubble = Math.max(0, wave(phase, 8));
  box(ctx, potX - u * 5.6, top - u * 13.4 - bubble * u * 1.2, u * 11.2, u * 1.8, hue(AMBER, 1));
  steam(ctx, potX, top - u * 15, u, phase, 5, (l) => gray(0.6 * l));
  const kx = x + w * 0.23;
  poly(ctx, [
    [kx - u * 5, top - u * 2.4],
    [kx + u * 5, top - u * 2.4],
    [kx + u * 3.6, top - u * 9.5],
    [kx - u * 3.6, top - u * 9.5],
  ], gray(TONE.near));
  box(ctx, kx - u * 5, top - u * 10.6, u * 10, u * 1.6, gray(TONE.hot));
  line(ctx, kx - u * 3.6, top - u * 9.5, kx - u * 9, top - u * 5.5, gray(TONE.edge), u * 1.3);
  disc(ctx, kx, top - u * 11.6, u * 1.8, gray(TONE.edge));
}

function drawFridge(ctx: Canvas2D, w: number, h: number, u: number): void {
  const x = w * 0.9;
  const top = h * 0.26;
  panel(ctx, x, top, w * 0.13, h * FLOOR - top, u, TONE.near);
  box(ctx, x, top + h * 0.18, w * 0.13, u * 1.6, gray(TONE.void));
  box(ctx, x + u * 2, top + h * 0.06, u * 1.6, h * 0.09, gray(TONE.hot));
  box(ctx, x + u * 2, top + h * 0.23, u * 1.6, h * 0.12, gray(TONE.hot));
  for (let i = 0; i < 4; i += 1) {
    box(ctx, x + u * 6 + (i % 2) * u * 5, top + h * 0.03 + Math.floor(i / 2) * u * 6, u * 3.4, u * 4,
      hue(JAR_TINTS[i % JAR_TINTS.length] ?? PINK, 1));
  }
}

export const kitchen: Scenery = {
  stand: { x: 0.34, y: 0.88 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    wash(ctx, 0, 0, w, h * 0.42, gray(0.14), gray(0.24));
    drawSplash(ctx, w, h, u);
    drawWindow(ctx, w, h, u, phase);
    drawRail(ctx, w, h, u, phase);
    drawJars(ctx, w * 0.01, h * 0.16, w * 0.24, u, 3);
    drawJars(ctx, w * 0.01, h * 0.36, w * 0.24, u, 21);
    drawFloor(ctx, w, h, u);
    drawCounter(ctx, w, h, u);
    drawStove(ctx, w, h, u, phase);
    drawFridge(ctx, w, h, u);
    ellipse(ctx, w * 0.34, h * 0.9, w * 0.22, u * 5, gray(TONE.void));
    cast(ctx, 0, 0, w, h, AMBER, 0.06);
  },
};
