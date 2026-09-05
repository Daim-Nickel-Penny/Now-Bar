import type { AsciiStyle } from "../preferences/preferences.ts";
import { mountAsciiBuffer, paintScene } from "./paint-scene.ts";
import { firstScene, nextScene, type Scene } from "./playlist.ts";
import { sceneGutterCss } from "./scene-gutter.ts";
import type { SceneId } from "./scene-id.ts";

export type SceneLoopOptions = {
  style: AsciiStyle;
  active: readonly SceneId[];
  reducedMotion: boolean;
  cycle: boolean;
  onScene?: (scene: Scene) => void;
};

export type SceneLoop = {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  skip: () => void;
  update: (next: Partial<SceneLoopOptions>) => void;
  current: () => Scene;
};

/**
 * Ambient scenery, not gameplay. Asciify allocates one cell record per grid square per frame, so
 * every frame skipped here is real GC pressure avoided; 15fps still reads as smooth drifting.
 */
const FRAME_MS = 66;
const HOLD_MS = 40000;
const FADE_MS = 400;

export function createSceneLoop(target: HTMLCanvasElement, initial: SceneLoopOptions): SceneLoop {
  const doc = target.ownerDocument;
  const view = doc.defaultView ?? window;
  const source = doc.createElement("canvas");
  const ascii = mountAsciiBuffer(target);
  let options = initial;
  let scene = firstScene(options.active);
  options.onScene?.(scene);
  let sceneStart = 0;
  let lastFrame = 0;
  let running = false;
  let fading = false;
  let frameHandle = 0;
  /** Set by the ResizeObserver so the hot path never reads layout. */
  let sizeDirty = true;
  let gutterCss = 0;

  const resizes = new ResizeObserver(() => {
    sizeDirty = true;
  });
  resizes.observe(target);
  const card = doc.querySelector(".card");
  if (card instanceof Element) {
    resizes.observe(card);
  }

  function holdMs(): number {
    return Math.ceil(HOLD_MS / scene.loopMs) * scene.loopMs;
  }

  function fit(): boolean {
    if (!sizeDirty) {
      return false;
    }
    sizeDirty = false;
    const nextGutter = sceneGutterCss(target);
    const gutterChanged = nextGutter !== gutterCss;
    gutterCss = nextGutter;
    const dpr = view.devicePixelRatio || 1;
    const width = Math.round(target.clientWidth * dpr);
    const height = Math.round(target.clientHeight * dpr);
    if (width === target.width && height === target.height) {
      return gutterChanged;
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
    const elapsed = options.reducedMotion ? 0 : now - sceneStart;
    paintScene(target, source, ascii, view, scene, options.style, elapsed, gutterCss);
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
      options.onScene?.(scene);
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
    if (options.cycle && !fading && now - sceneStart >= holdMs()) {
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
      const wasCycle = options.cycle;
      options = { ...options, ...next };
      lastFrame = 0;
      if (!options.active.includes(scene.id)) {
        advance(firstScene(options.active));
      } else if (options.cycle && !wasCycle) {
        sceneStart = view.performance.now();
      }
    },
  };
}
