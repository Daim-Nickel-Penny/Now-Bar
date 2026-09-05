import { asciiOptions, cellFor, renderAscii } from "./asciify-frame.ts";
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

const CELL_CSS_PX = 3;
/** The Axolotl is painted, not asciified, so its pixel is a fixed size and does not follow the grid. */
const SPRITE_PX = 4.5;
/**
 * Ambient scenery, not gameplay. Asciify allocates one cell record per grid square per frame, so
 * every frame skipped here is real GC pressure avoided; 15fps still reads as smooth drifting.
 */
const FRAME_MS = 66;
/** Supersampling behind the dot grid. Three is enough to smooth edges at a third of the fill cost of four. */
const SOURCE_SCALE = 3;
const HOLD_MS = 40000;
const FADE_MS = 400;
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
  const doc = target.ownerDocument;
  const view = doc.defaultView ?? window;
  const source = doc.createElement("canvas");
  const ascii = mountAsciiBuffer(target);
  let options = initial;
  let scene = firstScene(options.active);
  let sceneStart = 0;
  let lastFrame = 0;
  let running = false;
  let fading = false;
  let frameHandle = 0;
  /** Set by the ResizeObserver so the hot path never reads layout. */
  let sizeDirty = true;

  const resizes = new ResizeObserver(() => {
    sizeDirty = true;
  });
  resizes.observe(target);

  function holdMs(): number {
    return Math.ceil(HOLD_MS / scene.loopMs) * scene.loopMs;
  }

  function fit(): boolean {
    if (!sizeDirty) {
      return false;
    }
    sizeDirty = false;
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
    if (ctx === null || target.width === 0 || target.height === 0) {
      return;
    }
    const dpr = view.devicePixelRatio || 1;
    const asciiOpts = asciiOptions(options.style, cellFor(options.style, CELL_CSS_PX) * dpr);
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
    const elapsed = options.reducedMotion ? 0 : now - sceneStart;
    const phase = (elapsed % scene.loopMs) / scene.loopMs;
    const scenery = sceneryFor(scene.id);
    sourceCtx.fillStyle = BACKDROP;
    sourceCtx.fillRect(0, 0, width, height);
    scenery.draw(sourceCtx, width, height, phase);
    const grid = renderAscii(source, ascii, asciiOpts);
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(ascii, 0, 0);
    if (grid === null) {
      return;
    }
    const spriteCell = SPRITE_PX * dpr;
    const col = Math.round((scenery.stand.x * target.width) / spriteCell) - Math.floor(SPRITE_W / 2);
    const row = Math.round((scenery.stand.y * target.height) / spriteCell) - SPRITE_H;
    drawAxolotl(ctx, spriteCell, col, row, elapsed / 500, scene.activity);
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

  function begin(): void {
    if (running) {
      return;
    }
    running = true;
    lastFrame = 0;
    frameHandle = view.requestAnimationFrame(tick);
  }

  function halt(): void {
    running = false;
    view.cancelAnimationFrame(frameHandle);
  }

  /** A minimised or fully occluded Floater should cost nothing at all. */
  let wanted = false;
  function sync(): void {
    if (wanted && !doc.hidden) {
      begin();
    } else {
      halt();
    }
  }
  doc.addEventListener("visibilitychange", sync);

  return {
    current: () => scene,
    start() {
      wanted = true;
      sceneStart = view.performance.now();
      target.style.transition = `opacity ${FADE_MS}ms ease`;
      target.style.opacity = "1";
      sync();
    },
    stop() {
      wanted = false;
      sync();
    },
    dispose() {
      wanted = false;
      halt();
      resizes.disconnect();
      doc.removeEventListener("visibilitychange", sync);
      ascii.remove();
      source.width = 0;
      source.height = 0;
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
