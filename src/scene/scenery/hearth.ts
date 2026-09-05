import {
  AMBER, MINT, PINK, ROSE, TONE, VIOLET, arch, books, box, cat, courses, disc, ellipse, glow, gray,
  cast, hash, hue, line, panel, picture, plant, poly, pool, slab, star, wash, wave, type Canvas2D,
  type Rgb,
} from "../ink.ts";
import type { Scenery } from "./scenery.ts";

const FLOOR = 0.84;
const RAIL = 0.6;
const SPINES: readonly Rgb[] = [ROSE, AMBER, MINT, VIOLET, PINK];

/** Dark at the ceiling, warmer down by the fire, so the room has somewhere for the light to come from. */
function drawRoom(ctx: Canvas2D, w: number, h: number, u: number): void {
  wash(ctx, 0, 0, w, h * RAIL, gray(TONE.void), gray(TONE.back));
  for (let x = u * 6; x < w; x += u * 16) {
    box(ctx, x, 0, u * 3.4, h * RAIL, gray(TONE.back + 0.05));
  }
  slab(ctx, 0, h * RAIL, w, u * 3.4, u, TONE.edge);
  wash(ctx, 0, h * RAIL + u * 3.4, w, h * FLOOR - h * RAIL - u * 3.4, gray(TONE.back + 0.06), gray(TONE.mid));
  slab(ctx, 0, h * FLOOR, w, h * (1 - FLOOR), u, TONE.near);
  for (let i = 0; i < 8; i += 1) {
    line(ctx, i * (w / 8) - u * 4, h * FLOOR, i * (w / 8) + u * 9, h, gray(TONE.void), u * 1.4);
  }
  pool(ctx, w * 0.72, h * (FLOOR + 0.04), w * 0.5, h * 0.1, hue(AMBER, 0.82));
}

function drawWindow(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.04;
  const y = h * 0.06;
  const ww = w * 0.22;
  const wh = h * 0.3;
  box(ctx, x - u * 2.4, y - u * 2.4, ww + u * 4.8, wh + u * 4.8, gray(TONE.lit));
  box(ctx, x, y, ww, wh, gray(TONE.void));
  glow(ctx, x + ww * 0.72, y + wh * 0.24, u * 12, gray(0.28));
  disc(ctx, x + ww * 0.72, y + wh * 0.24, u * 3, gray(0.95));
  for (let i = 0; i < 22; i += 1) {
    const fall = (hash(i) + phase) % 1;
    const drift = ((hash(i + 4) + phase * 0.4) % 1) * ww;
    disc(ctx, x + drift, y + fall * wh, u * (0.6 + hash(i + 9) * 0.6), gray(0.5 + hash(i + 9) * 0.45));
  }
  for (let i = 0; i < 5; i += 1) {
    box(ctx, x + i * (ww / 5), y + wh - u * (2 + hash(i + 20) * 3), ww / 5, u * 5, gray(TONE.lit));
  }
  box(ctx, x + ww / 2 - u * 1.3, y, u * 2.6, wh, gray(TONE.edge));
  box(ctx, x, y + wh / 2 - u * 1.3, ww, u * 2.6, gray(TONE.edge));
  slab(ctx, x - u * 4, y + wh, ww + u * 8, u * 3, u, TONE.edge);
  plant(ctx, x + ww * 0.2, y + wh, u * 0.7, 61, phase, hue(MINT, 0.898));
}

function drawShelves(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.32;
  const sw = w * 0.24;
  for (const [i, at] of [0.13, 0.3, 0.47].entries()) {
    const y = h * at;
    slab(ctx, x, y, sw, u * 2.6, u, TONE.edge);
    books(ctx, x + u * 2, y, sw * 0.7, u * 1.5, i * 30 + 3, SPINES);
    if (i === 1) {
      plant(ctx, x + sw * 0.86, y, u * 0.65, 7, phase, hue(MINT, 0.88));
    } else {
      disc(ctx, x + sw * 0.84, y - u * 3.4, u * 3.4, gray(TONE.lit));
      box(ctx, x + sw * 0.84 - u * 3.4, y - u * 1.6, u * 6.8, u * 1.6, gray(TONE.near));
    }
  }
}

function drawFire(ctx: Canvas2D, x: number, base: number, u: number, phase: number): void {
  glow(ctx, x, base - u * 6, u * 26, hue(AMBER, 0.85 + 0.12 * wave(phase, 4)));
  for (let i = 0; i < 5; i += 1) {
    const lx = x - u * 11 + i * u * 4.6;
    box(ctx, lx, base - u * 4, u * 4, u * 3.4, gray(0.34 - i * 0.03));
    box(ctx, lx, base - u * 4, u * 4, u * 1, gray(0.5));
    disc(ctx, lx + u * 2, base - u * 2.3, u * 1.1, hue(AMBER, 0.8));
  }
  for (const [i, dx] of [-u * 6, -u * 1, u * 4.5].entries()) {
    const flicker = 0.7 + 0.3 * wave(phase, 6 + i * 2, i * 0.3);
    const height = u * (11 + i * 3) * flicker;
    ctx.fillStyle = hue(AMBER, 0.95);
    ctx.beginPath();
    ctx.moveTo(x + dx - u * 3.4, base - u * 3);
    ctx.quadraticCurveTo(x + dx - u * 3.8, base - height * 0.5, x + dx, base - height);
    ctx.quadraticCurveTo(x + dx + u * 3.8, base - height * 0.5, x + dx + u * 3.4, base - u * 3);
    ctx.fill();
    ellipse(ctx, x + dx, base - height * 0.4, u * 1.6, height * 0.26, gray(1));
  }
  for (let i = 0; i < 8; i += 1) {
    const life = (hash(i) + phase * 2) % 1;
    disc(ctx, x + (hash(i + 9) - 0.5) * u * 16, base - u * 11 - life * u * 22, u * 0.9, hue(AMBER, 1 - life));
  }
}

