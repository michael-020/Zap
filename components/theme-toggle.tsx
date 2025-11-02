'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme)
  }

  return (
    <div className="flex items-center justify-between w-full space-x-1">
      <span className="text-sm text-neutral-900 dark:text-neutral-200">
        Theme
      </span>
      <div className="flex space-x-1">
        <button
          onClick={() => handleThemeChange('system')}
          className={`p-1.5 rounded-full transition-colors duration-300 ${
            theme === 'system'
              ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
              : 'bg-transparent text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-100'
          }`}
          aria-label="System theme"
          title='System'
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleThemeChange('light')}
          className={`p-1.5 rounded-full transition-colors duration-300 ${
            theme === 'light'
              ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
              : 'bg-transparent text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-100'
          }`}
          aria-label="Light mode"
          title='Light mode'
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          className={`p-1.5 rounded-full transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
              : 'bg-transparent text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-100'
          }`}
          aria-label="Dark mode"
          title='Dark mode'
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
