import { useEffect, useState } from "react";

import { isDesktop, windowControls, type WindowControls } from "#src/lib/window.ts";

const controlButton =
  "flex h-full w-11 items-center justify-center text-sm hover:bg-accent transition-colors";

// The app's own titlebar: a drag region with window controls, rendered only
// inside Tauri (the native decorations are switched off for this shell); in a
// browser it renders nothing.
export const Titlebar = () => {
  const [controls, setControls] = useState<WindowControls | undefined>();

  useEffect(() => {
    void windowControls().then(setControls);
  }, []);

  if (!isDesktop || controls === undefined) {
    return null;
  }
  return (
    <div
      className="bg-background/80 backdrop-blur fixed inset-x-0 top-0 z-50 flex h-9 items-center"
      data-tauri-drag-region
    >
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
    </div>
  );
};
