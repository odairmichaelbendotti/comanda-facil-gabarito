"use client";

import { useEffect, useSyncExternalStore } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function setDark(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
  notify();
}

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      setDark(stored === "dark");
      return;
    }
    setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Alternar tema escuro"
      onClick={() => setDark(!isDark)}
      className={`flex cursor-pointer items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] ${className}`}
    >
      {isDark ? (
        <LuMoon className="size-4 shrink-0 text-[color:var(--color-text-secondary)]" />
      ) : (
        <LuSun className="size-4 shrink-0 text-[color:var(--color-text-secondary)]" />
      )}
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 motion-reduce:transition-none ${
          isDark
            ? "bg-[var(--color-brand-primary)]"
            : "bg-[var(--color-border-default)]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-[translate] duration-150 motion-reduce:transition-none ${
            isDark ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
