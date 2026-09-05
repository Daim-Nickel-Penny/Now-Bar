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
  const media = root.querySelector<HTMLMediaElement>("video, audio");
  return media !== null && !media.paused && !media.ended;
}