function drawMantel(ctx: Canvas2D, x: number, y: number, fw: number, h: number, u: number, phase: number): void {
  slab(ctx, x - u * 4, y - u * 3.6, fw + u * 8, u * 3.6, u, TONE.hot);
  for (const [i, at] of [0.1, 0.19].entries()) {
    const cx = x + fw * at;
    const tall = u * (7 - i * 2.5);
    panel(ctx, cx - u * 1.8, y - u * 3 - tall, u * 3.6, tall, u, TONE.edge);
    const flame = 0.7 + 0.3 * wave(phase, 5 + i * 3, i * 0.4);
    glow(ctx, cx, y - u * 4 - tall, u * 5, hue(AMBER, 0.865 * flame));
    disc(ctx, cx, y - u * 4.4 - tall, u * 1.3 * flame, gray(1));
  }
  const clockX = x + fw * 0.36;
  panel(ctx, clockX, y - u * 14, u * 11, u * 11, u, TONE.near);
  disc(ctx, clockX + u * 5.5, y - u * 8.5, u * 4, gray(TONE.edge));
  const tick = Math.round(wave(phase, 4));
  line(ctx, clockX + u * 5.5, y - u * 8.5, clockX + u * 5.5 + tick * u * 2.4, y - u * 11.4, gray(TONE.void), u * 1.2);
  picture(ctx, x + fw * 0.6, y - h * 0.19, fw * 0.34, h * 0.15, u, 0.6);
}

function drawFireplace(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.6;
  const y = h * 0.32;
  const fw = w * 0.36;
  const fh = h * FLOOR - y;
  box(ctx, x, y, fw, fh, gray(TONE.near));
  courses(ctx, x, y, fw, fh, u * 9, u * 6, u, TONE.near);
  const ax = x + fw * 0.2;
  const aw = fw * 0.6;
  arch(ctx, ax, y + fh * 0.18, aw, fh * 0.82, gray(TONE.void));
  ctx.save();
  ctx.beginPath();
  ctx.rect(ax, y + fh * 0.18, aw, fh * 0.8);
  ctx.clip();
  drawFire(ctx, ax + aw / 2, y + fh - u * 2, u, phase);
  ctx.restore();
  slab(ctx, ax - u * 3, y + fh - u * 3, aw + u * 6, u * 3, u, TONE.edge);
  drawMantel(ctx, x, y, fw, h, u, phase);
}

function drawChair(ctx: Canvas2D, w: number, h: number, u: number): void {
  const x = w * 0.1;
  const seat = h * 0.68;
  panel(ctx, x, h * 0.4, w * 0.26, seat - h * 0.4, u, TONE.mid);
  for (let i = 1; i < 4; i += 1) {
    box(ctx, x + i * (w * 0.065), h * 0.42, u * 1.8, seat - h * 0.44, gray(TONE.lit));
  }
  panel(ctx, x - u * 3, seat - u * 6, w * 0.32, u * 10, u, TONE.near);
  for (const dx of [x - u, x + w * 0.28]) {
    panel(ctx, dx, seat + u * 4, u * 3.4, h * FLOOR - seat - u * 4, u, TONE.near);
  }
  ellipse(ctx, x + w * 0.15, h * (FLOOR + 0.05), w * 0.3, u * 5, gray(TONE.void));
}

function drawLamp(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.52;
  const top = h * 0.24;
  glow(ctx, x, top + u * 6, u * 26, hue(AMBER, 0.79 + 0.05 * wave(phase, 2)));
  box(ctx, x - u * 1.3, top, u * 2.6, h * FLOOR - top, gray(TONE.lit));
  poly(ctx, [
    [x - u * 9, top + u * 6],
    [x + u * 9, top + u * 6],
    [x + u * 5.5, top - u * 3],
    [x - u * 5.5, top - u * 3],
  ], gray(TONE.hot));
  box(ctx, x - u * 9, top + u * 5, u * 18, u * 1.8, gray(TONE.mid));
  ellipse(ctx, x, h * FLOOR, u * 7, u * 2.4, gray(TONE.near));
}

export const hearth: Scenery = {
  stand: { x: 0.28, y: 0.84 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    drawRoom(ctx, w, h, u);
    cast(ctx, w * 0.44, 0, w * 0.56, h, AMBER, 0.16);
    cast(ctx, 0, 0, w * 0.44, h, VIOLET, 0.1);
    drawWindow(ctx, w, h, u, phase);
    drawShelves(ctx, w, h, u, phase);
    drawFireplace(ctx, w, h, u, phase);
    drawChair(ctx, w, h, u);
    drawLamp(ctx, w, h, u, phase);
    cat(ctx, w * 0.56, h * (FLOOR + 0.1), u, phase, gray(TONE.void));
    ellipse(ctx, w * 0.4, h * (FLOOR + 0.07), w * 0.36, u * 6, gray(TONE.near));
    for (let i = 0; i < 6; i += 1) {
      star(ctx, w * 0.5 + hash(i) * w * 0.14, h * 0.5 + hash(i + 7) * h * 0.26, u * (0.9 + hash(i + 3)),
        hue(AMBER, 0.82 + 0.5 * Math.abs(wave(phase, 2, hash(i)))));
    }
  },
};
