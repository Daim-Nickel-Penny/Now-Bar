import type { Preferences } from "../preferences/preferences.ts";
import type { Track } from "../track/track.ts";
import type { FloaterOwner } from "./floater.ts";
import type { TriggerPill } from "./trigger-pill.ts";

export type OpenOnPlay = {
  onTrack: (track: Track | null) => void;
  onPreferences: (next: Preferences) => void;
  requestOpen: () => void;
};

function hasActivation(view: Window): boolean {
  return view.navigator.userActivation?.isActive === true;
}

export function createOpenOnPlay(
  view: Window,
  owner: FloaterOwner,
  pill: TriggerPill,
  initial: Preferences,
): OpenOnPlay {
  let preferences = initial;
  let wasPlaying = false;
  let hasTrack = false;
  let dismissed = false;

  function settle(): void {
    if (owner.isOpen() || !hasTrack) {
      pill.hide();
      return;
    }
    pill.show();
  }

  async function tryOpen(): Promise<void> {
    if (owner.isOpen()) {
      return;
    }
    const opened = hasActivation(view) ? await owner.open() : false;
    if (!opened) {
      pill.nudge();
    }
    settle();
  }

  owner.onClose(() => {
    dismissed = true;
    settle();
  });

  return {
    onTrack(track) {
      hasTrack = track !== null;
      const playing = track?.playing === true;
      const started = playing && !wasPlaying;
      wasPlaying = playing;
      if (started && preferences.openOnPlay && !dismissed && !owner.isOpen()) {
        void tryOpen();
        return;
      }
      settle();
    },
    onPreferences(next) {
      preferences = next;
    },
    requestOpen() {
      dismissed = false;
      void tryOpen();
    },
  };
}
