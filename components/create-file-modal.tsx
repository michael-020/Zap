"use client"

import type React from "react"
import { useState } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { FileIcon, Folder, X } from "lucide-react"

interface CreateFileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateFileModal({ isOpen, onClose }: CreateFileModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"file" | "folder">("file")
  const [template, setTemplate] = useState("react-component")
  const { fileItems, setFileItems, files, setFiles } = useEditorStore()

  const templates = {
    "react-component": {
      name: "React Component",
      extension: ".tsx",
      content: `export default function ComponentName() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <p className="text-gray-600 mt-2">This is a new React component.</p>
    </div>
  )
}`,
    },
    page: {
      name: "Next.js Page",
      extension: ".tsx",
      content: `export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">New Page</h1>
      <p className="text-gray-600">Welcome to your new page!</p>
    </div>
  )
}`,
    },
    "api-route": {
      name: "API Route",
      extension: ".ts",
      content: `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Hello from API',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ 
    received: body,
    status: 'success'
  })
}`,
    },
    css: {
      name: "CSS File",
      extension: ".css",
      content: `/* Add your styles here */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #2563eb;
}`,
    },
    empty: {
      name: "Empty File",
      extension: ".txt",
      content: "",
    },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const basePath = "src" // Or allow the user to pick a folder
    const fullPath = `${basePath}/${trimmedName}`

    if (type === "folder") {
      const newFolder = {
        name: trimmedName,
        path: fullPath,
        type: "folder" as const,
      }
      setFileItems([...fileItems, newFolder])
    } else {
      const selectedTemplate = templates[template as keyof typeof templates]
      const fileName = trimmedName.includes(".")
        ? trimmedName
        : trimmedName + selectedTemplate.extension

      const fullFilePath = `${basePath}/${fileName}`
      const newFile = {
        name: fileName,
        path: fullFilePath,
        type: "file" as const,
      }

      setFileItems([...fileItems, newFile])
      setFiles({
        ...files,
        [fullFilePath]: {
          name: fileName,
          content: selectedTemplate.content,
          path: fullFilePath,
        },
      })
    }

    setName("")
    setType("file")
    setTemplate("react-component")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 text-white rounded-lg w-96 max-w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            {type === "file" ? <FileIcon className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
            <h2 className="text-lg font-semibold">Create New {type === "file" ? "File" : "Folder"}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-300">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "file" | "folder")}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="file">File</option>
              <option value="folder">Folder</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "file" ? "component-name" : "folder-name"}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {type === "file" && (
            <div className="space-y-2">
              <label htmlFor="template" className="block text-sm font-medium text-gray-300">
                Template
              </label>
              <select
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(templates).map(([key, tmpl]) => (
                  <option key={key} value={key}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-700 border border-gray-600 hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                name.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              Create {type === "file" ? "File" : "Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}