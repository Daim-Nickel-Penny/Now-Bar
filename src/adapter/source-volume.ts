import { pageMedia } from "./page-media.ts";

export const LEVEL_STEP = 0.1;

/** Fail closed: junk becomes silence, never a blast. */
export function clampLevel(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return Math.round(value * 100) / 100;
}

/** One notch only. A wild caller cannot jump the tab to full or empty in one step. */
export function clampSteps(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  if (value > 0) {
    return 1;
  }
  if (value < 0) {
    return -1;
  }
  return 0;
}

export function readLevel(root: ParentNode, fallback: number): number {
  const media = pageMedia(root);
  if (media.length === 0) {
    return clampLevel(fallback);
  }
  if (media.every((node) => node.muted)) {
    return 0;
  }
  const audible = media.find((node) => !node.muted) ?? media[0];
  return clampLevel(audible?.volume);
}

/**
 * Set loudness on the Owner document's own media elements only.
 * Never writes page form fields or dispatches input/change on the Source UI.
 */
export function applyLevel(root: ParentNode, value: unknown): number {
  const level = clampLevel(value);
  for (const node of pageMedia(root)) {
    node.muted = level === 0;
    if (level > 0) {
      node.volume = level;
    }
  }
  return level;
}
