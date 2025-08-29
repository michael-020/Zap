import { create } from "zustand"
import { authAction, authState } from "./types"

export const useAuthStore = create<authState & authAction>((set) => ({
    inputEmail: "",
    authUser: null,

    setInputEmail: (email: string) => {
        set({ inputEmail: email})
    },
    
    setAuthUser: (data) => set({ authUser: data })
}))