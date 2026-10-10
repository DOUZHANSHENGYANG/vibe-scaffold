import { useTheme } from "next-themes";

import { Button } from "@my-app/ui/components/button";
import { cn } from "@my-app/ui/lib/utils";

import { m } from "#src/paraglide/messages.js";
import "./theme-transition.css";

type Choice = "light" | "dark" | "system";
const choices: readonly Choice[] = ["light", "dark", "system"];

// Sweeps the new theme in as a circle from the clicked point. Browsers without
// the View Transition API fall back to an instant switch.
const sweep = (next: "light" | "dark", x: number, y: number) => {
  const apply = () => {
    document.documentElement.classList.toggle("dark", next === "dark");
  };
  if (document.startViewTransition === undefined) {
    apply();
    return;
  }
  const transition = document.startViewTransition(apply);
  // A skipped transition (rapid clicks, a hidden document) rejects; ignore it.
  transition.ready
    .then(() => {
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {});
};

const labels = {
  dark: () => m.theme_dark(),
  light: () => m.theme_light(),
  system: () => m.theme_system(),
} as const;

// The settings-page theme picker with the diffusion switch. The selection
// follows next-themes, so the highlighted button always matches the theme
// another toggle may have set.
export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  const picked = (theme ?? "system") as Choice;

  return (
    <div className="flex gap-2">
      {choices.map((choice) => (
        <Button
          className={cn(picked === choice && "border-foreground")}
          key={choice}
          onClick={(event) => {
            setTheme(choice);
            sweep(
              choice === "system"
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? "dark"
                  : "light"
                : choice,
              event.clientX,
              event.clientY
            );
          }}
          variant="outline"
        >
          {labels[choice]()}
        </Button>
      ))}
    </div>
  );
};
