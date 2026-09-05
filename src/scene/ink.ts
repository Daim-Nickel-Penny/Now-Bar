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

export type Rgb = readonly [number, number, number];

/** Pulled off assets/logo.png so Scenery accents sit next to the Axolotl instead of fighting it. */
export const PINK: Rgb = [255, 110, 175];
export const ROSE: Rgb = [216, 56, 111];
export const CYAN: Rgb = [120, 225, 255];
export const AMBER: Rgb = [255, 176, 88];
export const MINT: Rgb = [126, 226, 156];
export const VIOLET: Rgb = [166, 120, 255];

export function hue(rgb: Rgb, level: number): string {
  return tint(rgb[0], rgb[1], rgb[2], level);
}

export function poly(ctx: Canvas2D, points: ReadonlyArray<readonly [number, number]>, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const [i, [x, y]] of points.entries()) {
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
}

export function ellipse(ctx: Canvas2D, cx: number, cy: number, rx: number, ry: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fill();
}

/** A puff column on a per-puff loop, so it meets itself when `phase` wraps. */
export function steam(
  ctx: Canvas2D,
  x: number,
  y: number,
  u: number,
  phase: number,
  count: number,
  color: (level: number) => string,
): void {
  for (let i = 0; i < count; i += 1) {
    const life = (i / count + phase * 2) % 1;
    const drift = wave(life, 1, hash(i)) * u * 2.2;
    disc(ctx, x + (hash(i + 5) - 0.5) * u * 3 + drift, y - life * u * 15, u * (0.9 + life * 2.2), color(1 - life));
  }
}

/** A potted plant whose fronds lean on the phase. Anchored at the pot's bottom-centre. */
export function plant(
  ctx: Canvas2D,
  x: number,
  baseY: number,
  u: number,
  seed: number,
  phase: number,
  leaf: string,
): void {
  const potW = u * 7;
  const potH = u * 5;
  box(ctx, x - potW / 2, baseY - potH, potW, potH, gray(0.474));
  frame(ctx, x - potW / 2, baseY - potH, potW, potH, gray(0.816), u * 0.7);
  box(ctx, x - potW / 2 - u * 0.6, baseY - potH - u, potW + u * 1.2, u, gray(0.729));
  for (let i = 0; i < 7; i += 1) {
    const lean = (i / 6 - 0.5) * 2.2 + wave(phase, 1, seed + i * 0.12) * 0.16;
    const len = u * (5 + hash(seed + i) * 5);
    const tipX = x + Math.sin(lean) * len;
    const tipY = baseY - potH - u - Math.cos(lean) * len * 0.8;
    line(ctx, x, baseY - potH - u, tipX, tipY, leaf, u * 0.9);
    disc(ctx, tipX, tipY, u * 1.1, leaf);
  }
}

/** A curled cat, the one that keeps turning up in the collage. Anchored bottom-left. */
export function cat(ctx: Canvas2D, x: number, baseY: number, u: number, phase: number, color: string): void {
  const breathe = wave(phase, 2) * u * 0.3;
  ellipse(ctx, x + u * 7, baseY - u * 3 + breathe, u * 7.5, u * 3.4, color);
  disc(ctx, x + u * 2.6, baseY - u * 4.4, u * 3, color);
  poly(ctx, [
    [x + u * 0.4, baseY - u * 6.6],
    [x + u * 2, baseY - u * 6],
    [x + u * 1.2, baseY - u * 8.4],
  ], color);
  poly(ctx, [
    [x + u * 3.4, baseY - u * 6.8],
    [x + u * 5, baseY - u * 5.8],
    [x + u * 4.6, baseY - u * 8.6],
  ], color);
  const tail = wave(phase, 2) * u * 2;
  line(ctx, x + u * 13, baseY - u * 3, x + u * 16, baseY - u * 5 + tail, color, u * 1.4);
}

/** A four-point sparkle: two crossed spikes, the shape the logo uses for bubbles and glints. */
export function star(ctx: Canvas2D, cx: number, cy: number, r: number, color: string): void {
  poly(ctx, [
    [cx, cy - r],
    [cx + r * 0.28, cy - r * 0.28],
    [cx + r, cy],
    [cx + r * 0.28, cy + r * 0.28],
    [cx, cy + r],
    [cx - r * 0.28, cy + r * 0.28],
    [cx - r, cy],
    [cx - r * 0.28, cy - r * 0.28],
  ], color);
}

