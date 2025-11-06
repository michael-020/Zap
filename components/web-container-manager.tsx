// src/components/web-container-manager.tsx
"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"

// Regex to test if the route is a "safe" chat route
const safeRoutes = /^\/(chat|prev-chat)\/.*$/;

export function WebContainerManager() {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)
  
  // Get the cleanup function from the store
  const cleanupWebContainer = useEditorStore((state) => state.cleanupWebContainer)

  useEffect(() => {
    const prevPath = prevPathnameRef.current
    const currPath = pathname

    // Check if we *were* on a safe route
    const wasOnSafeRoute = safeRoutes.test(prevPath)
    
    // Check if we *are now* on a safe route
    const isOnSafeRoute = safeRoutes.test(currPath)

    // If we were on a chat page and just navigated to a non-chat page...
    if (wasOnSafeRoute && !isOnSafeRoute) {
      console.log("Navigating away from chat. Cleaning up WebContainer...")
      cleanupWebContainer()
    }

    // Always update the ref to the current pathname for the next navigation
    prevPathnameRef.current = pathname
  }, [pathname, cleanupWebContainer])

  return null // This component doesn't render any UI
}