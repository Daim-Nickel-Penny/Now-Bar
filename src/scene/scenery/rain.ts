import {
  AMBER, CYAN, MINT, PINK, TONE, VIOLET, box, cast, cat, disc, ellipse, glow, gray, hash, hue, line,
  panel, picture, plant, poly, pool, slab, star, wash, wave, type Canvas2D,
} from "../ink.ts";
import type { Scenery } from "./scenery.ts";

const FLOOR = 0.86;
const DROPS = 60;

/** The city behind the glass: a lit skyline, the rain over it, then beads on the inside. */
function drawStorm(ctx: Canvas2D, x: number, y: number, ww: number, wh: number, u: number, phase: number): void {
  wash(ctx, x, y, ww, wh, gray(0.14), gray(0.42));
  glow(ctx, x + ww * 0.74, y + wh * 0.18, u * 16, gray(0.55 + 0.06 * wave(phase, 1)));
  disc(ctx, x + ww * 0.74, y + wh * 0.18, u * 4, gray(TONE.hot));
  disc(ctx, x + ww * 0.74 + u * 1.8, y + wh * 0.18 - u * 1.2, u * 3.3, gray(0.22));
  for (let i = 0; i < 16; i += 1) {
    const bx = x + hash(i) * ww;
    const bh = wh * (0.18 + hash(i + 5) * 0.42);
    const bw = u * (5 + hash(i + 2) * 6);
    box(ctx, bx, y + wh - bh, bw, bh, gray(0.28 + hash(i + 30) * 0.12));
    for (let r = 0; r < Math.floor(bh / (u * 5)); r += 1) {
      for (let c = 0; c < 2; c += 1) {
        if (hash(i * 30 + r * 3 + c) < 0.45) {
          continue;
        }
        const on = wave(phase, 1 + (r % 3), hash(i + r)) > -0.6 ? 0.95 : 0.4;
        box(ctx, bx + u * 1.2 + c * (bw / 2), y + wh - bh + u * 2 + r * u * 5, u * 1.8, u * 2.2, hue(AMBER, on));
      }
    }
  }
  for (let i = 0; i < DROPS; i += 1) {
    const speed = 2 + (i % 3);
    const fall = (hash(i) + phase * speed) % 1;
    const dx = x + hash(i + 7) * ww;
    const dy = y + fall * (wh + u * 9) - u * 9;
    line(ctx, dx, dy, dx - u, dy + u * 5.5, hue(CYAN, 0.72 + hash(i + 3) * 0.28), u * 0.9);
  }
  for (let i = 0; i < 10; i += 1) {
    const run = (hash(i + 30) + phase * (1 + (i % 2))) % 1;
    const bx = x + u * 3 + hash(i + 40) * (ww - u * 6);
    const by = y + run * wh;
    line(ctx, bx, y, bx, by, gray(0.24), u * 0.9);
    disc(ctx, bx, by, u * (1.3 + hash(i + 50)), gray(TONE.lit));
  }
}

function drawWindow(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.5;
  const y = h * 0.07;
  const ww = w * 0.42;
  const wh = h * 0.52;
  box(ctx, x - u * 3, y - u * 3, ww + u * 6, wh + u * 6, gray(TONE.near));
  drawStorm(ctx, x, y, ww, wh, u, phase);
  box(ctx, x + ww / 2 - u * 1.1, y, u * 2.2, wh, gray(TONE.lit));
  box(ctx, x, y + wh * 0.42 - u * 1.1, ww, u * 2.2, gray(TONE.lit));
  box(ctx, x - u * 2.4, y - u * 2.4, ww + u * 4.8, u * 2.4, gray(TONE.edge));
  box(ctx, x - u * 2.4, y + wh, ww + u * 4.8, u * 3, gray(TONE.edge));
  box(ctx, x - u * 2.4, y - u * 2.4, u * 2.4, wh + u * 4.8, gray(TONE.near));
  box(ctx, x + ww, y - u * 2.4, u * 2.4, wh + u * 4.8, gray(TONE.near));
  pool(ctx, x + ww * 0.5, y + wh + u * 6, ww * 0.7, u * 14, hue(CYAN, 0.85));
  for (const [side, dir] of [[x - u * 4, -1], [x + ww + u * 4, 1]] as const) {
    for (let i = 0; i < 4; i += 1) {
      const sway = wave(phase, 1, i * 0.2) * u * 0.9;
      poly(ctx, [
        [side + dir * i * u * 2.6, y - u * 6],
        [side + dir * (i + 1) * u * 2.6, y - u * 6],
        [side + dir * (i + 1) * u * 2.6 + sway, y + wh + u * 8],
        [side + dir * i * u * 2.6 + sway, y + wh + u * 8],
      ], gray(i % 2 === 0 ? TONE.mid : TONE.near));
    }
  }
  slab(ctx, x - u * 14, y - u * 7, ww + u * 28, u * 3, u, TONE.edge);
}

