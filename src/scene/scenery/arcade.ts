import {
  CYAN, MINT, PINK, TONE, VIOLET, box, cast, disc, ellipse, glow, gray, hash, hue, line, panel,
  poly, ring, slab, star, wash, wave, type Canvas2D, type Rgb,
} from "../ink.ts";
import type { Scenery } from "./scenery.ts";

const FLOOR = 0.74;

/** A pixel field that steps on whole frames, so the cabinet reads as a game rather than as noise. */
function drawScreen(
  ctx: Canvas2D, x: number, y: number, sw: number, sh: number, u: number, phase: number, seed: number, color: Rgb,
): void {
  box(ctx, x, y, sw, sh, gray(TONE.void));
  glow(ctx, x + sw / 2, y + sh / 2, sw, hue(color, 0.8));
  const step = Math.floor(phase * 8);
  const cols = 6;
  const rows = 4;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (hash(seed * 100 + r * cols + c + step) > 0.55) {
        box(ctx, x + u * 1.6 + c * ((sw - u * 3) / cols), y + u * 1.6 + r * ((sh - u * 3) / rows),
          u * 2.4, u * 2.4, hue(color, 1));
      }
    }
  }
  const hero = (step % cols) * ((sw - u * 3) / cols);
  box(ctx, x + u * 1.6 + hero, y + sh - u * 5, u * 4, u * 2.6, gray(TONE.hot));
  box(ctx, x - u * 1.4, y - u * 1.4, sw + u * 2.8, u * 1.4, hue(color, 1));
  box(ctx, x - u * 1.4, y + sh, sw + u * 2.8, u * 1.4, hue(color, 1));
}

function drawCabinet(ctx: Canvas2D, x: number, w: number, h: number, u: number, phase: number, seed: number): void {
  const top = h * 0.14;
  const bottom = h * FLOOR;
  const color = seed > 0.5 ? CYAN : PINK;
  panel(ctx, x, top + u * 7, w, bottom - top - u * 7, u, TONE.lit);
  box(ctx, x + u * 1.4, top + u * 9, w - u * 2.8, bottom - top - u * 12, gray(TONE.mid));
  const marquee = 0.7 + 0.3 * Math.max(0, wave(phase, 2, seed));
  box(ctx, x - u * 2, top, w + u * 4, u * 7, hue(color, marquee));
  glow(ctx, x + w / 2, top + u * 3.5, w, hue(color, marquee));
  for (let i = 0; i < 4; i += 1) {
    box(ctx, x + u * 2 + i * (w / 4.4), top + u * 2, u * 3, u * 3, gray(TONE.void));
  }
  drawScreen(ctx, x + u * 2.5, top + u * 11, w - u * 5, h * 0.24, u, phase, seed, color);
  const deckY = top + u * 11 + h * 0.24 + u * 3;
  slab(ctx, x + u, deckY, w - u * 2, u * 6, u, TONE.edge);
  const stickX = x + w * 0.3;
  const lean = wave(phase, 4, seed) * u * 2.4;
  box(ctx, stickX - u * 0.8 + lean * 0.4, deckY - u * 4, u * 1.6, u * 5, gray(TONE.lit));
  disc(ctx, stickX + lean, deckY - u * 5, u * 2.2, hue(PINK, 1));
  disc(ctx, x + w * 0.58, deckY + u * 2.6, u * 1.7, hue(PINK, 1));
  disc(ctx, x + w * 0.76, deckY + u * 2.6, u * 1.7, hue(CYAN, 1));
  disc(ctx, x + w * 0.92, deckY + u * 2.6, u * 1.7, hue(MINT, 1));
  box(ctx, x + u * 2, deckY + u * 10, w - u * 4, u * 4.5, gray(TONE.near));
  glow(ctx, x + w / 2, bottom, w * 1.4, hue(color, 0.85));
}

function drawSign(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const pulse = 0.75 + 0.25 * wave(phase, 2);
  const x = w * 0.3;
  const y = h * 0.02;
  const sw = w * 0.4;
  const sh = h * 0.1;
  glow(ctx, x + sw / 2, y + sh / 2, sw, hue(PINK, 0.85 * pulse));
  box(ctx, x, y, sw, u * 3, hue(PINK, pulse));
  box(ctx, x, y + sh - u * 3, sw, u * 3, hue(PINK, pulse));
  box(ctx, x, y, u * 3, sh, hue(PINK, pulse));
  box(ctx, x + sw - u * 3, y, u * 3, sh, hue(PINK, pulse));
  for (let i = 0; i < 7; i += 1) {
    const on = wave(phase, 3, i / 7) > -0.2 ? 1 : 0.72;
    box(ctx, x + sw * 0.1 + i * (sw * 0.115), y + sh * 0.3, u * 2.6, sh * 0.4, hue(CYAN, on));
  }
}

