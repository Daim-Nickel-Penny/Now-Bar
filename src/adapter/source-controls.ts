export type SourceControls = {
  playPause: () => void;
  previous: () => void;
  next: () => void;
};

export type ControlSelectors = {
  playPause: readonly string[];
  previous: readonly string[];
  next: readonly string[];
};

function press(selectors: readonly string[]): void {
  for (const selector of selectors) {
    const button = document.querySelector<HTMLElement>(selector);
    if (button !== null) {
      button.click();
      return;
    }
  }
}

export function pageControls(selectors: ControlSelectors): SourceControls {
  return {
    playPause: () => press(selectors.playPause),
    previous: () => press(selectors.previous),
    next: () => press(selectors.next),
  };
}
