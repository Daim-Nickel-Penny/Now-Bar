import { box, disc, frame, glow, gray, hash, line, ring, shelf, tint, wave, type Canvas2D } from "../ink.ts";
import type { Scenery } from "./scenery.ts";

function drawWindow(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.36;
  const y = h * 0.08;
  const ww = w * 0.28;
  const wh = h * 0.32;
  box(ctx, x, y, ww, wh, gray(0.16));
  glow(ctx, x + ww * 0.3, y + wh * 0.3, u * 10, gray(0.3));
  disc(ctx, x + ww * 0.3, y + wh * 0.3, u * 3, gray(0.85));
  for (let i = 0; i < 3; i += 1) {
    const drift = ((hash(i) + phase) % 1) * (ww + u * 12) - u * 6;
    box(ctx, x + drift, y + wh * (0.15 + i * 0.2), u * 7, u * 2, gray(0.4));
  }
  frame(ctx, x, y, ww, wh, gray(0.9), u * 1.1);
  line(ctx, x + ww / 2, y, x + ww / 2, y + wh, gray(0.7), u * 0.8);
  box(ctx, x - u, y + wh, ww + u * 2, u * 1.4, gray(0.55));
  box(ctx, x + u * 2, y + wh - u * 4, u * 4, u * 4, gray(0.5));
  for (let i = 0; i < 3; i += 1) {
    line(ctx, x + u * 4, y + wh - u * 4, x + u * 2 + i * u * 2, y + wh - u * 8 - hash(i) * u * 2, gray(0.7), u * 0.8);
  }
}

function drawRail(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const y = h * 0.12;
  line(ctx, w * 0.68, y, w * 0.96, y, gray(0.7), u * 0.9);
  for (let i = 0; i < 3; i += 1) {
    const x = w * 0.72 + i * u * 9;
    const sway = wave(phase, 1, i * 0.33) * u * 0.6;
    line(ctx, x, y, x + sway, y + u * 4, gray(0.6), u * 0.7);
    ring(ctx, x + sway, y + u * 7.5, u * 3.5 - i * u * 0.5, gray(0.75), u * 0.9);
    disc(ctx, x + sway, y + u * 7.5, u * 2.2 - i * u * 0.3, gray(0.3));
  }
}

function drawCounter(ctx: Canvas2D, w: number, h: number, u: number): void {
  const top = h * 0.66;
  box(ctx, 0, top, w, u * 2, gray(0.8));
  box(ctx, 0, top + u * 2, w, h - top - u * 2, gray(0.16));
  for (let i = 0; i < 5; i += 1) {
    const x = u * 2 + i * (w / 5);
    frame(ctx, x, top + u * 4, w / 5 - u * 3, h * 0.12, gray(0.55), u * 0.7);
    box(ctx, x + w / 10 - u * 3, top + u * 4 + h * 0.06, u * 4, u * 0.9, gray(0.85));
  }
  line(ctx, 0, h * 0.9, w, h * 0.9, gray(0.4), u * 0.6);
}

function drawStove(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.66;
  const top = h * 0.66;
  box(ctx, x, top - u * 1.5, w * 0.26, u * 1.5, gray(0.35));
  for (let i = 0; i < 2; i += 1) {
    ring(ctx, x + w * 0.07 + i * w * 0.12, top - u * 0.7, u * 3.2, gray(0.6), u * 0.7);
  }
  const potX = x + w * 0.07;
  glow(ctx, potX, top - u * 1.5, u * 6, tint(255, 140, 60, 0.4 + 0.1 * wave(phase, 6)));
  box(ctx, potX - u * 5, top - u * 9, u * 10, u * 7.5, gray(0.3));
  frame(ctx, potX - u * 5, top - u * 9, u * 10, u * 7.5, gray(0.85), u * 0.9);
  box(ctx, potX - u * 5.8, top - u * 10.2, u * 11.6, u * 1.4, gray(0.75));
  line(ctx, potX - u * 5, top - u * 6, potX - u * 8, top - u * 6, gray(0.7), u * 0.9);
  line(ctx, potX + u * 5, top - u * 6, potX + u * 8, top - u * 6, gray(0.7), u * 0.9);
  for (let i = 0; i < 4; i += 1) {
    const life = (hash(i) + phase * 2) % 1;
    const puffX = potX + (hash(i + 5) - 0.5) * u * 6 + wave(life, 1, hash(i)) * u * 2;
    disc(ctx, puffX, top - u * 12 - life * u * 16, u * (1 + life * 2), gray(0.5 * (1 - life)));
  }
}

export const kitchen: Scenery = {
  stand: { x: 0.4, y: 0.9 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    drawWindow(ctx, w, h, u, phase);
    drawRail(ctx, w, h, u, phase);
    shelf(ctx, w * 0.05, h * 0.22, w * 0.24, 3, gray(0.75), u);
    shelf(ctx, w * 0.05, h * 0.42, w * 0.24, 9, gray(0.75), u);
    drawCounter(ctx, w, h, u);
    drawStove(ctx, w, h, u, phase);
    box(ctx, w * 0.06, h * 0.6, u * 12, u * 6, gray(0.28));
    frame(ctx, w * 0.06, h * 0.6, u * 12, u * 6, gray(0.7), u * 0.8);
    for (let i = 0; i < 3; i += 1) {
      disc(ctx, w * 0.08 + i * u * 4, h * 0.6 - u * 1.5, u * 1.8, gray(0.5 + i * 0.12));
    }
  },
};
