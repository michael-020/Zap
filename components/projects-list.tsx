import { useState, useEffect } from 'react'
import ProjectCard, { Project } from './project-card'
import ProjectModal from './project-modal'

interface ProjectsListProps {
    projects: Project[]
    isSelectionMode: boolean
    onProjectsUpdate: () => void
}

export default function ProjectsList({ projects, isSelectionMode, onProjectsUpdate }: ProjectsListProps) {
    const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
    const [modalState, setModalState] = useState<{
        isOpen: boolean
        mode: 'delete' | 'rename'
        projectId?: string | string[]
        projectName?: string | string[]
    }>({
        isOpen: false,
        mode: 'delete'
    })

    // Reset selection when selection mode is disabled
    useEffect(() => {
        if (!isSelectionMode) {
            setSelectedProjects(new Set())
        }
    }, [isSelectionMode])

    const handleSelectAll = () => {
        setSelectedProjects(new Set(projects.map(p => p.id)))
    }

    const handleUnselectAll = () => {
        setSelectedProjects(new Set())
    }

    const handleDeleteSelected = () => {
        if (selectedProjects.size === 0) return

        setModalState({
            isOpen: true,
            mode: 'delete',
            projectId: Array.from(selectedProjects),
            projectName: projects
                .filter(p => selectedProjects.has(p.id))
                .map(p => p.name)
        })
    }

    const handleModalClose = () => {
        setModalState({ isOpen: false, mode: 'delete' })
    }

    const handleModalSuccess = () => {
        setSelectedProjects(new Set())
        onProjectsUpdate()
    }

    return (
        <div>
            {/* Selection Controls */}
            {isSelectionMode && (
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={handleSelectAll}
                        className="px-4 py-2 text-sm font-medium bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                    >
                        Select All
                    </button>
                    <button
                        onClick={handleUnselectAll}
                        className="px-4 py-2 text-sm font-medium bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                    >
                        Unselect All
                    </button>
                    {selectedProjects.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete Selected ({selectedProjects.size})
                        </button>
                    )}
                </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        isSelected={selectedProjects.has(project.id)}
                        onSelect={() => {
                            if (!isSelectionMode) return
                            setSelectedProjects(prev => {
                                const newSelection = new Set(prev)
                                if (newSelection.has(project.id)) {
                                    newSelection.delete(project.id)
                                } else {
                                    newSelection.add(project.id)
                                }
                                return newSelection
                            })
                        }}
                        showCheckbox={isSelectionMode}
                        onUpdate={handleModalSuccess}
                    />
                ))}
            </div>

            {/* Delete Modal */}
            <ProjectModal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                mode={modalState.mode}
                projectId={modalState.projectId || ''}
                projectName={modalState.projectName || ''}
                onSuccess={handleModalSuccess}
            />
        </div>
    )
}