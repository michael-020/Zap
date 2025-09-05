export default function ProjectCardSkeleton() {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-pulse">
            {/* Card Header */}
            <div className="p-4 pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                        {/* Avatar Skeleton */}
                        <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex-shrink-0" />
                        
                        {/* Project Info Skeleton */}
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
                            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                        </div>
                    </div>

                    {/* Menu Button Skeleton */}
                    <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded" />
                </div>
            </div>
        </div>
    )
}