import { clampLevel } from "../adapter/source-volume.ts";
import type { FloaterShell } from "./floater-shell.ts";
import { setIcon, type IconName } from "./paint-icon.ts";

export function iconForLevel(level: number): IconName {
  const safe = clampLevel(level);
  if (safe <= 0) {
    return "mute";
  }
  if (safe < 0.4) {
    return "volumeLow";
  }
  return "volumeHigh";
}

export function paintLevel(shell: FloaterShell, level: number): void {
  const safe = clampLevel(level);
  const next = String(safe);
  if (shell.level.value !== next) {
    shell.level.value = next;
  }
  setIcon(shell.mute, iconForLevel(safe));
  shell.mute.setAttribute("aria-label", safe <= 0 ? "Unmute" : "Mute");
}
