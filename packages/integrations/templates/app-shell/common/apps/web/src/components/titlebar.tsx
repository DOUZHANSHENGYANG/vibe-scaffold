import { useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { Home, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { cn } from "@my-app/ui/lib/utils";

import { windowControls, type WindowControls } from "#src/lib/window.ts";
import { m } from "#src/paraglide/messages.js";

const controlButton =
  "flex h-full w-11 items-center justify-center text-foreground/70 hover:bg-accent hover:text-foreground transition-colors";

// The theme sweep: light -> dark expands a dark circle from the clicked icon;
// dark -> light is the reverse, the dark view collapsing into that point. GSAP
// animates an overlay so the direction is explicit, falling back to an instant
// switch where animations are unavailable.
const sweepTheme = (to: "light" | "dark", x: number, y: number) => {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  if (isDark === (to === "dark")) {
    return;
  }
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const commit = () => root.classList.toggle("dark", to === "dark");
  // Colors come from the theme's CSS variables so the overlay always matches.
  const styles = getComputedStyle(root);
  const color =
    styles.getPropertyValue(to === "dark" ? "--color-neutral-950" : "--color-neutral-50") ||
    (to === "dark" ? "#0a0a0a" : "#fafafa");

  const overlay = document.createElement("div");
  overlay.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;background:${color};`;
  document.body.appendChild(overlay);

  if (to === "dark") {
    // The dark view grows from the icon over the light page, then the theme commits.
    gsap.set(overlay, { clipPath: `circle(0px at ${x}px ${y}px)` });
    gsap.to(overlay, {
      clipPath: `circle(${radius}px at ${x}px ${y}px)`,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => {
        commit();
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => overlay.remove(),
        });
      },
    });
    setTimeout(() => overlay.remove(), 1500);
    return;
  }
  // The light page sits under the overlay; commit first, then the dark layer
  // collapses back into the icon.
  commit();
  gsap.set(overlay, { clipPath: `circle(${radius}px at ${x}px ${y}px)` });
  gsap.to(overlay, {
    clipPath: `circle(0px at ${x}px ${y}px)`,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => overlay.remove(),
  });
  setTimeout(() => overlay.remove(), 1500);
};

// The app's own titlebar: the drag region carries the app icon and the page
// navigation; the right side holds the theme sweep, the language switch, and
// the window controls. In a browser the window controls simply drop out.
export const Titlebar = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [controls, setControls] = useState<WindowControls | undefined>();
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void windowControls().then(setControls);
    if (barRef.current !== null) {
      gsap.from(barRef.current, {
        y: -36,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, []);

  const toggleTheme = (event: React.MouseEvent) => {
    const next = (resolvedTheme ?? "light") === "dark" ? ("light" as const) : ("dark" as const);
    setTheme(next);
    sweepTheme(next, event.clientX, event.clientY);
  };

  const cycleLanguage = () => {
    const next = document.documentElement.lang === "zh" ? "en" : "zh";
    void import("#src/paraglide/runtime.js").then(({ setLocale }) => setLocale(next));
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
        },
      );
    }
  };

  return (
    <header
      className="bg-background/90 backdrop-blur flex h-10 shrink-0 items-center border-b"
      data-tauri-drag-region
      ref={barRef}
    >
      <div className="flex h-full items-center gap-1 pl-3" data-tauri-drag-region>
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
        <button
          className="text-foreground/70 hover:text-foreground flex h-full items-center px-2 text-sm transition-colors"
          data-tauri-drag-region={false}
          onClick={() => {
          }}
          type="button"
        >
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
