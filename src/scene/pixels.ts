export type Pixels = readonly string[];
export type Palette = Readonly<Record<string, string>>;

/** Pink body off assets/logo.png. Gills are the collage blue; headphones are black. */
export const AXOLOTL_PALETTE: Palette = {
  W: "#ffeaf3",
  B: "#fbcede",
  b: "#f2b9d0",
  S: "#e6a2c2",
  P: "#ff7fb0",
  C: "#ff9dc6",
  G: "#4d94ff",
  g: "#8ab6ff",
  R: "#2f68c8",
  E: "#33143a",
  M: "#8c2f57",
  H: "#141416",
  h: "#0a0a0c",
  L: "#2a2a30",
  N: "#ff77ad",
};

export function mirrorPixels(pixels: Pixels): Pixels {
  return pixels.map((line) => [...line].reverse().join(""));
}

export function recolor(pixels: Pixels, from: string, to: string): Pixels {
  return pixels.map((line) => line.replaceAll(from, to));
}

export function paintPixels(
  ctx: CanvasRenderingContext2D,
  pixels: Pixels,
  palette: Palette,
  cell: number,
  col: number,
  row: number,
): void {
  for (const [y, line] of pixels.entries()) {
    for (let x = 0; x < line.length; x += 1) {
      const color = palette[line[x] ?? "."];
      if (color === undefined) {
        continue;
      }
      const left = Math.round((col + x) * cell);
      const top = Math.round((row + y) * cell);
      ctx.fillStyle = color;
      ctx.fillRect(
        left,
        top,
        Math.round((col + x + 1) * cell) - left,
        Math.round((row + y + 1) * cell) - top,
      );
    }
  }
}
