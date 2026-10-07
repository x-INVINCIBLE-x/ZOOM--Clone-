const PREFIX = "zoomclone:ui:";

export const uiPreferences = {
  get: (key: string, defaultValue: boolean): boolean => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(PREFIX + key);
      if (stored !== null) {
        return stored === "true";
      }
    } catch (e) {
      // ignore
    }
    return defaultValue;
  },
  
  set: (key: string, value: boolean): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PREFIX + key, value.toString());
    } catch (e) {
      // ignore
    }
  }
};
