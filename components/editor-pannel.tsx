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
  const { files, updateFileContent, streamingFiles, userEditedFiles } = useEditorStore()
  const [editorValue, setEditorValue] = useState("")
  const isUserEditingRef = useRef(false)
  const lastStreamedContentRef = useRef("")

  const file = files[filePath]
  const isStreaming = streamingFiles?.get(filePath) || false
  const isUserEdited = userEditedFiles?.has(filePath) || false

  useEffect(() => {
    if (file?.content !== undefined) {
      // Only update editor if user hasn't manually edited or if content changed significantly
      if (!isUserEditingRef.current) {
        // For streaming files, only update if content is significantly different
        if (isStreaming) {
          const contentDiff = file.content.length - lastStreamedContentRef.current.length
          if (contentDiff > 50 || file.content !== lastStreamedContentRef.current) {
            setEditorValue(file.content)
            lastStreamedContentRef.current = file.content
          }
        } else {
          setEditorValue(file.content)
        }
      }
    }
  }, [file?.content, isStreaming])

  useEffect(() => {
    const uri = getMonacoUri(filePath);
    const model = monaco.editor.getModel(uri);
    if (model && !isUserEditingRef.current) {
      model.setValue(file.content || "");
    }
  }, [file.content]);



  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || ""
    isUserEditingRef.current = true
    setEditorValue(newValue)
    
    // Debounce the store update to avoid conflicts during rapid typing
    const timeoutId = setTimeout(() => {
      updateFileContent(filePath, newValue)
      isUserEditingRef.current = false
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  // Reset user editing flag when file path changes
  useEffect(() => {
    isUserEditingRef.current = false
    lastStreamedContentRef.current = ""
  }, [filePath])

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
          defaultValue={editorValue}
          path={filePath}
          onChange={handleEditorChange}
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