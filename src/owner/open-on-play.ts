import type { Preferences } from "../preferences/preferences.ts";
import type { Track } from "../track/track.ts";
import type { FloaterOwner } from "./floater.ts";
import type { TriggerPill } from "./trigger-pill.ts";

export type OpenOnPlay = {
  onTrack: (track: Track | null) => void;
  onPreferences: (next: Preferences) => void;
  requestOpen: () => void;
  dismissPill: () => void;
};

/** Chrome only grants `requestWindow` inside a live user gesture; without one, opening always fails. */
function hasActivation(view: Window): boolean {
  return view.navigator.userActivation?.isActive === true;
}

function trackKey(track: Track | null): string {
  return track === null ? "" : `${track.source}\u001f${track.title}\u001f${track.artist}`;
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
  let songKey = "";
  /** Closing the Floater is a decision: nothing reopens it until the pill or the Panel is used. */
  let closedByUser = false;
  /** Dismissing the pill only quiets it until the next song. */
  let pillHidden = false;

  function settle(): void {
    if (owner.isOpen() || !hasTrack || pillHidden) {
      pill.hide();
      return;
    }
    pill.show();
  }

  async function tryOpen(nudgeOnFail: boolean): Promise<void> {
    if (owner.isOpen()) {
      return;
    }
    const opened = hasActivation(view) ? await owner.open() : false;
    if (!opened && nudgeOnFail) {
      pillHidden = false;
      pill.nudge();
    }
    settle();
  }

  owner.onClose(() => {
    closedByUser = true;
    pillHidden = false;
    settle();
  });

  return {
    onTrack(track) {
      hasTrack = track !== null;
      const key = trackKey(track);
      if (key !== songKey) {
        songKey = key;
        pillHidden = false;
      }
      const playing = track?.playing === true;
      const started = playing && !wasPlaying;
      wasPlaying = playing;
      if (started && preferences.openOnPlay && !closedByUser && !owner.isOpen()) {
        void tryOpen(true);
        return;
      }
      settle();
    },
    onPreferences(next) {
      preferences = next;
    },
    requestOpen() {
      closedByUser = false;
      pillHidden = false;
      void tryOpen(true);
    },
    dismissPill() {
      pillHidden = true;
      settle();
    },
  };
}
