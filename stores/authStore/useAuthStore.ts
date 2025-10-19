import { create } from "zustand"
import { authAction, authState } from "./types"

export const useAuthStore = create<authState & authAction>((set) => ({
    inputEmail: "",
    savedPrompt: "",
    savedImages: [],
    currentUsage: 0,   
    isPremium: false, 

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
    },

    setUsage: (usage: number) => {
        set({ currentUsage: usage })
    },

    incrementUsage: () => {
        set((state) => ({ currentUsage: state.currentUsage + 1 }))
    },

    resetUsage: () => {
        set({ currentUsage: 0 })
    },

    setPremiumStatus: (status: boolean) => {
        set({ isPremium: status })
    },
}))
