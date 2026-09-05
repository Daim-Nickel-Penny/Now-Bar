export type Canvas2D = CanvasRenderingContext2D;

export const TAU = Math.PI * 2;

export function gray(level: number): string {
  const v = Math.round(Math.max(0, Math.min(1, level)) * 255);
  return `rgb(${v},${v},${v})`;
}

export function tint(r: number, g: number, b: number, level: number): string {
  const k = Math.max(0, Math.min(1, level));
  return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
}

export function wave(phase: number, cycles: number, offset = 0): number {
  return Math.sin(TAU * (phase * cycles + offset));
}

export function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function box(ctx: Canvas2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function frame(
  ctx: Canvas2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  width: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.strokeRect(x + width / 2, y + width / 2, w - width, h - width);
}

export function line(
  ctx: Canvas2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function disc(ctx: Canvas2D, cx: number, cy: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
}

export function ring(ctx: Canvas2D, cx: number, cy: number, r: number, color: string, width: number): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
}

export function glow(ctx: Canvas2D, cx: number, cy: number, r: number, color: string): void {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

export function arch(ctx: Canvas2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + w / 2);
  ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

export function shelf(ctx: Canvas2D, x: number, y: number, w: number, seed: number, color: string, unit: number): void {
  line(ctx, x, y, x + w, y, color, unit * 0.8);
  let cursor = x + unit;
  let i = 0;
  while (cursor < x + w - unit * 2) {
    const bw = unit * (1.2 + hash(seed + i) * 1.4);
    const bh = unit * (3 + hash(seed + i + 40) * 2.5);
    box(ctx, cursor, y - bh, bw, bh, gray(0.35 + hash(seed + i + 80) * 0.45));
    cursor += bw + unit * 0.4;
    i += 1;
  }
}
