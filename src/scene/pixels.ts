export type Pixels = readonly string[];
export type Palette = Readonly<Record<string, string>>;

export const AXOLOTL_PALETTE: Palette = {
  B: "#ee9a76",
  S: "#c8785a",
  E: "#2a1a1a",
  M: "#8a4a3a",
  H: "#3b5bb5",
  L: "#7c9df0",
  C: "#f4b3a0",
  G: "#f08aa8",
};

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
