import {
  AMBER, CYAN, MINT, PINK, TONE, VIOLET, box, cast, disc, ellipse, glow, gray, hash, hue, line,
  panel, plant, poly, pool, slab, star, steam, wash, wave, type Canvas2D, type Rgb,
} from "../ink.ts";
import type { Scenery } from "./scenery.ts";

const LEDGE = 0.68;
const STARS = 80;

function drawSky(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  wash(ctx, 0, 0, w, h * LEDGE, gray(0.1), gray(0.3));
  for (let i = 0; i < 5; i += 1) {
    const drift = ((hash(i) + phase * 0.5) % 1) * (w + u * 50) - u * 25;
    ellipse(ctx, drift, h * (0.05 + hash(i + 3) * 0.18), u * (13 + hash(i + 8) * 12), u * 3.4, gray(0.22));
  }
  for (let i = 0; i < STARS; i += 1) {
    const twinkle = 0.45 + 0.55 * Math.abs(wave(phase, 2 + (i % 4), hash(i)));
    disc(ctx, hash(i + 3) * w, hash(i + 9) * h * 0.46, u * (0.7 + hash(i + 17) * 0.6), gray(twinkle));
  }
  for (let i = 0; i < 5; i += 1) {
    star(ctx, hash(i + 61) * w, hash(i + 71) * h * 0.36, u * 2.4,
      hue(i % 2 === 0 ? CYAN : PINK, 0.75 + 0.25 * Math.abs(wave(phase, 2, hash(i)))));
  }
  const streak = phase * 4 - 0.4;
  if (streak > 0 && streak < 1) {
    const sx = w * 0.1 + streak * w * 0.55;
    const sy = h * 0.05 + streak * h * 0.18;
    line(ctx, sx, sy, sx - u * 13, sy - u * 5, gray(1 - streak), u * 1.2);
  }
  const mx = w * 0.85;
  const my = h * 0.13;
  glow(ctx, mx, my, u * 26, gray(0.45));
  disc(ctx, mx, my, u * 7, gray(TONE.hot));
  disc(ctx, mx + u * 2.8, my - u * 1.6, u * 5.8, gray(0.16));
}

/** A hazy far row, then a near row whose lit windows are the brightest thing below the moon. */
function drawSkyline(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  let x = -u * 5;
  let i = 0;
  while (x < w) {
    const bw = u * (10 + hash(i + 100) * 14);
    const bh = h * (0.12 + hash(i + 130) * 0.2);
    box(ctx, x, h * 0.5 - bh, bw, bh, gray(0.2));
    x += bw + u * 2;
    i += 1;
  }
  const base = h * 0.58;
  x = 0;
  i = 0;
  while (x < w) {
    const bw = u * (8 + hash(i) * 10);
    const bh = h * (0.1 + hash(i + 30) * 0.28);
    box(ctx, x, base - bh, bw, bh, gray(0.3));
    box(ctx, x, base - bh, bw, u * 1.4, gray(TONE.mid));
    if (hash(i + 55) > 0.68) {
      box(ctx, x + bw / 2 - u * 0.7, base - bh - u * 7, u * 1.4, u * 7, gray(TONE.mid));
      disc(ctx, x + bw / 2, base - bh - u * 7, u * 1.5,
        hue(PINK, 0.7 + 0.3 * Math.max(0, wave(phase, 2, hash(i)))));
    }
    const cols = Math.max(2, Math.floor(bw / (u * 4.5)));
    const rows = Math.floor(bh / (u * 5.5));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (hash(i * 40 + r * 7 + c) < 0.38) {
          continue;
        }
        const flicker = wave(phase, 1 + ((r + c) % 3), hash(i + r + c)) > -0.7 ? 1 : 0.42;
        box(ctx, x + u * 1.4 + c * (u * 4.5), base - bh + u * 3 + r * (u * 5.5), u * 2.2, u * 2.6,
          hue(c % 3 === 0 ? CYAN : AMBER, flicker));
      }
    }
    x += bw + u * 1.8;
    i += 1;
  }
  pool(ctx, w * 0.5, base, w * 0.8, h * 0.14, hue(AMBER, 0.8));
}

