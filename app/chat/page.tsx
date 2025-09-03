"use client"

import { useState } from "react"
import { ProjectInitializer } from "@/components/project-initializer"
import { EditorInterface } from "@/components/editor-interface"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const [showMainInterface, setShowMainInterface] = useState(false)
  const { clearBuildSteps, setFileItems, setSelectedFile, clearPromptStepsMap } = useEditorStore()
  const router = useRouter()

  const handleProjectSubmit = () => {
    setShowMainInterface(true)
  }

  const handleBackToInitializer = () => {
    router.push("/chat")
    setShowMainInterface(false)
    clearBuildSteps()
    setFileItems([])
    setSelectedFile(null)
    clearPromptStepsMap()
  }

  if (!showMainInterface) {
    return <ProjectInitializer onSubmitAction={handleProjectSubmit} />
  }

  return <EditorInterface shouldInitialize={false} onBack={handleBackToInitializer} />
}