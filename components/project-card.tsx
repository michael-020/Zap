import { useState } from "react"
import { useRouter } from "next/navigation"
import ProjectModal from "./project-modal"

export interface Project {
  id: string
  name: string
  description: string 
  icon?: string 
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

    const handleOpenProject = (e: React.MouseEvent) => {
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

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect?.()
    }

    return (
        <>
            <div 
                className={`group relative p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all
                            ${isSelected ? 'ring-2 ring-purple-400/70 border-purple-400/70' : 'hover:border-neutral-300 dark:hover:border-neutral-700'}
                            flex flex-col h-full justify-between`} 
            >
                {showCheckbox && (
                    <div className="absolute top-2 left-2 z-10">
                        <button
                            onClick={handleCheckboxClick}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                        ${isSelected ? 'bg-purple-400/70 border-purple-400/70 hover:bg-purple-500/70' 
                                                    : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                        >
                            {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 
                            className="text-md font-semibold text-neutral-900 dark:text-white truncate"
                            title={project.name}
                        >
                            {project.name}
                        </h3>
                    </div>

                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2" title={project.description}>
                        {project.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <button
                        onClick={handleOpenProject}
                        className="px-3 py-1.5 text-sm font-medium rounded-md bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 transition-colors"
                    >
                        Open Project
                    </button>

                    <div className="relative">
                        <button
                            onClick={handleMenuClick}
                            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all"
                            aria-label="Project options"
                        >
                            <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

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