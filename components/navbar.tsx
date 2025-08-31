'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, PanelRight, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
              <button
                className="flex items-center justify-center size-8 text-white cursor-pointer bg-gradient-to-br from-neutral-600 to-neutral-700 rounded-full hover:from-neutral-500 hover:to-neutral-600 transition-all duration-200 shadow-lg"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <span className="text-sm font-medium">
                  {session.user.email.charAt(0).toUpperCase()}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 w-40 mt-2 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      router.push('/profile')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 rounded-t-sm"
                  >
                    <div className='flex items-center justify-start gap-2'>
                      <User className='size-5' />
                      <div>
                        Profile
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      signOut({ callbackUrl: "/signin" })
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 rounded-b-sm"
                  >
                    <div className='flex items-center justify-start gap-2'>
                      <LogOut className='size-5' />
                      <div>
                        Logout
                      </div>
                    </div>
                  </button>
                </div>
              )}
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