export function StatusPanelSkeletons() {
    return (
      <div className="h-[calc(100vh-60px)] flex flex-col overflow-x-hidden">
        <div className="flex-1 overflow-x-hidden flex-wrap p-4 space-y-4 custom-scrollbar">
          {/* First skeleton prompt/response */}
          <div className="space-y-3">
            {/* User prompt skeleton (right side) */}
            <div className="flex flex-col items-end gap-1 justify-end mb-3">
              <div className="bg-neutral-700 rounded-lg rounded-tr-none p-3 max-w-[80%] ml-auto animate-pulse">
                <div className="h-4 bg-neutral-600 rounded w-44 mb-2"></div>
                <div className="h-4 bg-neutral-600 rounded w-32"></div>
              </div>
              {/* Copy button skeleton */}
              <div className="w-5 h-5 bg-neutral-600 rounded animate-pulse"></div>
            </div>
  
            {/* Steps response skeleton (left side) */}
            <div className="space-y-2 ml-2 bg-neutral-900 px-3 p-2 rounded-lg animate-pulse">
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="h-3 bg-neutral-700 rounded w-24"></div>
                  <div className="h-8 bg-neutral-800 rounded w-full"></div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-neutral-700 rounded w-12"></div>
                    <div className="h-6 bg-neutral-800 rounded w-32"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-neutral-700 rounded w-12"></div>
                    <div className="h-6 bg-neutral-800 rounded w-40"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* User prompt skeleton (right side) */}
            <div className="flex flex-col items-end gap-1 justify-end mb-3">
              <div className="bg-neutral-700 rounded-lg rounded-tr-none p-3 max-w-[80%] ml-auto animate-pulse">
                <div className="h-4 bg-neutral-600 rounded w-44 mb-2"></div>
                <div className="h-4 bg-neutral-600 rounded w-32"></div>
              </div>
              {/* Copy button skeleton */}
              <div className="w-5 h-5 bg-neutral-600 rounded animate-pulse"></div>
            </div>
  
            {/* Steps response skeleton (left side) */}
            <div className="space-y-2 ml-2 bg-neutral-900 px-3 p-2 rounded-lg animate-pulse">
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="h-3 bg-neutral-700 rounded w-24"></div>
                  <div className="h-8 bg-neutral-800 rounded w-full"></div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-neutral-700 rounded w-12"></div>
                    <div className="h-6 bg-neutral-800 rounded w-32"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-neutral-700 rounded w-12"></div>
                    <div className="h-6 bg-neutral-800 rounded w-40"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {/* User prompt skeleton (right side) */}
            <div className="flex flex-col items-end gap-1 justify-end mb-3">
              <div className="bg-neutral-700 rounded-lg rounded-tr-none p-3 max-w-[80%] ml-auto animate-pulse">
                <div className="h-4 bg-neutral-600 rounded w-44 mb-2"></div>
                <div className="h-4 bg-neutral-600 rounded w-32"></div>
              </div>
              {/* Copy button skeleton */}
              <div className="w-5 h-5 bg-neutral-600 rounded animate-pulse"></div>
            </div>
  
            {/* Steps response skeleton (left side) */}
            <div className="space-y-2 ml-2 bg-neutral-900 px-3 p-2 rounded-lg animate-pulse">
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="h-3 bg-neutral-700 rounded w-24"></div>
                  <div className="h-8 bg-neutral-800 rounded w-full"></div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-neutral-700 rounded w-12"></div>
                    <div className="h-6 bg-neutral-800 rounded w-32"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-0.5">
                <div className="w-4 h-4 bg-neutral-700 rounded-full mt-1"></div>
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-neutral-700 rounded w-12"></div>
                    <div className="h-6 bg-neutral-800 rounded w-40"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Input area skeleton */}
        <div className="border-t border-neutral-800 p-2 bg-neutral-950">
          <div className="flex gap-2 relative animate-pulse">
            <div className="flex-1 h-16 bg-neutral-800 rounded-lg"></div>
            <div className="absolute bottom-3 right-14 w-5 h-5 bg-neutral-600 rounded"></div>
            <div className="absolute bottom-2 right-2 w-10 h-10 bg-neutral-600 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }