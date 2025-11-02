"use client"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { Code, Download, Eye, Fullscreen } from "lucide-react"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface CodeEditorTabsProps {
  activeTab: "code" | "preview"
  onTabChange: (tab: "code" | "preview") => void
  isFullscreen: boolean
  setIsFullscreen: (value: boolean) => void
}

export function CodeEditorTabs({ activeTab, onTabChange, isFullscreen, setIsFullscreen }: CodeEditorTabsProps) {
  const { fileItems } = useEditorStore()

  const handleDownloadZip = async () => {
    const zip = new JSZip()

    Object.entries(fileItems).forEach(([, file]) => {
      if (file?.path && typeof file.content === "string") {
        zip.file(file.path, file.content)
      }
    })

    const blob = await zip.generateAsync({ type: "blob" })

    saveAs(blob, "project.zip")
  }

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex p-2 gap-4">
      <div className="flex">
        <button
          onClick={() => onTabChange("code")}
          title="Code Editor"
          className={`px-4 py-2 text-sm border-r rounded-l-lg border-neutral-300 dark:border-neutral-700 transition-colors flex items-center gap-1 ${
            activeTab === "code"
            ? "bg-neutral-300 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            }`}
            >
          <Code className="size-3" />
        </button>
        <button
          title="Preview"
          onClick={() => onTabChange("preview")}
          className={`px-4 py-2 text-sm transition-colors rounded-r-lg flex items-center gap-1 ${
            activeTab === "preview"
            ? "bg-neutral-300 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200"
            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
          >
          <Eye className="size-3" />
        </button>
      </div>

      <button
        onClick={handleDownloadZip}
        className="px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center"
        title="Download as ZIP"
      >
        <Download className="size-4" />
      </button>

      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center"
        title="Fullscreen"
      >
        <Fullscreen className="size-4" />
      </button>
    </div>
  )
}
