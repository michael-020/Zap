export interface authState {
    inputEmail: string;
    savedPrompt: string;
    savedImages: File[];
    currentUsage: number;
    isPremium: boolean;
    isFetchingUsage: boolean
}

export interface authAction {
    setInputEmail: (email: string) => void;
    setSavedPrompt: (prompt: string) => void;
    setSavedImages: (images: File[]) => void;
    clearSavedData: () => void;
    setUsage: (usage: number) => void;
    incrementUsage: () => void;
    resetUsage: () => void;
    setPremiumStatus: (status: boolean) => void;
    fetchUsage: () => void;
}