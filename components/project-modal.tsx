import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { axiosInstance } from "@/lib/axios"

interface ProjectModalProps {
    isOpen: boolean
    onClose: () => void
    mode: 'delete' | 'rename'
    projectId: string
    projectName: string
    onSuccess?: () => void
}

export default function ProjectModal({ 
    isOpen, 
    onClose, 
    mode, 
    projectId, 
    projectName, 
    onSuccess 
}: ProjectModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [newName, setNewName] = useState(projectName)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        setNewName(projectName)
    }, [projectName])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await axiosInstance.delete(`/api/project/${projectId}`)
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error("Failed to delete project:", error)
            // You can add toast notification here
        } finally {
            setIsLoading(false)
        }
    }

    const handleRename = async () => {
        if (!newName.trim()) return
        
        setIsLoading(true)
        try {
            await axiosInstance.put(`/api/project/${projectId}`, { name: newName.trim() })
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error("Failed to rename project:", error)
            // You can add toast notification here
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (mode === 'delete') {
            handleDelete()
        } else {
            handleRename()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        }
    }

    if (!mounted || !isOpen) return null

    const modalContent = (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div 
                    className="relative bg-neutral-800 rounded-xl shadow-xl border border-neutral-700 w-full max-w-md transform transition-all"
                    onKeyDown={handleKeyDown}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-neutral-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">
                                {mode === 'delete' ? 'Delete Project' : 'Rename Project'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-neutral-400 hover:text-white transition-colors p-1 rounded-md hover:bg-neutral-700"
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4">
                            {mode === 'delete' ? (
                                <div>
                                    <p className="text-neutral-300 mb-4">
                                        Are you sure you want to delete <span className="font-semibold text-white">{projectName}</span>? 
                                        This action cannot be undone.
                                    </p>
                                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <p className="text-sm text-red-300">
                                                All chat history and data associated with this project will be permanently deleted.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="projectName" className="block text-sm font-medium text-neutral-300 mb-2">
                                        Project Name
                                    </label>
                                    <input
                                        id="projectName"
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter project name"
                                        autoFocus
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-neutral-900/50 rounded-b-xl flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    mode === 'delete' 
                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                                disabled={isLoading || (mode === 'rename' && !newName.trim())}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>{mode === 'delete' ? 'Deleting...' : 'Saving...'}</span>
                                    </div>
                                ) : (
                                    mode === 'delete' ? 'Delete Project' : 'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}