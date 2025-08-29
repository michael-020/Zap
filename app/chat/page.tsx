"use client"

import { useState } from "react"
import { ProjectInitializer } from "@/components/project-initializer"
import { EditorInterface } from "@/components/editor-interface"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const [showMainInterface, setShowMainInterface] = useState(false)
  const { clearBuildSteps, setFileItems, setFiles, setSelectedFile, buildSteps, fileItems, files, clearPromptStepsMap } = useEditorStore()
  const router = useRouter()

  const handleProjectSubmit = () => {
    setShowMainInterface(true)
  }

  const handleBackToInitializer = () => {
    setShowMainInterface(false)
    clearBuildSteps()
    setFileItems([])
    setFiles({})
    setSelectedFile(null)
    clearPromptStepsMap()
    console.log("files: ", files)
    console.log("files items: ", fileItems)
    console.log("build steps: ", buildSteps)
    router.push("/chat")
  }

  if (!showMainInterface) {
    return <ProjectInitializer onSubmitAction={handleProjectSubmit} />
  }

  return <EditorInterface onBack={handleBackToInitializer} />
}