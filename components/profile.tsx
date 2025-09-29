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

export function Profile() {
    const [projects, setProjects] = useState<Project[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()
    const { clearBuildSteps, setFileItems, setSelectedFile, clearPromptStepsMap } = useEditorStore()

    const handleBackToInitializer = () => {
        clearBuildSteps()
        setFileItems([])
        setSelectedFile(null)
        clearPromptStepsMap()
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

    return (
        <div className="min-h-screen bg-neutral-950">
            <Navbar 
                onBack={handleBackToInitializer}
                onPanelToggle={() => setIsOpen(!isOpen)}
                showPanelToggle={true} 
                showBackButton={true}
            />
            <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section with Selection Toggle */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            My Chats
                        </h1>
                        <p className="text-neutral-300">
                            Manage and explore your previous Chats
                        </p>
                    </div>
                    {/* Only show Select Projects button if there are projects */}
                    {!isLoading && projects && projects.length > 0 && (
                        <button
                            onClick={() => setIsSelectionMode(!isSelectionMode)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
                        >
                            {isSelectionMode ? 'Cancel Selection' : 'Select Chats'}
                        </button>
                    )}
                </div>

                {/* Projects Content */}
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
                        <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">
                            No chats yet
                        </h3>
                        <p className="text-neutral-400 text-center max-w-sm mb-6">
                            Start a new conversation to create your first project
                        </p>
                        <button
                            onClick={() => router.push('/chat')}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
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
    )
}