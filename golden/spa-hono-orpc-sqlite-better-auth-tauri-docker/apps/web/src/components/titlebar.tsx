import { useNavigate } from "@tanstack/react-router";
import { gsap } from "gsap";
import { Home, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@my-app/ui/lib/utils";

import { sweepTheme } from "#src/lib/theme-sweep.ts";
import { windowControls, type WindowControls } from "#src/lib/window.ts";
import { m } from "#src/paraglide/messages.js";

const controlButton =
  "flex h-full w-11 items-center justify-center text-foreground/70 hover:bg-accent hover:text-foreground transition-colors";

const setLocaleAsync = async (locale: "en" | "zh"): Promise<void> => {
  const runtime = await import("#src/paraglide/runtime.js");
  await runtime.setLocale(locale);
};

// The app's own titlebar: the drag region carries the page navigation; the
// right side holds the theme sweep, the language switch, and the window
// controls. In a browser the window controls simply drop out. Add one text
// button per page next to the home button as the app grows.
export const Titlebar = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [controls, setControls] = useState<WindowControls | undefined>();
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void (async () => {
      setControls(await windowControls());
    })();
    const bar = barRef.current;
    const tween =
      bar === null
        ? undefined
        : gsap.fromTo(
            bar,
            { y: -36, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
              clearProps: "transform,opacity",
            }
          );
    return () => {
      tween?.kill();
      if (bar !== null) {
        gsap.set(bar, { clearProps: "transform,opacity" });
      }
    };
  }, []);

  const toggleTheme = (event: MouseEvent) => {
    const next =
      (resolvedTheme ?? "light") === "dark"
        ? ("light" as const)
        : ("dark" as const);
    sweepTheme(next, event.clientX, event.clientY, setTheme);
  };

  const cycleLanguage = () => {
    const next = document.documentElement.lang === "zh" ? "en" : "zh";
    void setLocaleAsync(next);
    if (barRef.current !== null) {
      gsap.fromTo(
        barRef.current,
        { opacity: 1 },
        {
          opacity: 0.4,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        }
      );
    }
  };

  return (
    <header
      className="bg-background/90 flex h-10 shrink-0 items-center border-b backdrop-blur"
      data-tauri-drag-region
      ref={barRef}
    >
      <div
        className="flex h-full items-center gap-1 pl-3"
        data-tauri-drag-region
      >
        <button
          aria-label={m.nav_home()}
          className="text-foreground/70 hover:text-foreground flex h-full items-center gap-1.5 px-2 text-sm transition-colors"
          data-tauri-drag-region={false}
          onClick={() => {
            void navigate({ to: "/" });
          }}
          type="button"
        >
          <Home className="size-4" />
        </button>
      </div>
      <div className="ml-auto flex h-full items-center">
        <button
          aria-label={m.nav_settings()}
          className={controlButton}
          onClick={() => {
            void navigate({ to: "/settings" });
          }}
          type="button"
        >
          <Settings className="size-4" />
        </button>
        <button
          aria-label={m.settings_theme()}
          className={controlButton}
          onClick={toggleTheme}
          type="button"
        >
          {(resolvedTheme ?? "light") === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
        <button
          aria-label={m.settings_language()}
          className={cn(controlButton, "w-auto px-3 text-xs font-medium")}
          onClick={cycleLanguage}
          type="button"
        >
          {document.documentElement.lang === "zh" ? "EN" : "中"}
        </button>
        {controls !== undefined && (
          <>
            <span className="bg-border mx-1 h-4 w-px" />
            <button
              aria-label={m.window_minimize()}
              className={controlButton}
              onClick={() => {
                void controls.minimize();
              }}
              type="button"
            >
              ―
            </button>
            <button
              aria-label={m.window_maximize()}
              className={controlButton}
              onClick={() => {
                void controls.toggleMaximize();
              }}
              type="button"
            >
              ▢
            </button>
            <button
              aria-label={m.window_close()}
              className={`${controlButton} hover:bg-destructive hover:text-white`}
              onClick={() => {
                void controls.close();
              }}
              type="button"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </header>
  );
};
