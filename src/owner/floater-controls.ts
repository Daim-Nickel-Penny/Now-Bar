import type { SourceControls } from "../adapter/source-controls.ts";
import type { SceneLoop } from "../scene/loop.ts";
import type { FloaterShell } from "./floater-shell.ts";
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

export function bindFloaterControls(shell: FloaterShell, actions: FloaterActions): void {
  onClick(shell.prev, actions.controls.previous);
  onClick(shell.play, actions.controls.playPause);
  onClick(shell.next, actions.controls.next);
  onClick(shell.skipScene, actions.scenes.skip);
  onClick(shell.collapse, () => actions.setVariant("cycle"));
  onClick(shell.expand, () => actions.setVariant("expanded"));
  onClick(shell.close, actions.close);
  shell.root.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "k") {
      event.preventDefault();
      actions.controls.playPause();
    } else if (event.key === "ArrowRight") {
      actions.controls.next();
    } else if (event.key === "ArrowLeft") {
      actions.controls.previous();
    } else if (event.key === "Escape") {
      actions.close();
    }
  });
}
