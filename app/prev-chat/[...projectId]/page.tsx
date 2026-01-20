"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { EditorInterface } from "@/components/editor-interface"
import { axiosInstance } from "@/lib/axios"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { useRouter } from "next/navigation"

export default function ChatSessionPage() {
  const { projectId } = useParams()
  const { processChatData, clearBuildSteps, setFileItems, setSelectedFile, clearPromptStepsMap, setMessages, isWebContainerReady, setUpWebContainer } = useEditorStore()
  const router = useRouter()
  const [chatData, setChatData] = useState(null)

  
  const handleBackToInitializer = async () => {
    await router.push("/chat")
    clearBuildSteps()
    setFileItems([])
    setSelectedFile(null)
    clearPromptStepsMap()
    setMessages([])
  }

  useEffect(() => {
    setUpWebContainer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  useEffect(() => {
    const fetchProject = async () => {
      const res = await axiosInstance.get(`/api/project/${projectId}/chats`)
      setChatData(res.data)
    }

    fetchProject()
  }, [projectId])

  useEffect(() => {
    if (!isWebContainerReady || !chatData) return
    processChatData(chatData)
  }, [isWebContainerReady, chatData, processChatData])

  return <EditorInterface shouldInitialize={true} onBack={handleBackToInitializer} />
}
