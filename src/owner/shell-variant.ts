export type ShellVariant = "expanded" | "pill" | "icon";

export type ShellSize = { width: number; height: number };

const SIZES: Record<ShellVariant, ShellSize> = {
  expanded: { width: 380, height: 230 },
  pill: { width: 300, height: 48 },
  icon: { width: 64, height: 64 },
};

/**
 * A floor for stored or dragged values only — it must stay under the smallest variant, or clamping
 * would inflate the icon. What is usable at a given size is a layout question, answered in glass.css.
 */
export const MIN_SIZE: ShellSize = { width: 48, height: 40 };
export const MAX_SIZE: ShellSize = { width: 1200, height: 800 };

export function isShellVariant(value: unknown): value is ShellVariant {
  return value === "expanded" || value === "pill" || value === "icon";
}

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

export function variantSize(variant: ShellVariant): ShellSize {
  return SIZES[variant];
}

export function clampSize(size: ShellSize): ShellSize {
  return {
    width: Math.round(Math.min(MAX_SIZE.width, Math.max(MIN_SIZE.width, size.width))),
    height: Math.round(Math.min(MAX_SIZE.height, Math.max(MIN_SIZE.height, size.height))),
  };
}
