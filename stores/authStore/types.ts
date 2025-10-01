export interface authState {
    inputEmail: string;
    savedPrompt: string;
    savedImages: File[];
}

export interface authAction {
    setInputEmail: (email: string) => void;
    setSavedPrompt: (prompt: string) => void;
    setSavedImages: (images: File[]) => void;
    clearSavedData: () => void;
}
