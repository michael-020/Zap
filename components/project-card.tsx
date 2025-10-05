/* eslint-disable @next/next/no-img-element */
import { useState } from "react"
import { useRouter } from "next/navigation"
import ProjectModal from "./project-modal"

export interface Project {
  id: string
  name: string
  previewUrl?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  userId: string
}

interface ProjectCardProps {
    project: Project
    isSelected?: boolean
    showCheckbox?: boolean
    onSelect?: () => void
    onUpdate?: () => void
}

export default function ProjectCard({ 
    project, 
    isSelected, 
    showCheckbox,
    onSelect, 
    onUpdate 
}: ProjectCardProps) {
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
        router.push(`/prev-chat/${project.id}`)
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

    // Add a checkbox for selection
    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect?.()
    }

    return (
        <>
            <div className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                {/* Selection checkbox */}
                {showCheckbox && (
                    <div className="absolute top-2 left-2 z-10">
                        <button
                            onClick={handleCheckboxClick}
                            className="w-5 h-5 rounded border border-neutral-600 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 transition-colors"
                        >
                            {isSelected && (
                                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                )}

                {/* Iframe Section */}
                <div className="w-full h-48 rounded-t-xl bg-neutral-100 dark:bg-neutral-700">
                    <img
                        src={project.previewUrl!}
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
                                {project.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {formatDate(project.updatedAt?.toString() || project.createdAt?.toString())}
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
                projectId={project.id}
                projectName={project.name}
                onSuccess={handleModalSuccess}
            />
        </>
    )
}