import React, { useState, useRef, useEffect } from "react";
import { MODES, useTheme } from "../../context/ThemeContext";
import type { AestheticMode } from "../../context/ThemeContext";

const modeIcons: Record<AestheticMode, string> = {
  jordan: "◎",
  pustynia: "◈",
  ogien: "◉",
  cisza: "◌",
  noc: "◎",
};

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = MODES.find((m) => m.id === mode)!;

  return (
    <div ref={ref} className="relative" data-ocid="theme.dropdown_menu">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-sans border border-border hover:border-primary/30 hover:bg-accent/40 transition-all duration-300 text-muted-foreground hover:text-foreground"
        aria-haspopup="true"
        aria-expanded={open}
        data-ocid="theme.toggle"
      >
        <span className="text-xs opacity-60">{modeIcons[mode]}</span>
        <span className="font-medium tracking-wide text-xs uppercase">
          {current.label}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => {
                setMode(m.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-accent/60 ${
                mode === m.id
                  ? "bg-accent/80 text-accent-foreground"
                  : "text-foreground"
              }`}
              data-ocid={`theme.${m.id}.button`}
            >
              <span className="text-base opacity-50">{modeIcons[m.id]}</span>
              <div>
                <div className="font-display text-sm font-medium">
                  {m.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.description}
                </div>
              </div>
              {mode === m.id && (
                <svg
                  className="w-3.5 h-3.5 ml-auto text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
