import { create } from "zustand"
import { authAction, authState } from "./types"

export const useAuthStore = create<authState & authAction>((set) => ({
    inputEmail: "",
    savedPrompt: "",
    savedImages: [],

    setInputEmail: (email: string) => {
        set({ inputEmail: email })
    },

    setSavedPrompt: (prompt: string) => {
        set({ savedPrompt: prompt })
    },

    setSavedImages: (images: File[]) => {
        set({ savedImages: images })
    },

    clearSavedData: () => {
        set({ savedPrompt: "", savedImages: [] })
    }
}))