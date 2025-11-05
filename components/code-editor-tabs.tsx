"use client";
import { useEditorStore } from "@/stores/editorStore/useEditorStore";
import { Code, Download, Eye, Fullscreen, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios"; 
import { UsageLimitModal } from "./usage-limit-modal"; 

interface CodeEditorTabsProps {
  activeTab: "code" | "preview";
  onTabChange: (tab: "code" | "preview") => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
}

export function CodeEditorTabs({
  activeTab,
  onTabChange,
  isFullscreen,
  setIsFullscreen,
}: CodeEditorTabsProps) {
  const { fileItems } = useEditorStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const handleDownloadZip = async () => {
    setIsDownloading(true);

    try {
      const response = await axiosInstance.post("/api/check-download");
      const data = response.data;
      toast.success("Download approved! Preparing your zip...");

      const zip = new JSZip();
      Object.entries(fileItems).forEach(([, file]) => {
        if (file?.path && typeof file.content === "string") {
          zip.file(file.path, file.content);
        }
      });

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "zap.zip");

      if (data.remaining !== "Unlimited") {
        await new Promise(r => setTimeout(r, 3000))
        toast.success(`You have ${data.remaining} downloads remaining.`);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        setIsLimitModalOpen(true);
      } else {
        console.error("Download failed:", error);
        const errorMessage = (error instanceof AxiosError && error.response?.data?.error)
          ? error.response.data.error
          : "An unexpected error occurred during download.";
        toast.error(errorMessage);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    // Wrap in a React Fragment
    <>
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
          disabled={isDownloading}
          className="px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center disabled:opacity-50"
          title="Download as ZIP"
        >
          {isDownloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center"
          title="Fullscreen"
        >
          <Fullscreen className="size-4" />
        </button>
      </div>
      
      {/* Render the modal */}
      <UsageLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        reason="DOWNLOAD_LIMIT"
      />
    </>
  );
}