import { WebContainer, WebContainerProcess } from "@webcontainer/api"

export interface BuildStep {
    id: string
    title: string
    description: string
    type: BuildStepType
    status: statusType
    timestamp?: Date
    code?: string;
    path?: string;
    shouldExecute?: boolean; 
}

export enum statusType {
    Pending, 
    InProgress,
    Completed,
    Error
}

export enum BuildStepType {
    CreateFile,
    CreateFolder,
    EditFile,
    DeleteFile,
    RunScript,
    NonExecutuable
}

export type FileItemFlat = {
  name: string
  path: string
  type: "file" | "folder"
  content: string // Make content required since we're consolidating
}

// Updated to support both File objects and base64 strings
export interface PromptStepMapping {
  prompt: string
  images?: (File | string)[] // Support both WebP Files and base64 strings
  steps: BuildStep[]
}

interface ChatData {
  id: string
  projectId: string
  prompt: string
  response: string
  images?: string[] // Always stored as base64 strings in database
  createdAt: string
}

export interface StoreState {
  // Build status
  buildSteps: BuildStep[]
  isBuilding: boolean
  isInitialising: boolean,
  isProcessing: boolean,
  isProcessingFollowups: boolean,
  projectId: string,

  // File system
  fileItems: FileItemFlat[]
  selectedFile: string | null

  shellCommands: string[]
  webcontainer: WebContainer | null;
  messages: string[]
  inputPrompts: (string | { prompt: string; images: (File | string)[] })[]
  promptStepsMap: Map<number, PromptStepMapping>
  previewUrl: string
  devServerProcess: WebContainerProcess | null
  streamingFiles: Map<string, boolean>
  userEditedFiles: Set<string>

  // Actions
  setWebcontainer: (instance: WebContainer) => void;
  setBuildSteps: (steps: BuildStep[]) => void
  clearBuildSteps: () => void
  startBuild: () => void
  stopBuild: () => void
  setStepStatus: (id: string, status: statusType) => void
  setSelectedFile: (path: string | null) => void
  updateFileContent: (path: string, content: string) => void
  setFileItems: (items: FileItemFlat[]) => void
  addFile: (path: string, content: string) => void
  addFileItem: (item: FileItemFlat) => void
  executeSteps: (steps: BuildStep[]) => void
  // Updated to support both File objects and base64 strings
  processPrompt: (prompt: string, images?: (File | string)[]) => void;
  setShellCommand: (command: string) => void;
  setMessages: (messages: string | string[]) => void;
  // Updated to support both File objects and base64 strings
  processFollowupPrompts: (prompt: string, images?: (File | string)[]) => void;
  setPreviewUrl: (url: string) => void;
  setDevServerProcess: (proc: WebContainerProcess) => void
  handleShellCommand: (command: string) => Promise<void>
  streamFileContent: (path: string, chunk: string) => void;
  completeFileStreaming: (path: string) => void;
  resetUserEditedFiles: () => void;
  processChatData: (chatData: ChatData[]) => void;
  clearPromptStepsMap: () => void;
}