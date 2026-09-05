export type TriggerPill = {
  show: () => void;
  hide: () => void;
  nudge: () => void;
};

const PILL_ID = "now-bar-trigger";

const PILL_STYLE = [
  "position:fixed",
  "right:20px",
  "bottom:96px",
  "z-index:2147483646",
  "display:none",
  "align-items:center",
  "gap:8px",
  "height:36px",
  "padding:0 14px 0 8px",
  "border-radius:999px",
  "border:1px solid rgba(255,255,255,0.16)",
  "background:rgba(18,18,20,0.82)",
  "color:#f5f5f7",
  "font:600 12px/1 -apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif",
  "box-shadow:0 8px 24px rgba(0,0,0,0.4)",
  "backdrop-filter:blur(16px)",
  "cursor:pointer",
  "transition:transform 160ms ease,opacity 160ms ease",
].join(";");

export function createTriggerPill(onOpen: () => void): TriggerPill {
  const button = document.createElement("button");
  button.id = PILL_ID;
  button.type = "button";
  button.setAttribute("aria-label", "Open Now Bar floater");
  button.style.cssText = PILL_STYLE;

  const logo = document.createElement("img");
  logo.src = chrome.runtime.getURL("icons/icon-48.png");
  logo.alt = "";
  logo.width = 22;
  logo.height = 22;
  logo.style.cssText = "border-radius:50%;display:block";

  const label = document.createElement("span");
  label.textContent = "Now Bar";
  button.append(logo, label);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onOpen();
  });
  document.documentElement.appendChild(button);

  return {
    show: () => {
      button.style.display = "inline-flex";
    },
    hide: () => {
      button.style.display = "none";
    },
    nudge: () => {
      button.style.display = "inline-flex";
      button.style.transform = "scale(1.08)";
      window.setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 180);
    },
  };
}
