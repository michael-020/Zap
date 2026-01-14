"use client"

import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { LimitReason } from "./prompt-input-panel" 

type AllReasons = LimitReason | "DOWNLOAD_LIMIT";

interface UsageLimitModalProps {
  isOpen: boolean
  onClose: () => void
  reason: AllReasons
}

export function UsageLimitModal({ isOpen, onClose, reason }: UsageLimitModalProps) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)

  const content = {
    USAGE_LIMIT: {
      title: "Daily Limit Reached",
      description: "You've reached your daily usage limit. Upgrade to Pro for unlimited access."
    },
    CHAR_LIMIT: {
      title: "Character Limit Exceeded",
      description: "You've exceeded the character limit. Please shorten your prompt or upgrade to Pro for longer prompts."
    },
    DOWNLOAD_LIMIT: {
      title: "Download Limit Reached",
      description: "You have reached your download limit for free account. Please upgrade to Pro for unlimited downloads."
    }
  }

  const { title, description } = content[reason];

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

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/60 dark:bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-200 mb-2">
              {title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          </div>

          <button
            onClick={() => {
              onClose()
              router.push('/view-plans')
            }}
            className="w-full bg-neutral-900 hover:bg-neutral-700 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}