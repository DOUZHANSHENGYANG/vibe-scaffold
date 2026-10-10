import { Button } from "@todo-app/ui/components/button";
import { cn } from "@todo-app/ui/lib/utils";

import { m } from "#src/paraglide/messages.js";
import { setLocale } from "#src/paraglide/runtime.js";
import { getLocale } from "#src/paraglide/runtime.js";

// The language choice: switching here re-renders the app's messages in place.
export const LanguageSection = () => {
  const current = getLocale();

  return (
    <section id="language">
      <h3 className="mb-1 text-sm font-medium">{m.settings_language()}</h3>
      <p className="text-muted-foreground mb-3 text-sm">
        {m.settings_language_desc()}
      </p>
      <div className="flex gap-2">
        <Button
          className={cn(current === "en" && "border-foreground")}
          onClick={() => {
            void setLocale("en");
          }}
          variant="outline"
        >
          English
        </Button>
        <Button
          className={cn(current === "zh" && "border-foreground")}
          onClick={() => {
            void setLocale("zh");
          }}
          variant="outline"
        >
          中文
        </Button>
      </div>
    </section>
  );
};
