import { useState } from "react"
import { Chat } from "./sidebar"
import { useRouter } from "next/navigation"
import ProjectModal from "./project-modal"

interface ProjectCardProps {
    chat: Chat
    onUpdate?: () => void
}

export default function ProjectCard({ chat, onUpdate }: ProjectCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [modalState, setModalState] = useState<{
        isOpen: boolean
        mode: 'delete' | 'rename'
    }>({
        isOpen: false,
        mode: 'delete'
    })
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

    const handleNameClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/chat/${chat.id}`)
    }

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMenuOpen(!isMenuOpen)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMenuOpen(false)
        setModalState({ isOpen: true, mode: 'delete' })
    }

    const handleRename = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMenuOpen(false)
        setModalState({ isOpen: true, mode: 'rename' })
    }

    const closeModal = () => {
        setModalState({ ...modalState, isOpen: false })
    }

    const handleModalSuccess = () => {
        onUpdate?.()
        closeModal()
    }

    return (
        <>
            <div className="group relative bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200">
                {/* Iframe Section */}
                <div className="w-full h-48 rounded-t-xl bg-neutral-100 dark:bg-neutral-700">
                    <img
                        src={chat.previewUrl}
                        alt="Project Preview"
                        title="Project Preview"
                        crossOrigin="anonymous" 
                        className="rounded-t-xl size-full object-contain"
                    />
                </div>

                {/* Card Content */}
                <div className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            {/* Project Info */}
                            <h3 
                                className="text-sm font-semibold text-neutral-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                onClick={handleNameClick}
                            >
                                {chat.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {formatDate(chat.updatedAt?.toString() || chat.createdAt?.toString())}
                            </p>
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

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-neutral-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
            </div>

            {/* Modal */}
            <ProjectModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                mode={modalState.mode}
                projectId={chat.id}
                projectName={chat.name}
                onSuccess={handleModalSuccess}
            />
        </>
    )
}