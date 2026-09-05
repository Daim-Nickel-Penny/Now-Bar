import glassCss from "./glass.css";
import type { ShellSize } from "./shell-variant.ts";

export function canOpenFloater(view: Window): boolean {
  return view.documentPictureInPicture !== undefined;
}

export async function requestFloaterWindow(view: Window, size: ShellSize): Promise<Window> {
  const pipApi = view.documentPictureInPicture;
  if (pipApi === undefined) {
    throw new Error("documentPictureInPicture unavailable");
  }
  const pip = await pipApi.requestWindow({
    width: size.width,
    height: size.height,
    disallowReturnToOpener: true,
  });
  const sheet = new (pip as Window & typeof globalThis).CSSStyleSheet();
  sheet.replaceSync(glassCss);
  pip.document.adoptedStyleSheets = [sheet];
  pip.document.documentElement.lang = "en";
  pip.document.title = "Now Bar";
  return pip;
}

export function resizeFloater(pip: Window, size: ShellSize): void {
  try {
    pip.resizeTo(size.width, size.height);
  } catch {
    // Chrome only honors resizeTo with a fresh gesture; the layout still fits any size.
  }
}
