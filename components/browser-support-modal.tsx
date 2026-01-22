"use client"

import { createPortal } from "react-dom"
import { useRef, useEffect } from "react"

export function isBrowserSupported(): boolean {
  if (typeof window === 'undefined') return true;
  
  const ua = window.navigator.userAgent.toLowerCase();
  
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  
  const isFirefox = /firefox/i.test(ua);
  
  return !isSafari && !isFirefox;
}

interface BrowserSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BrowserSupportModal({ isOpen, onClose }: BrowserSupportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const copyProjectLink = () => {
    navigator.clipboard.writeText(window.location.href)
    // You can add a toast notification here if you want
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/60 dark:bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-200 mb-6">
              Zap works best in supported browsers
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Zap depends on some key browser features that aren&apos;t supported here. For the best experience, please use{' '}
              <a 
                href="https://www.google.com/chrome/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-neutral-800 dark:hover:text-neutral-300"
              >
                Chrome
              </a>
              ,{' '}
              <a 
                href="https://www.microsoft.com/edge" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-neutral-800 dark:hover:text-neutral-300"
              >
                Edge
              </a>
              , or another Chromium-based browser.
            </p>
          </div>

          <button
            onClick={copyProjectLink}
            className="w-full bg-neutral-900 hover:bg-neutral-700 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Copy project link
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}