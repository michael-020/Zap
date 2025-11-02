'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'

export default function UserDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session) {
    return null // Don't render anything if there's no session
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        className={`flex select-none items-center justify-center size-8 text-white cursor-pointer rounded-full shadow-lg ring-2 ring-transparent 
              bg-gradient-to-br from-neutral-600 to-neutral-700 
              hover:from-neutral-500 hover:to-neutral-600 
              dark:from-neutral-700 dark:to-neutral-800 
              dark:hover:from-neutral-600 dark:hover:to-neutral-700 
              hover:shadow-2xl 
              transition-all duration-200 ease-in-out ${
                dropdownOpen
                  ? 'ring-neutral-900 dark:ring-neutral-400/50'
                  : ''
              }`}
        onClick={() => setDropdownOpen((prev) => !prev)}
        whileHover={{
          scale: 1.05,
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: dropdownOpen ? 1.05 : 1,
          transition: { duration: 0.2 },
        }}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <motion.span
          className="text-sm font-semibold"
          animate={{
            rotate: dropdownOpen ? 360 : 0,
            transition: { duration: 0.3, ease: 'easeInOut' },
          }}
        >
          {session.user.email.charAt(0).toUpperCase()}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            className="absolute right-0 w-52 mt-3 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
            initial={{
              opacity: 0,
              scale: 0.9,
              y: -10,
              filter: 'blur(4px)',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -5,
              filter: 'blur(2px)',
            }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            style={{ transformOrigin: 'top right' }}
          >
            <div className="absolute inset-0 bg-neutral-100/10 dark:bg-gradient-to-br from-neutral-800/20 to-neutral-900/20 pointer-events-none" />

            <motion.div
              className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-800/30"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium uppercase tracking-wider mb-1">
                Signed in as
              </div>
              <div className="text-sm text-black dark:text-white font-medium truncate">
                {session.user.email}
              </div>
            </motion.div>

            <div className="py-2 px-2">
              <motion.button
                onClick={() => {
                  setDropdownOpen(false)
                  router.push('/profile')
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800/60 flex items-center gap-3 group relative overflow-hidden"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="flex items-center justify-center size-8 bg-neutral-200 dark:bg-neutral-700/50 rounded-lg group-hover:bg-neutral-300 dark:group-hover:bg-neutral-600/50 transition-colors duration-200 relative z-10"
                  transition={{ duration: 0.2 }}
                >
                  <User className="size-4" />
                </motion.div>
                <div className="flex flex-col relative z-10">
                  <span className="font-medium">Profile</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Manage your profile
                  </span>
                </div>
              </motion.button>

              {/* ThemeToggle is now inside the dropdown */}
              <motion.div
                className="w-full px-4 py-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <ThemeToggle />
              </motion.div>

              <div className="h-px mx-4 my-2 bg-neutral-200 dark:bg-neutral-700/50" />

              <motion.button
                onClick={() => {
                  setDropdownOpen(false)
                  signOut({ callbackUrl: '/signin' })
                }}
                className="w-full text-left px-4 py-3 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-3 group relative overflow-hidden"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.2 }} 
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="flex items-center justify-center size-8 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors duration-200 relative z-10"
                  transition={{ duration: 0.2 }}
                >
                  <LogOut className="size-4" />
                </motion.div>
                <div className="flex flex-col relative z-10">
                  <span className="font-medium">Sign out</span>
                  <span className="text-xs text-red-500/70 dark:text-red-300/70">
                    End your session
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}