import { pageMedia } from "./page-media.ts";

export function readText(root: ParentNode, selectors: readonly string[]): string {
  for (const selector of selectors) {
    const node = root.querySelector(selector);
    const text = node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (text !== "") {
      return text;
    }
  }
  return "";
}

export function readImageSrc(root: ParentNode, selectors: readonly string[]): string | null {
  for (const selector of selectors) {
    const node = root.querySelector<HTMLImageElement>(selector);
    const src = node?.currentSrc || node?.src || "";
    if (src.startsWith("https://")) {
      return src;
    }
  }
  return null;
}

function anyMediaPlaying(media: readonly HTMLMediaElement[]): boolean {
  return media.some((node) => !node.paused && !node.ended && node.readyState > 2);
}

/**
 * `aria-label` is translated, so "Pause" only answers the question in English. The media element
 * is the locale-independent truth and is only wrong while a track is still buffering, which is
 * when the button label is worth consulting.
 */
export function isPlaying(root: ParentNode, playPause: readonly string[]): boolean {
  const media = pageMedia(root);
  if (media.length > 0) {
    return anyMediaPlaying(media) || buttonSaysPause(root, playPause);
  }
  return buttonSaysPause(root, playPause);
}

export function buttonSaysPause(root: ParentNode, selectors: readonly string[]): boolean {
  for (const selector of selectors) {
    const button = root.querySelector<HTMLElement>(selector);
    if (button === null) {
      continue;
    }
    const state = button.getAttribute("aria-pressed") ?? button.dataset.playing;
    if (state === "true") {
      return true;
    }
    const label = (button.getAttribute("aria-label") ?? button.getAttribute("title") ?? "")
      .toLowerCase()
      .trim();
    if (label !== "") {
      return label.startsWith("pause");
    }
  }
  return false;
}
