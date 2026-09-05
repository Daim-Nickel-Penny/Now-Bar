import { TONE, box, disc, gray, hash, wash } from "./ink.ts";

const CELL_CSS_PX = 3;

export type FalseScreen = { dispose: () => void };

/** Dimmer toward the lip, brighter toward the bottom, so the glass sits on dust not a flat fill. */
export function speckLevel(col: number, row: number, rows: number): number | null {
  const n = hash(row * 131 + col * 17);
  if (n < 0.42) {
    return null;
  }
  const depth = 0.2 + 0.8 * (row / Math.max(1, rows - 1));
  return 0.1 + 0.16 * depth * n;
}

/**
 * A still, scene-agnostic dust field. Painted only on resize so the Scene loop never shares a frame
 * with the band the glass sits on.
 */
export function paintFalseScreen(target: HTMLCanvasElement, view: Window): void {
  const ctx = target.getContext("2d");
  if (ctx === null || target.width === 0 || target.height === 0) {
    return;
  }
  const dpr = view.devicePixelRatio || 1;
  const { width: w, height: h } = target;
  wash(ctx, 0, 0, w, h, gray(0.07), gray(TONE.void));
  const cell = CELL_CSS_PX * dpr;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const level = speckLevel(col, row, rows);
      if (level === null) {
        continue;
      }
      disc(ctx, col * cell + cell * 0.5, row * cell + cell * 0.5, cell * 0.16, gray(level));
    }
  }
  box(ctx, 0, 0, w, Math.max(1, dpr), gray(0.12));
}

export function attachFalseScreen(target: HTMLCanvasElement): FalseScreen {
  const view = target.ownerDocument.defaultView ?? window;
  function fit(): void {
    const dpr = view.devicePixelRatio || 1;
    const width = Math.round(target.clientWidth * dpr);
    const height = Math.round(target.clientHeight * dpr);
    if (width === 0 || height === 0) {
      return;
    }
    if (target.width !== width || target.height !== height) {
      target.width = width;
      target.height = height;
    }
    paintFalseScreen(target, view);
  }
  const resizes = new ResizeObserver(fit);
  resizes.observe(target);
  fit();
  return {
    dispose() {
      resizes.disconnect();
    },
  };
}
