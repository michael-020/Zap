/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import Editor from '@monaco-editor/react';

interface EditorPanelProps {
  filePath: string
}

const getLanguageFromPath = (filePath: string): string => {
  const extension = filePath.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'tsx':
    case 'ts':
      return 'typescript'
    case 'jsx':
    case 'js':
      return 'javascript'
    case 'css':
      return 'css'
    case 'html':
      return 'html'
    case 'json':
      return 'json'
    case 'md':
      return 'markdown'
    default:
      return 'typescript'
  }
}

export function EditorPanel({ filePath }: EditorPanelProps) {
  const { fileItems, updateFileContent, streamingFiles } = useEditorStore()
  const [editorValue, setEditorValue] = useState("")
  const [editorTheme, setEditorTheme] = useState<'vs-light' | 'vs-dark'>('vs-dark');
  const isUserEditingRef = useRef(false)
  const editorRef = useRef<any | null>(null)
  const monacoRef = useRef<any>(null)
  const currentFilePathRef = useRef<string>(filePath)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const file = fileItems.find(item => item.path === filePath)
  const isStreaming = streamingFiles?.get(filePath) || false

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            setEditorTheme('vs-dark');
        } else {
            setEditorTheme('vs-light');
        }
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Handle file path changes
  useEffect(() => {
    if (currentFilePathRef.current !== filePath) {
      console.log(`Switching to file: ${filePath}`);
      currentFilePathRef.current = filePath
      isUserEditingRef.current = false
      
      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }
      
      if (file?.content !== undefined) {
        setEditorValue(file.content)
      } else {
        setEditorValue("")
      }
    }
  }, [filePath, file?.content])

  // Handle content streaming updates with minimal delay
  useEffect(() => {
    if (file?.content !== undefined && currentFilePathRef.current === filePath) {
      if (!isUserEditingRef.current) {
        // Clear any pending timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current)
        }

        // For streaming files, update immediately for real-time effect
        if (isStreaming) {
          setEditorValue(file.content)
        } else {
          // Immediate update for non-streaming files
          setEditorValue(file.content)
        }
      }
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [file?.content, isStreaming, filePath])

  const handleEditorChange = useCallback((value: string | undefined) => {
    const newValue = value || ""
    
    if (currentFilePathRef.current !== filePath) {
      return
    }
    
    // Allow edits but mark as user-edited to stop streaming
    isUserEditingRef.current = true
    setEditorValue(newValue)
    
    const timeoutId = setTimeout(() => {
      updateFileContent(filePath, newValue)
      isUserEditingRef.current = false
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filePath, updateFileContent])

  const handleEditorMount = useCallback((editor: any, monacoInstance: any) => {
    editorRef.current = editor
    monacoRef.current = monacoInstance
    
    monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    })

    monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    })
    
    if (file?.content !== undefined) {
      setEditorValue(file.content)
    }
  }, [file?.content])

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900">
        <p>File not found: {filePath}</p>
      </div>
    )
  }

  return (
    <div className="h-full relative bg-white dark:bg-neutral-900">
      {/* {isStreaming && (
        <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Streaming code...</span>
        </div>
      )} */}
      <div className="h-full pb-4">
        <Editor
          height="100%"
          language={getLanguageFromPath(filePath)}
          value={editorValue}
          path={filePath}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={editorTheme}
          beforeMount={(monacoInstance) => {
            monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
              noSuggestionDiagnostics: true,
            });

            monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
              noSuggestionDiagnostics: true,
            });

            monacoInstance.languages.typescript.typescriptDefaults.setExtraLibs([]);
            monacoInstance.languages.typescript.javascriptDefaults.setExtraLibs([]);

            monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions({
              jsx: monacoInstance.languages.typescript.JsxEmit.React,
              allowJs: true,
              esModuleInterop: true,
              target: monacoInstance.languages.typescript.ScriptTarget.ESNext,
              module: monacoInstance.languages.typescript.ModuleKind.ESNext,
              moduleResolution: monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
              skipLibCheck: true,
              isolatedModules: true,
              allowSyntheticDefaultImports: true,
              noEmit: true,
              typeRoots: [],
              strict: false,
              noImplicitAny: false,
              noImplicitReturns: false,
              noUnusedLocals: false,
              noUnusedParameters: false,
            });
          }}
          options={{
            readOnly: false, // Allow editing - user edits will stop streaming for that file
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            quickSuggestions: !isStreaming,
            parameterHints: { enabled: !isStreaming },
            suggestOnTriggerCharacters: !isStreaming,
            hover: { enabled: !isStreaming },
            links: false,
            colorDecorators: false,
            codeLens: false,
            autoIndent: "full",
            scrollBeyondLastColumn: 10,
            automaticLayout: true,
            cursorBlinking: 'blink',
          }}
        />
      </div>
    </div>
  )
}