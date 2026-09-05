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

export function mediaPlaying(root: ParentNode): boolean {
  for (const media of root.querySelectorAll<HTMLMediaElement>("video, audio")) {
    if (!media.paused && !media.ended && media.readyState > 2) {
      return true;
    }
  }
  return false;
}

export function buttonSaysPause(root: ParentNode, selectors: readonly string[]): boolean {
  for (const selector of selectors) {
    const button = root.querySelector<HTMLElement>(selector);
    const label = (button?.getAttribute("aria-label") ?? button?.getAttribute("title") ?? "").toLowerCase();
    if (label !== "") {
      return label.startsWith("pause");
    }
  }
  return false;
}
