import { useTheme } from "next-themes";
import { useState } from "react";

import { Button } from "@my-app/ui/components/button";
import { cn } from "@my-app/ui/lib/utils";

import { m } from "#/paraglide/messages.js";
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
  void transition.ready.then(() => {
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
  });
};

const labels = {
  dark: () => m.theme_dark(),
  light: () => m.theme_light(),
  system: () => m.theme_system(),
} as const;

// The settings-page theme picker with the diffusion switch.
export const ThemeToggle = () => {
  const { setTheme } = useTheme();
  const [picked, setPicked] = useState<Choice>("system");

  return (
    <div className="flex gap-2">
      {choices.map((choice) => (
        <Button
          className={cn(picked === choice && "border-foreground")}
          key={choice}
          onClick={(event) => {
            setPicked(choice);
            if (choice !== "system") {
              setTheme(choice);
              sweep(choice, event.clientX, event.clientY);
              return;
            }
            setTheme("system");
            sweep(
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light",
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
