"use client"

import { useEffect, useState } from "react"
import RightSidebar, { Chat } from "./sidebar"
import { axiosInstance } from "@/lib/axios"
import Navbar from "./navbar"
import ProjectCard from "./project-card"
import ProjectCardSkeleton from "./project-card-skeleton"
import { useRouter } from "next/navigation"

export function Profile() {
    const [chats, setChats] = useState<Chat[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter()

    const handleBackToInitializer = () => {
        router.push("/chat")
    }

    const handleSidebarMouseLeave = () => {
        setIsHovered(false);
    };

    const handleSidebarClose = () => {
        setIsOpen(false);
        setIsHovered(false);
    };
    
    const sidebarVisible = isOpen || isHovered;
    
    const fetchChats = async () => {
        try {
            setIsLoading(true)
            const res = await axiosInstance.get("/api/previous-projects")
            setChats(res.data)
        } catch (error) {
            console.error("Failed to fetch chats:", error)
            setChats([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchChats()
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
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                        My Projects
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-300">
                        Manage and explore your previous projects
                    </p>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                    {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 8 }).map((_, index) => (
                            <ProjectCardSkeleton key={index} />
                        ))
                    ) : chats && chats.length > 0 ? (
                        // Project cards
                        chats.map((chat) => (
                            <ProjectCard 
                                key={chat.id} 
                                chat={chat}
                                onUpdate={fetchChats}
                            />
                        ))
                    ) : (
                        // Empty state
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">
                                No projects yet
                            </h3>
                            <p className="text-neutral-400 text-center max-w-sm">
                                Start a new conversation to create your first project
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <RightSidebar
                isOpen={sidebarVisible}
                setIsOpenAction={handleSidebarClose}
                onMouseLeaveAction={handleSidebarMouseLeave}
            />
        </div>
    )
}