export type TriggerPill = {
  show: () => void;
  hide: () => void;
  nudge: () => void;
  remove: () => void;
};

const PILL_ID = "now-bar-trigger";

/**
 * The page is not ours, so the pill carries every value it needs inline and claims one id.
 * `all: initial` keeps the host page's button and reset rules from reaching it.
 */
const PILL_STYLE = [
  "all: initial",
  "position: fixed",
  "right: 20px",
  "bottom: 96px",
  "z-index: 2147483646",
  "display: none",
  "align-items: center",
  "gap: 8px",
  "height: 38px",
  "padding: 0 6px 0 6px",
  "border-radius: 999px",
  "border: 1px solid rgba(255,255,255,0.16)",
  "background: rgba(18,18,20,0.86)",
  "color: #f5f5f7",
  "font: 600 12px/1 -apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif",
  "box-shadow: 0 10px 30px rgba(0,0,0,0.45)",
  "backdrop-filter: blur(16px) saturate(1.4)",
  "cursor: pointer",
  "opacity: 0",
  "transform: translateY(6px) scale(0.96)",
  "transition: opacity 180ms ease, transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
].join(";");

const LOGO_STYLE = "width:26px;height:26px;border-radius:50%;display:block;flex:0 0 auto";
const LABEL_STYLE = "padding-right:4px;letter-spacing:-0.01em;white-space:nowrap";
const DISMISS_STYLE = [
  "all: initial",
  "display: grid",
  "place-items: center",
  "width: 22px",
  "height: 22px",
  "margin-right: 2px",
  "border-radius: 50%",
  "color: rgba(245,245,247,0.6)",
  "font: 500 14px/1 -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  "cursor: pointer",
].join(";");

export function createTriggerPill(onOpen: () => void, onDismiss: () => void): TriggerPill {
  const host = document.createElement("div");
  host.id = PILL_ID;
  const root = host.attachShadow({ mode: "closed" });

  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Open Now Bar");
  button.style.cssText = PILL_STYLE;

  const logo = document.createElement("img");
  logo.alt = "";
  logo.width = 26;
  logo.height = 26;
  logo.style.cssText = LOGO_STYLE;
  try {
    logo.src = chrome.runtime.getURL("icons/icon-48.png");
  } catch {
    // An orphaned content script cannot resolve extension URLs; the pill still reads as a label.
    logo.remove();
  }

  const label = document.createElement("span");
  label.textContent = "Now Bar";
  label.style.cssText = LABEL_STYLE;

  const dismiss = document.createElement("span");
  dismiss.textContent = "\u00d7";
  dismiss.setAttribute("role", "button");
  dismiss.setAttribute("aria-label", "Hide until the next track");
  dismiss.style.cssText = DISMISS_STYLE;

  button.append(logo, label, dismiss);
  root.appendChild(button);
  document.documentElement.appendChild(host);

  let shown = false;

  function paint(next: boolean): void {
    shown = next;
    button.style.display = next ? "inline-flex" : "none";
    button.style.opacity = next ? "1" : "0";
    button.style.transform = next ? "translateY(0) scale(1)" : "translateY(6px) scale(0.96)";
  }

  dismiss.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    paint(false);
    onDismiss();
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onOpen();
  });

  return {
    show: () => {
      if (!shown) {
        paint(true);
      }
    },
    hide: () => {
      if (shown) {
        paint(false);
      }
    },
    nudge: () => {
      paint(true);
      button.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.07)" }, { transform: "scale(1)" }],
        { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      );
    },
    remove: () => host.remove(),
  };
}
