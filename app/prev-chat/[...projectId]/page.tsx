"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"
import { EditorInterface } from "@/components/editor-interface"
import { axiosInstance } from "@/lib/axios"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { useRouter } from "next/navigation"

export default function ChatSessionPage() {
  const { projectId } = useParams()
  const { processChatData, clearBuildSteps, setFileItems, setSelectedFile, clearPromptStepsMap } = useEditorStore()
  const router = useRouter()
  
  const handleBackToInitializer = async () => {
    await router.push("/chat")
    clearBuildSteps()
    setFileItems([])
    setSelectedFile(null)
    clearPromptStepsMap()
  }

  useEffect(() => {
    const fetchProject = async () => {
      const res = await axiosInstance.get(`/api/project/${projectId}/chats`)
      const data = await res.data
      
      processChatData(data)
    }

    fetchProject()
  }, [projectId, processChatData])

  return <EditorInterface shouldInitialize={true} onBack={handleBackToInitializer} />
}
