"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "@/components/auth-modal";
import { useAuthStore } from "@/stores/authStore/useAuthStore";
import { PromptInputPanel } from "@/components/prompt-input-panel";
import { showErrorToast } from "@/lib/toast";

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  
  const { setSavedPrompt, setSavedImages } = useAuthStore();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = (description: string, files: File[]) => {
    if (!description.trim()) {
      showErrorToast("Please enter a description");
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
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950/80 border-0.5 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-neutral-900 dark:text-white select-none font-stretch-extra-expanded">Zap</div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/signin")}
                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center -translate-y-12 px-4">
        <div className="text-center mb-3">
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white leading-tight">
            Start with a sentence.
          </h1>
          <h2 className="text-4xl bg-purple-400 md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            End with a website.
          </h2>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 text-center mb-12 text-lg">
          Create stunning websites by chatting with Zap.
        </p>

        <div className="w-full max-w-3xl mx-auto">
          <PromptInputPanel
            isPremium={false}
            description={prompt}
            setDescription={setPrompt}
            onSubmit={handleSubmit}
            isSubmitting={false}
            disabled={false}
            placeholder="Describe the website you want to build..."
            textareaHeight="6rem"
            textareaMaxHeight="16rem"
            maxImages={10}
            showSupportModal={false}
          />
        </div>
      </div>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="text-xl font-bold text-neutral-900 dark:text-white select-none font-stretch-extra-expanded">
                Zap
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                © 2026 Zap - All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-8">
              <a
                href="/policies"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Policies
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}