function drawBed(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.02;
  const top = h * 0.64;
  const bw = w * 0.46;
  panel(ctx, x, h * 0.36, u * 4.5, top - h * 0.36, u, TONE.near);
  for (let i = 0; i < 6; i += 1) {
    box(ctx, x, h * 0.38 + i * u * 5, u * 14, u * 1.6, gray(TONE.mid));
  }
  panel(ctx, x, top, bw, u * 11, u, TONE.mid);
  slab(ctx, x, top, bw, u * 3, u, TONE.edge);
  panel(ctx, x + u * 4, top - u * 6, u * 16, u * 6.5, u, TONE.hot);
  panel(ctx, x + u * 5, top - u * 10.5, u * 13, u * 4.5, u, TONE.lit);
  const breathe = wave(phase, 3) * u * 0.5;
  box(ctx, x + u * 21, top - u * 2 + breathe, bw - u * 22, u * 4.5, hue(VIOLET, 0.8));
  for (let i = 0; i < 6; i += 1) {
    box(ctx, x + u * 23 + i * u * 7, top - u * 2, u * 1.6, u * 5, hue(PINK, 0.85));
  }
  for (const dx of [x + u * 2, x + bw - u * 5]) {
    panel(ctx, dx, top + u * 11, u * 3.4, h * FLOOR - top - u * 11, u, TONE.near);
  }
  ellipse(ctx, x + bw * 0.5, h * (FLOOR + 0.05), bw * 0.66, u * 6, gray(TONE.void));
}

function drawNightstand(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.5;
  const top = h * 0.68;
  panel(ctx, x, top, u * 15, h * FLOOR - top, u, TONE.mid);
  slab(ctx, x - u, top, u * 17, u * 2.4, u, TONE.edge);
  box(ctx, x + u * 2, top + u * 6, u * 11, u * 1.6, gray(TONE.lit));
  const lampX = x + u * 5;
  glow(ctx, lampX, top - u * 9, u * 20, hue(AMBER, 0.9 + 0.1 * wave(phase, 2)));
  box(ctx, lampX - u, top - u * 7, u * 2, u * 7, gray(TONE.lit));
  poly(ctx, [
    [lampX - u * 5.5, top - u * 7],
    [lampX + u * 5.5, top - u * 7],
    [lampX + u * 3, top - u * 13],
    [lampX - u * 3, top - u * 13],
  ], gray(TONE.hot));
  panel(ctx, x + u * 9.5, top - u * 4, u * 5.5, u * 4, u, TONE.near);
  box(ctx, x + u * 10, top - u * 3.2, u * 4.5, u * 2.4, hue(CYAN, Math.floor(phase * 8) % 2 === 0 ? 1 : 0.72));
  pool(ctx, lampX, top, u * 22, u * 8, hue(AMBER, 0.85));
}

export const rain: Scenery = {
  stand: { x: 0.24, y: 0.7 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    wash(ctx, 0, 0, w, h * FLOOR, gray(0.16), gray(TONE.back));
    for (let x = u * 3; x < w; x += u * 11) {
      box(ctx, x, 0, u * 3, h * FLOOR, gray(TONE.back + 0.06));
    }
    slab(ctx, 0, h * FLOOR, w, h * (1 - FLOOR), u, TONE.mid);
    picture(ctx, w * 0.1, h * 0.1, w * 0.15, h * 0.13, u, TONE.lit);
    picture(ctx, w * 0.29, h * 0.16, w * 0.11, h * 0.1, u, TONE.mid);
    drawWindow(ctx, w, h, u, phase);
    drawBed(ctx, w, h, u, phase);
    drawNightstand(ctx, w, h, u, phase);
    plant(ctx, w * 0.95, h * FLOOR, u * 1.2, 17, phase, hue(MINT, 0.85));
    cat(ctx, w * 0.33, h * 0.665, u * 0.85, phase, gray(TONE.void));
    cast(ctx, 0, 0, w, h, VIOLET, 0.07);
    for (let i = 0; i < 5; i += 1) {
      star(ctx, w * 0.04 + hash(i + 2) * w * 0.07, h * 0.3 + hash(i + 8) * h * 0.12, u * 1.3,
        hue(CYAN, 0.75 + 0.25 * Math.abs(wave(phase, 2, hash(i)))));
    }
  },
};
