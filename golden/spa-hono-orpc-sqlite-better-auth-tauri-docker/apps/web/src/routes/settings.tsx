import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@todo-app/ui/components/card";
import { cn } from "@todo-app/ui/lib/utils";
import { useEffect, useState } from "react";

import { DataSection } from "#src/components/settings/data-section.tsx";
import { LanguageSection } from "#src/components/settings/language-section.tsx";
import { ThemeSection } from "#src/components/settings/theme-section.tsx";
import { m } from "#src/paraglide/messages.js";

// The system sidebar: theme, language, and the storage directory, top to bottom.
const useSections = () => [
  { id: "theme", title: m.settings_theme() },
  { id: "language", title: m.settings_language() },
  { id: "data", title: m.settings_data() },
];

const SettingsPage = () => {
  const [active, setActive] = useState("theme");
  const sections = useSections();

  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.slice(1);
      if (sections.some((section) => section.id === hash)) {
        setActive(hash);
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => {
      window.removeEventListener("hashchange", read);
    };
  }, []);

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <nav aria-label={m.settings_title()} className="flex flex-col gap-1">
        {sections.map((section) => (
          <a
            className={cn(
              "text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors",
              active === section.id && "bg-accent text-foreground"
            )}
            href={`#${section.id}`}
            key={section.id}
          >
            {section.title}
          </a>
        ))}
      </nav>
      <div className="flex flex-col gap-10">
        <Card>
          <CardHeader>
            <CardTitle>{m.settings_title()}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-10">
            <ThemeSection />
            <LanguageSection />
            <DataSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
