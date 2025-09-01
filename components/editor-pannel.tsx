"use client"

import { useEffect, useState, useRef } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import Editor from '@monaco-editor/react';
import * as monaco from "monaco-editor"

interface EditorPanelProps {
  filePath: string
}

const getMonacoUri = (filePath: string) => {
  return monaco.Uri.parse(`file:///${filePath}`);
}

export function EditorPanel({ filePath }: EditorPanelProps) {
  const { fileItems, updateFileContent, streamingFiles, userEditedFiles } = useEditorStore()
  const [editorValue, setEditorValue] = useState("")
  const isUserEditingRef = useRef(false)
  const lastStreamedContentRef = useRef("")
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const currentFilePathRef = useRef<string>(filePath)

  const file = fileItems.find(item => item.path === filePath)
  const isStreaming = streamingFiles?.get(filePath) || false
  const isUserEdited = userEditedFiles?.has(filePath) || false

  // Handle file path changes - this is crucial for proper content loading
  useEffect(() => {
    if (currentFilePathRef.current !== filePath) {
      currentFilePathRef.current = filePath
      isUserEditingRef.current = false
      lastStreamedContentRef.current = ""
      
      // Immediately set the editor value when switching files
      if (file?.content !== undefined) {
        setEditorValue(file.content)
      }
    }
  }, [filePath, file?.content])

  // Handle content updates for the current file
  useEffect(() => {
    if (file?.content !== undefined && currentFilePathRef.current === filePath) {
      if (!isUserEditingRef.current) {
        if (isStreaming) {
          const contentDiff = file.content.length - lastStreamedContentRef.current.length
          if (contentDiff > 50 || file.content !== lastStreamedContentRef.current) {
            setEditorValue(file.content)
            lastStreamedContentRef.current = file.content
          }
        } else {
          // For non-streaming files, always update the editor value
          setEditorValue(file.content)
        }
      }
    }
  }, [file?.content, isStreaming, filePath])

  // Sync Monaco model with content - but only for the current file
  useEffect(() => {
    if (editorRef.current && currentFilePathRef.current === filePath) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== editorValue && !isUserEditingRef.current) {
        editorRef.current.setValue(editorValue)
      }
    }
  }, [editorValue, filePath])

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || ""
    
    if (currentFilePathRef.current !== filePath) {
      return
    }
    
    isUserEditingRef.current = true
    setEditorValue(newValue)
    
    const timeoutId = setTimeout(() => {
      updateFileContent(filePath, newValue)
      isUserEditingRef.current = false
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Set initial value for the mounted editor
    if (file?.content !== undefined) {
      editor.setValue(file.content)
      setEditorValue(file.content)
    }
  }

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>File not found: {filePath}</p>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      {/* Streaming indicator */}
      {isStreaming && !isUserEdited && (
        <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Streaming...
        </div>
      )}
      
      <div className="h-full">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          value={editorValue} // Use controlled value instead of defaultValue
          path={getMonacoUri(filePath).toString()}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          beforeMount={(monaco) => {
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
            });

            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
            });

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              jsx: monaco.languages.typescript.JsxEmit.React,
              allowJs: true,
              esModuleInterop: true,
              target: monaco.languages.typescript.ScriptTarget.ESNext,
              module: monaco.languages.typescript.ModuleKind.ESNext,
              moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
              skipLibCheck: true,
              isolatedModules: true,
              allowSyntheticDefaultImports: true,
              noEmit: true,
              typeRoots: [], 
            });
          }}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            quickSuggestions: !isStreaming,
            parameterHints: { enabled: !isStreaming },
            suggestOnTriggerCharacters: !isStreaming,
          }}
        />
      </div>
    </div>
  )
}