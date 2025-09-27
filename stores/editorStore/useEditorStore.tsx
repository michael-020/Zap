import { create } from "zustand"
import { BuildStep, BuildStepType, FileItemFlat, statusType, StoreState } from "./types"
import { axiosInstance } from "@/lib/axios"
import { getDescriptionFromFile, getTitleFromFile, parseXml } from "@/lib/steps"
import { WebContainer, WebContainerProcess } from "@webcontainer/api"
import toast from "react-hot-toast"

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
  projectId: "",

  setWebcontainer: async (instance: WebContainer) => {
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
            return { ...item, content: currentContent + chunk }
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
              content,
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

    setShellCommand: (command: string) =>{
      console.log("command added: ", command)
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
            axiosInstance.put(`/api/project/${get().projectId}`, {
              previewUrl: url
            })
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
            axiosInstance.put(`/api/project/${get().projectId}`, {
              previewUrl: url
            })
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

    processPrompt: async (prompt, images) => {
      get().setUpWebContainer()

      set({ isInitialising: true })
      let url = ""
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
      
      if(url !== "not a url".toLowerCase() && !hasErrorOccured){
        try {
          const res = await axiosInstance.post("/api/get-images", { url })
          images?.push(res.data.images)
          console.log("images: ", images)
        } catch (error) {
          console.error("Error while getting images: ", error)
          hasErrorOccured = true
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

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);
            buffer += chunk;
            fullResponse += chunk;

            // Process streaming content for files that are still streaming
            fileCompletionTracker.forEach((fileData, filePath) => {
              if (!fileData.isComplete && !get().userEditedFiles.has(filePath)) {
                // Only stream if file is still marked as streaming
                if (get().streamingFiles.get(filePath)) {
                  // Limit chunk size to avoid overwhelming the editor
                  const chunkSize = Math.min(chunk.length, 100)
                  const limitedChunk = chunk.substring(0, chunkSize)
                  get().streamFileContent(filePath, limitedChunk);
                }
              }
            });

            // Process complete actions
            let match;
            const actionRegex = /<mirrorAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/mirrorAction>/g;

            while ((match = actionRegex.exec(buffer)) !== null) {
              const [, type, filePath, content] = match;
              buffer = buffer.slice(actionRegex.lastIndex);

              const code = content.trim();

              if (type === "file" && filePath) {
                // Mark file as complete in our tracker
                if (fileCompletionTracker.has(filePath)) {
                  fileCompletionTracker.get(filePath)!.isComplete = true;
                }

                // Complete the file streaming
                get().completeFileStreaming(filePath);

                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: getTitleFromFile(filePath),
                  description: getDescriptionFromFile(filePath),
                  type: BuildStepType.CreateFile,
                  status: statusType.InProgress,
                  code,
                  path: filePath,
                };

                // Set final content
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
                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: "Run shell command",
                  description: code,
                  type: BuildStepType.RunScript,
                  status: statusType.InProgress,
                  code,
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
                get().executeSteps([step]);
              }
            }

            // Check for new incomplete file actions
            const incompleteActionRegex = /<mirrorAction\s+type="file"\s+filePath="([^"]*)">/g;
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

        // Mark all files as no longer streaming
        fileCompletionTracker.forEach((_, filePath) => {
          get().completeFileStreaming(filePath);
        });

        get().setMessages(fullResponse);
      } catch (err) {
        console.error("Error during build:", err)
        toast.error("Error while building project")
        set({ isProcessing: false })
        hasErrorOccured = true
      } finally {
        set({ isProcessing: false })
      }

      if(!hasErrorOccured){
        try {
          const projectRes = await axiosInstance.post("/api/store-project", { prompt });
          set({ projectId: projectRes.data.projectId });
        } catch (error) {
          console.error("Error while storing project: ", error)
          hasErrorOccured = true
        }
        
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
          
          await axiosInstance.post("/api/store-chats", {
            prompt,
            response: get().messages,
            projectId: get().projectId,
            images: imagesToStore
          })
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

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);
            buffer += chunk;
            fullResponse += chunk;

            // Process streaming content for files that are still streaming
            fileCompletionTracker.forEach((fileData, filePath) => {
              if (!fileData.isComplete && !get().userEditedFiles.has(filePath)) {
                // Only stream if file is still marked as streaming
                if (get().streamingFiles.get(filePath)) {
                  // Limit chunk size to avoid overwhelming the editor
                  const chunkSize = Math.min(chunk.length, 100)
                  const limitedChunk = chunk.substring(0, chunkSize)
                  get().streamFileContent(filePath, limitedChunk);
                }
              }
            });

            // Process complete actions
            let match;
            const actionRegex = /<mirrorAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/mirrorAction>/g;

            while ((match = actionRegex.exec(buffer)) !== null) {
              const [, type, filePath, content] = match;
              buffer = buffer.slice(actionRegex.lastIndex);

              const code = content.trim();

              if (type === "file" && filePath) {
                // Mark file as complete in our tracker
                if (fileCompletionTracker.has(filePath)) {
                  fileCompletionTracker.get(filePath)!.isComplete = true;
                }

                // Complete the file streaming
                get().completeFileStreaming(filePath);

                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: getTitleFromFile(filePath),
                  description: getDescriptionFromFile(filePath),
                  type: BuildStepType.CreateFile,
                  status: statusType.InProgress,
                  code,
                  path: filePath,
                };

                // Set final content
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
                const step: BuildStep = {
                  id: crypto.randomUUID(),
                  title: "Run shell command",
                  description: code,
                  type: BuildStepType.RunScript,
                  status: statusType.InProgress,
                  code,
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
                get().executeSteps([step]);
              }
            }

            // Check for new incomplete file actions
            const incompleteActionRegex = /<mirrorAction\s+type="file"\s+filePath="([^"]*)">/g;
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

        // Mark all files as no longer streaming
        fileCompletionTracker.forEach((_, filePath) => {
          get().completeFileStreaming(filePath);
        });

        get().setMessages(fullResponse);
        await axiosInstance.post("/api/store-chats", {
          prompt,
          response: [fullResponse],
          projectId: get().projectId,
          images
        })
      } catch (error) {
        console.error("Error processing followup prompt:", error);
      } finally {
        set({ isProcessingFollowups: false });
      }
    },
    
    processChatData: async (chatData) => {
      const { 
        setBuildSteps, 
        addFile, 
        addFileItem, 
        setMessages, 
        setShellCommand,
        resetUserEditedFiles,
        clearBuildSteps,
        setUpWebContainer
      } = get()
      await new Promise(r => setTimeout(r, 3000))
      setUpWebContainer()
      // Reset store state
      clearBuildSteps()
      resetUserEditedFiles()
    
      const allSteps: BuildStep[] = []
      const allMessages: string[] = []

      chatData.forEach((chat, promptIndex) => {
        set((state) => ({
          inputPrompts: [...state.inputPrompts, chat.prompt]
        }))
    
        const actionRegex = /<mirrorAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/mirrorAction>/g
        let match
        const promptSteps: BuildStep[] = []
    
        while ((match = actionRegex.exec(chat.response)) !== null) {
          const [, type, filePath, content] = match
          const code = content.trim()
    
          if (type === "file" && filePath) {
            const step: BuildStep = {
              id: crypto.randomUUID(),
              title: getTitleFromFile(filePath),
              description: getDescriptionFromFile(filePath),
              type: BuildStepType.CreateFile,
              status: statusType.Completed,
              code,
              path: filePath,
            }
    
            addFile(filePath, code)
    
            addFileItem({
              name: filePath.split("/").pop() || filePath,
              path: filePath,
              type: "file",
              content: code
            })
    
            promptSteps.push(step)
            allSteps.push(step)
            get().executeSteps([step])
          }
    
          if (type === "shell") {
            const step: BuildStep = {
              id: crypto.randomUUID(),
              title: "Run shell command",
              description: code,
              type: BuildStepType.RunScript,
              status: statusType.InProgress,
              code,
            }
    
            setShellCommand(code)
    
            promptSteps.push(step)
            allSteps.push(step)
            get().executeSteps([step])
          }
        }
      
        set((state) => {
          const newMap = new Map(state.promptStepsMap)
          newMap.set(promptIndex, {
            prompt: chat.prompt,
            steps: promptSteps,
            images: chat.images
          })
          return { promptStepsMap: newMap }
        })
    
        allMessages.push(chat.response)
      })
      
      setBuildSteps(allSteps)
      setMessages(allMessages)
    
      if (chatData.length > 0) {
        set({ projectId: chatData[0].projectId })
      }
    },

    setUpWebContainer: async () => {
      const {
        setWebcontainer,
        webcontainer
      } = get()
      if (webcontainer) {
        return;
      }

      set({ isInitialisingWebContainer: true })
      console.log("initialising web container")
      try {
        const webContainerInstance = await WebContainer.boot();
        setWebcontainer(webContainerInstance);
        console.log("web container initialised")
      } catch (error) {
        console.error("Error while initialisint web container: ", error)
      } finally {
        set({ isInitialisingWebContainer: false })
      }
      
    }
  }))