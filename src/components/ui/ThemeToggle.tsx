"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// 主题切换组件 - 这个必须保持为客户端组件，因为需要访问 localStorage
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme("light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  );
}