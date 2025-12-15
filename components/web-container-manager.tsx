"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"

const safeRoutes = /^\/(chat|prev-chat)\/.*$/;

export function WebContainerManager() {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)
  
  const cleanupWebContainer = useEditorStore(state => state.cleanupWebContainer)
  const clearEditorState = useEditorStore(state => state.clearEditorState)

  useEffect(() => {
    const prevPath = prevPathnameRef.current
    const currPath = pathname

    const wasOnSafeRoute = safeRoutes.test(prevPath)
    
    const isOnSafeRoute = safeRoutes.test(currPath)

    if (wasOnSafeRoute && !isOnSafeRoute) {
      console.log("Navigating away from chat. Cleaning up WebContainer...")
      // Properly await the async cleanup function
      cleanupWebContainer().then(() => {
        console.log("WebContainer cleanup completed before clearing state");
        clearEditorState()
      }).catch((err) => {
        console.error("Error during cleanup:", err);
        clearEditorState()
      })
    }

    prevPathnameRef.current = pathname
  }, [pathname, cleanupWebContainer, clearEditorState])

  return null 
}