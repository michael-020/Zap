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
    cleanupWebContainer
  } = useEditorStore()
  const router = useRouter()
  const hasProcessedChatDataRef = useRef(false);

  const handleBackToInitializer = async () => {
    await cleanupWebContainer()
    await router.push("/chat")
    clearBuildSteps()
    setFileItems([])
    setSelectedFile(null)
    clearPromptStepsMap()
  }

    // Effect to fetch project data
    useEffect(() => {
        if (projectId && !hasProcessedChatDataRef.current) {
            const fetchProject = async () => {
                try {
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
    }, [projectId, processChatData]); 

    // Effect to cleanup webcontainer when leaving chat page
    useEffect(() => {
        return () => {
            const pathname = window.location.pathname;
            if (!pathname.startsWith('/chat/') && !pathname.startsWith('/prev-chat/')) {
                cleanupWebContainer();
            }
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