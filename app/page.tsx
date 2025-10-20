/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { ArrowUp, ImageIcon, X } from "lucide-react";
import AuthModal from "@/components/auth-modal";
import { useAuthStore } from "@/stores/authStore/useAuthStore";
import toast from "react-hot-toast";
import AutoResizingTextarea from "@/components/textarea";

async function convertToWebP(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const maxWidth = 1920;
      const maxHeight = 1080;
      
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
            type: 'image/webp'
          });
          resolve(webpFile);
        } else {
          reject(new Error('Failed to convert image to WebP'));
        }
      }, 'image/webp', quality);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [webpFiles, setWebpFiles] = useState<File[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setSavedPrompt, setSavedImages } = useAuthStore();
  const { data: session } = useSession();
  const router = useRouter();

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    const invalidFiles = files.filter(file => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    if (imagePreviews.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setIsProcessingImages(true);

    try {
      const newPreviews: string[] = [];
      const newWebpFiles: File[] = [];

      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);

        try {
          let webpFile: File;
          if (file.type === 'image/webp') {
            webpFile = file;
          } else {
            webpFile = await convertToWebP(file);
          }
          newWebpFiles.push(webpFile);
        } catch (error) {
          console.error('Error converting image to WebP:', error);
          toast.error(`Failed to process image: ${file.name}`);
          newWebpFiles.push(file);
        }
      }

      setImagePreviews(prev => [...prev, ...newPreviews]);
      setWebpFiles(prev => [...prev, ...newWebpFiles]);

    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process some images');
    } finally {
      setIsProcessingImages(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      const removedUrl = prev[indexToRemove];
      if (removedUrl && removedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(removedUrl);
      }
      return newPreviews;
    });
    setWebpFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeAllImages = () => {
    imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    setImagePreviews([]);
    setWebpFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    // Save to auth store
    setSavedPrompt(prompt);
    setSavedImages(webpFiles);

    if (!session) {
      // Show auth modal, user will be redirected to /chat after signing in
      setIsAuthModalOpen(true);
      return;
    }

    // User is already logged in, navigate to chat
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
        <div className="w-full max-w-2xl mx-auto space-y-4">
          {imagePreviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Selected Images ({imagePreviews.length})
                  {isProcessingImages && (
                    <span className="ml-2 text-sm text-neutral-400">
                      Processing...
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={removeAllImages}
                  className="text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
                >
                  Remove All
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square size-20 rounded-lg overflow-hidden bg-neutral-800">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <AutoResizingTextarea
                description={prompt}
                setDescription={setPrompt}
                placeholder="Describe the website you want to build..."
                maxHeight="16rem"
                height="8rem"
                onEnterSubmit={handleSubmit}
              />
              
              <div className="absolute bottom-6 left-6 flex items-center justify-center gap-2">
                <label htmlFor="fileInput" className="cursor-pointer relative">
                  <ImageIcon className={`w-6 h-6 transition-colors ${
                    isProcessingImages 
                      ? 'text-blue-400 animate-pulse' 
                      : 'text-neutral-500 hover:text-neutral-400'
                  }`} />
                </label>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={isProcessingImages}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isProcessingImages}
                className={`absolute bottom-4 right-4 p-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  prompt.trim() && !isProcessingImages
                    ? "bg-neutral-300 hover:bg-neutral-400 text-black shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5 hover:scale-105"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}