import { acceptAdapterMail, acceptPanelMail } from "./accept-mail.ts";
import { forgetSourceTab, readSource, writeNowPlaying, type SourceEntry } from "./session-now-playing.ts";
import { parseTrackReply, type NowPlayingReply, type OwnerMail, type PanelMail } from "../mail/message.ts";
import { assertNever } from "../mail/message.ts";
import type { Track } from "../track/track.ts";

const SOURCE_HOSTS = ["https://music.youtube.com/*", "https://open.spotify.com/*"];

async function ask(tabId: number, mail: OwnerMail): Promise<unknown> {
  return chrome.tabs.sendMessage(tabId, mail);
}

/**
 * The worker is evicted after a short idle and wakes with an empty session store, so a Panel opened
 * at the wrong moment used to report no music tab at all. Asking the matching tabs directly is the
 * authoritative answer; the session store is only a cache in front of it.
 */
async function pollSourceTabs(): Promise<SourceEntry | null> {
  let tabs: chrome.tabs.Tab[];
  try {
    tabs = await chrome.tabs.query({ url: SOURCE_HOSTS });
  } catch {
    return null;
  }
  const replies = await Promise.all(
    tabs.map(async (tab): Promise<SourceEntry | null> => {
      if (tab.id === undefined) {
        return null;
      }
      try {
        const reply = parseTrackReply(await ask(tab.id, { type: "reportTrack" }));
        if (reply === null) {
          await forgetSourceTab(tab.id);
          return null;
        }
        await writeNowPlaying(reply.track, reply.readable, tab.id);
        return { tabId: tab.id, track: reply.track, readable: reply.readable, at: Date.now() };
      } catch {
        await forgetSourceTab(tab.id);
        return null;
      }
    }),
  );
  return replies.some((entry) => entry !== null) ? readSource() : null;
}

async function currentSource(): Promise<SourceEntry | null> {
  const cached = await readSource();
  if (cached !== null && cached.track !== null) {
    return cached;
  }
  return (await pollSourceTabs()) ?? cached;
}

async function replyNowPlaying(): Promise<NowPlayingReply> {
  const source = await currentSource();
  return {
    type: "nowPlaying",
    track: source?.track ?? null,
    connected: source !== null,
    readable: source?.readable !== false,
  };
}

async function forwardOpenFloater(): Promise<void> {
  const source = await currentSource();
  if (source === null) {
    return;
  }
  try {
    const tab = await chrome.tabs.get(source.tabId);
    await ask(source.tabId, { type: "openFloater" });
    await chrome.tabs.update(source.tabId, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } catch {
    await forgetSourceTab(source.tabId);
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
  const track: Track | null = adapterMail.type === "track" ? adapterMail.track : null;
  void writeNowPlaying(track, adapterMail.type !== "unreadable", sender.tab?.id);
  return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void forgetSourceTab(tabId);
});

/**
 * Chrome does not re-inject content scripts into tabs that are already open, so after an install,
 * an update, or a Reload during development, every music tab is left running an orphaned adapter
 * that can only throw. Re-injecting here is what makes those tabs work again without a refresh.
 */
async function injectOpenSourceTabs(): Promise<void> {
  for (const script of chrome.runtime.getManifest().content_scripts ?? []) {
    const files = script.js ?? [];
    if (script.matches === undefined || files.length === 0) {
      continue;
    }
    const tabs = await chrome.tabs.query({ url: script.matches });
    await Promise.all(
      tabs.map(async (tab) => {
        if (tab.id === undefined) {
          return;
        }
        try {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files });
        } catch {
          // A tab mid-navigation or otherwise unreachable picks the adapter up on its next load.
        }
      }),
    );
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void injectOpenSourceTabs();
});
