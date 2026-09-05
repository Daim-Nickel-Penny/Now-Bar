import type { SourceControls } from "../adapter/source-controls.ts";
import type { Preferences } from "../preferences/preferences.ts";
import { createSceneLoop, type SceneLoop } from "../scene/loop.ts";
import type { Track } from "../track/track.ts";
import { bindFloaterControls } from "./floater-controls.ts";
import { buildFloaterShell, type FloaterShell } from "./floater-shell.ts";
import {
  canOpenFloater,
  readRememberedSize,
  rememberSize,
  requestFloaterWindow,
  resizeFloater,
} from "./floater-window.ts";
import { paintNowPlaying } from "./paint-now-playing.ts";
import { attachPlayingBars, type PlayingBars } from "./playing-bars.ts";
import { nextVariant, variantSize, type ShellSize, type ShellVariant } from "./shell-variant.ts";

export type FloaterOwner = {
  open: () => Promise<boolean>;
  isOpen: () => boolean;
  setTrack: (track: Track | null) => void;
  setPreferences: (next: Preferences) => void;
  onClose: (listener: () => void) => void;
};

type Live = {
  pip: Window;
  shell: FloaterShell;
  scenes: SceneLoop;
  variant: ShellVariant;
  bars: PlayingBars;
};

const RESIZE_SETTLE_MS = 500;

export function createFloaterOwner(
  view: Window,
  controls: SourceControls,
  initial: Preferences,
): FloaterOwner {
  let preferences = initial;
  let track: Track | null = null;
  let live: Live | null = null;
  let opening = false;
  /**
   * Only the card variant is user-sizeable; the pill and icon are fixed shapes. Loaded up front,
   * never awaited inside `open`: `requestWindow` has to be reached while the click is still the
   * current user activation, and any await before it spends that gesture.
   */
  let expandedSize: ShellSize | null = null;
  void readRememberedSize().then((size) => {
    expandedSize ??= size;
  });
  const closeListeners: Array<() => void> = [];

  function sizeFor(variant: ShellVariant): ShellSize {
    return variant === "expanded" ? (expandedSize ?? variantSize(variant)) : variantSize(variant);
  }

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
    resizeFloater(live.pip, sizeFor(next));
  }

  function mount(pip: Window): Live {
    const shell = buildFloaterShell(pip.document, preferences.variant);
    const scenes = createSceneLoop(shell.scene, {
      style: preferences.asciiStyle,
      active: preferences.activeScenes,
      reducedMotion: pip.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    const bars = attachPlayingBars(shell.bars);
    const next: Live = { pip, shell, scenes, variant: preferences.variant, bars };
    bindFloaterControls(shell, {
      controls,
      scenes,
      close: () => pip.close(),
      setVariant: (target) => applyVariant(target === "cycle" ? nextVariant(next.variant) : target),
    });
    /** Dragging the window is the user setting a size; keep it for the next time it opens. */
    let settle = 0;
    pip.addEventListener("resize", () => {
      if (next.variant !== "expanded") {
        return;
      }
      pip.clearTimeout(settle);
      settle = pip.setTimeout(() => {
        const size = { width: pip.innerWidth, height: pip.innerHeight };
        if (size.width > 0 && size.height > 0) {
          expandedSize = size;
          rememberSize(size);
        }
      }, RESIZE_SETTLE_MS);
    });

    pip.addEventListener("pagehide", () => {
      pip.clearTimeout(settle);
      scenes.dispose();
      bars.dispose();
      live = null;
      for (const listener of closeListeners) {
        listener();
      }
    });
    paintNowPlaying(shell, track);
    bars.setPlaying(track?.playing === true);
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
        const pip = await requestFloaterWindow(view, sizeFor(preferences.variant));
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
        live.bars.setPlaying(track?.playing === true);
      }
    },
    setPreferences(next) {
      preferences = next;
      live?.scenes.update({ style: next.asciiStyle, active: next.activeScenes });
    },
  };
}
