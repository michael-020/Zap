"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, Loader2, LoaderPinwheel } from 'lucide-react'
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { TextArea } from "./text-area"
import RightSidebar from "./sidebar"
import Navbar from "./navbar"

interface ProjectInitializerProps {
  onSubmitAction: (description: string) => void
}

export function ProjectInitializer({ onSubmitAction }: ProjectInitializerProps) {
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef(null)
  const { processPrompt } = useEditorStore()
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { data: session, status } = useSession()
  
  useEffect(() => {
    if(status === "loading") return
    if (!session) {
      redirect("/")
    }
  }, [session, status])

  useEffect(() => { 
    if (textareaRef.current) {
      (textareaRef.current as HTMLTextAreaElement).focus()
    }
  }, [])

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
   
  const sidebarVisible = isOpen || isHovered;

  const handleSubmit = () => {
    if (!description.trim()) return

    setIsLoading(true)
    
    try {
      processPrompt(description)
      
      onSubmitAction(description.trim())

    } catch (error) {
      console.error("Error generating steps:", error)
    } finally {
      setIsLoading(false)
    }
  }

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleSubmit()
    }
   
   if(!session){
     return <div className="h-screen bg-black flex items-center justify-center">
       <Loader2 className="size-14 animate-spin text-neutral-200" />
     </div>
   }

  return (
    <div className="relative min-h-screen bg-black">
      <Navbar
        onPanelToggle={() => setIsOpen(!isOpen)}
        showPanelToggle={true}
      />

      <div className="flex items-center justify-center min-h-screen px-6 pb-20">
        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* Hero Text */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Start with a sentence.
              </h1>
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                End with a website.
              </h2>
            </div>

            {/* Input Section */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <TextArea
                  id="description"
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onEnterSubmit={handleSubmit}
                  placeholder="Describe the website you want to build..."
                  height="8rem"
                  maxHeight="16rem"
                  required
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!description.trim() || isLoading}
                  className={`absolute bottom-4 right-4 p-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    description.trim() && !isLoading
                      ? "bg-neutral-300 hover:bg-neutral-400 text-black shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5 hover:scale-105"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  {!isLoading ? (
                    <>
                      <ArrowUp className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <LoaderPinwheel className="animate-spin w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <RightSidebar
        isOpen={sidebarVisible}
        setIsOpenAction={setIsOpen}
        onMouseLeaveAction={handleSidebarMouseLeave}
      />
    </div>
  )
}