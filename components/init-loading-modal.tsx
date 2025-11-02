"use client"

import { Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface LoadingModalProps {
  message?: string
}

export function InitLoadingModal({ message = "Initialising project..." }: LoadingModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-white/50 dark:bg-black/40 backdrop-blur-xs flex flex-col gap-4 items-center justify-center z-50">
      <Loader2 className="size-10 text-blue-500 animate-spin" />
      <p className="text-gray-300 text-lg animate-pulse">{message}</p>
    </div>,
    document.body
  )
}
