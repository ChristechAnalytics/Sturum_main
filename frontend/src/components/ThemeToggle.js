import React from "react";
import { FaMoon, FaSun, FaDesktop } from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";

const OPTIONS = [
  { value: "light", label: "Light", Icon: FaSun },
  { value: "dark", label: "Dark", Icon: FaMoon },
  { value: "system", label: "System", Icon: FaDesktop },
];

const ThemeToggle = ({ variant = "segmented", className = "" }) => {
  const { theme, setTheme } = useTheme();

  if (variant === "icon") {
    const currentIndex = OPTIONS.findIndex((o) => o.value === theme);
    const next = OPTIONS[(currentIndex + 1) % OPTIONS.length];
    const ActiveIcon = OPTIONS.find((o) => o.value === theme)?.Icon || FaSun;

    return (
      <button
        type="button"
        onClick={() => setTheme(next.value)}
        className={`p-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${className}`}
        aria-label={`Theme: ${theme}. Click for ${next.label}`}
        title={`Theme: ${theme}`}
      >
        <ActiveIcon className="text-lg sm:text-xl" />
      </button>
    );
  }

  return (
    <div
      className={`inline-flex w-full max-w-md rounded-xl border-2 border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 p-1 ${className}`}
      role="radiogroup"
      aria-label="Color theme"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              active
                ? "bg-white dark:bg-neutral-700 text-primary-700 dark:text-primary-400 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            <Icon className="text-base shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
