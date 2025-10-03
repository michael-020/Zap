"use client"

import { useEditorStore } from "@/stores/editorStore/useEditorStore";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";


export function PreviewPanel() {
    const { webcontainer, previewUrl, setPreviewUrl, setUpWebContainer } = useEditorStore()

    async function init(){
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

    useEffect(() => {
        init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    return (
        <div className="h-[calc(100vh-4rem)] overflow-hidden pb-10"> 
            {!previewUrl ? 
                <div className="h-full w-full items-center justify-center flex flex-col gap-4"> 
                    <Loader2 className="animate-spin size-10" />
                    <div className="text-xl">Generating preview</div>
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