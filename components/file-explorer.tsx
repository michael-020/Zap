/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo, useEffect } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { ChevronRight, ChevronDown, FileIcon, Folder, FolderOpen, Search } from "lucide-react"
import type { FileItemFlat } from "@/stores/editorStore/types"

interface FileTreeItemProps {
  item: any
  level: number
  onFileSelect: (file: any) => void
  selectedFile: string | null
}

interface FileNode {
  file: {
    contents: string
  }
}

interface DirectoryNode {
  directory: Record<string, FileNode | DirectoryNode>
}

type MountStructure = Record<string, FileNode | DirectoryNode>

export function FileExplorer() {
  const { fileItems, selectedFile, setSelectedFile, webcontainer } = useEditorStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"files" | "search">("files")

  const handleFileSelect = (file: any) => {
    setSelectedFile(file.path)
  }

  const filteredAndSortedItems = useMemo(() => {
    let filtered = fileItems

    if (searchTerm) {
      filtered = fileItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.path.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1
      if (a.type === "file" && b.type === "folder") return 1
      return a.name.localeCompare(b.name)
    })
  }, [fileItems, searchTerm])

  const filteredTree = useMemo(() => {
    const buildNestedTree = (items: FileItemFlat[]): any[] => {
      const root: Record<string, any> = {}

      for (const item of items) {
        const parts = item.path.split("/")
        let current = root

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]
          const currentPath = parts.slice(0, i + 1).join("/")
          const isFile = i === parts.length - 1 && item.type === "file"

          if (!current[part]) {
            current[part] = {
              name: part,
              path: currentPath,
              type: isFile ? "file" : "folder",
              children: isFile ? undefined : {},
              depth: i,
            }
          }

          if (!isFile) {
            current = current[part].children
          }
        }
      }

      const sortNodes = (nodes: any[]): any[] => {
        return nodes.sort((a, b) => {
          if (a.depth === 0 && b.depth === 0) {
            if (a.name === "src") return -1
            if (b.name === "src") return 1
          }

          if (a.type === "folder" && b.type === "file") return -1
          if (a.type === "file" && b.type === "folder") return 1

          return a.name.localeCompare(b.name)
        }).map(node => ({
          ...node,
          children: node.children ? sortNodes(Object.values(node.children)) : undefined
        }))
      }

      return sortNodes(Object.values(root))
    }

    return buildNestedTree(filteredAndSortedItems)
  }, [filteredAndSortedItems])

  useEffect(() => {
    const mountStructure: MountStructure = {}

    fileItems.forEach(item => {
      const pathParts = item.path.split('/')
      let currentLevel: Record<string, FileNode | DirectoryNode> = mountStructure

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (!currentLevel[part]) {
          currentLevel[part] = {
            directory: {}
          }
        }
        currentLevel = (currentLevel[part] as DirectoryNode).directory
      }

      const finalName = pathParts[pathParts.length - 1]

      if (item.type === 'file') {
        currentLevel[finalName] = {
          file: {
            contents: item.content || ""
          }
        }
      } else if (item.type === 'folder') {
        if (!currentLevel[finalName]) {
          currentLevel[finalName] = {
            directory: {}
          }
        }
      }
    })

    webcontainer?.mount(mountStructure)
  }, [fileItems, webcontainer])

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col scrollbar-hidden bg-white dark:bg-neutral-900">
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "files"
              ? "text-neutral-900 dark:text-white border-b-2 border-blue-500"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={` px-4 py-2 text-sm font-medium ${
            activeTab === "search"
              ? "text-neutral-900 dark:text-white border-b-2 border-blue-500"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Search
        </button>
      </div>

      {activeTab === "files" ? (
        <div className="flex-1 overflow-y-auto scrollbar-hidden pb-20">
          {filteredTree.map((item) => (
            <FileTreeItem
              key={item.path}
              item={item}
              level={0}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
            />
          ))}

          {filteredTree.length === 0 && fileItems.length > 0 && (
            <div className="p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
              No files match your search
            </div>
          )}

          {fileItems.length === 0 && (
            <div className="p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
              No files yet. Start building to see your project structure.
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            {searchTerm.trim() ? (
              filteredAndSortedItems.map((item) => (
                <div
                  key={item.path}
                  className="py-1.5 px-2 cursor-pointer rounded-md text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  onClick={() => handleFileSelect(item)}
                >
                  {item.name}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                Looking for a file? 
                <br/>
                Start typing...
              </div>
            )}

            {searchTerm.trim() && filteredAndSortedItems.length === 0 && (
              <div className="p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                No files match your search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FileTreeItem({ item, level, onFileSelect, selectedFile }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2)

  const handleClick = () => {
    if (item.type === "folder") {
      setIsExpanded(!isExpanded)
    } else {
      onFileSelect(item)
    }
  }

  const isSelected = selectedFile === item.path

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm transition-colors group rounded-md mx-1 ${
          isSelected ? "bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {item.type === "folder" ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            )}
          </>
        ) : (
          <>
            <div className="w-4" /> 
            <FileIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300" />
          </>
        )}
        <span
          className={`text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors ${
            isSelected ? "text-neutral-900 dark:text-white font-medium" : ""
          }`}
        >
          {item.name}
        </span>
      </div>

      {item.type === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((child: any) => (
            <FileTreeItem
              key={child.path}
              item={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}
