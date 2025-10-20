"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "@/components/auth-modal";
import { useAuthStore } from "@/stores/authStore/useAuthStore";
import toast from "react-hot-toast";
import { PromptInputPanel } from "@/components/prompt-input-panel";

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  
  const { setSavedPrompt, setSavedImages } = useAuthStore();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = (description: string, files: File[]) => {
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setSavedPrompt(description);
    setSavedImages(files);

    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }
    router.push("/chat");
  };

  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-white">Mirror</div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/signin")}
                className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-4 py-2 text-sm font-medium bg-neutral-800 text-white hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen md-14">
        <div className="text-center mb-3">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Start with a sentence.
          </h1>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            End with a website.
          </h2>
        </div>
        <p className="text-neutral-400 text-center mb-12 text-lg">
          Create stunning websites by chatting with Mirror AI.
        </p>

        <div className="w-full max-w-3xl mx-auto">
          <PromptInputPanel
            description={prompt}
            setDescription={setPrompt}
            onSubmit={handleSubmit}
            isSubmitting={false}
            disabled={false}
            placeholder="Describe the website you want to build..."
            textareaHeight="8rem"
            textareaMaxHeight="16rem"
            maxImages={10}
          />
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}