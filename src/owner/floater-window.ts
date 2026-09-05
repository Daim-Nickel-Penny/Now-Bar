import glassCss from "./glass.css";
import { clampSize, type ShellSize } from "./shell-variant.ts";

const SIZE_KEY = "floaterSize";

export function canOpenFloater(view: Window): boolean {
  return view.documentPictureInPicture !== undefined;
}

/**
 * The size the user dragged the Floater to, kept apart from Preferences: it is a place the window
 * was left, not a choice made in the Panel. Never holds Track text.
 */
export async function readRememberedSize(): Promise<ShellSize | null> {
  try {
    const bag = await chrome.storage.local.get(SIZE_KEY);
    const value = bag[SIZE_KEY];
    if (value === null || typeof value !== "object") {
      return null;
    }
    const { width, height } = value as Record<string, unknown>;
    if (typeof width !== "number" || typeof height !== "number") {
      return null;
    }
    return clampSize({ width, height });
  } catch {
    return null;
  }
}

export function rememberSize(size: ShellSize): void {
  try {
    void chrome.storage.local.set({ [SIZE_KEY]: clampSize(size) }).catch(() => undefined);
  } catch {
    // Storage is gone with the extension context; the window keeps its size for this session.
  }
}

export async function requestFloaterWindow(view: Window, size: ShellSize): Promise<Window> {
  const pipApi = view.documentPictureInPicture;
  if (pipApi === undefined) {
    throw new Error("documentPictureInPicture unavailable");
  }
  const fitted = clampSize(size);
  const pip = await pipApi.requestWindow({
    width: fitted.width,
    height: fitted.height,
    disallowReturnToOpener: true,
  });
  const sheet = new (pip as Window & typeof globalThis).CSSStyleSheet();
  sheet.replaceSync(glassCss);
  pip.document.adoptedStyleSheets = [sheet];
  pip.document.documentElement.lang = "en";
  /**
   * Chrome draws its own title bar on a Document PiP window and paints the opener's origin in it,
   * not this title. That is deliberate anti-spoofing for an always-on-top window, so the bar cannot
   * be hidden, restyled, or renamed. The title is still the document's accessible name.
   */
  pip.document.title = "Now Bar";
  return pip;
}

export function resizeFloater(pip: Window, size: ShellSize): void {
  const fitted = clampSize(size);
  try {
    pip.resizeTo(fitted.width, fitted.height);
  } catch {
    // Chrome only honors resizeTo with a fresh gesture; the layout still fits any size.
  }
}
