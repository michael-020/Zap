"use client"

import { useEffect, useState } from "react"
import RightSidebar from "./sidebar"
import { axiosInstance } from "@/lib/axios"
import Navbar from "./navbar"
import ProjectsList from "./projects-list"
import ProjectCardSkeleton from "./project-card-skeleton"
import { useRouter } from "next/navigation"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { Project } from "./project-card"
import { useSession } from "next-auth/react"
import { DownloadIcon } from "lucide-react"

export function Profile() {
    const [projects, setProjects] = useState<Project[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()
    const { clearBuildSteps, setFileItems, setSelectedFile, clearPromptStepsMap, setMessages } = useEditorStore()
    const session = useSession()

    const handleBackToInitializer = () => {
        clearBuildSteps()
        setFileItems([])
        setSelectedFile(null)
        clearPromptStepsMap()
        setMessages([])
        router.push("/chat")
    }

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
    
    const sidebarVisible = isOpen || isHovered;
    
    const fetchProjects = async () => {
        try {
            setIsLoading(true)
            const res = await axiosInstance.get("/api/previous-projects")
            setProjects(res.data)
        } catch (error) {
            console.error("Failed to fetch projects:", error)
            setProjects([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    const user = session?.data?.user
    const downloadCount = user?.downloadCount ?? 0
    const isPremium = user?.isPremium ?? false
    const downloadLimit = 5

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <Navbar 
                onBack={handleBackToInitializer}
                onPanelToggle={() => setIsOpen(!isOpen)}
                showPanelToggle={true} 
                showBackButton={true}
            />
            <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                            My Chats
                        </h1>
                        {!isLoading && projects && projects.length > 0 && (
                            <button
                                onClick={() => setIsSelectionMode(!isSelectionMode)}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 transition-colors"
                            >
                                {isSelectionMode ? 'Cancel Selection' : 'Select Chats'}
                            </button>
                        )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                        Manage and explore your previous Chats
                    </p>
                    {user && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <DownloadIcon className="size-4 text-neutral-700 dark:text-neutral-300" />
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Downloads: {isPremium ? downloadCount : `${downloadCount}/${downloadLimit}`}
                            </span>
                            {!isPremium && downloadCount >= downloadLimit && (
                                <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                    Limit reached
                                </span>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="mb-8">

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <ProjectCardSkeleton key={index} />
                        ))}
                    </div>
                ) : projects && projects.length > 0 ? (
                    <ProjectsList 
                        projects={projects} 
                        isSelectionMode={isSelectionMode}
                        onProjectsUpdate={fetchProjects}
                    />
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16">
                        <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                            No chats yet
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-sm mb-6">
                            Start a new conversation to create your first project
                        </p>
                        <button
                            onClick={() => router.push('/chat')}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 transition-colors"
                        >
                            New Chat
                        </button>
                    </div>
                )}
            </div>

            <RightSidebar
                isOpen={sidebarVisible}
                setIsOpenAction={handleSidebarClose}
                onMouseLeaveAction={handleSidebarMouseLeave}
            />
        </div>
        </div>
    )
}