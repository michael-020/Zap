/* eslint-disable @next/next/no-img-element */
"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"
import { ArrowUp, ImageIcon, Loader2, LoaderPinwheel, X } from 'lucide-react'
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { TextArea } from "./text-area"
import RightSidebar from "./sidebar"
import Navbar from "./navbar"
import toast from "react-hot-toast"
import { ImageModal } from "./image-modal"

interface ProjectInitializerProps {
  onSubmitAction: (description: string) => void
  initialPrompt?: string;
  initialImages?: File[];
}

// Helper function to convert image to WebP
async function convertToWebP(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (optional: resize for optimization)
      const maxWidth = 1920; // Max width for uploaded images
      const maxHeight = 1080; // Max height for uploaded images
      
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
      
      // Draw and convert to WebP
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

export function ProjectInitializer({ onSubmitAction, initialPrompt, initialImages }: ProjectInitializerProps) {
  const [description, setDescription] = useState(initialPrompt || "")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef(null)
  const { processPrompt } = useEditorStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [webpFiles, setWebpFiles] = useState<File[]>(initialImages || [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: session, status } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState("")
  const [isProcessingImages, setIsProcessingImages] = useState(false)

  // Initialize previews for initial images
  useEffect(() => {
    const setupInitialImages = async () => {
      if (initialImages && initialImages.length > 0) {
        const newPreviews: string[] = [];
        const newWebpFiles: File[] = [];

        for (const file of initialImages) {
          // Create preview URL for initial images
          const previewUrl = URL.createObjectURL(file);
          newPreviews.push(previewUrl);

          try {
            // Convert to WebP if not already WebP
            let webpFile: File;
            if (file.type === 'image/webp') {
              webpFile = file;
            } else {
              webpFile = await convertToWebP(file);
            }
            newWebpFiles.push(webpFile);
          } catch (error) {
            console.error('Error converting initial image to WebP:', error);
            newWebpFiles.push(file);
          }
        }

        setImagePreviews(newPreviews);
        setWebpFiles(newWebpFiles);
      }
    };

    setupInitialImages();
  }, [initialImages]);

  // Auto-submit if there's an initial prompt
  useEffect(() => {
    if (initialPrompt && initialImages) {
      handleSubmit();
    }
  }, [initialPrompt, initialImages])

  const openImageModal = (imageSrc: string) => {
    setModalImageSrc(imageSrc)
    setIsModalOpen(true)
  }

  const closeImageModal = () => {
    setIsModalOpen(false)
    setModalImageSrc("")
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    
    if (files.length === 0) return;

    // Validate all files are images
    const invalidFiles = files.filter(file => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    // Check if adding these files would exceed a reasonable limit (e.g., 10 images)
    if (imagePreviews.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setIsProcessingImages(true);

    try {
      // Process each file
      const newPreviews: string[] = [];
      const newWebpFiles: File[] = [];

      for (const file of files) {
        // Create preview URL for display
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);

        try {
          // Convert to WebP if not already WebP
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
          // Fallback: use original file
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

    // Clear the input so the same files can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      // Clean up object URL to prevent memory leaks
      const removedUrl = prev[indexToRemove];
      if (removedUrl && removedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(removedUrl);
      }
      return newPreviews;
    });
    setWebpFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeAllImages = () => {
    // Clean up all object URLs to prevent memory leaks
    imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    setImagePreviews([]);
    setWebpFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Clean up object URLs when component unmounts
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
  
  useEffect(() => {
    if(status === "loading") return
    if (!session) {
      redirect("/")
    }
  }, [session, status])

  useEffect(() => { 
    if (textareaRef.current) {
      (textareaRef.current as HTMLTextAreaElement).focus()
    }
  }, [])

  useEffect(() => {
    const threshold = 25;
    const sidebarWidth = 256; 
  
    const onMouseMove = (e: MouseEvent) => {
      const isNearRightEdge = window.innerWidth - e.clientX <= threshold;
      const isInsideSidebar = e.clientX >= window.innerWidth - sidebarWidth;
      
      if (isNearRightEdge) {
        setIsHovered(true);
      } else if (!isInsideSidebar && isHovered) {
        setIsHovered(false);
      }
    };
  
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [isHovered]);
 
  const handleSidebarMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSidebarClose = () => {
    setIsOpen(false);
    setIsHovered(false);
  };

   
  const sidebarVisible = isOpen || isHovered;

  const handleSubmit = () => {
    if (!description.trim()) return;

    setIsLoading(true);
    
    try {
      processPrompt(description, webpFiles);
      onSubmitAction(description.trim());
    } catch (error) {
      console.error("Error generating steps:", error);
      toast.error("Failed to process your request");
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }
   
  if(!session){
    return <div className="h-screen bg-black flex items-center justify-center">
      <Loader2 className="size-14 animate-spin text-neutral-200" />
    </div>
  }

  return (
    <div className="relative min-h-screen bg-black">
      <Navbar
        onPanelToggle={() => setIsOpen(!isOpen)}
        showPanelToggle={true}
      />

      <div className="flex items-center justify-center min-h-screen px-6 pb-20">
        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleFormSubmit} className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Start with a sentence.
              </h1>
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                End with a website.
              </h2>
            </div>

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
                    className="text-sm text-neutral-400 hover:text-neutral-500 transition-colors"
                  >
                    Remove All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-8 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <button onClick={() => openImageModal(preview)} className="aspect-square size-20 rounded-sm overflow-hidden bg-neutral-800">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="object-cover size-20"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-neutral-700 hover:bg-neutral-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <TextArea
                  id="description"
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onEnterSubmit={handleSubmit}
                  placeholder="Describe the website you want to build..."
                  height="8rem"
                  maxHeight="16rem"
                  required
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
                  type="submit"
                  disabled={!description.trim() || isLoading || isProcessingImages}
                  className={`absolute bottom-4 right-4 p-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    description.trim() && !isLoading && !isProcessingImages
                      ? "bg-neutral-300 hover:bg-neutral-400 text-black shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5 hover:scale-105"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  {!isLoading ? (
                    <>
                      <ArrowUp className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <LoaderPinwheel className="animate-spin w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <RightSidebar
        isOpen={sidebarVisible}
        setIsOpenAction={handleSidebarClose}
        onMouseLeaveAction={handleSidebarMouseLeave}
      />
      <ImageModal
        isOpen={isModalOpen}
        imageSrc={modalImageSrc}
        onClose={closeImageModal}
      />
    </div>
  )
}