import { Button } from "@my-app/ui/components/button";

import { m } from "#src/paraglide/messages.js";
import { getLocale, setLocale } from "#src/paraglide/runtime.js";

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
          onClick={() => {
            void setLocale("en");
          }}
          variant={current === "en" ? "default" : "outline"}
        >
          English
        </Button>
        <Button
          onClick={() => {
            void setLocale("zh");
          }}
          variant={current === "zh" ? "default" : "outline"}
        >
          中文
        </Button>
      </div>
    </section>
  );
};
