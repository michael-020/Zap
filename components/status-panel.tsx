"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { Clock, AlertCircle, Loader2, Check, Copy, ArrowUp, ImageIcon, X } from 'lucide-react'
import { BuildStepType, statusType } from "@/stores/editorStore/types"
import { TextArea } from "./text-area"
import toast from "react-hot-toast"
import Image from "next/image"

export function StatusPanel() {
  const { processFollowupPrompts, isProcessing, isProcessingFollowups, promptStepsMap } = useEditorStore()
  const [prompt, setPrompt] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    
    if (files.length === 0) return;

    // Validate all files are images
    const invalidFiles = files.filter(file => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    // Check if adding these files would exceed a reasonable limit (e.g., 10 images)
    if (imagePreviews.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    // Process each file
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Clear the input so the same files can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeAllImages = () => {
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleSubmit = () => {
    if (!prompt.trim()) return
    
    processFollowupPrompts(prompt, imagePreviews);
    
    setPrompt("")
    setImagePreviews([]) // Clear images after submit
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  const handleCopy = async (text: string, promptIndex: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPromptIndex(promptIndex)

      setTimeout(() => {
        setCopiedPromptIndex(null)
      }, 3000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const getStatusIcon = (status: statusType) => {
    switch (status) {
      case statusType.Completed:
        return <Check className="w-4 h-4 text-green-500 translate-y-1" />
      case statusType.InProgress:
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case statusType.Error:
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [promptStepsMap])


  return (
    <div className="h-[calc(100vh-60px)] flex flex-col overflow-x-hidden">

      <div className="flex-1 overflow-x-hidden flex-wrap p-4 space-y-4 custom-scrollbar">
        {Array.from(promptStepsMap.entries()).map(([promptIndex, { prompt, steps, images }]) => (
          <div key={promptIndex} className="space-y-3">
            <div className="flex flex-col items-end gap-1 justify-end mb-3">
              <div className="flex gap-2">
                {images && images.map((image: string) => {
                  return <div key={image} className="rounded-md">
                    <img src={image} alt="prompt-image" crossOrigin="anonymous" />
                  </div>
                })}
              </div>
              <div className="bg-neutral-700 rounded-lg rounded-tr-none p-3 max-w-[80%] ml-auto">
                <p className="text-sm text-white break-words">
                  {prompt}
                </p>
              </div>
              <button
                onClick={() => handleCopy(prompt, promptIndex)}
                className="p-1 hover:text-white text-gray-400 transition-colors"
                title={copiedPromptIndex === promptIndex ? "Copied" : "Copy prompt"}
                aria-label="Copy prompt"
              >
                {copiedPromptIndex === promptIndex ? (
                  <Check className="size-4 text-neutral-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>


            
            {/* Render Build Steps for this prompt */}
            {steps.length > 0 && (
              <div className="space-y-2 ml-2 bg-neutral-900 px-3 p-2 rounded-lg">
                {steps.filter(step => step.shouldExecute !== false).map((step) => (
                  <div key={step.id} className="flex items-start gap-3 py-0.5 group">
                    {getStatusIcon(step.status)}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {step.type === BuildStepType.RunScript ? 
                        <div className="space-y-2">
                            <p className="text-[0.8rem] text-blue-500">Execute Command</p>
                          <p className="text-[0.8rem] text-orange-300 py-2 pl-2 rounded-md text-wrap bg-neutral-800 transition-colors">
                            {step.description}
                          </p> 
                        </div> :
                        <div className="text-[0.8rem] text-gray-300 text-wrap group-hover:text-white transition-colors">
                          {step.title.startsWith("Create") ? (
                            <div className="space-x-1 flex flex-wrap items-center">
                              <span className="font-semibold text-white">Create</span>
                              <span className="bg-neutral-800 p-2 py-1 rounded-md">
                                {step.title
                                  .replace(/^Create\s*/, "")                  
                                  .replace(/^React Component\s*/, "")}        
                              </span>
                            </div>
                          ) : (
                            <div className="text-white">{step.title}</div>
                          )}
                        </div>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          <div ref={bottomRef} ></div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-blue-400 mt-4 p-3 bg-blue-900/20 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing changes...</span>
          </div>
        )}
      </div>

      {/* Image Previews Section */}
      {imagePreviews.length > 0 && (
        <div className="border-t border-neutral-800 p-3 bg-neutral-950">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">
                Selected Images ({imagePreviews.length})
              </h4>
              <button
                type="button"
                onClick={removeAllImages}
                className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
              >
                Remove All
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-md overflow-hidden bg-neutral-800">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-neutral-800 p-2 bg-neutral-950">
        <form onSubmit={handleFormSubmit} className="flex gap-2 relative">
          <TextArea
            id="description"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onEnterSubmit={handleSubmit}
            placeholder="Ask a follow up..."
            height="4rem"
            className="text-[1rem] pl-4 pt-2 pr-20" // Add right padding for icons
            maxHeight="16rem"
            required
          />

          {/* File Input and Gallery Icon */}
          <div className="absolute bottom-3 right-14 flex items-center justify-center">
            <label htmlFor="followupFileInput" className="cursor-pointer relative">
              <ImageIcon className="w-5 h-5 text-neutral-400 hover:text-neutral-300 transition-colors" />
              {imagePreviews.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {imagePreviews.length}
                </span>
              )}
            </label>
            <input
              id="followupFileInput"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!prompt.trim() || isProcessingFollowups}
            className={`px-2 py-2 rounded-lg absolute bottom-2 right-2 font-medium transition-all duration-200 flex items-center gap-2 ${
              prompt.trim() && !isProcessing
                ? "bg-neutral-300 hover:bg-neutral-400 text-black"
                : "bg-neutral-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isProcessingFollowups ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ArrowUp className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}