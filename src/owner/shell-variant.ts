import type { SceneLoop } from "../scene/loop.ts";

export type ShellVariant = "expanded" | "pill" | "icon";

const SIZES: Record<ShellVariant, { width: number; height: number }> = {
  expanded: { width: 360, height: 220 },
  pill: { width: 300, height: 44 },
  icon: { width: 64, height: 64 },
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

export function applyVariant(
  shell: HTMLElement,
  scenes: SceneLoop,
  variant: ShellVariant,
): void {
  shell.dataset.variant = variant;
  if (variant === "expanded") {
    void scenes.start();
    return;
  }
  scenes.stop();
}

export function variantSize(variant: ShellVariant): { width: number; height: number } {
  return SIZES[variant];
}
