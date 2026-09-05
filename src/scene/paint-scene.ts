import type { AsciiStyle } from "../preferences/preferences.ts";
import { asciiOptions, cellFor, renderAscii } from "./asciify-frame.ts";
import { SPRITE_H, SPRITE_W, drawAxolotl } from "./axolotl-sprite.ts";
import type { Scene } from "./playlist.ts";
import { sceneryFor } from "./scenery/by-scene.ts";

const CELL_CSS_PX = 3;
/** The Axolotl is painted, not asciified, so its pixel is a fixed size and does not follow the grid. */
const SPRITE_PX = 4.5;
/** Supersampling behind the dot grid. Three is enough to smooth edges at a third of the fill cost of four. */
const SOURCE_SCALE = 3;
const BACKDROP = "#000";

/**
 * asciify-engine probes the ancestor background of the canvas it paints to pick dark or light ink;
 * the buffer sits hidden in the Floater with a black background so it always picks dark.
 */
export function mountAsciiBuffer(target: HTMLCanvasElement): HTMLCanvasElement {
  const buffer = target.ownerDocument.createElement("canvas");
  buffer.hidden = true;
  buffer.style.backgroundColor = "#000";
  target.insertAdjacentElement("afterend", buffer);
  return buffer;
}

function extendFloor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, stage: number): void {
  if (stage >= canvas.height || stage < 1) {
    return;
  }
  ctx.drawImage(canvas, 0, stage - 1, canvas.width, 1, 0, stage, canvas.width, canvas.height - stage);
}

export function paintScene(
  target: HTMLCanvasElement,
  source: HTMLCanvasElement,
  ascii: HTMLCanvasElement,
  view: Window,
  scene: Scene,
  style: AsciiStyle,
  elapsed: number,
  gutterCss: number,
): void {
  const ctx = target.getContext("2d");
  if (ctx === null || target.width === 0 || target.height === 0) {
    return;
  }
  const dpr = view.devicePixelRatio || 1;
  const asciiOpts = asciiOptions(style, cellFor(style, CELL_CSS_PX) * dpr);
  const cols = Math.floor(target.width / asciiOpts.fontSize);
  if (cols <= 0) {
    return;
  }
  const width = Math.max(1, cols * SOURCE_SCALE);
  const height = Math.max(1, Math.round((width * target.height) / target.width));
  if (source.width !== width || source.height !== height) {
    source.width = width;
    source.height = height;
  }
  const sourceCtx = source.getContext("2d");
  if (sourceCtx === null) {
    return;
  }
  const phase = (elapsed % scene.loopMs) / scene.loopMs;
  const scenery = sceneryFor(scene.id);
  const gutter = Math.min(target.height - 1, Math.round(Math.max(0, gutterCss) * dpr));
  const stageFrac = gutter <= 0 ? 1 : (target.height - gutter) / target.height;
  const sourceStage = Math.max(1, Math.round(height * stageFrac));
  sourceCtx.fillStyle = BACKDROP;
  sourceCtx.fillRect(0, 0, width, height);
  scenery.draw(sourceCtx, width, sourceStage, phase);
  extendFloor(sourceCtx, source, sourceStage);
  const grid = renderAscii(source, ascii, asciiOpts);
  ctx.clearRect(0, 0, target.width, target.height);
  ctx.drawImage(ascii, 0, 0);
  if (grid === null) {
    return;
  }
  const stageH = Math.max(1, target.height - gutter);
  const spriteCell = SPRITE_PX * dpr;
  const col = Math.round((scenery.stand.x * target.width) / spriteCell) - Math.floor(SPRITE_W / 2);
  const row = Math.round((scenery.stand.y * stageH) / spriteCell) - SPRITE_H;
  drawAxolotl(ctx, spriteCell, col, row, elapsed / 500, scene.activity);
}
