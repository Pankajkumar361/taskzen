import { useCallback, useEffect, useState } from "react";

interface Preferences {
  darkMode: boolean;
}

const KEY = "taskzen_prefs";

function load(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { darkMode: false };
  } catch {
    return { darkMode: false };
  }
}

export function usePreferences() {
  const [prefs, setPrefsState] = useState<Preferences>(load);

  useEffect(() => {
    if (prefs.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [prefs.darkMode]);

  const setPrefs = useCallback((partial: Partial<Preferences>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, setPrefs };
}
