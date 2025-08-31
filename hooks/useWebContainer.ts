import { useEffect } from "react";
import { WebContainer } from "@webcontainer/api";
import { useEditorStore } from "@/stores/editorStore/useEditorStore";

export function useWebContainer() {
  const { setWebcontainer, webcontainer } = useEditorStore();

  useEffect(() => {
    const initWebContainer = async () => {
      if(!webcontainer){
        const webContainerInstance = await WebContainer.boot();
        setWebcontainer(webContainerInstance);
      }
    };

    initWebContainer();
  }, [setWebcontainer, webcontainer]);
}
