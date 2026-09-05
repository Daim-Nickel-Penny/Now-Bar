import { box, disc, frame, glow, gray, hash, line, wave, type Canvas2D } from "../ink.ts";
import type { Scenery } from "./scenery.ts";

const DROPS = 42;

function drawRain(ctx: Canvas2D, x: number, y: number, ww: number, wh: number, u: number, phase: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, ww, wh);
  ctx.clip();
  for (let i = 0; i < DROPS; i += 1) {
    const speed = 2 + (i % 3);
    const fall = (hash(i) + phase * speed) % 1;
    const dx = x + hash(i + 7) * ww;
    const dy = y + fall * (wh + u * 6) - u * 6;
    line(ctx, dx, dy, dx - u * 0.6, dy + u * 3.5, gray(0.3 + hash(i + 3) * 0.35), u * 0.7);
  }
  ctx.restore();
}

function drawWindow(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.5;
  const y = h * 0.08;
  const ww = w * 0.4;
  const wh = h * 0.56;
  box(ctx, x, y, ww, wh, gray(0.07));
  glow(ctx, x + ww * 0.78, y + wh * 0.22, u * 12, gray(0.3 + 0.05 * wave(phase, 1)));
  disc(ctx, x + ww * 0.78, y + wh * 0.22, u * 3.2, gray(0.9));
  disc(ctx, x + ww * 0.78 + u * 1.4, y + wh * 0.22 - u * 0.8, u * 2.6, gray(0.07));
  drawRain(ctx, x, y, ww, wh, u, phase);
  frame(ctx, x, y, ww, wh, gray(0.9), u * 1.2);
  line(ctx, x + ww / 2, y, x + ww / 2, y + wh, gray(0.75), u * 0.9);
  line(ctx, x, y + wh / 2, x + ww, y + wh / 2, gray(0.75), u * 0.9);
  box(ctx, x - u * 2, y + wh, ww + u * 4, u * 1.6, gray(0.6));
  for (const side of [x - u * 6, x + ww + u * 1.5]) {
    for (let i = 0; i < 4; i += 1) {
      const cx = side + i * u * 1.3;
      const sway = wave(phase, 1, i * 0.25) * u * 0.4;
      line(ctx, cx, y - u * 2, cx + sway, y + wh + u * 4, gray(0.3 + (i % 2) * 0.15), u * 0.8);
    }
  }
}

function drawBed(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.06;
  const top = h * 0.7;
  const bw = w * 0.4;
  frame(ctx, x, h * 0.46, u * 2.4, top - h * 0.46, gray(0.7), u * 0.8);
  box(ctx, x, top, bw, u * 7, gray(0.34));
  frame(ctx, x, top, bw, u * 7, gray(0.8), u * 0.9);
  box(ctx, x + u * 2, top - u * 3, u * 9, u * 3.5, gray(0.85));
  const breathe = wave(phase, 3) * u * 0.3;
  box(ctx, x + u * 12, top - u * 1.2 + breathe, bw - u * 13, u * 3, gray(0.5));
  for (let i = 0; i < 4; i += 1) {
    line(ctx, x + u * 14 + i * u * 6, top - u * 1.2, x + u * 14 + i * u * 6, top + u * 2, gray(0.65), u * 0.6);
  }
  box(ctx, x + u, top + u * 7, u * 2, u * 4, gray(0.55));
  box(ctx, x + bw - u * 3, top + u * 7, u * 2, u * 4, gray(0.55));
}

function drawNightstand(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.48 - u * 10;
  const top = h * 0.68;
  frame(ctx, x, top, u * 9, h * 0.82 - top, gray(0.6), u * 0.8);
  line(ctx, x + u * 1.5, top + u * 4, x + u * 7.5, top + u * 4, gray(0.4), u * 0.6);
  const lampX = x + u * 4.5;
  glow(ctx, lampX, top - u * 6, u * 9, gray(0.28 + 0.06 * wave(phase, 2)));
  line(ctx, lampX, top, lampX, top - u * 5, gray(0.6), u * 0.8);
  ctx.fillStyle = gray(0.9);
  ctx.beginPath();
  ctx.moveTo(lampX - u * 3.5, top - u * 5);
  ctx.lineTo(lampX + u * 3.5, top - u * 5);
  ctx.lineTo(lampX + u * 2, top - u * 9);
  ctx.lineTo(lampX - u * 2, top - u * 9);
  ctx.fill();
}

export const rain: Scenery = {
  stand: { x: 0.29, y: 0.71 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    drawWindow(ctx, w, h, u, phase);
    line(ctx, 0, h * 0.82, w, h * 0.82, gray(0.5), u * 0.8);
    drawBed(ctx, w, h, u, phase);
    drawNightstand(ctx, w, h, u, phase);
    box(ctx, w * 0.9, h * 0.72, u * 5, u * 10, gray(0.45));
    for (let i = 0; i < 5; i += 1) {
      const sway = wave(phase, 1, i * 0.2) * u * 0.6;
      line(ctx, w * 0.925, h * 0.72, w * 0.9 + i * u * 1.6 + sway, h * 0.6 - hash(i) * u * 4, gray(0.65), u * 0.9);
    }
  },
};
