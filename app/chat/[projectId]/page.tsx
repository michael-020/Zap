"use client"

import { useParams, useRouter } from "next/navigation"
import { EditorInterface } from "@/components/editor-interface"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { InitLoadingModal } from "@/components/init-loading-modal"
import { useEffect, useRef } from "react"
import { axiosInstance } from "@/lib/axios"

export default function ProjectPage() {
  const { projectId } = useParams()
  const { 
    isInitialising, 
    clearBuildSteps, 
    setFileItems, 
    setSelectedFile, 
    clearPromptStepsMap, 
    processChatData, 
    cleanupWebContainer,
    setMessages,
    setUpWebContainer,
    isWebcontainerReady
  } = useEditorStore()
  const router = useRouter()
  const hasProcessedChatDataRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      await setUpWebContainer()
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleBackToInitializer = async () => {
    await cleanupWebContainer()
    await router.push("/chat")
    clearBuildSteps()
    setFileItems([])
    setSelectedFile(null)
    clearPromptStepsMap()
    setMessages([])
  }

  // Effect to fetch project data
  useEffect(() => {
    if (isWebcontainerReady && projectId && !hasProcessedChatDataRef.current) {
      const fetchProject = async () => {
          try {
            // await setUpWebContainer()
            const res = await axiosInstance.get(`/api/project/${projectId}/chats`);
            const data = res.data;

            processChatData(data);
            hasProcessedChatDataRef.current = true; 
          } catch (error) {
            console.error("Failed to fetch project chat data:", error);
          }
      };

      fetchProject();
    }
  }, [projectId, processChatData, isWebcontainerReady]); 

  // Effect to cleanup webcontainer when leaving chat page
  useEffect(() => {
    return () => {
      cleanupWebContainer()
    }
  }, [cleanupWebContainer]);

  return (
    <>
      {isInitialising && <InitLoadingModal />}
      <EditorInterface 
        shouldInitialize={true} 
        onBack={handleBackToInitializer}
      />
    </>
  )
}