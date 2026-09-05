import { parseOwnerMail } from "../mail/message.ts";
import { isMailboxSender } from "../mail/sender.ts";
import { createFloaterOwner } from "../owner/floater.ts";
import { createOpenOnPlay } from "../owner/open-on-play.ts";
import { createTriggerPill } from "../owner/trigger-pill.ts";
import { observePreferences, readPreferences } from "../preferences/preferences.ts";
import type { Track } from "../track/track.ts";
import { observeBar, postTrack } from "./observe-bar.ts";
import { pageControls, type ControlSelectors } from "./source-controls.ts";

export type AdapterSpec = {
  read: () => Track | null;
  controls: ControlSelectors;
};

export async function startAdapter(spec: AdapterSpec): Promise<void> {
  const preferences = await readPreferences();
  const owner = createFloaterOwner(window, pageControls(spec.controls), preferences);
  let requestOpen = (): void => undefined;
  const pill = createTriggerPill(() => requestOpen());
  const opener = createOpenOnPlay(window, owner, pill, preferences);
  requestOpen = opener.requestOpen;

  observePreferences((next) => {
    owner.setPreferences(next);
    opener.onPreferences(next);
  });

  observeBar(spec.read, (track) => {
    postTrack(track);
    owner.setTrack(track);
    opener.onTrack(track);
  });

  chrome.runtime.onMessage.addListener((input: unknown, sender) => {
    if (!isMailboxSender(sender.id, sender.tab?.id, chrome.runtime.id)) {
      return;
    }
    if (parseOwnerMail(input) !== null) {
      opener.requestOpen();
    }
  });
}
