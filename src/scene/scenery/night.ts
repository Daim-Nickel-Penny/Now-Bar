import { box, disc, frame, glow, gray, hash, line, tint, wave, type Canvas2D } from "../ink.ts";
import type { Scenery } from "./scenery.ts";

const STARS = 70;

function drawSky(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  for (let i = 0; i < STARS; i += 1) {
    const cycles = 2 + (i % 4);
    const twinkle = 0.35 + 0.65 * Math.abs(wave(phase, cycles, hash(i)));
    disc(ctx, hash(i + 3) * w, hash(i + 9) * h * 0.55, u * (0.5 + hash(i + 17) * 0.5), gray(twinkle));
  }
  const streak = phase * 4 - 0.5;
  if (streak > 0 && streak < 1) {
    const sx = w * 0.15 + streak * w * 0.5;
    const sy = h * 0.08 + streak * h * 0.18;
    line(ctx, sx, sy, sx - u * 8, sy - u * 3, gray(0.9 * (1 - streak)), u * 0.9);
  }
  const mx = w * 0.82;
  const my = h * 0.16;
  glow(ctx, mx, my, u * 16, gray(0.22));
  disc(ctx, mx, my, u * 5, gray(0.95));
  disc(ctx, mx + u * 2, my - u * 1.2, u * 4.2, gray(0));
}

function drawSkyline(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const base = h * 0.6;
  let x = 0;
  let i = 0;
  while (x < w) {
    const bw = u * (6 + hash(i) * 8);
    const bh = h * (0.08 + hash(i + 30) * 0.22);
    box(ctx, x, base - bh, bw, bh, gray(0.12));
    frame(ctx, x, base - bh, bw, bh, gray(0.32), u * 0.6);
    for (let win = 0; win < 6; win += 1) {
      const wx = x + u * 1.2 + (win % 2) * (bw / 2);
      const wy = base - bh + u * 2 + Math.floor(win / 2) * u * 4;
      if (wy + u * 1.5 < base && hash(i * 10 + win) > 0.35) {
        const flicker = wave(phase, 1 + (win % 3), hash(i + win)) > -0.6 ? 0.7 : 0.15;
        box(ctx, wx, wy, u * 1.4, u * 1.6, tint(255, 230, 170, flicker));
      }
    }
    x += bw + u * 1.5;
    i += 1;
  }
}

function drawRoof(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const ledge = h * 0.72;
  box(ctx, 0, ledge, w, h - ledge, gray(0.14));
  line(ctx, 0, ledge, w, ledge, gray(0.9), u * 1.2);
  for (let i = 0; i < 12; i += 1) {
    line(ctx, i * (w / 12), ledge + u * 3, i * (w / 12), h, gray(0.28), u * 0.6);
  }
  box(ctx, w * 0.06, ledge - h * 0.16, u * 9, h * 0.16, gray(0.2));
  frame(ctx, w * 0.06, ledge - h * 0.16, u * 9, h * 0.16, gray(0.7), u * 0.8);
  frame(ctx, w * 0.06 - u, ledge - h * 0.16 - u * 1.5, u * 11, u * 2, gray(0.75), u * 0.7);
  for (let i = 0; i < 3; i += 1) {
    const life = (hash(i) + phase * 2) % 1;
    disc(ctx, w * 0.06 + u * 4.5 + wave(life, 1) * u * 2, ledge - h * 0.16 - u * 3 - life * u * 10, u * (1 + life * 1.5), gray(0.3 * (1 - life)));
  }
  const bulbs = 9;
  for (let i = 0; i <= bulbs; i += 1) {
    const x0 = w * 0.2 + (i / bulbs) * w * 0.7;
    const sag = Math.sin((i / bulbs) * Math.PI) * u * 4;
    const y0 = h * 0.05 + sag;
    if (i < bulbs) {
      const x1 = w * 0.2 + ((i + 1) / bulbs) * w * 0.7;
      const y1 = h * 0.05 + Math.sin(((i + 1) / bulbs) * Math.PI) * u * 4;
      line(ctx, x0, y0, x1, y1, gray(0.45), u * 0.5);
    }
    const on = wave(phase, 2, i / bulbs) > 0 ? 1 : 0.4;
    glow(ctx, x0, y0 + u * 1.5, u * 3.5, tint(255, 220, 150, 0.25 * on));
    disc(ctx, x0, y0 + u * 1.5, u * 1.1, tint(255, 235, 190, on));
  }
  frame(ctx, w * 0.6, ledge - u * 6, u * 10, u * 6, gray(0.6), u * 0.8);
  box(ctx, w * 0.62, ledge - u * 4, u * 6, u * 2, gray(0.4));
}

export const night: Scenery = {
  stand: { x: 0.36, y: 0.72 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    drawSky(ctx, w, h, u, phase);
    drawSkyline(ctx, w, h, u, phase);
    drawRoof(ctx, w, h, u, phase);
  },
};