function drawTower(ctx: Canvas2D, w: number, h: number, u: number): void {
  const x = w * 0.66;
  const y = h * 0.26;
  panel(ctx, x, y, u * 16, u * 13, u, TONE.mid);
  for (let i = 1; i < 4; i += 1) {
    box(ctx, x, y + i * u * 3.2, u * 16, u * 1.2, gray(TONE.lit));
  }
  poly(ctx, [[x - u * 2.5, y], [x + u * 18.5, y], [x + u * 8, y - u * 7]], gray(TONE.lit));
  for (const dx of [u * 2, u * 13]) {
    box(ctx, x + dx, y + u * 13, u * 1.4, h * 0.58 - y - u * 13, gray(TONE.mid));
  }
}

function drawLights(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const bulbs = 11;
  const colors: readonly Rgb[] = [PINK, AMBER, CYAN];
  for (let i = 0; i <= bulbs; i += 1) {
    const t = i / bulbs;
    const x0 = w * 0.03 + t * w * 0.94;
    const y0 = h * 0.05 + Math.sin(t * Math.PI) * u * 8;
    if (i < bulbs) {
      const t1 = (i + 1) / bulbs;
      line(ctx, x0, y0, w * 0.03 + t1 * w * 0.94, h * 0.05 + Math.sin(t1 * Math.PI) * u * 8, gray(TONE.mid), u * 0.8);
    }
    const on = 0.6 + 0.4 * Math.max(0, wave(phase, 2, t));
    const color = colors[i % 3] ?? PINK;
    glow(ctx, x0, y0 + u * 2.5, u * 8, hue(color, on));
    disc(ctx, x0, y0 + u * 2.5, u * 1.8, hue(color, 1));
  }
}

function drawRoof(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const ledge = h * LEDGE;
  box(ctx, 0, ledge, w, h - ledge, gray(0.26));
  slab(ctx, 0, ledge - u * 4, w, u * 4.4, u, TONE.hot);
  for (let i = 0; i < 8; i += 1) {
    line(ctx, i * (w / 8), ledge, i * (w / 8), h, gray(0.14), u * 1.3);
  }
  for (let i = 1; i < 4; i += 1) {
    line(ctx, 0, ledge + i * ((h - ledge) / 4), w, ledge + i * ((h - ledge) / 4), gray(0.14), u * 1.3);
  }
  const ax = w * 0.02;
  panel(ctx, ax, ledge - h * 0.15, u * 15, h * 0.15, u, TONE.near);
  for (let i = 0; i < 5; i += 1) {
    box(ctx, ax + u * 2, ledge - h * 0.14 + i * u * 3.4, u * 11, u * 1.4, gray(TONE.lit));
  }
  slab(ctx, ax - u * 1.5, ledge - h * 0.15 - u * 2.6, u * 18, u * 2.6, u, TONE.edge);
  steam(ctx, ax + u * 7.5, ledge - h * 0.15 - u * 4, u, phase, 4, (l) => gray(0.5 * l));
  const dish = w * 0.9;
  box(ctx, dish - u, ledge - u * 17, u * 2, u * 14, gray(TONE.lit));
  ctx.fillStyle = gray(TONE.near);
  ctx.beginPath();
  ctx.ellipse(dish, ledge - u * 19, u * 7, u * 4, -0.5, 0, Math.PI * 2);
  ctx.fill();
  disc(ctx, dish + u * 2.4, ledge - u * 16, u * 1.5, gray(TONE.hot));
  panel(ctx, w * 0.6, ledge - u * 11, u * 14, u * 11, u, TONE.mid);
  box(ctx, w * 0.605, ledge - u * 10, u * 13, u * 1.4, gray(TONE.lit));
  plant(ctx, w * 0.53, ledge, u, 33, phase, hue(MINT, 0.85));
  plant(ctx, w * 0.78, ledge, u * 0.85, 41, phase, hue(MINT, 0.75));
  ellipse(ctx, w * 0.34, h * (LEDGE + 0.18), w * 0.24, u * 5, gray(TONE.void));
  disc(ctx, w * 0.965, ledge - u * 27, u * 1.8, hue(PINK, wave(phase, 4) > 0 ? 1 : 0.72));
}

export const night: Scenery = {
  stand: { x: 0.34, y: 0.86 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    drawSky(ctx, w, h, u, phase);
    drawSkyline(ctx, w, h, u, phase);
    drawTower(ctx, w, h, u);
    drawRoof(ctx, w, h, u, phase);
    drawLights(ctx, w, h, u, phase);
    cast(ctx, 0, 0, w, h, VIOLET, 0.07);
  },
};
