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
  const { setSelectedFile, fileItems, isInitialising, isInitialisingWebContainer } = useEditorStore()
  const hasSelectedInitialFile = useRef(false)
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(25) 
  const [isResizing, setIsResizing] = useState(false)
  const resizerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const containerWidth = window.innerWidth
      const newWidth = (e.clientX / containerWidth) * 100
      const clampedWidth = Math.max(15, Math.min(50, newWidth))
      setLeftPanelWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const handleResizerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }
 
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

      <div className="flex fixed top-[60px] h-[calc(100vh-60px)] w-screen">
        {!isFullscreen && (
          <div 
          className="dark:bg-neutral-950 bg-neutral-50 border-r border-neutral-800 flex-shrink-0"
          style={{ width: `${leftPanelWidth}%` }}
          >
          <StatusPanel />
        </div>
        )}
        <div
          ref={resizerRef}
          className="w-0.5 bg-neutral-800 hover:bg-neutral-700 cursor-col-resize flex justify-center flex-shrink-0 transition-colors duration-150 relative group"
          onMouseDown={handleResizerMouseDown}
        >
          <div className="absolute w-1.5 h-6 inset-y-0 top-1/2 -translate-y-1/2 bg-neutral-600 group-hover:bg-neutral-500 rounded-md transition-opacity duration-150" />
        </div>
        <div className="bg-neutral-900 flex-1 min-w-0">
          <EditorWorkspace isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />
        </div>
      </div>

      {shouldInitialize && (isInitialising || isInitialisingWebContainer) && <InitLoadingModal message={`${isInitialisingWebContainer ? "Initialising Environment..." : "Initialising project..."}`} />}
      <RightSidebar
        isOpen={sidebarVisible}
        setIsOpenAction={handleSidebarClose}
        onMouseLeaveAction={handleSidebarMouseLeave}
      />
    </div>
  )
}