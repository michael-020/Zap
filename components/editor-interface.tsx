"use client"

import { useEffect, useRef, useState } from "react"
import { StatusPanel } from "@/components/status-panel"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { Loader2 } from "lucide-react"
import { EditorWorkspace } from "@/components/editor-workspace"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Navbar from "./navbar"
import RightSidebar from "./sidebar"
import { InitLoadingModal } from "./init-loading-modal"

export function EditorInterface({
  onBack,
  shouldInitialize
}: {
  onBack?: () => void,
  shouldInitialize?: boolean
}) {
  const { setSelectedFile, fileItems, isInitialising } = useEditorStore()
  const hasSelectedInitialFile = useRef(false)
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
   const sidebarVisible = isOpen || isHovered;
  
  useEffect(() => {
    if(status === "loading") return
    if (!session) {
      redirect("/")
    }
  }, [session, status])

  useEffect(() => {
    if (!hasSelectedInitialFile.current && fileItems.length > 0) {
      const firstFile = fileItems.find(f => f.type === "file")
      if (firstFile) {
        setSelectedFile(firstFile.path)
        hasSelectedInitialFile.current = true
      }
    }
  }, [fileItems, setSelectedFile])
  
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

  
  if(!session){
     return <div className="h-screen bg-black flex items-center justify-center">
       <Loader2 className="size-14 animate-spin text-neutral-200" />
     </div>
   }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Navbar
        onPanelToggle={() => setIsOpen(!isOpen)}
        showPanelToggle={true}
        onBack={onBack}
        showBackButton={true}
      />

      <div className="grid grid-cols-12 gap-0 fixed top-[60px] h-[calc(100vh-60px)] w-screen">
        <div className="col-span-3 bg-neutral-950 border-r border-neutral-800">
          <StatusPanel />
        </div>
      
        <div className="col-span-9 bg-neutral-900">
          <EditorWorkspace />
        </div>
      </div>

      {shouldInitialize && !isInitialising && <InitLoadingModal />}
      <RightSidebar
        isOpen={sidebarVisible}
        setIsOpenAction={handleSidebarClose}
        onMouseLeaveAction={handleSidebarMouseLeave}
      />
    </div>
  )
}