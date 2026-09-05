import { TAU, box, disc, frame, glow, gray, hash, line, ring, tint, wave, type Canvas2D } from "../ink.ts";
import type { Scenery } from "./scenery.ts";

function drawBall(ctx: Canvas2D, cx: number, cy: number, r: number, u: number, phase: number): void {
  line(ctx, cx, 0, cx, cy - r, gray(0.6), u * 0.8);
  glow(ctx, cx, cy, r * 2.2, gray(0.22 + 0.05 * wave(phase, 2)));
  disc(ctx, cx, cy, r, gray(0.42));
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.clip();
  const spacing = r / 3;
  for (let i = -4; i <= 4; i += 1) {
    const x = cx + ((i * spacing + phase * spacing) % (r * 2 + spacing)) - spacing / 2;
    line(ctx, x, cy - r, x, cy + r, gray(0.08), u * 0.7);
  }
  for (let i = -3; i <= 3; i += 1) {
    line(ctx, cx - r, cy + i * spacing, cx + r, cy + i * spacing, gray(0.08), u * 0.7);
  }
  for (let i = 0; i < 9; i += 1) {
    const sparkle = Math.max(0, wave(phase, 3, hash(i)));
    const angle = hash(i + 20) * TAU;
    const dist = hash(i + 40) * r * 0.8;
    disc(ctx, cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, u * 1.2, gray(0.5 + sparkle * 0.5));
  }
  ctx.restore();
  ring(ctx, cx, cy, r, gray(0.9), u * 0.8);
}

function drawBeams(ctx: Canvas2D, cx: number, cy: number, h: number, phase: number): void {
  const colors: Array<[number, number, number]> = [
    [255, 90, 170],
    [90, 200, 255],
    [255, 220, 90],
  ];
  for (const [i, color] of colors.entries()) {
    const angle = Math.PI / 2 + wave(phase, 1, i / 3) * 0.9;
    const spread = 0.12;
    ctx.fillStyle = tint(color[0], color[1], color[2], 0.16);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle - spread) * h * 1.4, cy + Math.sin(angle - spread) * h * 1.4);
    ctx.lineTo(cx + Math.cos(angle + spread) * h * 1.4, cy + Math.sin(angle + spread) * h * 1.4);
    ctx.fill();
  }
}

function drawSpeaker(ctx: Canvas2D, x: number, y: number, sw: number, sh: number, u: number, phase: number): void {
  box(ctx, x, y, sw, sh, gray(0.18));
  frame(ctx, x, y, sw, sh, gray(0.8), u * 0.9);
  const pump = 1 + 0.12 * Math.max(0, wave(phase, 8));
  ring(ctx, x + sw / 2, y + sh * 0.62, sw * 0.3 * pump, gray(0.75), u * 0.9);
  disc(ctx, x + sw / 2, y + sh * 0.62, sw * 0.12 * pump, gray(0.5));
  ring(ctx, x + sw / 2, y + sh * 0.22, sw * 0.14, gray(0.6), u * 0.7);
}

function drawFloor(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const top = h * 0.8;
  const tiles = 10;
  const tw = w / tiles;
  for (let i = 0; i < tiles; i += 1) {
    const beat = wave(phase, 4, i / tiles) > 0.6 ? 0.42 : 0.16;
    box(ctx, i * tw + u * 0.5, top + u, tw - u, h - top - u * 2, gray(beat + ((i % 2) * 0.06)));
  }
  line(ctx, 0, top, w, top, gray(0.85), u * 0.9);
}

export const disco: Scenery = {
  stand: { x: 0.5, y: 0.8 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    const cx = w * 0.5;
    const cy = h * 0.2;
    drawBeams(ctx, cx, cy, h, phase);
    drawBall(ctx, cx, cy, h * 0.12, u, phase);
    for (let i = 0; i < 26; i += 1) {
      const twinkle = Math.max(0, wave(phase, 2, hash(i)));
      disc(ctx, hash(i + 5) * w, hash(i + 11) * h * 0.72, u * 0.8, gray(0.3 + twinkle * 0.6));
    }
    drawSpeaker(ctx, w * 0.05, h * 0.42, w * 0.13, h * 0.38, u, phase);
    drawSpeaker(ctx, w * 0.82, h * 0.42, w * 0.13, h * 0.38, u, phase);
    frame(ctx, w * 0.22, h * 0.55, w * 0.14, h * 0.25, gray(0.65), u * 0.8);
    disc(ctx, w * 0.29, h * 0.64, u * 3.5, gray(0.5));
    disc(ctx, w * 0.29 + Math.cos(phase * TAU * 2) * u * 2, h * 0.64 + Math.sin(phase * TAU * 2) * u * 2, u * 0.8, gray(0.9));
    frame(ctx, w * 0.64, h * 0.5, w * 0.16, h * 0.3, gray(0.65), u * 0.8);
    for (let i = 0; i < 5; i += 1) {
      const level = 0.4 + 0.6 * Math.max(0, wave(phase, 4 + i, hash(i)));
      box(ctx, w * 0.66 + i * u * 2.8, h * 0.66 - level * h * 0.12, u * 1.8, level * h * 0.12, gray(0.4 + level * 0.5));
    }
    drawFloor(ctx, w, h, u, phase);
  },
};
