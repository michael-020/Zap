import { create } from "zustand"
import { authAction, authState } from "./types"

export const useAuthStore = create<authState & authAction>((set) => ({
    inputEmail: "",

    setInputEmail: (email: string) => {
        set({ inputEmail: email})
    }
}))