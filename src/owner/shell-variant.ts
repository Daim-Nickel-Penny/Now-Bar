export type ShellVariant = "expanded" | "pill" | "icon";

export type ShellSize = { width: number; height: number };

const SIZES: Record<ShellVariant, ShellSize> = {
  expanded: { width: 380, height: 230 },
  pill: { width: 300, height: 48 },
  icon: { width: 64, height: 64 },
};

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
