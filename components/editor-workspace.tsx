"use client"

import { useState } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { CodeEditorTabs } from "./code-editor-tabs"
import { EditorPanel } from "./editor-pannel"
import { PreviewPanel } from "./preview-pannel"
import { EditorErrorBoundary } from "./editor-error-boundary"
import { FileExplorer } from "./file-explorer"
import { EditorWorkspaceSkeletons } from "./editor-workspace-skeletons"

export function EditorWorkspace({ isFullscreen, setIsFullscreen }: { isFullscreen: boolean, setIsFullscreen: (value: boolean) => void }) {
  const { selectedFile, fileItems } = useEditorStore()
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")

  if (!fileItems || fileItems.length === 0) {
    return <EditorWorkspaceSkeletons />
  }

  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center  pt-10">
        <div className="text-center">
          <p className="text-lg font-medium text-neutral-300">No file selected</p>
          <p className="text-sm text-neutral-400">Please select a file to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <CodeEditorTabs isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {activeTab === "code" ? (
          <div className="h-full flex">
            {/* File Explorer */}
            <div className="w-64 border-r border-neutral-800">
              <FileExplorer />
            </div>

            {/* Code Editor */}
            <div className="flex-1">
              <EditorErrorBoundary>
                <EditorPanel filePath={selectedFile} />
              </EditorErrorBoundary>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <PreviewPanel />
          </div>
        )}
      </div>
    </div>
  )
}