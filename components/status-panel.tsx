"use client"

import { useEffect, useRef, useState } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { Clock, AlertCircle, Loader2, Check, Copy, ArrowUp } from 'lucide-react'
import { BuildStepType, statusType } from "@/stores/editorStore/types"
import { TextArea } from "./text-area"

export function StatusPanel() {
  const { processFollowupPrompts, isProcessing, isProcessingFollowups, promptStepsMap } = useEditorStore()
  const [prompt, setPrompt] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null)
  
  const handleSubmit = () => {
    if (!prompt.trim()) return
    
    processFollowupPrompts(
      prompt
    );
    
    setPrompt("") 
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
        {Array.from(promptStepsMap.entries()).map(([promptIndex, { prompt, steps }]) => (
          <div key={promptIndex} className="space-y-3">
            <div className="flex flex-col items-end gap-1 justify-end mb-3">
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

      <div className="border-t border-neutral-800 p-2 bg-neutral-950">
        <form onSubmit={handleFormSubmit} className="flex gap-2 relative">
          <TextArea
            id="description"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onEnterSubmit={handleSubmit}
            placeholder="Ask a follow up..."
            height="4rem"
            className="text-[1rem] pl-4 pt-2"
            maxHeight="16rem"
            required
          />
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