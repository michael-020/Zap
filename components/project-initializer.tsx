"use client"

import { useEffect, useState } from "react"
import { Loader2 } from 'lucide-react'
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { useAuthStore } from "@/stores/authStore/useAuthStore"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import RightSidebar from "./sidebar"
import Navbar from "./navbar"
import toast from "react-hot-toast"
import { axiosInstance } from "@/lib/axios"
import { PromptInputPanel } from "./prompt-input-panel"

export function ProjectInitializer() {
  const { savedPrompt, savedImages, clearSavedData, currentUsage, isPremium, setUsage } = useAuthStore()
  const [description, setDescription] = useState("")
  const { createProject, isCreatingProject, processPrompt } = useEditorStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { data: session, status } = useSession()
  const [hasInitialized, setHasInitialized] = useState(false)
  const maxUsage = isPremium ? Infinity : 5

  useEffect(() => {
    if (session && !isPremium) {
      const fetchUsage = async () => {
        try {
          const response = await axiosInstance.get('/api/usage')
          const data = response.data
          setUsage(data.currentUsage) 
        } catch (error) {
          console.error('Failed to fetch usage:', error)
        }
      }

      fetchUsage()
    }
  }, [session, isPremium, setUsage])

  useEffect(() => {
    const setupInitialData = async () => {
      if (hasInitialized) return;
      
      if (savedPrompt) {
        setDescription(savedPrompt);
      }

      setHasInitialized(true);

      if (savedPrompt && savedImages && savedImages.length > 0) {
        handleSubmit(savedPrompt, savedImages);
      }
    };

    if (session && !hasInitialized) {
      setupInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPrompt, savedImages, session, hasInitialized]);
  
  useEffect(() => {
    if(status === "loading") return
    if (!session) {
      redirect("/")
    }
  }, [session, status])

  useEffect(() => {
    const threshold = 25;
    const sidebarWidth = 256; 
  
    const onMouseMove = (e: MouseEvent) => {
      const isNearRightEdge = window.innerWidth - e.clientX <= threshold;
      const isInsideSidebar = e.clientX >= window.innerWidth - sidebarWidth;
      
      if (isNearRightEdge) {
        setIsHovered(true);
      } else if (!isInsideSidebar && isHovered) {
        setIsHovered(false);
      }
    };
  
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [isHovered]);
 
  const handleSidebarMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSidebarClose = () => {
    setIsOpen(false);
    setIsHovered(false);
  };

  const sidebarVisible = isOpen || isHovered;

  const handleSubmit = async (promptText: string, files: File[]) => {
    if (!promptText.trim()) return;

    if (currentUsage >= maxUsage) {
      toast.error("You have reached your daily chat limit.")
      return
    }

    const projectId = await createProject(promptText);
    if(!projectId)
      return;
    clearSavedData();
    processPrompt(promptText, files)
    redirect(`/chat/${projectId}`)
  }
   
  if(!session){
    return <div className="h-screen bg-black flex items-center justify-center">
      <Loader2 className="size-14 animate-spin text-neutral-200" />
    </div>
  }

  const usageRemaining = maxUsage - currentUsage

  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      <Navbar
        onPanelToggle={() => setIsOpen(!isOpen)}
        showPanelToggle={true}
      />

      <div className="flex items-center justify-center min-h-screen px-6 pb-20">
        <div className="w-full max-w-3xl mx-auto">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-neutral-950 dark:text-white leading-tight">
                Start with a sentence.
              </h1>
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                End with a website.
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-center mb-12 text-lg">
                Create stunning websites by chatting with Zap.
              </p>
            </div>

            <PromptInputPanel
              isPremium={session.user.isPremium}
              description={description}
              setDescription={setDescription}
              onSubmit={handleSubmit}
              isSubmitting={isCreatingProject}
              disabled={false}
              placeholder="Describe the website you want to build..."
              usageInfo={{
                remaining: usageRemaining,
                limitReached: usageRemaining <= 0
              }}
              textareaHeight="6rem"
              textareaMaxHeight="16rem"
              maxImages={10}
              showBanner={true}
              showLimit={true}
            />
          </div>
        </div>
      </div>
      
      <RightSidebar
        isOpen={sidebarVisible}
        setIsOpenAction={handleSidebarClose}
        onMouseLeaveAction={handleSidebarMouseLeave}
      />
    </div>
  )
}