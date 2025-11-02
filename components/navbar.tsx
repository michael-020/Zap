'use client'

import { PanelRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import UserDropdown from './user-dropdown' 

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="text-neutral-900 dark:text-white font-bold font-stretch-extra-expanded text-xl tracking-wide cursor-pointer select-none hover:opacity-90 transition"
            >
              Zap
            </button>
          ) : (
            <div className="text-neutral-900 dark:text-white font-bold font-stretch-extra-expanded text-xl tracking-wide select-none">
              Zap
            </div>
          )}
        </div>

        <div className="flex gap-3 items-center relative">
          {/* ThemeToggle has been removed from here */}

          {session?.user.isPremium && (
            <div className="text-xs text-neutral-200 bg-neutral-900 px-3 py-2 rounded-md cursor-default select-none">
              Pro
            </div>
          )}
          
          {/* All dropdown logic is now encapsulated in UserDropdown */}
          {session && <UserDropdown />}

          {showPanelToggle && onPanelToggle && (
            <motion.button
              className="text-neutral-950 dark:text-neutral-200 hover:text-neutral-700 dark:hover:text-neutral-50 p-2 rounded-lg"
              onClick={onPanelToggle}
              whileHover={{
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <PanelRight className="size-5" />
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  )
}