import { DEFAULT_OPTIONS, imageToAsciiFrame, renderFrameToCanvas, type AsciiOptions } from "asciify-engine";
import type { AsciiStyle } from "../preferences/preferences.ts";

export type AsciiGrid = { cols: number; rows: number; cell: number };

const GLYPH_RAMP = " .,:;i1tfLCG08@";

/**
 * Dots stay readable on a fine grid, so the Scenery keeps its detail. A glyph has to be big enough
 * to tell one character from another, so that style gets a much coarser cell.
 */
export function cellFor(style: AsciiStyle, basePx: number): number {
  return style === "glyphs" ? basePx * 2.2 : basePx;
}

export function asciiOptions(style: AsciiStyle, cellPx: number): AsciiOptions {
  const shared: AsciiOptions = {
    ...DEFAULT_OPTIONS,
    fontSize: cellPx,
    charSpacing: 1,
    colorMode: "fullcolor",
    accentColor: "#ffffff",
    invert: false,
    brightness: 0.25,
    contrast: 0.15,
  };
  switch (style) {
    case "dots":
      return { ...shared, renderMode: "dots", charAspect: 1, dotSizeRatio: 0.9 };
    case "glyphs":
      return { ...shared, renderMode: "ascii", charAspect: 0.55, charset: GLYPH_RAMP };
    default: {
      const _never: never = style;
      return _never;
    }
  }
}

export function renderAscii(
  source: HTMLCanvasElement,
  target: HTMLCanvasElement,
  options: AsciiOptions,
): AsciiGrid | null {
  const ctx = target.getContext("2d");
  if (ctx === null || target.width === 0 || target.height === 0) {
    return null;
  }
  const { frame, cols, rows } = imageToAsciiFrame(source, options, target.width, target.height);
  if (cols === 0 || rows === 0) {
    ctx.clearRect(0, 0, target.width, target.height);
    return null;
  }
  renderFrameToCanvas(ctx, frame, options, target.width, target.height, 0);
  return { cols, rows, cell: target.width / cols };
}
