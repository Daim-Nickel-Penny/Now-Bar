import { isSceneId, SCENE_IDS, type SceneId } from "../scene/scene-id.ts";
import { isShellVariant, type ShellVariant } from "../owner/shell-variant.ts";

export type AsciiStyle = "dots" | "glyphs";

export type Preferences = {
  openOnPlay: boolean;
  asciiStyle: AsciiStyle;
  activeScenes: readonly SceneId[];
  cycleScenes: boolean;
  variant: ShellVariant;
};

export const DEFAULT_PREFERENCES: Preferences = {
  openOnPlay: true,
  asciiStyle: "dots",
  activeScenes: SCENE_IDS,
  cycleScenes: true,
  variant: "expanded",
};

const KEY = "preferences";

export function sanitizePreferences(input: unknown): Preferences {
  if (input === null || typeof input !== "object") {
    return DEFAULT_PREFERENCES;
  }
  const raw = input as Record<string, unknown>;
  return {
    openOnPlay:
      typeof raw.openOnPlay === "boolean" ? raw.openOnPlay : DEFAULT_PREFERENCES.openOnPlay,
    asciiStyle: isAsciiStyle(raw.asciiStyle) ? raw.asciiStyle : DEFAULT_PREFERENCES.asciiStyle,
    activeScenes: sanitizeScenes(raw.activeScenes),
    cycleScenes:
      typeof raw.cycleScenes === "boolean" ? raw.cycleScenes : DEFAULT_PREFERENCES.cycleScenes,
    variant: isShellVariant(raw.variant) ? raw.variant : DEFAULT_PREFERENCES.variant,
  };
}

export function isAsciiStyle(value: unknown): value is AsciiStyle {
  return value === "dots" || value === "glyphs";
}

function sanitizeScenes(value: unknown): readonly SceneId[] {
  if (!Array.isArray(value)) {
    return DEFAULT_PREFERENCES.activeScenes;
  }
  const scenes = SCENE_IDS.filter((id) => value.includes(id));
  return scenes.length === 0 ? DEFAULT_PREFERENCES.activeScenes : scenes;
}

export async function readPreferences(): Promise<Preferences> {
  const bag = await chrome.storage.local.get(KEY);
  return sanitizePreferences(bag[KEY]);
}

export async function writePreferences(next: Preferences): Promise<void> {
  await chrome.storage.local.set({ [KEY]: sanitizePreferences(next) });
}

export function observePreferences(onChange: (next: Preferences) => void): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>): void => {
    const change = changes[KEY];
    if (change === undefined) {
      return;
    }
    onChange(sanitizePreferences(change.newValue));
  };
  chrome.storage.local.onChanged.addListener(listener);
  return () => chrome.storage.local.onChanged.removeListener(listener);
}

export function isSceneActive(preferences: Preferences, id: unknown): boolean {
  return isSceneId(id) && preferences.activeScenes.includes(id);
}
