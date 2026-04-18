import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemo: () => void;
  disableDemo: () => void;
  toggleDemo: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const DEMO_KEY = "demo_mode_active";

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(DEMO_KEY) === "true";
    }
    return false;
  });

  const enableDemo = useCallback(() => {
    setIsDemoMode(true);
    sessionStorage.setItem(DEMO_KEY, "true");
  }, []);

  const disableDemo = useCallback(() => {
    setIsDemoMode(false);
    sessionStorage.removeItem(DEMO_KEY);
  }, []);

  const toggleDemo = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev;
      if (next) {
        sessionStorage.setItem(DEMO_KEY, "true");
      } else {
        sessionStorage.removeItem(DEMO_KEY);
      }
      return next;
    });
  }, []);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, enableDemo, disableDemo, toggleDemo }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}
