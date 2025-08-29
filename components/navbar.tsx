'use client'

import { PanelRight } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface NavbarProps {
  onPanelToggle?: () => void
  showPanelToggle?: boolean
  showBackButton?: boolean
  onBack?: () => void
}

export default function Navbar({
  onPanelToggle,
  showPanelToggle = false,
  showBackButton = false,
  onBack,
}: NavbarProps) {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="text-white font-bold font-stretch-extra-expanded text-xl tracking-wide cursor-pointer select-none hover:opacity-90 transition"
            >
              Mirror
            </button>
          ) : (
            <div className="text-white font-bold font-stretch-extra-expanded text-xl tracking-wide select-none">
              Mirror
            </div>
          )}
        </div>
        <div className="flex gap-3 items-center">
          {session && (
            <div className="flex items-center justify-center size-8 text-white cursor-pointer bg-gradient-to-br from-neutral-600 to-neutral-700 rounded-full hover:from-neutral-500 hover:to-neutral-600 transition-all duration-200 shadow-lg">
              <div className="text-sm font-medium">
                {session.user.email.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          {showPanelToggle && onPanelToggle && (
            <button className="text-neutral-500" onClick={onPanelToggle}>
              <PanelRight />
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}