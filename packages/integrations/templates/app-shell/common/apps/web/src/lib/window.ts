// The browser stub of the window layer: the Tauri variant of this file, which
// the tauri set contributes in place of this one, wraps the real window API.
export const isDesktop = false;

export interface WindowControls {
  close(): Promise<void>;
  minimize(): Promise<void>;
  toggleMaximize(): Promise<void>;
}

export const windowControls = async (): Promise<WindowControls | undefined> =>
  undefined;
