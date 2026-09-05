import type { SourceControls } from "../adapter/source-controls.ts";
import type { SceneLoop } from "../scene/loop.ts";
import type { FloaterShell } from "./floater-shell.ts";
import { paintLevel } from "./paint-level.ts";
import type { ShellVariant } from "./shell-variant.ts";

export type FloaterActions = {
  controls: SourceControls;
  scenes: SceneLoop;
  setVariant: (next: ShellVariant | "cycle") => void;
  close: () => void;
};

function onClick(button: HTMLButtonElement, action: () => void): void {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    action();
  });
}

function syncLevel(shell: FloaterShell, controls: SourceControls): void {
  paintLevel(shell, controls.level());
}

export function bindFloaterControls(shell: FloaterShell, actions: FloaterActions): void {
  onClick(shell.prev, actions.controls.previous);
  onClick(shell.play, actions.controls.playPause);
  onClick(shell.next, actions.controls.next);
  onClick(shell.mute, () => {
    actions.controls.mute();
    const view = shell.root.ownerDocument.defaultView;
    if (view === null) {
      syncLevel(shell, actions.controls);
      return;
    }
    view.requestAnimationFrame(() => syncLevel(shell, actions.controls));
  });
  onClick(shell.skipScene, actions.scenes.skip);
  onClick(shell.collapse, () => actions.setVariant("cycle"));
  onClick(shell.expand, () => actions.setVariant("expanded"));
  onClick(shell.close, actions.close);
  shell.level.addEventListener("input", () => {
    const raw = Number(shell.level.value);
    actions.controls.setLevel(raw);
    syncLevel(shell, actions.controls);
  });
  shell.root.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "k") {
      event.preventDefault();
      actions.controls.playPause();
    } else if (event.key === "ArrowRight") {
      actions.controls.next();
    } else if (event.key === "ArrowLeft") {
      actions.controls.previous();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (event.target === shell.level) {
        return;
      }
      event.preventDefault();
      actions.controls.nudge(event.key === "ArrowUp" ? 1 : -1);
      syncLevel(shell, actions.controls);
    } else if (event.key === "Escape") {
      actions.close();
    }
  });
}
