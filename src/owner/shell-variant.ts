import type { SceneLoop } from "../scene/loop.ts";

export type ShellVariant = "expanded" | "pill" | "icon";

const ORDER: readonly ShellVariant[] = ["expanded", "pill", "icon"];

const SIZES: Record<ShellVariant, { width: number; height: number }> = {
  expanded: { width: 360, height: 220 },
  pill: { width: 228, height: 40 },
  icon: { width: 56, height: 56 },
};

export function nextVariant(current: ShellVariant): ShellVariant {
  switch (current) {
    case "expanded":
      return "pill";
    case "pill":
      return "icon";
    case "icon":
      return "expanded";
    default: {
      const _never: never = current;
      return _never;
    }
  }
}

export function cycleShell(
  shell: HTMLElement,
  scenes: SceneLoop,
  current: ShellVariant,
): ShellVariant {
  const next = nextVariant(current);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (next !== "expanded") {
    scenes.stop();
  }
  shell.dataset.variant = next;
  if (next === "expanded") {
    void scenes.start();
  }
  const size = SIZES[next];
  if (window.documentPictureInPicture?.window) {
    return next;
  }
  void chrome.windows.getCurrent().then((win) => {
    if (win.id === undefined) {
      return;
    }
    void chrome.windows.update(win.id, {
      width: size.width,
      height: size.height,
    });
  });
  void reduced;
  return next;
}

export function variantOrder(): readonly ShellVariant[] {
  return ORDER;
}
