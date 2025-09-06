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

export interface PromptStepMapping {
  prompt: string
  images?: string[]
  steps: BuildStep[]
}

interface ChatData {
  id: string
  projectId: string
  prompt: string
  response: string
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
  inputPrompts: (string | { prompt: string; images: string[] })[]
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
  processPrompt: (prompt: string, images?: string[]) => void;
  setShellCommand: (command: string) => void;
  setMessages: (messages: string | string[]) => void;
  processFollowupPrompts: (prompt: string, images?: string[]) => void;
  setPreviewUrl: (url: string) => void;
  setDevServerProcess: (proc: WebContainerProcess) => void
  handleShellCommand: (command: string) => Promise<void>
  streamFileContent: (path: string, chunk: string) => void;
  completeFileStreaming: (path: string) => void;
  resetUserEditedFiles: () => void;
  processChatData: (chatData: ChatData[]) => void;
  clearPromptStepsMap: () => void;
}