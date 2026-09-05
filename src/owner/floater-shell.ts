import type { ShellVariant } from "./shell-variant.ts";

export type FloaterShell = {
  root: HTMLElement;
  scene: HTMLCanvasElement;
  art: HTMLImageElement;
  artMini: HTMLImageElement;
  title: HTMLElement;
  artist: HTMLElement;
  bars: HTMLElement;
  prev: HTMLButtonElement;
  play: HTMLButtonElement;
  next: HTMLButtonElement;
  skipScene: HTMLButtonElement;
  collapse: HTMLButtonElement;
  close: HTMLButtonElement;
  expand: HTMLButtonElement;
};

const ICON = {
  prev: "M6 6h2v12H6zM20 6v12L9.5 12z",
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  next: "M16 6h2v12h-2zM4 6v12l10.5-6z",
  scene: "M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z",
  collapse: "M5 11h14v2H5z",
  close: "M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z",
} as const;

type IconName = keyof typeof ICON;

function icon(doc: Document, name: IconName): SVGSVGElement {
  const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", ICON[name]);
  svg.appendChild(path);
  return svg;
}

export function setIcon(button: HTMLButtonElement, name: IconName): void {
  const path = button.querySelector("path");
  path?.setAttribute("d", ICON[name]);
}

function iconButton(doc: Document, name: IconName, label: string, className: string): HTMLButtonElement {
  const button = doc.createElement("button");
  button.type = "button";
  button.className = `icon-button ${className}`;
  button.setAttribute("aria-label", label);
  button.appendChild(icon(doc, name));
  return button;
}

function element<K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag);
  node.className = className;
  return node;
}

export function buildFloaterShell(doc: Document, variant: ShellVariant): FloaterShell {
  const root = element(doc, "div", "");
  root.id = "shell";
  root.dataset.variant = variant;
  root.dataset.playing = "false";

  const scene = element(doc, "canvas", "scene");
  scene.setAttribute("aria-hidden", "true");
  const dim = element(doc, "div", "dim");

  const tools = element(doc, "div", "tools");
  const skipScene = iconButton(doc, "scene", "Next scene", "skip-scene");
  const collapse = iconButton(doc, "collapse", "Collapse", "collapse");
  const close = iconButton(doc, "close", "Close", "close");
  tools.append(skipScene, collapse, close);

  const card = element(doc, "div", "card");
  const art = element(doc, "img", "art");
  art.alt = "";
  art.decoding = "async";
  const meta = element(doc, "div", "meta");
  const title = element(doc, "p", "title");
  const artist = element(doc, "p", "artist");
  const bars = element(doc, "span", "bars");
  bars.append(doc.createElement("i"), doc.createElement("i"), doc.createElement("i"));
  const artistText = element(doc, "span", "artist-text");
  artist.append(bars, artistText);
  meta.append(title, artist);

  const transport = element(doc, "div", "transport");
  const prev = iconButton(doc, "prev", "Previous", "prev");
  const play = iconButton(doc, "play", "Play", "play");
  const next = iconButton(doc, "next", "Next", "next");
  transport.append(prev, play, next);
  card.append(art, meta, transport);

  const expand = element(doc, "button", "expand");
  expand.type = "button";
  expand.setAttribute("aria-label", "Expand");
  const artMini = element(doc, "img", "art-mini");
  artMini.alt = "";
  expand.appendChild(artMini);

  root.append(scene, dim, tools, card, expand);
  doc.body.appendChild(root);

  return {
    root,
    scene,
    art,
    artMini,
    title,
    artist: artistText,
    bars,
    prev,
    play,
    next,
    skipScene,
    collapse,
    close,
    expand,
  };
}
