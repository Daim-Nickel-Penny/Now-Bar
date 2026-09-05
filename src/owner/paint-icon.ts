import { ICON_PATHS, type IconName } from "./icons.ts";

export type { IconName };

const SVG_NS = "http://www.w3.org/2000/svg";

/** Hugeicons Stroke Rounded: fill none, stroke currentColor, 1.5 on a 24 box. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.5",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

export function paintIcon(svg: SVGSVGElement, name: IconName): void {
  if (svg.dataset.icon === name) {
    return;
  }
  svg.dataset.icon = name;
  const doc = svg.ownerDocument;
  const nodes = ICON_PATHS[name].map((d) => {
    const path = doc.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", STROKE.fill);
    path.setAttribute("stroke", STROKE.stroke);
    path.setAttribute("stroke-width", STROKE["stroke-width"]);
    path.setAttribute("stroke-linecap", STROKE["stroke-linecap"]);
    path.setAttribute("stroke-linejoin", STROKE["stroke-linejoin"]);
    return path;
  });
  svg.replaceChildren(...nodes);
}

export function createIcon(doc: Document, name: IconName): SVGSVGElement {
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
