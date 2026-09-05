export function pageMedia(root: ParentNode): HTMLMediaElement[] {
  const found: HTMLMediaElement[] = [];
  for (const node of root.querySelectorAll("video, audio")) {
    if (
      (node instanceof HTMLVideoElement || node instanceof HTMLAudioElement) &&
      node.isConnected
    ) {
      found.push(node);
    }
  }
  return found;
}
