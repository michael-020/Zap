"use client"

import { useEffect, useState } from "react"
import { ProjectInitializer } from "@/components/project-initializer"
import { EditorInterface } from "@/components/editor-interface"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const [showMainInterface, setShowMainInterface] = useState(false)
  const { clearBuildSteps, setFileItems, setSelectedFile, clearPromptStepsMap } = useEditorStore()
  const { savedPrompt, savedImages, clearSavedData } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // If there's a saved prompt, automatically submit it
    if (savedPrompt) {
      handleProjectSubmit();
      clearSavedData();
    }
  }, [savedPrompt]);

  const handleProjectSubmit = () => {
    setShowMainInterface(true)
  }

  const handleBackToInitializer = async () => {
    await router.push("/chat")
    setShowMainInterface(false)
    clearBuildSteps()
    setFileItems([])
    setSelectedFile(null)
    clearPromptStepsMap()
  }

  if (!showMainInterface) {
    return (
      <ProjectInitializer 
        onSubmitAction={handleProjectSubmit}
        initialPrompt={savedPrompt}
        initialImages={savedImages}
      />
    )
  }

  return <EditorInterface shouldInitialize={true} onBack={handleBackToInitializer} />
}