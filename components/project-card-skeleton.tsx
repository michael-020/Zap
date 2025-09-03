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

            {/* Card Content */}
            <div className="px-4 pb-4">
                {/* Description Skeleton */}
                <div className="space-y-2 mb-3">
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                </div>

                {/* Stats Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-neutral-700 rounded" />
                            <div className="h-3 bg-neutral-700 rounded w-6" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-neutral-700 rounded-full" />
                        <div className="h-3 bg-neutral-700 rounded w-8" />
                    </div>
                </div>
            </div>
        </div>
    )
}