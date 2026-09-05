import type { SourceControls } from "../adapter/source-controls.ts";
import type { Preferences } from "../preferences/preferences.ts";
import { createSceneLoop, type SceneLoop } from "../scene/loop.ts";
import type { Track } from "../track/track.ts";
import { bindFloaterControls } from "./floater-controls.ts";
import { buildFloaterShell, type FloaterShell } from "./floater-shell.ts";
import { canOpenFloater, requestFloaterWindow, resizeFloater } from "./floater-window.ts";
import { paintNowPlaying } from "./paint-now-playing.ts";
import { nextVariant, variantSize, type ShellVariant } from "./shell-variant.ts";

export type FloaterOwner = {
  open: () => Promise<boolean>;
  isOpen: () => boolean;
  setTrack: (track: Track | null) => void;
  setPreferences: (next: Preferences) => void;
  onClose: (listener: () => void) => void;
};

type Live = { pip: Window; shell: FloaterShell; scenes: SceneLoop; variant: ShellVariant };

export function createFloaterOwner(
  view: Window,
  controls: SourceControls,
  initial: Preferences,
): FloaterOwner {
  let preferences = initial;
  let track: Track | null = null;
  let live: Live | null = null;
  let opening = false;
  const closeListeners: Array<() => void> = [];

  function applyVariant(next: ShellVariant): void {
    if (live === null) {
      return;
    }
    live.variant = next;
    live.shell.root.dataset.variant = next;
    if (next === "expanded") {
      live.scenes.start();
    } else {
      live.scenes.stop();
    }
    resizeFloater(live.pip, variantSize(next));
  }

  function mount(pip: Window): Live {
    const shell = buildFloaterShell(pip.document, preferences.variant);
    const scenes = createSceneLoop(shell.scene, {
      style: preferences.asciiStyle,
      active: preferences.activeScenes,
      reducedMotion: pip.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    const next: Live = { pip, shell, scenes, variant: preferences.variant };
    bindFloaterControls(shell, {
      controls,
      scenes,
      close: () => pip.close(),
      setVariant: (target) => applyVariant(target === "cycle" ? nextVariant(next.variant) : target),
    });
    pip.addEventListener("pagehide", () => {
      scenes.dispose();
      live = null;
      for (const listener of closeListeners) {
        listener();
      }
    });
    paintNowPlaying(shell, track);
    if (preferences.variant === "expanded") {
      scenes.start();
    }
    return next;
  }

  return {
    isOpen: () => live !== null,
    onClose: (listener) => {
      closeListeners.push(listener);
    },
    async open() {
      if (live !== null) {
        live.pip.focus();
        return true;
      }
      if (opening || !canOpenFloater(view)) {
        return false;
      }
      opening = true;
      try {
        const pip = await requestFloaterWindow(view, variantSize(preferences.variant));
        live = mount(pip);
        return true;
      } catch {
        return false;
      } finally {
        opening = false;
      }
    },
    setTrack(next) {
      track = next;
      if (live !== null) {
        paintNowPlaying(live.shell, track);
      }
    },
    setPreferences(next) {
      preferences = next;
      live?.scenes.update({ style: next.asciiStyle, active: next.activeScenes });
    },
  };
}
