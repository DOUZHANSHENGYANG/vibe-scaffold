import "#src/theme-sweep.css";
import { flushSync } from "react-dom";

// The theme sweep rides the View Transition API: light -> dark expands the
// dark view from the click point, dark -> light collapses it back into it.
// Browsers without the API and reduced-motion users switch instantly.
export const sweepTheme = (
  to: "light" | "dark",
  x: number,
  y: number,
  setTheme: (theme: "light" | "dark" | "system") => void
): void => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition === undefined || reduce) {
    setTheme(to);
    return;
  }
  const root = document.documentElement;
  const goingDark = to === "dark";
  // The view-transition stack paints the new snapshot above the old one. The
  // expand needs exactly that (the dark view grows over the light page); the
  // collapse shrinks the dark snapshot over the light view, so the old one
  // must be raised via the data-sweep CSS while the transition runs.
  if (!goingDark) {
    root.dataset.sweep = "collapse";
  }
  const transition = document.startViewTransition(() => {
    flushSync(() => {
      setTheme(to);
    });
  });
  const run = async (): Promise<void> => {
    try {
      await transition.ready;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      document.documentElement.animate(
        {
          clipPath: goingDark
            ? [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ]
            : [
                `circle(${radius}px at ${x}px ${y}px)`,
                `circle(0px at ${x}px ${y}px)`,
              ],
        },
        {
          duration: 450,
          easing: "cubic-bezier(0.33, 1, 0.68, 1)",
          pseudoElement: goingDark
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
        }
      );
      await transition.finished;
    } catch {
      // A newer transition took over; it owns the screen.
    } finally {
      delete root.dataset.sweep;
    }
  };
  void run();
};
