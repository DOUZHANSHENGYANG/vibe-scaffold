import { cn } from "@my-app/ui/lib/utils";
import type { ReactNode } from "react";

export interface SettingsSection {
  readonly id: string;
  readonly title: string;
}

// The settings layout: a sidebar of sections on the left, one section on the right.
export const SettingsShell = ({
  active,
  children,
  sections,
}: {
  readonly active: string;
  readonly children: ReactNode;
  readonly sections: readonly SettingsSection[];
}) => (
  <div className="grid gap-8 md:grid-cols-[180px_1fr]">
    <nav className="flex flex-row gap-1 md:flex-col">
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
    <div className="flex flex-col gap-10">{children}</div>
  </div>
);
