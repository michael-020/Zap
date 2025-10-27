import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useEffect } from "react"
import { createPortal } from "react-dom"

interface UsageLimitModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UsageLimitModal({ isOpen, onClose }: UsageLimitModalProps) {
  const router = useRouter()
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

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-neutral-200 mb-2">
              Daily Limit Reached
            </h3>
            <p className="text-neutral-400">
              You&apos;ve reached your daily usage limit. Upgrade to Pro for unlimited access.
            </p>
          </div>

          <button
            onClick={() => {
              onClose()
              router.push('/view-plans')
            }}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}