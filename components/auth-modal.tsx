import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80"
      onClick={handleBackdropClick}
    >
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to Mirror</h3>
              <p className="text-neutral-400">Sign in to continue building</p>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => signIn("google", { callbackUrl: "/chat" })}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                <Image src="/google.svg" alt="Google" width={20} height={20} />
                <span>Sign In with Google</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  router.push("/signin");
                }}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Sign In with email and password
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-400">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    onClose();
                    router.push("/verify-email");
                  }}
                  className="text-neutral-200 hover:text-white font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}