/** A hanging frame with a lit picture inside — cheap wall detail that survives asciify. */
export function picture(ctx: Canvas2D, x: number, y: number, w: number, h: number, u: number, level: number): void {
  box(ctx, x, y, w, h, gray(level * 0.5));
  frame(ctx, x, y, w, h, gray(0.904), u * 0.9);
  line(ctx, x + u, y + h * 0.6, x + w * 0.45, y + h * 0.25, gray(level), u * 0.8);
  line(ctx, x + w * 0.45, y + h * 0.25, x + w - u, y + h * 0.7, gray(level), u * 0.8);
  disc(ctx, x + w * 0.74, y + h * 0.28, u * 1.4, gray(0.937));
}

/**
 * A solid lit form: a filled body with a bright top edge and a dark base. Outlines alone turn into
 * one faint dot row, so anything that has to read as an object in the Scene is built from these.
 */
export function panel(ctx: Canvas2D, x: number, y: number, w: number, h: number, u: number, level: number): void {
  box(ctx, x, y, w, h, gray(level));
  box(ctx, x, y, w, u * 1.2, gray(Math.min(1, level + 0.35)));
  box(ctx, x, y + h - u, w, u, gray(level * 0.55));
  box(ctx, x, y, u * 1.2, h, gray(Math.min(1, level + 0.18)));
}

/** A horizontal surface seen edge-on: bright lip, shaded face. Counters, ledges, floors, shelves. */
export function slab(ctx: Canvas2D, x: number, y: number, w: number, h: number, u: number, level: number): void {
  box(ctx, x, y, w, h, gray(level * 0.6));
  box(ctx, x, y, w, u * 1.6, gray(Math.min(1, level + 0.3)));
}

/** Staggered courses. Reads as brick, tile, or paving depending on the size you hand it. */
export function courses(
  ctx: Canvas2D, x: number, y: number, w: number, h: number, cw: number, ch: number, u: number, level: number,
): void {
  let row = 0;
  for (let yy = y; yy < y + h; yy += ch) {
    const offset = row % 2 === 0 ? 0 : cw / 2;
    for (let xx = x - offset; xx < x + w; xx += cw) {
      const left = Math.max(x, xx);
      const width = Math.min(x + w, xx + cw - u * 0.8) - left;
      const height = Math.min(y + h, yy + ch - u * 0.8) - yy;
      if (width > 0 && height > 0) {
        box(ctx, left, yy, width, height, gray(level + hash(xx * 3 + yy) * 0.12));
      }
    }
    row += 1;
  }
}

/** A run of spines on a shelf, in colour. The room detail that survives being asciified. */
export function books(ctx: Canvas2D, x: number, y: number, w: number, u: number, seed: number, palette: readonly Rgb[]): void {
  let cursor = x;
  let i = 0;
  while (cursor < x + w - u) {
    const bw = u * (1.6 + hash(seed + i) * 1.8);
    const bh = u * (5 + hash(seed + i + 40) * 4);
    const lean = hash(seed + i + 80) > 0.85;
    const color = palette[Math.floor(hash(seed + i + 120) * palette.length)] ?? palette[0];
    if (color === undefined) {
      break;
    }
    if (lean) {
      poly(ctx, [
        [cursor, y],
        [cursor + bw, y],
        [cursor + bw + bh * 0.3, y - bh],
        [cursor + bh * 0.3, y - bh],
      ], hue(color, 0.85 + hash(seed + i + 9) * 0.4));
    } else {
      box(ctx, cursor, y - bh, bw, bh, hue(color, 0.85 + hash(seed + i + 9) * 0.4));
      box(ctx, cursor, y - bh, bw, u * 0.8, hue(color, 0.9));
    }
    cursor += bw + u * 0.5;
    i += 1;
  }
}

/**
 * The Scene is only about 76 x 46 ASCII cells, so shapes separate by tone, not by outline.
 * Neighbouring forms should sit at least one step apart on this scale.
 */
export const TONE = {
  void: 0.04,
  back: 0.34,
  mid: 0.52,
  near: 0.66,
  lit: 0.8,
  edge: 0.92,
  hot: 1,
} as const;

export function wash(ctx: Canvas2D, x: number, y: number, w: number, h: number, top: string, bottom: string): void {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/** A pool of light on a surface — the floor under a lamp, the counter under a window. */
/** A colour cast laid over a finished area — the fire's warmth, a window's cool. */
export function cast(ctx: Canvas2D, x: number, y: number, w: number, h: number, rgb: Rgb, level: number): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = hue(rgb, level);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

export function pool(ctx: Canvas2D, cx: number, cy: number, rx: number, ry: number, color: string): void {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}
