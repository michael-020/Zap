"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "@/components/auth-modal";

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = (prompt: string) => {
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
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
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-16">
        <div className="text-center mb-3">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Start with a sentence.
          </h1>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            End with a website.
          </h2>
        </div>
        <p className="text-neutral-400 text-center mb-12 text-lg">
          Create stunning websites by chatting with AI.
        </p>

        {/* Input Area */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative">
            <textarea
              placeholder="Type your idea and we'll build it together."
              className="w-full px-4 py-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-transparent resize-none h-[120px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e.currentTarget.value);
                }
              }}
            />
            <button
              onClick={() => handleSubmit("")}
              className="absolute bottom-3 right-3 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium"
            >
              Start Building →
            </button>
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}