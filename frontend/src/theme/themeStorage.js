export const THEME_STORAGE_KEY = "sturum-theme";
export const THEMES = ["light", "dark", "system"];

export const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (THEMES.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "system";
};

export const resolveTheme = (theme) =>
  theme === "system" ? getSystemTheme() : theme;

export const applyTheme = (theme) => {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  return resolved;
};

export const persistTheme = (theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  return applyTheme(theme);
};
