import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type AestheticMode = "jordan" | "pustynia" | "ogien" | "cisza" | "noc";

export const MODES: {
  id: AestheticMode;
  label: string;
  description: string;
}[] = [
  { id: "jordan", label: "Jordan", description: "Spokój i jasność" },
  { id: "pustynia", label: "Pustynia", description: "Ciepło złotego piasku" },
  { id: "ogien", label: "Ogień", description: "Żarliwość i pasja" },
  { id: "cisza", label: "Cisza", description: "Kontemplacja i skupienie" },
  { id: "noc", label: "Noc", description: "Głęboki spokój nocy" },
];

interface ThemeContextValue {
  mode: AestheticMode;
  setMode: (mode: AestheticMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "jordan",
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AestheticMode>(() => {
    const stored = localStorage.getItem(
      "parish-aesthetic-mode",
    ) as AestheticMode;
    if (stored && MODES.some((m) => m.id === stored)) return stored;
    return "jordan";
  });

  const setMode = (newMode: AestheticMode) => {
    setModeState(newMode);
    localStorage.setItem("parish-aesthetic-mode", newMode);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    // Remove dark class for non-noc modes
    if (mode === "noc") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
