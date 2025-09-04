import { useState } from "react"
import { Chat } from "./sidebar"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axios"

interface ProjectCardProps {
    chat: Chat
    onUpdate?: () => void
}

export default function ProjectCard({ chat, onUpdate }: ProjectCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const router = useRouter()

    const formatDate = (dateString?: string) => {
        if (!dateString) return "No date"
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch {
            return "Invalid date"
        }
    }

    // Get project initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('')
    }

    const handleCardClick = () => {
        // Navigate to project or handle click action
        console.log("Navigate to project:", chat.id)
        router.push(`/chat/${chat.id}`)
    }

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMenuOpen(!isMenuOpen)
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMenuOpen(false)
        
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                // Implement delete functionality
                await axiosInstance.delete(`/api/project/${chat.id}`)
                onUpdate?.()
            } catch (error) {
                console.error("Failed to delete project:", error)
            }
        }
    }

    const handleRename = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMenuOpen(false)
        
        const newName = window.prompt("Enter new project name:", chat.name)
        if (newName && newName.trim()) {
            try {
                // Implement rename functionality
                console.log("Rename project:", chat.id, "to:", newName)
                // await axiosInstance.patch(`/api/projects/${chat.id}`, { name: newName })
                onUpdate?.()
            } catch (error) {
                console.error("Failed to rename project:", error)
            }
        }
    }

    return (
        <div 
            className="group relative bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer "
            onClick={handleCardClick}
        >
            {/* Card Header */}
            <div className="p-4 pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Project Avatar */}
                        <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {getInitials(chat.name)}
                        </div>
                        
                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {chat.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {formatDate(chat.updatedAt.toString() || chat.createdAt.toString())}
                            </p>
                        </div>
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                        <button
                            onClick={handleMenuClick}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200"
                            aria-label="Project options"
                        >
                            <svg className="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 z-20">
                                    <button
                                        onClick={handleRename}
                                        className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-t-md transition-colors"
                                    >
                                        Rename
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-md transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="px-4 pb-4">
                {/* Project Description/Preview */}
                {/* <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                    {chat.description || "No description available"}
                </p> */}

                {/* Project Stats */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {/* <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {chat.messageCount || 0}
                            </span> */}
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Active
                        </span>
                    </div>
                </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-neutral-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </div>
    )
}