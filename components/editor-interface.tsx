"use client"

import { useEffect, useRef } from "react"
import { StatusPanel } from "@/components/status-panel"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { Loader2 } from "lucide-react"
import { EditorWorkspace } from "@/components/editor-workspace"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { InitLoadingModal } from "./init-loading-modal"

export function EditorInterface({
  onBack,
}: {
  onBack?: () => void
}) {
  const { setSelectedFile, fileItems, isInitialising } = useEditorStore()
  const hasSelectedInitialFile = useRef(false)
  const { data: session, status } = useSession()
  
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
  
  if(!session){
     return <div className="h-screen bg-black flex items-center justify-center">
       <Loader2 className="size-14 animate-spin text-neutral-200" />
     </div>
   }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="py-2  bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
            <button onClick={onBack}>
              <h1 className="text-lg font-semibold font-stretch-ultra-expanded">Mirror</h1>
            </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 rounded-full transition-colors flex items-center gap-1"
          >
            {session.user.email.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Content - 3 Column Grid */}
      <div className="flex-1 grid grid-cols-12 gap-0">
        <div className="col-span-3 bg-neutral-950 border-r border-neutral-800">
          <StatusPanel />
        </div>

        <div className="col-span-9 bg-neutral-900">
          <EditorWorkspace />
        </div>
      </div>

      {!isInitialising && <InitLoadingModal />}
    </div>
  )
}