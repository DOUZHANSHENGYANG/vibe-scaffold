import { useTheme } from "next-themes";

import { Button } from "@todo-app/ui/components/button";
import { cn } from "@todo-app/ui/lib/utils";

import { sweepTheme } from "#src/lib/theme-sweep.ts";
import { m } from "#src/paraglide/messages.js";

type Choice = "light" | "dark" | "system";
const choices: readonly Choice[] = ["light", "dark", "system"];

const labels = {
  dark: () => m.theme_dark(),
  light: () => m.theme_light(),
  system: () => m.theme_system(),
} as const;

// The settings-page theme choice. The quick toggle lives in the titlebar; this
// section shows which of the three choices is active. Light and dark sweep
// from the clicked button; system switches instantly (its resolution is not
// known until the theme applies).
export const ThemeSection = () => {
  const { setTheme, theme } = useTheme();
  const picked = (theme ?? "system") as Choice;

  return (
    <section id="theme">
      <h3 className="mb-1 text-sm font-medium">{m.settings_theme()}</h3>
      <p className="text-muted-foreground mb-3 text-sm">{m.settings_appearance_desc()}</p>
      <div className="flex gap-2">
        {choices.map((choice) => (
          <Button
            className={cn(picked === choice && "border-foreground")}
            key={choice}
            onClick={(event) => {
              if (choice === "system") {
                setTheme(choice);
                return;
              }
              sweepTheme(choice, event.clientX, event.clientY, setTheme);
            }}
            variant="outline"
          >
            {labels[choice]()}
          </Button>
        ))}
      </div>
    </section>
  );
};
