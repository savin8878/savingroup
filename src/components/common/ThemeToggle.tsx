"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle({ className }: { className?: string } = {}) {
  const [theme, setTheme] = useState<Theme>("system");
  // Keep the first client render identical to the server render. Resolve the
  // system preference after hydration, and follow subsequent OS changes.
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => setSystemDark(query.matches);
    syncSystem();
    query.addEventListener("change", syncSystem);
    let stored: string | null = null;
    try { stored = localStorage.getItem("theme"); } catch { /* Storage may be unavailable. */ }
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      applyTheme(stored);
    } else {
      setTheme("system");
      applyTheme("system");
    }
    return () => query.removeEventListener("change", syncSystem);
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (t === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("dark", "light");
    }
  }

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch { /* The in-memory toggle still works. */ }
  }

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  return (
    <button
      type="button"
      onClick={toggle}
      className={className ?? "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
}
