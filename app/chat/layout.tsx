"use client"

import type React from "react"
import { useWebContainer } from "@/hooks/useWebContainer"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useWebContainer()
  const { webcontainer } = useEditorStore()

  if(!webcontainer){
    console.log("Initialising web container")
    return <div className="h-screen bg-black flex items-center justify-center text-white">Initializing Environment...</div>
  }

  return <>{children}</>
}
