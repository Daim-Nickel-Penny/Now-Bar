/** Air between the Axolotl's feet and the glass card, in CSS pixels. */
const AIR = 8;
/** The card may cover a lot of a short Floater; keep a usable stage. */
const MAX_FRAC = 0.45;
const MIN_STAGE = 72;

/**
 * How much of the Scene's CSS height is reserved for the card.
 * Pure so a layout read and the clamp stay testable apart.
 */
export function clampGutterCss(overlap: number, viewHeight: number): number {
  if (viewHeight <= 0 || overlap <= 0) {
    return 0;
  }
  const raw = overlap + AIR;
  const cap = Math.min(viewHeight * MAX_FRAC, Math.max(0, viewHeight - MIN_STAGE));
  return Math.round(Math.min(raw, cap));
}

/** Reads the live card once per layout pass, never on the paint hot path. */
export function sceneGutterCss(target: HTMLCanvasElement): number {
  const doc = target.ownerDocument;
  const shell = doc.getElementById("shell");
  if (shell?.dataset.variant !== "expanded") {
    return 0;
  }
  const card = doc.querySelector(".card");
  if (!(card instanceof HTMLElement) || card.offsetParent === null) {
    return 0;
  }
  const sceneBox = target.getBoundingClientRect();
  const cardBox = card.getBoundingClientRect();
  return clampGutterCss(sceneBox.bottom - cardBox.top, sceneBox.height);
}
