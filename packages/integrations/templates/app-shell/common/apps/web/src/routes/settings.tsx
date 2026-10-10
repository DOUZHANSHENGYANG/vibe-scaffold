import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { setLocale } from "#src/paraglide/runtime.js";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@my-app/ui/components/card";

import { m } from "#src/paraglide/messages.js";
import { SettingsShell } from "#src/components/layout/settings-shell.tsx";
import { ThemeToggle } from "#src/components/theme-toggle.tsx";

const sections = () => [
  { id: "appearance", title: m.settings_appearance() },
  { id: "language", title: m.settings_language() },
];

const SettingsPage = () => {
  const [active, setActive] = useState("appearance");

  // The sidebar highlights the section the page is scrolled to, which the
  // browser tracks through the URL hash.
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.slice(1);
      if (sections().some((section) => section.id === hash)) {
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
    <Card>
      <CardHeader>
        <CardTitle>{m.settings_title()}</CardTitle>
      </CardHeader>
      <CardContent>
        <SettingsShell active={active} sections={sections()}>
          <section id="appearance">
            <h3 className="mb-1 text-sm font-medium">{m.settings_theme()}</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              {m.settings_appearance_desc()}
            </p>
            <ThemeToggle />
          </section>
          <section id="language">
            <h3 className="mb-1 text-sm font-medium">{m.settings_language()}</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              {m.settings_language_desc()}
            </p>
            <div className="flex gap-2">
              <button
                className="border-border hover:bg-accent rounded-md border px-3 py-1 text-sm"
                onClick={() => {
                  void setLocale("en");
                }}
                type="button"
              >
                English
              </button>
              <button
                className="border-border hover:bg-accent rounded-md border px-3 py-1 text-sm"
                onClick={() => {
                  void setLocale("zh");
                }}
                type="button"
              >
                中文
              </button>
            </div>
          </section>
        </SettingsShell>
      </CardContent>
    </Card>
  );
};

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
