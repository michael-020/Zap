'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, PanelRight, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

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

        <div className="flex gap-3 items-center relative">
          {session && (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                className={`flex items-center justify-center size-8 text-white cursor-pointer bg-gradient-to-br from-neutral-600 to-neutral-700 rounded-full shadow-lg ring-2 ring-transparent ${
                  dropdownOpen ? 'ring-neutral-400/50' : ''
                }`}
                onClick={() => setDropdownOpen((prev) => !prev)}
                whileHover={{ 
                  scale: 1.05,
                  background: 'linear-gradient(135deg, rgb(115, 115, 115), rgb(82, 82, 82))',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 10px 10px -5px rgb(0 0 0 / 0.1)',
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: dropdownOpen ? 1.05 : 1,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.span 
                  className="text-sm font-semibold"
                  animate={{ 
                    rotate: dropdownOpen ? 360 : 0,
                    transition: { duration: 0.3, ease: "easeInOut" }
                  }}
                >
                  {session.user.email.charAt(0).toUpperCase()}
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="absolute right-0 w-48 mt-3 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
                    initial={{ 
                      opacity: 0, 
                      scale: 0.9, 
                      y: -10,
                      filter: 'blur(4px)'
                    }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                      filter: 'blur(0px)'
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.95, 
                      y: -5,
                      filter: 'blur(2px)'
                    }}
                    transition={{ 
                      duration: 0.2, 
                      ease: [0.4, 0.0, 0.2, 1] // Custom easing curve
                    }}
                    style={{ transformOrigin: 'top right' }}
                  >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 to-neutral-900/20 pointer-events-none" />
                    
                    <motion.div 
                      className="px-4 py-3 border-b border-neutral-700/50 bg-neutral-800/30"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">
                        Signed in as
                      </div>
                      <div className="text-sm text-white font-medium truncate">
                        {session.user.email}
                      </div>
                    </motion.div>

                    <div className="py-">
                      <motion.button
                        onClick={() => {
                          setDropdownOpen(false)
                          router.push('/profile')
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-neutral-800/60 flex items-center gap-3 group relative overflow-hidden"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.2 }}
                        whileTap={{ scale: 0.98 }}
                      > 
                        <motion.div 
                          className="flex items-center justify-center size-8 bg-neutral-700/50 rounded-lg group-hover:bg-neutral-600/50 transition-colors duration-200 relative z-10"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <User className="size-4" />
                        </motion.div>
                        <div className="flex flex-col relative z-10">
                          <span className="font-medium">Profile</span>
                          <span className="text-xs text-neutral-400">Manage your profile</span>
                        </div>
                      </motion.button>
                      
                      <motion.button
                        onClick={() => {
                          setDropdownOpen(false)
                          signOut({ callbackUrl: "/signin" })
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 group relative overflow-hidden"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div 
                          className="flex items-center justify-center size-8 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors duration-200 relative z-10"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <LogOut className="size-4" />
                        </motion.div>
                        <div className="flex flex-col relative z-10">
                          <span className="font-medium">Sign out</span>
                          <span className="text-xs text-red-300/70">End your session</span>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {showPanelToggle && onPanelToggle && (
            <motion.button 
              className="text-neutral-200 hover:text-neutral-50 p-2 rounded-lg" 
              onClick={onPanelToggle}
              whileHover={{ 
                transition: { duration: 0.2 }
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