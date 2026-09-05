import { asciiOptions, renderAscii } from "./asciify-frame.ts";
import { SPRITE_H, SPRITE_W, drawAxolotl } from "./axolotl-sprite.ts";
import { firstScene, nextScene, type Scene } from "./playlist.ts";
import type { SceneId } from "./scene-id.ts";
import { sceneryFor } from "./scenery/by-scene.ts";
import type { AsciiStyle } from "../preferences/preferences.ts";

export type SceneLoopOptions = {
  style: AsciiStyle;
  active: readonly SceneId[];
  reducedMotion: boolean;
};

export type SceneLoop = {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  skip: () => void;
  update: (next: Partial<SceneLoopOptions>) => void;
  current: () => Scene;
};

const CELL_CSS_PX = 5;
const FRAME_MS = 50;
const HOLD_MS = 40000;
const FADE_MS = 400;
const SOURCE_SCALE = 4;
const BACKDROP = "#000";

/** asciify-engine probes the ancestor background of the canvas it paints to pick dark or light ink; the buffer sits hidden in the Floater with a black background so it always picks dark. */
function mountAsciiBuffer(target: HTMLCanvasElement): HTMLCanvasElement {
  const buffer = target.ownerDocument.createElement("canvas");
  buffer.hidden = true;
  buffer.style.backgroundColor = "#000";
  target.insertAdjacentElement("afterend", buffer);
  return buffer;
}

export function createSceneLoop(target: HTMLCanvasElement, initial: SceneLoopOptions): SceneLoop {
  const view = target.ownerDocument.defaultView ?? window;
  const source = document.createElement("canvas");
  const ascii = mountAsciiBuffer(target);
  let options = initial;
  let scene = firstScene(options.active);
  let sceneStart = 0;
  let lastFrame = 0;
  let running = false;
  let fading = false;
  let frameHandle = 0;

  function holdMs(): number {
    return Math.ceil(HOLD_MS / scene.loopMs) * scene.loopMs;
  }

  function fit(): boolean {
    const dpr = view.devicePixelRatio || 1;
    const width = Math.round(target.clientWidth * dpr);
    const height = Math.round(target.clientHeight * dpr);
    if (width === target.width && height === target.height) {
      return false;
    }
    target.width = width;
    target.height = height;
    ascii.width = width;
    ascii.height = height;
    return true;
  }

  function paint(now: number): void {
    const resized = fit();
    if (options.reducedMotion && !resized && lastFrame !== 0) {
      return;
    }
    const ctx = target.getContext("2d");
    if (ctx === null || target.width === 0) {
      return;
    }
    const dpr = view.devicePixelRatio || 1;
    const asciiOpts = asciiOptions(options.style, CELL_CSS_PX * dpr);
    const cols = Math.floor(target.width / asciiOpts.fontSize);
    source.width = Math.max(1, cols * SOURCE_SCALE);
    source.height = Math.max(1, Math.round((source.width * target.height) / target.width));
    const sourceCtx = source.getContext("2d");
    if (sourceCtx === null) {
      return;
    }
    const elapsed = options.reducedMotion ? 0 : now - sceneStart;
    const phase = (elapsed % scene.loopMs) / scene.loopMs;
    const scenery = sceneryFor(scene.id);
    sourceCtx.fillStyle = BACKDROP;
    sourceCtx.fillRect(0, 0, source.width, source.height);
    scenery.draw(sourceCtx, source.width, source.height, phase);
    const grid = renderAscii(source, ascii, asciiOpts);
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(ascii, 0, 0);
    if (grid === null) {
      return;
    }
    const col = Math.round((scenery.stand.x * target.width) / grid.cell) - Math.floor(SPRITE_W / 2);
    const row = Math.round((scenery.stand.y * target.height) / grid.cell) - SPRITE_H;
    drawAxolotl(ctx, grid.cell, col, row, elapsed / 500, scene.activity);
  }

  function advance(next: Scene): void {
    if (fading) {
      return;
    }
    fading = true;
    target.style.opacity = "0";
    view.setTimeout(() => {
      scene = next;
      sceneStart = view.performance.now();
      fading = false;
      lastFrame = 0;
      target.style.opacity = "1";
      if (!running) {
        paint(sceneStart);
      }
    }, FADE_MS);
  }

  function tick(now: number): void {
    if (!running) {
      return;
    }
    frameHandle = view.requestAnimationFrame(tick);
    if (now - lastFrame < FRAME_MS) {
      return;
    }
    if (!fading && now - sceneStart >= holdMs()) {
      advance(nextScene(scene.id, options.active));
    }
    paint(now);
    lastFrame = now;
  }

  return {
    current: () => scene,
    start() {
      if (running) {
        return;
      }
      running = true;
      sceneStart = view.performance.now();
      lastFrame = 0;
      target.style.transition = `opacity ${FADE_MS}ms ease`;
      target.style.opacity = "1";
      frameHandle = view.requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      view.cancelAnimationFrame(frameHandle);
    },
    dispose() {
      running = false;
      view.cancelAnimationFrame(frameHandle);
      ascii.remove();
    },
    skip() {
      advance(nextScene(scene.id, options.active));
    },
    update(next) {
      options = { ...options, ...next };
      lastFrame = 0;
      if (!options.active.includes(scene.id)) {
        advance(firstScene(options.active));
      }
    },
  };
}
