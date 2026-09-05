import { box, disc, frame, glow, gray, hash, line, tint, wave, type Canvas2D } from "../ink.ts";
import type { Scenery } from "./scenery.ts";

function drawCabinet(ctx: Canvas2D, x: number, w: number, h: number, u: number, phase: number, seed: number): void {
  const top = h * 0.22;
  const bottom = h * 0.78;
  box(ctx, x, top, w, bottom - top, gray(0.14));
  frame(ctx, x, top, w, bottom - top, gray(0.8), u * 1);
  box(ctx, x - u, top - u * 4, w + u * 2, u * 4, gray(0.4 + 0.2 * Math.max(0, wave(phase, 2, seed))));
  const screenY = top + u * 3;
  const screenH = h * 0.2;
  box(ctx, x + u * 1.5, screenY, w - u * 3, screenH, gray(0.05));
  const hue: [number, number, number] = seed > 0.5 ? [120, 230, 255] : [255, 120, 220];
  glow(ctx, x + w / 2, screenY + screenH / 2, w * 0.6, tint(hue[0], hue[1], hue[2], 0.18));
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const on = hash(seed * 100 + row * 6 + col + Math.floor(phase * 8)) > 0.55;
      if (on) {
        box(ctx, x + u * 2.5 + col * ((w - u * 5) / 6), screenY + u * 1.5 + row * ((screenH - u * 3) / 5), u * 1.6, u * 1.6, tint(hue[0], hue[1], hue[2], 0.9));
      }
    }
  }
  const deckY = screenY + screenH + u * 3;
  box(ctx, x + u, deckY, w - u * 2, u * 4, gray(0.3));
  disc(ctx, x + w * 0.3, deckY + u * 2, u * 1.4, gray(0.85));
  line(ctx, x + w * 0.3, deckY + u * 2, x + w * 0.3 + wave(phase, 4, seed) * u * 1.5, deckY - u * 2, gray(0.7), u * 0.8);
  disc(ctx, x + w * 0.6, deckY + u * 2, u * 1.1, tint(255, 90, 90, 0.9));
  disc(ctx, x + w * 0.75, deckY + u * 2, u * 1.1, tint(90, 130, 255, 0.9));
  frame(ctx, x + u * 2, deckY + u * 8, w - u * 4, u * 3, gray(0.4), u * 0.6);
}

function drawNeon(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const pulse = 0.7 + 0.3 * wave(phase, 2);
  const x = w * 0.36;
  const y = h * 0.04;
  glow(ctx, w * 0.5, y + h * 0.06, w * 0.2, tint(255, 60, 180, 0.2 * pulse));
  frame(ctx, x, y, w * 0.28, h * 0.12, tint(255, 90, 200, pulse), u * 1.2);
  for (let i = 0; i < 4; i += 1) {
    const zig = i % 2 === 0 ? -1 : 1;
    line(ctx, x + u * 4 + i * u * 5, y + h * 0.06 + zig * u * 2, x + u * 9 + i * u * 5, y + h * 0.06 - zig * u * 2, tint(120, 230, 255, pulse), u * 0.9);
  }
}

function drawTv(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.56;
  const y = h * 0.54;
  const tw = w * 0.18;
  const th = h * 0.22;
  const flicker = hash(Math.floor(phase * 16)) * 0.25;
  glow(ctx, x + tw / 2, y + th / 2, tw, gray(0.2 + flicker));
  box(ctx, x, y, tw, th, gray(0.2));
  frame(ctx, x, y, tw, th, gray(0.8), u * 1);
  box(ctx, x + u * 1.5, y + u * 1.5, tw - u * 3, th - u * 4, gray(0.5 + flicker));
  box(ctx, x + u * 3, y + u * 3 + wave(phase, 4) * u, u * 3, u * 2, gray(0.1));
  box(ctx, x + tw - u * 7, y + th - u * 6, u * 3, u * 2, gray(0.1));
  box(ctx, x + tw * 0.3, y + th, tw * 0.4, u * 2, gray(0.45));
  line(ctx, x + u * 2, y + th + u * 2, w * 0.42, h * 0.78, gray(0.35), u * 0.6);
}

export const arcade: Scenery = {
  stand: { x: 0.3, y: 0.78 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    drawNeon(ctx, w, h, u, phase);
    drawCabinet(ctx, w * 0.06, w * 0.16, h, u, phase, 0.2);
    drawCabinet(ctx, w * 0.78, w * 0.16, h, u, phase, 0.8);
    line(ctx, 0, h * 0.78, w, h * 0.78, gray(0.85), u * 0.9);
    for (let i = 0; i < 12; i += 1) {
      box(ctx, i * (w / 12) + u * 0.4, h * 0.79, w / 12 - u * 0.8, h * 0.21, gray(i % 2 === 0 ? 0.12 : 0.2));
    }
    ctx.fillStyle = gray(0.38);
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h * 0.8, u * 16, u * 5, 0, 0, Math.PI * 2);
    ctx.fill();
    drawTv(ctx, w, h, u, phase);
  },
};
