import { createIcon, type IconName } from "./paint-icon.ts";
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
  mute: HTMLButtonElement;
  level: HTMLInputElement;
  skipScene: HTMLButtonElement;
  collapse: HTMLButtonElement;
  close: HTMLButtonElement;
  expand: HTMLButtonElement;
};

function iconButton(doc: Document, name: IconName, label: string, className: string): HTMLButtonElement {
  const button = doc.createElement("button");
  button.type = "button";
  button.className = `icon-button ${className}`;
  button.setAttribute("aria-label", label);
  button.appendChild(createIcon(doc, name));
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
  const artistText = element(doc, "span", "artist-text");
  artist.append(bars, artistText);
  meta.append(title, artist);

  const transport = element(doc, "div", "transport");
  const prev = iconButton(doc, "previous", "Previous", "prev");
  const play = iconButton(doc, "play", "Play", "play");
  const next = iconButton(doc, "next", "Next", "next");
  const mute = iconButton(doc, "volumeHigh", "Mute", "mute");
  const level = element(doc, "input", "level-slider");
  level.type = "range";
  level.min = "0";
  level.max = "1";
  level.step = "0.05";
  level.value = "1";
  level.setAttribute("aria-label", "Volume");
  const volume = element(doc, "div", "level");
  volume.append(mute, level);
  transport.append(prev, play, next, volume);
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
    mute,
    level,
    skipScene,
    collapse,
    close,
    expand,
  };
}
