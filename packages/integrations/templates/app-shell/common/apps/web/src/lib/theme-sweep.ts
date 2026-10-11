import "#src/theme-sweep.css";
import { flushSync } from "react-dom";

// The theme sweep rides the View Transition API: light -> dark expands the
// dark view from the click point, dark -> light collapses it back into it.
// Browsers without the API and reduced-motion users switch instantly.
export const sweepTheme = (
  to: "light" | "dark",
  x: number,
  y: number,
  setTheme: (theme: "light" | "dark" | "system") => void,
) => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) {
    setTheme(to);
    return;
  }
  const transition = document.startViewTransition(() => {
    flushSync(() => setTheme(to));
  });
  const goingDark = to === "dark";
  void transition.ready
    .then(() => {
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      document.documentElement.animate(
        {
          clipPath: goingDark
            ? [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]
            : [`circle(${radius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`],
        },
        {
          duration: 450,
          easing: "cubic-bezier(0.33, 1, 0.68, 1)",
          pseudoElement: goingDark ? "::view-transition-new(root)" : "::view-transition-old(root)",
        },
      );
    })
    .catch(() => {
      // A newer transition took over; it owns the screen.
    });
};
