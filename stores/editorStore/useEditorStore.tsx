import { create } from "zustand"
import { BuildStep, BuildStepType, FileItemFlat, statusType, StoreState } from "./types"
import { axiosInstance } from "@/lib/axios"
import { getDescriptionFromFile, getTitleFromFile, parseXml } from "@/lib/steps"
import { WebContainer, WebContainerProcess } from "@webcontainer/api"
import toast from "react-hot-toast"
import { useAuthStore } from "../authStore/useAuthStore"
import { AxiosError } from "axios"

export const useEditorStore = create<StoreState>((set, get) => ({
  // Initial state
  buildSteps: [],
  isBuilding: false,
  fileItems: [],
  selectedFile: null,
  shellCommands: [],
  webcontainer: null,
  messages: [],
  isInitialising: false,
  isInitialisingWebContainer: false,
  isProcessing: false,
  isProcessingFollowups: false,
  inputPrompts: [],
  promptStepsMap: new Map(),
  previewUrl: "",
  devServerProcess: null,
  streamingFiles: new Map(),
  userEditedFiles: new Set(),
  isFetchingImages: false,
  isCreatingProject: false,
  projectId: "",
  isCleaningUp: false,

  cleanupWebContainer: async () => {
    const state = get();
    const { isCleaningUp } = state;
    
    // Prevent multiple concurrent cleanup attempts
    if (isCleaningUp) {
      console.log("Cleanup already in progress, skipping...");
      return;
    }

    set({ isCleaningUp: true });

    try {
      console.log("Cleaning up WebContainer state...");
      
      // Simply nullify the state without calling teardown()
      // This avoids the "Process aborted" error from teardown
      set({ 
        webcontainer: null, 
        devServerProcess: null,
        previewUrl: "",
        isInitialisingWebContainer: false,
        isCleaningUp: false
      });
      
      console.log("WebContainer state cleared successfully");
    } catch (err) {
      console.error("Unexpected error during cleanup:", err);
      set({ 
        webcontainer: null, 
        devServerProcess: null,
        previewUrl: "",
        isInitialisingWebContainer: false,
        isCleaningUp: false
      });
    }
  },

  setWebcontainer: async (instance: WebContainer) => {
    if(get().webcontainer || get().isInitialisingWebContainer)
      return;

    set({ webcontainer: instance })
    console.log("webcontainer setup")
  },

  setMessages: (messages) => {
    set((state) => ({
      messages: [
        ...state.messages, 
        ...(Array.isArray(messages) ? messages : [messages])
      ]
    }))
  },

  setBuildSteps: (steps: BuildStep[]) =>{
    set((state) => ({
      buildSteps: [...state.buildSteps, ...steps],
    }))
  },

  clearBuildSteps: () => set({ buildSteps: [] }),

  startBuild: () => {
    set({ isBuilding: true })
    get().clearBuildSteps()
  },

  stopBuild: () => set({ isBuilding: false }),

  setStepStatus: (id: string, status: statusType) =>
    set((state) => {
      // Update buildSteps
      const updatedBuildSteps = state.buildSteps.map((step) =>
        step.id === id ? { ...step, status } : step
      )
      
      // Update promptStepsMap to sync the status
      const updatedPromptStepsMap = new Map(state.promptStepsMap)
      updatedPromptStepsMap.forEach((mapping, key) => {
        const updatedSteps = mapping.steps.map((step) =>
          step.id === id ? { ...step, status } : step
        )
        updatedPromptStepsMap.set(key, {
          ...mapping,
          steps: updatedSteps
        })
      })
      
      return {
        buildSteps: updatedBuildSteps,
        promptStepsMap: updatedPromptStepsMap
      }
    }),

  // File actions
  setSelectedFile: (path) => set({ selectedFile: path }),
  
  clearPromptStepsMap: () => set({ promptStepsMap: new Map() }),

  clearEditorState: () => {
    set({ 
      buildSteps: [],
      fileItems: [],
      shellCommands: [],
      messages: [],
      inputPrompts: [],
      promptStepsMap: new Map(),
      previewUrl: "",
      streamingFiles: new Map(),
      userEditedFiles: new Set(),
      projectId: "",
      selectedFile: null
    });
  },

  updateFileContent: (path, content) =>
    set((state) => {
      // Mark file as user-edited and stop streaming
      const newUserEditedFiles = new Set(state.userEditedFiles)
      newUserEditedFiles.add(path)
      
      const newStreamingFiles = new Map(state.streamingFiles)
      newStreamingFiles.set(path, false)

      // Update the fileItems array
      const updatedFileItems = state.fileItems.map(item =>
        item.path === path ? { ...item, content } : item
      )

      return {
        userEditedFiles: newUserEditedFiles,
        streamingFiles: newStreamingFiles,
        fileItems: updatedFileItems,
      }
    }),

    // Add method to stream file content
    streamFileContent: (path: string, chunk: string) =>
      set((state) => {
        // Don't stream to files that user has edited
        if (state.userEditedFiles.has(path)) {
          return state
        }

        // Only proceed if file is marked as streaming
        if (!state.streamingFiles.get(path)) {
          return state
        }

        // Update the fileItems array
        const updatedFileItems = state.fileItems.map(item => {
          if (item.path === path) {
            const currentContent = item.content || ""
            const newContent = currentContent + chunk
            return { ...item, content: newContent } // Remove formatCodeBlock here for streaming
          }
          return item
        })

        return {
          fileItems: updatedFileItems,
        }
      }),

    startFileStreaming: (path: string) =>
      set((state) => ({
        streamingFiles: new Map(state.streamingFiles).set(path, true)
      })),

    // Method to reset streaming state when file is complete
    completeFileStreaming: (path: string) =>
      set((state) => ({
        streamingFiles: new Map(state.streamingFiles).set(path, false)
      })),

    // Reset user edited state (call when starting new build)
    resetUserEditedFiles: () =>
      set({ userEditedFiles: new Set() }),

      setFileItems: (items: FileItemFlat[]) => set({ fileItems: items }),
      
      // Removed setFiles method since we're not using files array anymore

      addFile: (path: string, content: string = "") => {
        set((state) => {
          const formattedContent = content;
          // Check if file already exists
          const existingIndex = state.fileItems.findIndex(item => item.path === path)
          
          if (existingIndex >= 0) {
            // Update existing file
            const updatedFileItems = [...state.fileItems]
            updatedFileItems[existingIndex] = {
              ...updatedFileItems[existingIndex],
              content
            }
            return { fileItems: updatedFileItems }
          } else {
            // Add new file
            const newFileItem: FileItemFlat = {
              name: path.split("/").pop() || path,
              path,
              type: "file",
              content: formattedContent,
            }
            return {
              fileItems: [...state.fileItems, newFileItem],
            }
          }
        })
      },

    addFileItem: (item: FileItemFlat) =>
      set((state) => {
        const exists = state.fileItems.some(existing => existing.path === item.path)
        if (exists) return state
        
        return {
          fileItems: [...state.fileItems, item],
        }
      }),

    setShellCommand: async (command: string) =>{
      console.log("command added: ", command)
      await get().setUpWebContainer()
      set((state) => ({
        shellCommands: [...state.shellCommands, command],
      }))
    },

    setPreviewUrl: (url: string) => {
      set({previewUrl: url})
    },

    setDevServerProcess: (proc: WebContainerProcess) => set({ devServerProcess: proc }),

    handleShellCommand: async (command: string) => {
      const { webcontainer, devServerProcess, setPreviewUrl, setDevServerProcess } = get()
      if (!webcontainer) return

      const parts = command.split("&&").map(p => p.trim())

      for (const cmd of parts) {
        if (cmd.startsWith("npm install")) {
          const proc = await webcontainer.spawn("npm", ["install"])
          await proc.exit
          const devProc = await webcontainer.spawn("npm", ["run", "dev"])
          setDevServerProcess(devProc)

          devProc.output.pipeTo(new WritableStream({ write() {} })) 

          webcontainer.on("server-ready", (port, url) => {
            console.log("Dev server ready at:", url)
            setPreviewUrl(url)
          })
        } 
        
        else if (cmd.startsWith("npm run dev")) {
          // Kill existing dev server
          if (devServerProcess) {
            try {
              devServerProcess.kill()
            } catch (err) {
              console.warn("Failed to kill dev server:", err)
            }
          }
          const proc = await webcontainer.spawn("npm", ["install"])
          await proc.exit
          const devProc = await webcontainer.spawn("npm", ["run", "dev"])
          setDevServerProcess(devProc)

          devProc.output.pipeTo(new WritableStream({ write() {} })) // optional

          webcontainer.on("server-ready", (port, url) => {
            console.log("Dev server ready at:", url)
            setPreviewUrl(url)
          })
        }

        else {
          // Run any other shell command
          const args = cmd.split(" ")
          const proc = await webcontainer.spawn(args[0], args.slice(1))
          await proc.exit
        }
      }
    },
    
    executeSteps: async (steps: BuildStep[]) => {
      const { setStepStatus, addFile, addFileItem } = get()
      console.log("executing steps")
      for (const step of steps) {
        try {
          if (step.title === "Project Files") {
            console.log("Skipping Project Files step:", step)
            continue
          }

          setStepStatus(step.id, statusType.InProgress)
          
          switch (step.type) {
            case BuildStepType.CreateFile: {
              if (!step.path || !step.code) {
                console.error("CreateFile step missing path or code:", step)
                throw new Error("Missing path or code")
              }
              addFile(step.path, step.code)
              break
            }

            case BuildStepType.CreateFolder: {
              if (!step.path) {
                console.error("CreateFolder step missing path:", step)
                throw new Error(`Missing path for folder creation. Step: ${JSON.stringify(step)}`)
              }

              addFileItem({
                name: step.path.split("/").pop() || step.path,
                path: step.path,
                type: "folder",
                content: ""
              })
              break
            }

            case BuildStepType.RunScript: {
              if (step.description) {
                await get().setUpWebContainer()
                console.log("Executing command:", step.description)
                get().setShellCommand(step.description)
                await get().handleShellCommand(step.description)
              }
              break
            }

            case BuildStepType.NonExecutuable: {
              break;
            }

            default:
              console.warn("Unhandled step type:", step.type, step)
          }

          setStepStatus(step.id, statusType.Completed)
        } catch (err) {
          console.error("Error executing step:", err)
          setStepStatus(step.id, statusType.Error)
        }
      }
    },

    createProject: async (prompt) => {
      set({ isCreatingProject: true })
      try {
        const projectRes = await axiosInstance.post("/api/store-project", { prompt });
        const projectId = projectRes.data.projectId;
        set({ projectId });
        return projectId;
      } catch (error) {
        console.error("Error creating project:", error);
        if (error instanceof AxiosError && error.response?.data?.msg) {
            toast.error(error.response.data.msg as string);
        } else {
            toast.error("An unexpected error occurred.");
        }

        set({ isInitialising: false });
        return null;
      } finally {
        set({ isCreatingProject: false })
      }
    },

    processPrompt: async (prompt, images) => {
      set({ isInitialising: true })
      let url = ""
      let desc = ""
      let hasErrorOccured = false
      const currentPromptIndex = get().inputPrompts.length
      try {
        set(state => ({
          inputPrompts: [
            ...state.inputPrompts,
            prompt
          ]
        }))

        set(state => ({
          promptStepsMap: new Map(state.promptStepsMap).set(currentPromptIndex, {
            prompt,
            steps: [],
            images: images || [] // Store File objects temporarily
          })
        }))

        const res = await axiosInstance.post("/api/template", { 
          prompt: {
            role: "user",
            content: prompt
          }
        })
        url = res.data.url.content
        const parsedSteps = parseXml(res.data.uiPrompts[0]).map((x: BuildStep) => ({
          ...x,
          status: statusType.InProgress
        }))

        set(state => {
          const newMap = new Map(state.promptStepsMap)
          const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
          newMap.set(currentPromptIndex, {
            ...existing,
            steps: [...existing.steps, ...parsedSteps]
          })
          return { promptStepsMap: newMap }
        })

        get().setBuildSteps(parsedSteps)
        get().executeSteps(parsedSteps.filter(step => step.shouldExecute !== false))

        get().setMessages(res.data.prompts)
      } catch (err) {
        console.error("Error during initialisation:", err)
        toast.error("Error while initialising project")
        set({ isInitialising: false })
        hasErrorOccured = true
      } finally {
        set({ isInitialising: false })
      }
      
      if(url && url.trim() !== "not a url".toLowerCase() && !hasErrorOccured){
        set({ isFetchingImages: true })
        try {
          const res = await axiosInstance.post("/api/get-images", { url })
          images?.push(res.data.images)
          console.log("images: ", images)
        } catch (error) {
          console.error("Error while getting images: ", error)
          hasErrorOccured = true
        } finally {
          set({ isFetchingImages: false })
        }
      }
      set({ isProcessing: true })
      if(hasErrorOccured){
        return
      }
      try {
        const formattedMessages = get().messages.map(m => ({
          role: "user",
          content: m
        }))
        
        const requestOptions: RequestInit = {
          method: "POST"
        };

        if (images && images.length > 0 && images[0] instanceof File) {
          // Send as FormData for WebP files
          const formData = new FormData();
          formData.append('messages', JSON.stringify(formattedMessages));
          formData.append('prompt', JSON.stringify({
            role: "user",
            content: prompt
          }));
          
          // Append each WebP file
          images.forEach((file, index) => {
            if (file instanceof File) {
              formData.append(`image_${index}`, file);
            }
          });
          
          requestOptions.body = formData;
          // Don't set Content-Type header - let browser set it with boundary
        } else {
          // Send as JSON for base64 images (backward compatibility)
          requestOptions.headers = {
            "Content-Type": "application/json"
          };
          requestOptions.body = JSON.stringify({
            prompt: {
              role: "user",
              content: prompt
            },
            messages: formattedMessages,
            images: images || [],
          });
        }

        const response = await fetch("/api/chat", requestOptions);

        if (!response.ok || !response.body) {
          toast.error("Failed to stream chat response")
          return
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = "";
        let fullResponse = "";
        // Separate map for tracking file completion - this one uses objects
        const fileCompletionTracker = new Map<string, { step: BuildStep, content: string, isComplete: boolean }>();
        
        // Collect steps to execute at the end
        const stepsToExecuteLater: BuildStep[] = [];

        const descriptionRegex = /^([\s\S]*?)<zapArtifeact/;
        
        let description = "";
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);
            buffer += chunk;
            fullResponse += chunk;

            // Try to extract description if we haven't yet
            if (!description) {
              const descMatch = descriptionRegex.exec(buffer);
              if (descMatch) {
                description = descMatch[1].trim();
                // Update promptStepsMap with description
                set(state => {
                  const newMap = new Map(state.promptStepsMap);
                  const existing = newMap.get(currentPromptIndex) || { 
                    prompt, 
                    steps: [],
                    images: images || []
                  };
                  newMap.set(currentPromptIndex, {
                    ...existing,
                    description
                  });
                  return { promptStepsMap: newMap };
                });
              }
            }

            // Process streaming content for files that are still streaming
            fileCompletionTracker.forEach((fileData, filePath) => {
              if (!fileData.isComplete && !get().userEditedFiles.has(filePath)) {
                // Extract content between the opening tag and current buffer position
                const openingTag = `<zapAction type="file" filePath="${filePath}">`;
                const openingIndex = buffer.indexOf(openingTag);
                
                if (openingIndex !== -1) {
                  const contentStart = openingIndex + openingTag.length;
                  const closingTag = '</zapAction>';
                  const closingIndex = buffer.indexOf(closingTag, contentStart);
                  
                  // Extract the content portion
                  let contentToStream = '';
                  if (closingIndex === -1) {
                    // File not complete yet, stream what we have
                    contentToStream = buffer.substring(contentStart);
                  } else {
                    // File complete
                    contentToStream = buffer.substring(contentStart, closingIndex);
                  }
                  
                  // Remove leading/trailing whitespace and normalize indentation
                  // But only do this once at the start (when fileData.content is empty)
                  if (fileData.content.length === 0) {
                    // Remove leading newline and whitespace
                    contentToStream = contentToStream.replace(/^\s*\n/, '');
                    
                    // Find the minimum indentation to remove
                    const lines = contentToStream.split('\n');
                    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
                    
                    if (nonEmptyLines.length > 0) {
                      const minIndent = Math.min(
                        ...nonEmptyLines.map(line => {
                          const match = line.match(/^(\s*)/);
                          return match ? match[1].length : 0;
                        })
                      );
                      
                      // Remove the base indentation from all lines
                      if (minIndent > 0) {
                        contentToStream = lines
                          .map(line => line.substring(minIndent))
                          .join('\n');
                      }
                    }
                  }
                  
                  // Only stream the new content that wasn't streamed before
                  const previousLength = fileData.content.length;
                  if (contentToStream.length > previousLength) {
                    const newChunk = contentToStream.substring(previousLength);
                    fileData.content = contentToStream; // Update tracker
                    
                    // Stream only actual file content in reasonable chunks
                    const chunkSize = Math.min(newChunk.length, 100);
                    const limitedChunk = newChunk.substring(0, chunkSize);
                    get().streamFileContent(filePath, limitedChunk);
                  }
                }
              }
            });

            // Process complete actions (keep existing code)
            let match;
            const actionRegex = /<zapAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/zapAction>/g;

            while ((match = actionRegex.exec(buffer)) !== null) {
              const [, type, filePath, content] = match;
              buffer = buffer.slice(actionRegex.lastIndex);

              const code = content.trim();

              if (type === "file" && filePath) {
                if (fileCompletionTracker.has(filePath)) {
                  fileCompletionTracker.get(filePath)!.isComplete = true;
                }

                get().completeFileStreaming(filePath);

                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: getTitleFromFile(filePath),
                  description: getDescriptionFromFile(filePath),
                  type: BuildStepType.CreateFile,
                  status: statusType.InProgress,
                  code: code, // Format only on completion
                  path: filePath,
                };

                get().addFile(filePath, code); // Format only on completion

                set(state => {
                  const newMap = new Map(state.promptStepsMap)
                  const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
                  newMap.set(currentPromptIndex, {
                    ...existing,
                    steps: [...existing.steps, step]
                  })
                  return { promptStepsMap: newMap }
                })

                get().setBuildSteps([step]);
                get().setSelectedFile(step.path as string);
                get().executeSteps([step]); 
              }

              if (type === "shell") {
                const decodedCode = code.replace(/&amp;/g, '&');
                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: "Run shell command",
                  description: decodedCode, // Use decoded version
                  type: BuildStepType.RunScript,
                  status: statusType.InProgress,
                  code: decodedCode, // Use decoded version
                };

                set(state => {
                  const newMap = new Map(state.promptStepsMap)
                  const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
                  newMap.set(currentPromptIndex, {
                    ...existing,
                    steps: [...existing.steps, step]
                  })
                  return { promptStepsMap: newMap }
                })

                get().setBuildSteps([step]);
                // Collect shell steps to execute later after all files are created
                stepsToExecuteLater.push(step);
              }
            }

            // Check for new incomplete file actions
            const incompleteActionRegex = /<zapAction\s+type="file"\s+filePath="([^"]*)">/g;
            let incompleteMatch;
            while ((incompleteMatch = incompleteActionRegex.exec(buffer)) !== null) {
              const [, filePath] = incompleteMatch;
              
              if (!fileCompletionTracker.has(filePath)) {
                // Initialize file for streaming
                get().addFile(filePath, "");
                get().setSelectedFile(filePath);

                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: getTitleFromFile(filePath),
                  description: getDescriptionFromFile(filePath),
                  type: BuildStepType.CreateFile,
                  status: statusType.InProgress,
                  code: "",
                  path: filePath,
                };

                // Add to completion tracker
                fileCompletionTracker.set(filePath, { 
                  step, 
                  content: "", 
                  isComplete: false 
                });
                
                // Mark file as streaming in the store
                set(state => ({
                  streamingFiles: new Map(state.streamingFiles).set(filePath, true)
                }));
                
                get().setBuildSteps([step]);
              }
            }
          }
        }

        // Process any remaining buffer content after stream ends
        if (buffer.trim().length > 0) {
          let match;
          const actionRegex = /<zapAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/zapAction>/g;

          while ((match = actionRegex.exec(buffer)) !== null) {
            const [, type, filePath, content] = match;
            const code = content.trim();

            if (type === "file" && filePath) {
              if (fileCompletionTracker.has(filePath)) {
                fileCompletionTracker.get(filePath)!.isComplete = true;
              }

              get().completeFileStreaming(filePath);

              const step: BuildStep = {
                id: crypto.randomUUID(),
                title: getTitleFromFile(filePath),
                description: getDescriptionFromFile(filePath),
                type: BuildStepType.CreateFile,
                status: statusType.InProgress,
                code: code,
                path: filePath,
              };

              get().addFile(filePath, code);

              set(state => {
                const newMap = new Map(state.promptStepsMap)
                const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
                newMap.set(currentPromptIndex, {
                  ...existing,
                  steps: [...existing.steps, step]
                })
                return { promptStepsMap: newMap }
              })

              get().setBuildSteps([step]);
              get().setSelectedFile(step.path as string);
              get().executeSteps([step]);
            }

            if (type === "shell") {
              const decodedCode = code.replace(/&amp;/g, '&');
              const step: BuildStep = {
                id: crypto.randomUUID(),
                title: "Run shell command",
                description: decodedCode,
                type: BuildStepType.RunScript,
                status: statusType.InProgress,
                code: decodedCode,
              };

              set(state => {
                const newMap = new Map(state.promptStepsMap)
                const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
                newMap.set(currentPromptIndex, {
                  ...existing,
                  steps: [...existing.steps, step]
                })
                return { promptStepsMap: newMap }
              })

              get().setBuildSteps([step]);
              stepsToExecuteLater.push(step);
            }
          }
        }

        desc = description

        // Mark all files as no longer streaming
        fileCompletionTracker.forEach((_, filePath) => {
          get().completeFileStreaming(filePath);
        });

        get().setMessages(fullResponse);

        // Log the shell steps that will be executed
        if (stepsToExecuteLater.length > 0) {
          console.log(`Found ${stepsToExecuteLater.length} shell steps to execute:`, stepsToExecuteLater.map(s => s.code || s.description));
          await get().executeSteps(stepsToExecuteLater);
        } else {
          console.log('No shell steps found in response');
        }
      } catch (err) {
        console.error("Error during build:", err);
        toast.error("Error while building project")
        set({ isProcessing: false })
        hasErrorOccured = true
      } finally {
        set({ isProcessing: false })
      }

      if(!hasErrorOccured){
        // try {
        //   const projectRes = await axiosInstance.post("/api/store-project", { prompt });
        //   set({ projectId: projectRes.data.projectId });
        // } catch (error) {
        //   console.error("Error while storing project: ", error)
        //   hasErrorOccured = true
        // }
        
        try {
          // Convert File objects to base64 for storage if needed
          let imagesToStore = images;
          if (images && images.length > 0 && images[0] instanceof File) {
            imagesToStore = await Promise.all(
              images.map(async (fileOrString: string | File) => {
                if (fileOrString instanceof File) {
                  const buffer = await fileOrString.arrayBuffer();
                  const base64 = Buffer.from(buffer).toString('base64');
                  return `data:${fileOrString.type};base64,${base64}`;
                }
                return fileOrString;
              })
            );
          }
          
          console.log("messages: ", get().messages)
          await axiosInstance.post("/api/store-chats", {
            prompt,
            response: get().messages,
            projectId: get().projectId,
            images: imagesToStore,
            description: desc
          })
          useAuthStore.getState().incrementUsage()
        } catch (error) {
          console.error("Error while storing chats: ", error)
        }
      }
    },

    processFollowupPrompts: async (prompt, images) => {
      set({ isProcessingFollowups: true });
      const currentPromptIndex = get().inputPrompts.length
      try {
        set(state => ({
          inputPrompts: [
            ...state.inputPrompts,
            prompt
          ]
        }))
        set(state => ({
          promptStepsMap: new Map(state.promptStepsMap).set(currentPromptIndex, {
            prompt,
            steps: [],
            images
          })
        }))

        const cleanMessages = get().messages.filter(Boolean).map(m => ({
          role: "assistant",
          content: m
        }));
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: {
              role: "user",
              content: prompt
            },
            messages: cleanMessages,
            images
          })
        });

        if (!response.ok || !response.body) {
          toast.error("Failed to stream chat response")
          return
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = "";
        let fullResponse = "";
        // Separate map for tracking file completion - this one uses objects
        const fileCompletionTracker = new Map<string, { step: BuildStep, content: string, isComplete: boolean }>();
        
        // Collect steps to execute at the end
        const stepsToExecuteLater: BuildStep[] = [];

        // Extract description from the start of the response
        const descriptionRegex = /^([\s\S]*?)<zapArtifeact/;
        
        let description = "";
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);
            buffer += chunk;
            fullResponse += chunk;

            // Try to extract description if we haven't yet
            if (!description) {
              const descMatch = descriptionRegex.exec(buffer);
              if (descMatch) {
                description = descMatch[1].trim();
                // Update promptStepsMap with description
                set(state => {
                  const newMap = new Map(state.promptStepsMap);
                  const existing = newMap.get(currentPromptIndex) || { 
                    prompt, 
                    steps: [],
                    images: images || []
                  };
                  newMap.set(currentPromptIndex, {
                    ...existing,
                    description
                  });
                  return { promptStepsMap: newMap };
                });
              }
            }

            // Process streaming content for files that are still streaming
            fileCompletionTracker.forEach((fileData, filePath) => {
              if (!fileData.isComplete && !get().userEditedFiles.has(filePath)) {
                // Extract content between the opening tag and current buffer position
                const openingTag = `<zapAction type="file" filePath="${filePath}">`;
                const openingIndex = buffer.indexOf(openingTag);
                
                if (openingIndex !== -1) {
                  const contentStart = openingIndex + openingTag.length;
                  const closingTag = '</zapAction>';
                  const closingIndex = buffer.indexOf(closingTag, contentStart);
                  
                  // Extract the content portion
                  let contentToStream = '';
                  if (closingIndex === -1) {
                    // File not complete yet, stream what we have
                    contentToStream = buffer.substring(contentStart);
                  } else {
                    // File complete
                    contentToStream = buffer.substring(contentStart, closingIndex);
                  }
                  
                  // Remove leading/trailing whitespace and normalize indentation
                  // But only do this once at the start (when fileData.content is empty)
                  if (fileData.content.length === 0) {
                    // Remove leading newline and whitespace
                    contentToStream = contentToStream.replace(/^\s*\n/, '');
                    
                    // Find the minimum indentation to remove
                    const lines = contentToStream.split('\n');
                    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
                    
                    if (nonEmptyLines.length > 0) {
                      const minIndent = Math.min(
                        ...nonEmptyLines.map(line => {
                          const match = line.match(/^(\s*)/);
                          return match ? match[1].length : 0;
                        })
                      );
                      
                      // Remove the base indentation from all lines
                      if (minIndent > 0) {
                        contentToStream = lines
                          .map(line => line.substring(minIndent))
                          .join('\n');
                      }
                    }
                  }
                  
                  // Only stream the new content that wasn't streamed before
                  const previousLength = fileData.content.length;
                  if (contentToStream.length > previousLength) {
                    const newChunk = contentToStream.substring(previousLength);
                    fileData.content = contentToStream; // Update tracker
                    
                    // Stream only actual file content in reasonable chunks
                    const chunkSize = Math.min(newChunk.length, 100);
                    const limitedChunk = newChunk.substring(0, chunkSize);
                    get().streamFileContent(filePath, limitedChunk);
                  }
                }
              }
            });

            // Process complete actions
            let match;
            const actionRegex = /<zapAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/zapAction>/g;

            while ((match = actionRegex.exec(buffer)) !== null) {
              const [, type, filePath, content] = match;
              buffer = buffer.slice(actionRegex.lastIndex);

              const code = content.trim();

              if (type === "file" && filePath) {
                if (fileCompletionTracker.has(filePath)) {
                  fileCompletionTracker.get(filePath)!.isComplete = true;
                }

                get().completeFileStreaming(filePath);

                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: getTitleFromFile(filePath),
                  description: getDescriptionFromFile(filePath),
                  type: BuildStepType.CreateFile,
                  status: statusType.InProgress,
                  code: code, // Format only on completion
                  path: filePath,
                };

                get().addFile(filePath, code); // Format only on completion

                set(state => {
                  const newMap = new Map(state.promptStepsMap)
                  const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
                  newMap.set(currentPromptIndex, {
                    ...existing,
                    steps: [...existing.steps, step]
                  })
                  return { promptStepsMap: newMap }
                })

                get().setBuildSteps([step]);
                get().setSelectedFile(step.path as string);
                get().executeSteps([step]); 
              }

              if (type === "shell") {
                const decodedCode = code.replace(/&amp;/g, '&'); // Add this line to decode HTML entities
                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: "Run shell command",
                  description: decodedCode, // Use decoded version
                  type: BuildStepType.RunScript,
                  status: statusType.InProgress,
                  code: decodedCode, // Use decoded version
                };

                set(state => {
                  const newMap = new Map(state.promptStepsMap)
                  const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
                  newMap.set(currentPromptIndex, {
                    ...existing,
                    steps: [...existing.steps, step]
                  })
                  return { promptStepsMap: newMap }
                })

                get().setBuildSteps([step]);
                // Collect shell steps to execute later after all files are created
                stepsToExecuteLater.push(step);
              }
            }

            // Check for new incomplete file actions
            const incompleteActionRegex = /<zapAction\s+type="file"\s+filePath="([^"]*)">/g;
            let incompleteMatch;
            while ((incompleteMatch = incompleteActionRegex.exec(buffer)) !== null) {
              const [, filePath] = incompleteMatch;
              
              if (!fileCompletionTracker.has(filePath)) {
                // Initialize file for streaming
                get().addFile(filePath, "");
                get().setSelectedFile(filePath);

                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: getTitleFromFile(filePath),
                  description: getDescriptionFromFile(filePath),
                  type: BuildStepType.CreateFile,
                  status: statusType.InProgress,
                  code: "",
                  path: filePath,
                };

                // Add to completion tracker
                fileCompletionTracker.set(filePath, { 
                  step, 
                  content: "", 
                  isComplete: false 
                });
                
                // Mark file as streaming in the store
                set(state => ({
                  streamingFiles: new Map(state.streamingFiles).set(filePath, true)
                }));
                
                get().setBuildSteps([step]);
              }
            }
          }
        }

        // Process any remaining buffer content after stream ends
        if (buffer.trim().length > 0) {
          let match;
          const actionRegex = /<zapAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/zapAction>/g;

          while ((match = actionRegex.exec(buffer)) !== null) {
            const [, type, filePath, content] = match;
            const code = content.trim();

            if (type === "file" && filePath) {
              if (fileCompletionTracker.has(filePath)) {
                fileCompletionTracker.get(filePath)!.isComplete = true;
              }

              get().completeFileStreaming(filePath);

              const step: BuildStep = {
                id: crypto.randomUUID(),
                title: getTitleFromFile(filePath),
                description: getDescriptionFromFile(filePath),
                type: BuildStepType.CreateFile,
                status: statusType.InProgress,
                code: code,
                path: filePath,
              };

              get().addFile(filePath, code);

              set(state => {
                const newMap = new Map(state.promptStepsMap)
                const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
                newMap.set(currentPromptIndex, {
                  ...existing,
                  steps: [...existing.steps, step]
                })
                return { promptStepsMap: newMap }
              })

              get().setBuildSteps([step]);
              get().setSelectedFile(step.path as string);
              get().executeSteps([step]);
            }

            if (type === "shell") {
              const decodedCode = code.replace(/&amp;/g, '&');
              const step: BuildStep = {
                id: crypto.randomUUID(),
                title: "Run shell command",
                description: decodedCode,
                type: BuildStepType.RunScript,
                status: statusType.InProgress,
                code: decodedCode,
              };

              set(state => {
                const newMap = new Map(state.promptStepsMap)
                const existing = newMap.get(currentPromptIndex) || { prompt, steps: [] }
                newMap.set(currentPromptIndex, {
                  ...existing,
                  steps: [...existing.steps, step]
                })
                return { promptStepsMap: newMap }
              })

              get().setBuildSteps([step]);
              stepsToExecuteLater.push(step);
            }
          }
        }

        // Mark all files as no longer streaming
        fileCompletionTracker.forEach((_, filePath) => {
          get().completeFileStreaming(filePath);
        });

        get().setMessages(fullResponse);

        // Log the shell steps that will be executed
        if (stepsToExecuteLater.length > 0) {
          console.log(`Found ${stepsToExecuteLater.length} shell steps to execute:`, stepsToExecuteLater.map(s => s.code || s.description));
          await get().executeSteps(stepsToExecuteLater);
        } else {
          console.log('No shell steps found in response');
        }

        await axiosInstance.post("/api/store-chats", {
          prompt,
          response: [fullResponse],
          projectId: get().projectId,
          images
        })
        useAuthStore.getState().incrementUsage()
      } catch (error) {
        console.error("Error processing followup prompt:", error);
      } finally {
        set({ isProcessingFollowups: false });
      }
    },
    
    processChatData: async (chatData) => {
      const { 
        setBuildSteps, 
        setMessages, 
        resetUserEditedFiles,
        clearBuildSteps,
        executeSteps,
      } = get()
      
      // Reset store state
      clearBuildSteps()
      resetUserEditedFiles()
      
      // Clear the promptStepsMap
      set({ promptStepsMap: new Map() })

      const allSteps: BuildStep[] = []
      const allMessages: string[] = []
      console.log("processing chat data")
      // First pass: Create all steps and initialize promptStepsMap
      chatData.forEach((chat, promptIndex) => {
        // Initialize the prompt mapping first with description
        set((state) => {
          const newMap = new Map(state.promptStepsMap);
          newMap.set(promptIndex, {
            prompt: chat.prompt,
            steps: [],
            images: chat.images || [],
            description: chat.description
          });
          return { 
            promptStepsMap: newMap,
            inputPrompts: [...state.inputPrompts, chat.prompt]
          };
        });

        const actionRegex = /<zapAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/zapAction>/g;
        let match;
        const promptSteps: BuildStep[] = [];

        while ((match = actionRegex.exec(chat.response)) !== null) {
          const [, type, filePath, content] = match;
          const code = content.trim();

          if (type === "file" && filePath) {
            const step: BuildStep = {
              id: crypto.randomUUID(),
              title: getTitleFromFile(filePath),
              description: getDescriptionFromFile(filePath),
              type: BuildStepType.CreateFile,
              status: statusType.InProgress,
              code,
              path: filePath,
            };

            promptSteps.push(step);
            allSteps.push(step);
          }

          if (type === "shell") {
            const decodedCode = code.replace(/&amp;/g, '&');
            const step: BuildStep = {
              id: crypto.randomUUID(),
              title: "Run shell command",
              description: decodedCode,
              type: BuildStepType.RunScript,
              status: statusType.InProgress,
              code: decodedCode,
            };

            promptSteps.push(step);
            allSteps.push(step);
          }
        }
      
        // Update the prompt mapping with steps after processing
        set((state) => {
          const newMap = new Map(state.promptStepsMap);
          const existing = newMap.get(promptIndex);
          if (existing) {
            newMap.set(promptIndex, {
              ...existing,
              steps: promptSteps
            });
          }
          return { promptStepsMap: newMap };
        });

        allMessages.push(chat.response)
      })
      
      setBuildSteps(allSteps)
      setMessages(allMessages)

      if (chatData.length > 0) {
        set({ projectId: chatData[0].projectId })
      }

      // Second pass: Execute all steps sequentially
      // This ensures steps show as InProgress and then complete
      await executeSteps(allSteps)
    },

    setUpWebContainer: async () => {
      const {
        webcontainer,
        isInitialisingWebContainer,
      } = get();

      if (webcontainer) {
        console.log("Web container already initialized, reusing existing instance.");
        return;
      }

      if (isInitialisingWebContainer) {
        console.log("Web container is already initialising, waiting...");

        const currentState = get();
        if (currentState.webcontainer) {
          return currentState.webcontainer;
        }
        return null;
      }

      set({ isInitialisingWebContainer: true });
      console.log("Initialising web container...");

      try {
        // let retryCount = 0;
        // const maxRetries = 3;
        // let webContainerInstance = null;

        // while (retryCount < maxRetries && !webContainerInstance) {
        //   try {
        //     webContainerInstance = await WebContainer.boot();
        //   } catch (err) {
        //     const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        //     console.log(`Attempt ${retryCount + 1} failed, ${errorMessage}`);
        //     if ((err instanceof Error && err.message.includes("Unable to create more instances")) || retryCount === maxRetries - 1) {
        //       throw err;
        //     }
        //     retryCount++;
        //   }
        // }

        // if (webContainerInstance) {
        //   set({ webcontainer: webContainerInstance });
        //   console.log("Web container initialised successfully");
        //   return webContainerInstance;
        // }
        const webContainerInstance = await WebContainer.boot()
        set({ webcontainer: webContainerInstance })
        console.log("Web container initialised successfully");
      } catch (error) {
        console.error("Error while initialising web container: ", error);
        // set({ webcontainer: null });
        // If we hit the instance limit, we might want to show a user-friendly message
        // if (error instanceof Error && error.message.includes("Unable to create more instances")) {
        //   toast.error("Too many preview instances open. Please close some tabs and try again.");
        // }
      } finally {
        set({ isInitialisingWebContainer: false });
      }
    },

    startDevServer: async () => {
      const { webcontainer, devServerProcess } = get()
      if (!webcontainer) throw new Error("WebContainer not ready")

      // prevent duplicate servers
      if (devServerProcess) return

      await webcontainer.spawn("npm", ["install"])

      const devProc = await webcontainer.spawn("npm", ["run", "dev"])
      set({ devServerProcess: devProc })

      webcontainer.on("server-ready", (port, url) => {
        console.log("Dev server ready:", url)
        set({ previewUrl: url })
      })
    }

}))


// export function formatCodeBlock(code: string): string {
//   const lines = code.split('\n');
//   const result: string[] = [];
//   let indentLevel = 0;
//   const INDENT = '  '; // 2 spaces

//   // Find base indentation to remove
//   const baseIndent = lines
//     .filter(line => line.trim())
//     .reduce((min, line) => {
//       const indent = line.match(/^\s*/)?.[0].length ?? 0;
//       return Math.min(min, indent);
//     }, Infinity);

//   for (const line of lines) {
//     // Remove base indentation from line
//     let currentLine = line.slice(baseIndent);
    
//     // Decrease indent for closing brackets
//     if (currentLine.trim().match(/^[}\])]/) && indentLevel > 0) {
//       indentLevel--;
//     }

//     // Add proper indentation
//     if (currentLine.trim().length > 0) {
//       currentLine = INDENT.repeat(indentLevel) + currentLine.trim();
//     }

//     result.push(currentLine);

//     // Increase indent for opening brackets
//     if (currentLine.trim().match(/[{[(]\s*$/)) {
//       indentLevel++;
//     }
//   }

//   return result.join('\n');
// }