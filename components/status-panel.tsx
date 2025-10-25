/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { Clock, AlertCircle, Loader2, Check, Copy } from 'lucide-react'
import { BuildStepType, statusType } from "@/stores/editorStore/types"
import { ImageModal } from "./image-modal"
import { StatusPanelSkeletons } from "./status-pannel-skeletons"
import { PromptInputPanel } from "./prompt-input-panel"
import { useSession } from "next-auth/react"

export function StatusPanel() {
  const { processFollowupPrompts, isProcessing, isProcessingFollowups, promptStepsMap, isFetchingImages } = useEditorStore()
  const [prompt, setPrompt] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState("")
  const session = useSession()

  const openImageModal = (imageSrc: string) => {
    setModalImageSrc(imageSrc)
    setIsModalOpen(true)
  }

  const closeImageModal = () => {
    setIsModalOpen(false)
    setModalImageSrc("")
  }
  
  const handleSubmit = (description: string, files: File[]) => {
    if (!description.trim()) return
    
    processFollowupPrompts(description, files);
    setPrompt("")
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

  if (!promptStepsMap || promptStepsMap.size === 0) {
    return <StatusPanelSkeletons />
  }

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col overflow-x-hidden">
      <div className="flex-1 overflow-x-hidden flex-wrap p-4 space-y-4 custom-scrollbar">
        {Array.from(promptStepsMap.entries()).map(([promptIndex, { prompt, steps, images, description }]) => (
          <div key={promptIndex} className="space-y-3">
            <div className="flex flex-col items-end gap-1 justify-end mb-3">
              {isFetchingImages ? (
                    <div 
                      className="aspect-square bg-neutral-800 size-20 flex items-center justify-center text-center rounded-md animate-pulse relative"
                    >
                          <p className="text-xs text-neutral-400">Fetching Images...</p>
                    </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                {images && images.map((image: string | File, index: number) => {
                  let imageSrc: string;
                  if (typeof image === 'string') {
                    imageSrc = image;
                  } else {
                    imageSrc = URL.createObjectURL(image);
                  }

                  return (
                    <div 
                      key={`${typeof image === 'string' ? image : image.name}-${index}`} 
                      className="rounded-sm aspect-square cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                      onClick={() => openImageModal(imageSrc)}
                    >
                      <img 
                        src={imageSrc} 
                        alt="prompt-image" 
                        crossOrigin="anonymous" 
                        className="scale-200" 
                      />
                    </div>
                  );
                })}
              </div>

              )}
              
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
            {description && (
                <div className="p-4">
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}
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
            <span>Thinking...</span>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-800 p-2 bg-neutral-950">
        <PromptInputPanel
          isPremium={session.data?.user.isPremium as boolean}
          description={prompt}
          setDescription={setPrompt}
          onSubmit={handleSubmit}
          isSubmitting={isProcessingFollowups}
          disabled={false}
          placeholder="Ask a follow up..."
          textareaHeight="3rem"
          textareaMaxHeight="10rem"
          textareaClassName="placeholder:text-sm text-sm"
          maxImages={10}
          submitButtonSize={"4"}
          imageSelectorSize={"5"}
        />
      </div>

      <ImageModal
        isOpen={isModalOpen}
        imageSrc={modalImageSrc}
        onClose={closeImageModal}
      />
    </div>
  )
}