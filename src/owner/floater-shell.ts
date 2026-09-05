import { ICON_PATHS, type IconName } from "./icons.ts";
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

const SVG_NS = "http://www.w3.org/2000/svg";

/** Hugeicons glyphs are one to four stroked paths, so the count changes with the icon. */
function paintIcon(svg: SVGSVGElement, name: IconName): void {
  const doc = svg.ownerDocument;
  const paths = ICON_PATHS[name];
  while (svg.childNodes.length > paths.length) {
    svg.lastChild?.remove();
  }
  for (const [i, d] of paths.entries()) {
    let node = svg.childNodes[i] as SVGPathElement | undefined;
    if (node === undefined) {
      node = doc.createElementNS(SVG_NS, "path");
      svg.appendChild(node);
    }
    node.setAttribute("d", d);
  }
}

function icon(doc: Document, name: IconName): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  paintIcon(svg, name);
  return svg;
}

export function setIcon(button: HTMLButtonElement, name: IconName): void {
  const svg = button.querySelector("svg");
  if (svg !== null) {
    paintIcon(svg, name);
  }
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
  const prev = iconButton(doc, "previous", "Previous", "prev");
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
