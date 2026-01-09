"use client"

import { useEditorStore } from "@/stores/editorStore/useEditorStore";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";


export function PreviewPanel() {
    const { webcontainer, previewUrl, setPreviewUrl, setUpWebContainer, isWebContainerReady } = useEditorStore()

    // async function init(){
    //     try {
    //         if(!webcontainer) {
    //             console.log("setting up webcontainer")
    //             await setUpWebContainer()
    //         }
            
    //         // Get the webcontainer instance again after setup
    //         const currentContainer = useEditorStore.getState().webcontainer
    //         if(!currentContainer) {
    //             console.log("No webcontainer available after setup")
    //             return;
    //         }

    //         // Use the current container instance
    //         const installProcess = await currentContainer.spawn('npm', ['install']);
    //         console.log("npm i done")

    //         installProcess.output.pipeTo(new WritableStream({
    //             write() {
    //             }
    //         }));

    //         await currentContainer.spawn('npm', ['run', 'dev']);
    //         console.log("npm run dev")

    //         currentContainer.on('server-ready', (port, url) => {
    //             console.log("url: ", url)
    //             setPreviewUrl(url)
    //         });
    //     } catch (error) {
    //         console.error("Error in preview initialization:", error);
    //     }
    // }

    // useEffect(() => {
    //     init()
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])
    useEffect(() => {
        if(isWebContainerReady){
            const init = async () => {
                // await setUpWebContainer()
                if(!webcontainer) {
                    console.log("return")
                    await setUpWebContainer()
                }
                
                if(!webcontainer) {
                    console.log("return")
                    return;
                }
                
                const installProcess = await webcontainer.spawn('npm', ['install']);
                console.log("npm i done")
                
                installProcess.output.pipeTo(new WritableStream({
                    write() {
                    }
                }));
                
                await webcontainer.spawn('npm', ['run', 'dev']);
                console.log("npm run dev")
                
                webcontainer.on('server-ready', (port, url) => {
                    console.log("url: ", url)
                    setPreviewUrl(url)
                });
            }
            
            init()
        }
    }, [isWebContainerReady, setPreviewUrl, setUpWebContainer, webcontainer])

    
    return (
        <div className="h-[calc(100vh-4rem)] overflow-hidden pb-10"> 
            {!previewUrl ? 
                <div className="h-full w-full items-center justify-center bg-neutral-50 dark:bg-neutral-950 flex flex-col gap-4"> 
                    <Loader2 className="animate-spin size-10 text-neutral-300 dark:text-neutral-400" />
                    <div className="text-xl text-neutral-900 dark:text-neutral-100 animate-pulse">Generating preview</div>
                </div>
            : 
                <iframe 
                    src={previewUrl}
                    className="w-full h-full"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                />
            }
        </div>
    );
}