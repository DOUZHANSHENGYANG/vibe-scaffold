// The window API exists only inside Tauri; everything here degrades to no-ops
// in a plain browser, so the titlebar component can render unconditionally.
const inTauri = "__TAURI_INTERNALS__" in globalThis;

export const isDesktop = inTauri;

export interface WindowControls {
  close(): Promise<void>;
  minimize(): Promise<void>;
  toggleMaximize(): Promise<void>;
}

export const windowControls = async (): Promise<WindowControls | undefined> => {
  if (!inTauri) {
    return undefined;
  }
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const window = getCurrentWindow();
  return {
    close: () => window.close(),
    minimize: () => window.minimize(),
    toggleMaximize: () => window.toggleMaximize(),
  };
};
