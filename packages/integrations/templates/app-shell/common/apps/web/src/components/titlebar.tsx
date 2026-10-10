import { useEffect, useState } from "react";

import {
  isDesktop,
  windowControls,
  type WindowControls,
} from "#src/lib/window.ts";

const controlButton =
  "flex h-full w-11 items-center justify-center text-sm hover:bg-accent transition-colors";

// The app's own titlebar: a drag region with window controls, rendered only
// inside Tauri (the native decorations are switched off for this shell); in a
// browser it renders nothing. The drag region appears before the controls do,
// so the window is never without any top strip.
export const Titlebar = () => {
  const [controls, setControls] = useState<WindowControls | undefined>();

  useEffect(() => {
    void windowControls().then(setControls);
  }, []);

  if (!isDesktop) {
    return null;
  }
  return (
    <div
      className="bg-background/80 backdrop-blur flex h-9 items-center"
      data-tauri-drag-region
    >
      {controls !== undefined && (
        <div className="ml-auto flex h-full">
          <button
            aria-label="Minimize"
            className={controlButton}
            onClick={() => {
              void controls.minimize();
            }}
            type="button"
          >
            ―
          </button>
          <button
            aria-label="Toggle maximize"
            className={controlButton}
            onClick={() => {
              void controls.toggleMaximize();
            }}
            type="button"
          >
            ▢
          </button>
          <button
            aria-label="Close"
            className={`${controlButton} hover:bg-destructive hover:text-white`}
            onClick={() => {
              void controls.close();
            }}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
