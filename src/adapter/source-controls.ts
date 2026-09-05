import { applyLevel, clampSteps, LEVEL_STEP, readLevel } from "./source-volume.ts";

export type SourceControls = {
  playPause: () => void;
  previous: () => void;
  next: () => void;
  setLevel: (level: number) => void;
  nudge: (steps: number) => void;
  mute: () => void;
  level: () => number;
};

export type ControlSelectors = {
  playPause: readonly string[];
  previous: readonly string[];
  next: readonly string[];
  mute: readonly string[];
};

function isPressable(node: Element): boolean {
  if (node instanceof HTMLAnchorElement || node instanceof HTMLInputElement) {
    return false;
  }
  if (node instanceof HTMLButtonElement) {
    return !node.disabled;
  }
  return node.getAttribute("role") === "button" || node.tagName.endsWith("BUTTON");
}

function press(selectors: readonly string[]): boolean {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (node !== null && isPressable(node)) {
      (node as HTMLElement).click();
      return true;
    }
  }
  return false;
}

export function pageControls(selectors: ControlSelectors): SourceControls {
  let last = 1;
  return {
    playPause: () => {
      press(selectors.playPause);
    },
    previous: () => {
      press(selectors.previous);
    },
    next: () => {
      press(selectors.next);
    },
    setLevel(level) {
      last = applyLevel(document, level);
    },
    nudge(steps) {
      const next = readLevel(document, last) + clampSteps(steps) * LEVEL_STEP;
      last = applyLevel(document, next);
    },
    mute() {
      if (press(selectors.mute)) {
        last = readLevel(document, last);
        return;
      }
      const now = readLevel(document, last);
      last = applyLevel(document, now === 0 ? (last > 0 ? last : 0.5) : 0);
    },
    level: () => readLevel(document, last),
  };
}
