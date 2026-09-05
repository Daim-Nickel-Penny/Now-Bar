import { asciifyVideo } from "asciify-engine";
import { drawField, resizeField } from "./field-draw.ts";
import { drawPlate, resizePlate } from "./plate-draw.ts";
import { nextScene, sceneAt, type Scene } from "./playlist.ts";

type Stop = () => void;

const QUALITY = {
  fontSize: 5,
  renderMode: "dots" as const,
  colorMode: "fullcolor" as const,
  contrast: 1.15,
  brightness: 0.05,
};

export type SceneLoop = {
  start: () => Promise<void>;
  stop: () => void;
  skip: () => Promise<void>;
  current: () => Scene;
};

export function createSceneLoop(mount: HTMLElement): SceneLoop {
  let scene = sceneAt(0);
  let stopCurrent: Stop | undefined;
  let timer = 0;
  let running = false;

  async function play(next: Scene): Promise<void> {
    stopCurrent?.();
    scene = next;
    if (!running) {
      return;
    }
    stopCurrent = next.kind === "plate" ? await playPlate(mount, next) : await playField(mount, next);
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void play(nextScene(next.id));
    }, next.loopMs);
  }

  return {
    current: () => scene,
    start: async () => {
      running = true;
      await play(scene);
    },
    stop: () => {
      running = false;
      window.clearTimeout(timer);
      stopCurrent?.();
      stopCurrent = undefined;
      mount.replaceChildren();
    },
    skip: async () => {
      await play(nextScene(scene.id));
    },
  };
}

async function playPlate(mount: HTMLElement, scene: Scene): Promise<Stop> {
  const image = await loadPlate(scene.src);
  const source = document.createElement("canvas");
  const ctx = resizePlate(source);
  return driveVideo(mount, source, (time) => {
    drawPlate(ctx, image, scene.motion, time);
  });
}

async function playField(mount: HTMLElement, scene: Scene): Promise<Stop> {
  const source = document.createElement("canvas");
  const ctx = resizeField(source);
  return driveVideo(mount, source, (time) => {
    drawField(ctx, scene.id, time);
  });
}

function loadPlate(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("plate"));
    image.src = chrome.runtime.getURL(src);
  });
}

async function driveVideo(
  mount: HTMLElement,
  source: HTMLCanvasElement,
  draw: (time: number) => void,
): Promise<Stop> {
  const ascii = document.createElement("canvas");
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("aria-hidden", "true");
  video.style.position = "absolute";
  video.style.opacity = "0";
  video.style.pointerEvents = "none";
  video.style.width = "100%";
  video.style.height = "100%";
  ascii.style.width = "100%";
  ascii.style.height = "100%";
  mount.replaceChildren(video, ascii);

  let frame = 0;
  const started = performance.now();
  const tick = (now: number): void => {
    draw((now - started) / 1000);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  const stream = source.captureStream(18);
  video.srcObject = stream;
  await video.play();
  const stopAscii = await asciifyVideo(video, ascii, {
    fitTo: mount,
    options: QUALITY,
  });

  return () => {
    cancelAnimationFrame(frame);
    if (typeof stopAscii === "function") {
      stopAscii();
    }
    for (const track of stream.getTracks()) {
      track.stop();
    }
    video.srcObject = null;
  };
}
