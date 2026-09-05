import { acceptAdapterMail, acceptOwnerMail } from "./accept-mail.ts";
import { readNowPlaying, writeNowPlaying } from "./session-now-playing.ts";

const OWNER_PATH = "owner/owner.html";
const OWNER_WIDTH = 360;
const OWNER_HEIGHT = 240;

let ownerWindowId: number | undefined;

async function openOwner(): Promise<void> {
  if (ownerWindowId !== undefined) {
    try {
      await chrome.windows.update(ownerWindowId, { focused: true });
      return;
    } catch {
      ownerWindowId = undefined;
    }
  }
  const created = await chrome.windows.create({
    url: chrome.runtime.getURL(OWNER_PATH),
    type: "popup",
    width: OWNER_WIDTH,
    height: OWNER_HEIGHT,
    focused: true,
  });
  ownerWindowId = created.id;
}

chrome.windows.onRemoved.addListener((id) => {
  if (id === ownerWindowId) {
    ownerWindowId = undefined;
  }
});

chrome.action.onClicked.addListener(() => {
  void openOwner();
});

chrome.runtime.onMessage.addListener((input: unknown, sender, sendResponse) => {
  const extensionOrigin = `chrome-extension://${chrome.runtime.id}`;
  const ownerMail = acceptOwnerMail(input, sender.url, extensionOrigin);
  if (ownerMail !== null) {
    void readNowPlaying().then((track) => {
      sendResponse({ type: "track", track });
    });
    return true;
  }
  const adapterMail = acceptAdapterMail(input, sender.url);
  if (adapterMail === null) {
    return false;
  }
  if (adapterMail.type === "idle") {
    void writeNowPlaying(null);
    return false;
  }
  void writeNowPlaying(adapterMail.track);
  return false;
});
