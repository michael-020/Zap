"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme)
  }

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-neutral-900 dark:text-neutral-200">Theme</span>
      <div className="flex space-x-2">
        <button
          onClick={() => handleThemeChange("light")}
          className={`p-2 rounded-full transition-colors duration-300 ${
            theme === "light"
              ? "bg-neutral-300 dark:bg-neutral-700 text-neutral-900"
              : "bg-transparent text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:text-neutral-200"
          }`}
        >
          <Sun className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleThemeChange("dark")}
          className={`p-2 rounded-full transition-colors duration-300 ${
            theme === "dark"
              ? "bg-neutral-300 dark:bg-neutral-700 text-neutral-900"
              : "bg-transparent text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:text-neutral-200"
          }`}
        >
          <Moon className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleThemeChange("system")}
          className={`p-2 rounded-full transition-colors duration-300 ${
            theme === "system"
              ? "bg-neutral-300 dark:bg-neutral-700 text-neutral-900"
              : "bg-transparent text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-600 dark:text-neutral-200"
          }`}
        >
          <Monitor className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
