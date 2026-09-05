import { arch, box, disc, frame, glow, gray, hash, line, tint, wave, type Canvas2D } from "../ink.ts";
import type { Scenery } from "./scenery.ts";

function drawWindow(ctx: Canvas2D, w: number, h: number, u: number): void {
  const x = w * 0.06;
  const y = h * 0.1;
  const ww = w * 0.24;
  const wh = h * 0.34;
  box(ctx, x, y, ww, wh, gray(0.1));
  frame(ctx, x, y, ww, wh, gray(0.85), u * 1.1);
  line(ctx, x + ww / 2, y, x + ww / 2, y + wh, gray(0.7), u * 0.8);
  line(ctx, x, y + wh / 2, x + ww, y + wh / 2, gray(0.7), u * 0.8);
  disc(ctx, x + ww * 0.72, y + wh * 0.28, u * 2.2, gray(0.6));
  line(ctx, x - u, y + wh + u, x + ww + u, y + wh + u, gray(0.5), u * 0.8);
}

function drawFire(ctx: Canvas2D, x: number, base: number, u: number, phase: number): void {
  const tongues = [
    { dx: -u * 4, cycles: 6, height: u * 9 },
    { dx: 0, cycles: 8, height: u * 13 },
    { dx: u * 4, cycles: 10, height: u * 8 },
  ];
  glow(ctx, x, base - u * 4, u * 20, tint(255, 150, 60, 0.35 + 0.08 * wave(phase, 4)));
  for (const [i, tongue] of tongues.entries()) {
    const flicker = 0.75 + 0.25 * wave(phase, tongue.cycles, i * 0.3);
    const height = tongue.height * flicker;
    ctx.fillStyle = tint(255, 170 + i * 20, 70, 0.95);
    ctx.beginPath();
    ctx.moveTo(x + tongue.dx - u * 2.4, base);
    ctx.quadraticCurveTo(x + tongue.dx - u * 2.8, base - height * 0.5, x + tongue.dx, base - height);
    ctx.quadraticCurveTo(x + tongue.dx + u * 2.8, base - height * 0.5, x + tongue.dx + u * 2.4, base);
    ctx.fill();
  }
  for (let i = 0; i < 4; i += 1) {
    const life = (hash(i) + phase * 2) % 1;
    disc(ctx, x + (hash(i + 9) - 0.5) * u * 10, base - u * 8 - life * u * 14, u * 0.7, tint(255, 200, 120, 1 - life));
  }
}

function drawFireplace(ctx: Canvas2D, w: number, h: number, u: number, phase: number): void {
  const x = w * 0.6;
  const y = h * 0.3;
  const fw = w * 0.32;
  const fh = h * 0.52;
  frame(ctx, x, y, fw, fh, gray(0.8), u * 1.2);
  for (let row = 0; row < 6; row += 1) {
    const yy = y + u * 2 + row * (fh / 6.6);
    for (let col = 0; col < 5; col += 1) {
      const offset = row % 2 === 0 ? 0 : fw / 10;
      const xx = x + u * 1.5 + col * (fw / 5) + offset;
      if (xx + fw / 5 - u * 2 < x + fw - u) {
        frame(ctx, xx, yy, fw / 5 - u * 2, fh / 6.6 - u * 1.5, gray(0.28), u * 0.6);
      }
    }
  }
  const ax = x + fw * 0.2;
  const aw = fw * 0.6;
  arch(ctx, ax, y + fh * 0.25, aw, fh * 0.75, gray(0.03));
  ctx.save();
  ctx.beginPath();
  ctx.rect(ax, y + fh * 0.25, aw, fh * 0.75);
  ctx.clip();
  drawFire(ctx, ax + aw / 2, y + fh - u * 1.5, u, phase);
  ctx.restore();
  box(ctx, ax - u * 1.5, y + fh - u * 2, aw + u * 3, u * 1.2, gray(0.45));
  line(ctx, x - u * 2, y, x + fw + u * 2, y, gray(0.9), u * 1.4);
  frame(ctx, x + fw * 0.4, y - h * 0.14, fw * 0.2, h * 0.12, gray(0.6), u * 0.8);
  disc(ctx, x + fw * 0.5, y - h * 0.08, u * 2.4, gray(0.35));
  box(ctx, x + fw * 0.08, y - u * 5, u * 3, u * 5, gray(0.5));
  disc(ctx, x + fw * 0.08 + u * 1.5, y - u * 6, u * 2.6, gray(0.35));
}

function drawArmchair(ctx: Canvas2D, w: number, h: number, u: number): void {
  const x = w * 0.14;
  const seatY = h * 0.72;
  box(ctx, x, h * 0.44, w * 0.26, seatY - h * 0.44, gray(0.32));
  frame(ctx, x, h * 0.44, w * 0.26, seatY - h * 0.44, gray(0.7), u * 0.9);
  box(ctx, x - u * 3, seatY - u * 5, w * 0.32, u * 9, gray(0.4));
  frame(ctx, x - u * 3, seatY - u * 5, w * 0.32, u * 9, gray(0.75), u * 0.9);
  box(ctx, x + u, seatY + u * 4, u * 2.5, u * 5, gray(0.5));
  box(ctx, x + w * 0.26 - u * 5, seatY + u * 4, u * 2.5, u * 5, gray(0.5));
}

export const hearth: Scenery = {
  stand: { x: 0.27, y: 0.7 },
  draw(ctx, w, h, phase) {
    const u = w / 100;
    drawWindow(ctx, w, h, u);
    drawFireplace(ctx, w, h, u, phase);
    line(ctx, 0, h * 0.82, w, h * 0.82, gray(0.55), u * 0.8);
    for (let i = 0; i < 6; i += 1) {
      box(ctx, w * 0.5 + i * u * 5, h * 0.84, u * 3, u * 3, gray(i % 2 === 0 ? 0.25 : 0.4));
    }
    drawArmchair(ctx, w, h, u);
    disc(ctx, w * 0.5, h * 0.62, u * 2, gray(0.55));
    line(ctx, w * 0.5, h * 0.62, w * 0.5, h * 0.82, gray(0.5), u * 0.9);
    box(ctx, w * 0.46, h * 0.56, u * 8, u * 3, gray(0.65));
  },
};
