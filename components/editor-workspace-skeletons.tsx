export function EditorWorkspaceSkeletons() {
    return (
      <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Tabs Skeleton */}
        <div className="flex border-b border-neutral-800 bg-neutral-900">
          <div className="flex">
            <div className="px-4 py-2 bg-neutral-800 border-r border-neutral-700 animate-pulse">
              <div className="h-4 bg-neutral-600 rounded w-8"></div>
            </div>
            <div className="px-4 py-2 bg-neutral-900 border-r border-neutral-700 animate-pulse">
              <div className="h-4 bg-neutral-700 rounded w-12"></div>
            </div>
          </div>
        </div>
  
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* File Explorer Skeleton */}
            <div className="w-64 border-r border-neutral-800 bg-neutral-950">
              {/* Header */}
              <div className="p-3 border-b border-neutral-800">
                <div className="h-5 bg-neutral-700 rounded w-12 animate-pulse"></div>
              </div>
              
              {/* File tree */}
              <div className="p-2 space-y-1">
                {/* Root folder */}
                <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                  <div className="w-4 h-4 bg-neutral-700 rounded"></div>
                  <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                  <div className="h-4 bg-neutral-600 rounded w-6"></div>
                </div>
                
                {/* Nested components folder */}
                <div className="ml-4">
                  <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                    <div className="w-4 h-4 bg-neutral-700 rounded"></div>
                    <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                    <div className="h-4 bg-neutral-600 rounded w-20"></div>
                  </div>
                  
                  {/* Files inside components */}
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                      <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                      <div className="h-4 bg-neutral-600 rounded w-16"></div>
                    </div>
                    <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                      <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                      <div className="h-4 bg-neutral-600 rounded w-18"></div>
                    </div>
                    <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                      <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                      <div className="h-4 bg-neutral-600 rounded w-20"></div>
                    </div>
                    <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                      <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                      <div className="h-4 bg-neutral-600 rounded w-16"></div>
                    </div>
                    <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                      <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                      <div className="h-4 bg-neutral-600 rounded w-20"></div>
                    </div>
                  </div>
                </div>
                
                {/* Types folder */}
                <div className="ml-4">
                  <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                    <div className="w-4 h-4 bg-neutral-700 rounded"></div>
                    <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                    <div className="h-4 bg-neutral-600 rounded w-10"></div>
                  </div>
                  
                  <div className="ml-6">
                    <div className="flex items-center gap-2 py-1 px-2 animate-pulse">
                      <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                      <div className="h-4 bg-neutral-600 rounded w-12"></div>
                    </div>
                  </div>
                </div>
                
                {/* Root files */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 px-2 animate-pulse">
                    <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                    <div className="h-4 bg-neutral-600 rounded" style={{ width: `${Math.random() * 40 + 40}px` }}></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Code Editor Skeleton */}
            <div className="flex-1 bg-neutral-900">
              {/* Editor header with file name and controls */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900">
                <div className="flex items-center gap-2 animate-pulse">
                  <div className="w-4 h-4 bg-neutral-600 rounded"></div>
                  <div className="h-4 bg-neutral-600 rounded w-24"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-neutral-700 rounded animate-pulse"></div>
                  <div className="w-6 h-6 bg-neutral-700 rounded animate-pulse"></div>
                  <div className="w-6 h-6 bg-neutral-700 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Line numbers and code content */}
              <div className="flex h-full">
                {/* Line numbers */}
                <div className="bg-neutral-950 border-r border-neutral-800 px-3 py-4 text-right text-neutral-500 min-w-[50px]">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="h-6 flex items-center justify-end animate-pulse">
                      <div className="h-3 bg-neutral-700 rounded w-4"></div>
                    </div>
                  ))}
                </div>
                
                {/* Code content */}
                <div className="flex-1 p-4 space-y-1">
                  {/* Import statements */}
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-4 bg-blue-600 rounded w-12"></div>
                    <div className="h-4 bg-neutral-300 rounded w-4"></div>
                    <div className="h-4 bg-blue-600 rounded w-8"></div>
                    <div className="h-4 bg-orange-400/70 rounded w-20"></div>
                  </div>
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-4 bg-blue-600 rounded w-12"></div>
                    <div className="h-4 bg-neutral-300 rounded w-12"></div>
                    <div className="h-4 bg-blue-600 rounded w-8"></div>
                    <div className="h-4 bg-orange-400/70 rounded w-16"></div>
                  </div>
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-4 bg-blue-600 rounded w-12"></div>
                    <div className="h-4 bg-neutral-300 rounded w-20"></div>
                    <div className="h-4 bg-blue-600 rounded w-8"></div>
                    <div className="h-4 bg-orange-400/70 rounded w-40"></div>
                  </div>
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-4 bg-blue-600 rounded w-12"></div>
                    <div className="h-4 bg-neutral-300 rounded w-16"></div>
                    <div className="h-4 bg-blue-600 rounded w-8"></div>
                    <div className="h-4 bg-orange-400/70 rounded w-36"></div>
                  </div>
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-4 bg-blue-600 rounded w-12"></div>
                    <div className="h-4 bg-neutral-300 rounded w-14"></div>
                    <div className="h-4 bg-blue-600 rounded w-8"></div>
                    <div className="h-4 bg-orange-400/70 rounded w-28"></div>
                  </div>
                  
                  {/* Empty line */}
                  <div className="h-4"></div>
                  
                  {/* Export statement */}
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-4 bg-blue-600 rounded w-12"></div>
                    <div className="h-4 bg-blue-600 rounded w-16"></div>
                    <div className="h-4 bg-neutral-300 rounded w-32"></div>
                  </div>
                  
                  {/* Object opening */}
                  <div className="ml-4 animate-pulse">
                    <div className="h-4 bg-neutral-400 rounded w-2"></div>
                  </div>
                  
                  {/* Object properties */}
                  <div className="ml-8 space-y-1">
                    <div className="flex gap-2 animate-pulse">
                      <div className="h-4 bg-neutral-300 rounded w-16"></div>
                      <div className="h-4 bg-neutral-300 rounded w-24"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-4 bg-neutral-400 rounded w-2"></div>
                    </div>
                    <div className="ml-4 flex gap-2 animate-pulse">
                      <div className="h-4 bg-neutral-300 rounded w-12"></div>
                      <div className="h-4 bg-neutral-300 rounded w-6"></div>
                      <div className="h-4 bg-neutral-300 rounded w-20"></div>
                    </div>
                    <div className="ml-4 animate-pulse">
                      <div className="h-4 bg-neutral-300 rounded w-8"></div>
                    </div>
                    <div className="ml-4 flex gap-2 animate-pulse">
                      <div className="h-4 bg-neutral-300 rounded w-10"></div>
                      <div className="h-4 bg-orange-400/70 rounded w-32"></div>
                    </div>
                    <div className="ml-4 flex gap-2 animate-pulse">
                      <div className="h-4 bg-neutral-300 rounded w-24"></div>
                      <div className="h-4 bg-neutral-400 rounded w-2"></div>
                    </div>
                    
                    {/* Continue with more nested content */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className={`ml-${Math.floor(Math.random() * 3 + 1) * 4} animate-pulse`}>
                        <div className="flex gap-2">
                          <div className="h-4 bg-neutral-600 rounded" style={{ width: `${Math.random() * 80 + 20}px` }}></div>
                          <div className="h-4 bg-neutral-500 rounded" style={{ width: `${Math.random() * 60 + 10}px` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Closing braces */}
                  <div className="ml-4 animate-pulse">
                    <div className="h-4 bg-neutral-400 rounded w-2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-neutral-400 rounded w-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}