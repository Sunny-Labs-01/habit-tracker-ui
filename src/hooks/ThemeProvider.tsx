"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleTheme: () => {},
});

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getServerSnapshot(): ThemeMode {
  return "light";
}

export function HabitTrackerThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [userOverride, setUserOverride] = useState<ThemeMode | null>(null);

  const mode = userOverride ?? systemMode;

  const toggleTheme = () => {
    setUserOverride(mode === "light" ? "dark" : "light");
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
