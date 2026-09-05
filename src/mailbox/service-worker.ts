import { acceptAdapterMail, acceptPanelMail } from "./accept-mail.ts";
import { forgetSourceTab, readNowPlaying, readSourceTabId, writeNowPlaying } from "./session-now-playing.ts";
import type { NowPlayingReply, OwnerMail, PanelMail } from "../mail/message.ts";
import { assertNever } from "../mail/message.ts";

async function replyNowPlaying(): Promise<NowPlayingReply> {
  const [track, tabId] = await Promise.all([readNowPlaying(), readSourceTabId()]);
  return { type: "nowPlaying", track, connected: tabId !== null };
}

async function forwardOpenFloater(): Promise<void> {
  const tabId = await readSourceTabId();
  if (tabId === null) {
    return;
  }
  const mail: OwnerMail = { type: "openFloater" };
  try {
    const tab = await chrome.tabs.get(tabId);
    await chrome.tabs.sendMessage(tabId, mail);
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } catch {
    await forgetSourceTab(tabId);
  }
}

function handlePanelMail(mail: PanelMail, sendResponse: (reply: NowPlayingReply) => void): boolean {
  switch (mail.type) {
    case "requestTrack":
      void replyNowPlaying().then(sendResponse);
      return true;
    case "openFloater":
      void forwardOpenFloater().then(replyNowPlaying).then(sendResponse);
      return true;
    default:
      return assertNever(mail);
  }
}

chrome.runtime.onMessage.addListener((input: unknown, sender, sendResponse) => {
  const extensionOrigin = `chrome-extension://${chrome.runtime.id}`;
  const panelMail = acceptPanelMail(input, sender.url, extensionOrigin);
  if (panelMail !== null) {
    return handlePanelMail(panelMail, sendResponse);
  }
  const adapterMail = acceptAdapterMail(input, sender.url);
  if (adapterMail === null) {
    return false;
  }
  void writeNowPlaying(adapterMail.type === "track" ? adapterMail.track : null, sender.tab?.id);
  return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void forgetSourceTab(tabId);
});