function drawClaw(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.44;
  const y = h * 0.36;
  const cw = w * 0.17;
  const ch = h * FLOOR - y;
  panel(ctx, x, y, cw, ch, u, TONE.mid);
  box(ctx, x, y, u * 1.6, ch, gray(TONE.edge));
  box(ctx, x + cw - u * 1.6, y, u * 1.6, ch, gray(TONE.edge));
  box(ctx, x - u * 1.5, y - u * 6, cw + u * 3, u * 6, hue(PINK, 0.8 + 0.2 * wave(phase, 2)));
  glow(ctx, x + cw / 2, y - u * 3, cw, hue(PINK, 0.9));
  const grab = x + cw * 0.5 + wave(phase, 1) * cw * 0.3;
  box(ctx, grab - u * 0.8, y + u * 2, u * 1.6, u * 8, gray(TONE.lit));
  poly(ctx, [[grab - u * 3, y + u * 10], [grab + u * 3, y + u * 10], [grab, y + u * 15]], gray(TONE.edge));
  for (let i = 0; i < 9; i += 1) {
    disc(ctx, x + u * 4 + hash(i) * (cw - u * 8), y + ch - u * 4 - hash(i + 4) * u * 8,
      u * (2 + hash(i + 8) * 1.4), hue(i % 3 === 0 ? MINT : i % 3 === 1 ? PINK : CYAN, 1));
  }
}

function drawFloor(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const top = h * FLOOR;
  wash(ctx, 0, top, w, h - top, gray(0.3), gray(0.14));
  slab(ctx, 0, top - u * 1.4, w, u * 3, u, TONE.hot);
  for (let i = 0; i <= 12; i += 1) {
    const t = i / 12 - 0.5;
    line(ctx, w * 0.5 + t * w * 0.35, top, w * 0.5 + t * w * 2.6, h, hue(VIOLET, 0.85), u * 0.9);
  }
  for (let i = 1; i < 5; i += 1) {
    const y = top + Math.pow(i / 5, 1.7) * (h - top);
    line(ctx, 0, y, w, y, hue(PINK, 0.75 + 0.25 * Math.max(0, wave(phase, 2, i / 5))), u * 1.1);
  }
}

export const arcade: Scenery = {
  stand: { x: 0.3, y: 0.84 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    wash(ctx, 0, 0, w, h * FLOOR, gray(0.38), gray(0.2));
    for (const [i, at] of [0.18, 0.5, 0.82].entries()) {
      const on = 0.7 + 0.3 * Math.max(0, wave(phase, 2, i / 3));
      const color = i % 2 === 0 ? CYAN : VIOLET;
      box(ctx, w * at - w * 0.09, 0, w * 0.18, u * 2.2, hue(color, on));
      glow(ctx, w * at, u, w * 0.16, hue(color, on));
    }
    drawSign(ctx, w, h, u, phase);
    drawCabinet(ctx, w * 0.02, w * 0.18, h, u, phase, 0.2);
    drawCabinet(ctx, w * 0.8, w * 0.18, h, u, phase, 0.8);
    drawClaw(ctx, w, h, u, phase);
    drawFloor(ctx, w, h, u, phase);
    panel(ctx, w * 0.23, h * (FLOOR + 0.02), u * 3.4, h * 0.13, u, TONE.near);
    ellipse(ctx, w * 0.247, h * (FLOOR + 0.02), u * 8, u * 2.8, gray(TONE.edge));
    ellipse(ctx, w * 0.3, h * (FLOOR + 0.16), w * 0.22, u * 5, gray(TONE.void));
    for (let i = 0; i < 10; i += 1) {
      const rise = (hash(i + 20) + phase * 2) % 1;
      star(ctx, hash(i + 30) * w, h * FLOOR - rise * h * 0.34, u * (1 + hash(i) * 1.2),
        hue(i % 2 === 0 ? CYAN : PINK, 1 - rise * 0.3));
    }
    ring(ctx, w * 0.5, h * 0.2, w * 0.07, hue(CYAN, 0.8 + 0.2 * wave(phase, 2)), u * 1.1);
    cast(ctx, 0, 0, w, h, VIOLET, 0.06);
  },
};
