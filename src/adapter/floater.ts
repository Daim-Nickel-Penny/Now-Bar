import { createSceneLoop } from "../scene/loop.ts";
import type { Track } from "../track/track.ts";

let pipWindow: Window | null = null;
let scenes: ReturnType<typeof createSceneLoop> | null = null;
let currentTrack: Track | null = null;

const RESIZE_OBSERVER_MSG = "ResizeObserver loop";

function isResizeObserverError(event: ErrorEvent): boolean {
  return event.message.includes(RESIZE_OBSERVER_MSG);
}

function suppressResizeObserverError(win: Window): void {
  win.addEventListener("error", (event) => {
    if (isResizeObserverError(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

export function initFloater(): void {
  suppressResizeObserverError(window);
  const button = createTriggerButton();
  document.body.appendChild(button);
  button.addEventListener("click", handleTriggerClick);
}

function createTriggerButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = "now-bar-trigger";
  button.setAttribute("aria-label", "Open Now Bar");
  button.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(20,20,22,0.8);
    backdrop-filter: blur(20px);
    cursor: pointer;
    z-index: 999999;
    display: grid;
    place-items: center;
    padding: 0;
  `;
  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL("icons/icon-48.png");
  icon.width = 28;
  icon.height = 28;
  icon.style.borderRadius = "50%";
  button.appendChild(icon);
  return button;
}

function handleTriggerClick(): void {
  if (pipWindow !== null && !pipWindow.closed) {
    pipWindow.focus();
    return;
  }
  if (!("documentPictureInPicture" in window)) {
    return;
  }
  window.documentPictureInPicture
    .requestWindow({
      width: 360,
      height: 220,
      disallowReturnToOpener: true,
    })
    .then((pip) => {
      pipWindow = pip;
      suppressResizeObserverError(pip);
      buildFloaterUI(pip);
      pip.addEventListener("pagehide", () => {
        pipWindow = null;
        scenes?.stop();
        scenes = null;
      });
    })
    .catch(() => undefined);
}

function buildFloaterUI(pip: Window): void {
  const doc = pip.document;
  doc.head.replaceChildren();
  doc.body.replaceChildren();
  doc.body.style.cssText = "margin:0;padding:0;overflow:hidden;background:#000;";

  const style = doc.createElement("style");
  style.textContent = getFloaterCSS();
  doc.head.appendChild(style);

  const shell = doc.createElement("div");
  shell.id = "shell";
  shell.dataset.variant = "expanded";

  const sceneRoot = doc.createElement("div");
  sceneRoot.className = "scene";
  shell.appendChild(sceneRoot);

  const dim = doc.createElement("div");
  dim.className = "scene-dim";
  shell.appendChild(dim);

  const card = buildCard(doc);
  shell.appendChild(card);

  const controls = buildControls(doc);
  shell.appendChild(controls);

  doc.body.appendChild(shell);

  scenes = createSceneLoop(sceneRoot);
  void scenes.start();

  bindControls(doc, pip);
  updateTrackUI(doc);
}

function buildCard(doc: Document): HTMLElement {
  const card = doc.createElement("div");
  card.className = "card";

  const art = doc.createElement("img");
  art.id = "art";
  art.alt = "";
  art.width = 44;
  art.height = 44;
  card.appendChild(art);

  const meta = doc.createElement("div");
  meta.className = "meta";

  const title = doc.createElement("p");
  title.id = "title";
  meta.appendChild(title);

  const artist = doc.createElement("p");
  artist.id = "artist";
  meta.appendChild(artist);

  card.appendChild(meta);
  return card;
}

function buildControls(doc: Document): HTMLElement {
  const controls = doc.createElement("div");
  controls.className = "controls";

  const buttons: Array<{ action: string; label: string; path: string }> = [
    { action: "prev", label: "Previous", path: "M6 6h2v12H6zM20 6v12L9.5 12z" },
    { action: "play", label: "Play or pause", path: "M8 5v14l11-7z" },
    { action: "next", label: "Next", path: "M16 6h2v12h-2zM4 6v12l10.5-6z" },
    { action: "scene", label: "Next scene", path: "M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" },
    { action: "collapse", label: "Collapse", path: "M6 11h12v2H6z" },
    { action: "close", label: "Close", path: "M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z" },
  ];

  for (const { action, label, path } of buttons) {
    const btn = doc.createElement("button");
    btn.className = action === "play" ? "icon-btn play" : "icon-btn";
    btn.dataset.action = action;
    btn.setAttribute("aria-label", label);
    btn.type = "button";

    const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");

    const pathEl = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    pathEl.setAttribute("d", path);
    svg.appendChild(pathEl);
    btn.appendChild(svg);
    controls.appendChild(btn);
  }

  return controls;
}

function bindControls(doc: Document, pip: Window): void {
  const shell = doc.querySelector<HTMLElement>("#shell");
  if (shell === null) {
    return;
  }

  doc.querySelectorAll(".icon-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = (e.currentTarget as HTMLElement).dataset.action;
      switch (action) {
        case "play":
          togglePlayback();
          break;
        case "scene":
          void scenes?.skip();
          break;
        case "collapse":
          collapseShell(shell);
          break;
        case "close":
          pip.close();
          break;
        case "prev":
        case "next":
          break;
      }
    });
  });

  shell.querySelector(".scene")?.addEventListener("click", () => {
    if (shell.dataset.variant === "expanded") {
      void scenes?.skip();
    }
  });
}

function collapseShell(shell: HTMLElement): void {
  const current = shell.dataset.variant;
  const next = current === "expanded" ? "pill" : current === "pill" ? "icon" : "expanded";
  shell.dataset.variant = next;
  if (next === "expanded") {
    void scenes?.start();
  } else {
    scenes?.stop();
  }
}

function togglePlayback(): void {
  const media = document.querySelector<HTMLMediaElement>("video, audio");
  if (media === null) {
    return;
  }
  if (media.paused) {
    void media.play();
  } else {
    media.pause();
  }
}

function updateTrackUI(doc: Document): void {
  const title = doc.querySelector("#title");
  const artist = doc.querySelector("#artist");
  const art = doc.querySelector<HTMLImageElement>("#art");
  if (title === null || artist === null || art === null) {
    return;
  }

  if (currentTrack === null) {
    title.textContent = "Nothing playing";
    artist.textContent = "";
    art.removeAttribute("src");
    return;
  }
  title.textContent = currentTrack.title;
  artist.textContent = currentTrack.artist;
  if (currentTrack.artworkUrl) {
    art.src = currentTrack.artworkUrl;
  }
}

export function setTrack(track: Track | null): void {
  currentTrack = track;
  if (pipWindow !== null && !pipWindow.closed) {
    updateTrackUI(pipWindow.document);
  }
}

function getFloaterCSS(): string {
  return `
    @font-face {
      font-family: Poppins;
      font-weight: 500;
      src: url("${chrome.runtime.getURL("fonts/poppins-500.woff2")}") format("woff2");
    }
    @font-face {
      font-family: Poppins;
      font-weight: 600;
      src: url("${chrome.runtime.getURL("fonts/poppins-600.woff2")}") format("woff2");
    }
    :root {
      --ink: #f5f5f7;
      --ink-dim: rgba(245,245,247,0.6);
      --glass: rgba(20,20,22,0.5);
      --stroke: rgba(255,255,255,0.18);
      --spec: rgba(255,255,255,0.35);
    }
    * { box-sizing: border-box; margin: 0; }
    #shell {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 20px;
      overflow: hidden;
      font-family: Poppins, ui-sans-serif, system-ui, sans-serif;
      color: var(--ink);
    }
    .scene, .scene-dim { position: absolute; inset: 0; }
    .scene-dim {
      background: linear-gradient(to top, rgba(0,0,0,0.6), transparent 45%);
      pointer-events: none;
    }
    .card {
      position: absolute;
      left: 12px; bottom: 12px; right: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 16px;
      background: var(--glass);
      border: 1px solid var(--stroke);
      box-shadow: inset 0 1px 0 var(--spec), 0 8px 24px rgba(0,0,0,0.3);
      backdrop-filter: blur(24px) saturate(1.4);
    }
    #art {
      width: 44px; height: 44px;
      border-radius: 10px;
      object-fit: cover;
      background: #1c1c1e;
      flex: 0 0 auto;
    }
    .meta { min-width: 0; }
    #title, #artist {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.25;
    }
    #title { font-weight: 600; font-size: 13px; }
    #artist { font-size: 11px; color: var(--ink-dim); }
    .controls {
      position: absolute;
      left: 12px; bottom: 68px;
      display: flex;
      gap: 6px;
      padding: 6px;
      border-radius: 999px;
      background: var(--glass);
      border: 1px solid var(--stroke);
      backdrop-filter: blur(24px) saturate(1.4);
    }
    .icon-btn {
      display: grid;
      place-items: center;
      width: 30px; height: 30px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--ink);
      cursor: pointer;
    }
    .icon-btn:hover { background: rgba(255,255,255,0.12); }
    .icon-btn svg { width: 16px; height: 16px; fill: currentColor; }
    .icon-btn.play { background: var(--ink); color: #000; }
    #shell[data-variant="pill"] .scene,
    #shell[data-variant="pill"] .scene-dim,
    #shell[data-variant="pill"] .controls,
    #shell[data-variant="pill"] #artist,
    #shell[data-variant="icon"] .scene,
    #shell[data-variant="icon"] .scene-dim,
    #shell[data-variant="icon"] .controls,
    #shell[data-variant="icon"] .card { display: none; }
    #shell[data-variant="pill"] .card {
      inset: 0;
      border-radius: 999px;
      padding: 4px 10px 4px 4px;
    }
    #shell[data-variant="pill"] #art {
      width: 32px; height: 32px;
      border-radius: 50%;
    }
    #shell[data-variant="icon"] { border-radius: 50%; }
    #shell[data-variant="icon"] .card {
      display: grid;
      place-items: center;
      inset: 0;
      padding: 0;
      border-radius: 50%;
    }
    #shell[data-variant="icon"] #art {
      width: 48px; height: 48px;
      border-radius: 50%;
    }
    #shell[data-variant="icon"] .meta { display: none; }
    @media (prefers-reduced-transparency: reduce) {
      .card, .controls { background: #1c1c1e; backdrop-filter: none; }
    }
  `;
}
