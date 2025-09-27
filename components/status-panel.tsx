/* eslint-disable @next/next/no-img-element */
"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useEditorStore } from "@/stores/editorStore/useEditorStore"
import { Clock, AlertCircle, Loader2, Check, Copy, ArrowUp, ImageIcon, X } from 'lucide-react'
import { BuildStepType, statusType } from "@/stores/editorStore/types"
import { TextArea } from "./text-area"
import toast from "react-hot-toast"
import { ImageModal } from "./image-modal"
import { StatusPanelSkeletons } from "./status-pannel-skeletons"

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

export function StatusPanel() {
  const { processFollowupPrompts, isProcessing, isProcessingFollowups, promptStepsMap } = useEditorStore()
  const [prompt, setPrompt] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [webpFiles, setWebpFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState("")
  const [isProcessingImages, setIsProcessingImages] = useState(false)

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

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);
  
  const handleSubmit = () => {
    if (!prompt.trim()) return
    
    processFollowupPrompts(prompt, webpFiles);
    
    setPrompt("")
    imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setImagePreviews([]);
    setWebpFiles([]);
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  const handleCopy = async (text: string, promptIndex: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPromptIndex(promptIndex)

      setTimeout(() => {
        setCopiedPromptIndex(null)
      }, 3000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const getStatusIcon = (status: statusType) => {
    switch (status) {
      case statusType.Completed:
        return <Check className="w-4 h-4 text-green-500 translate-y-1" />
      case statusType.InProgress:
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case statusType.Error:
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [promptStepsMap])

  if (!promptStepsMap || promptStepsMap.size === 0) {
    return <StatusPanelSkeletons />
  }

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col overflow-x-hidden">
      <div className="flex-1 overflow-x-hidden flex-wrap p-4 space-y-4 custom-scrollbar">
        {Array.from(promptStepsMap.entries()).map(([promptIndex, { prompt, steps, images, description }]) => (
          <div key={promptIndex} className="space-y-3">
            <div className="flex flex-col items-end gap-1 justify-end mb-3">
              <div className="grid grid-cols-3 gap-2">
                {images && images.map((image: string | File, index: number) => {
                  let imageSrc: string;
                  if (typeof image === 'string') {
                    imageSrc = image;
                  } else {
                    imageSrc = URL.createObjectURL(image);
                  }
                  
                  return (
                    <div 
                      key={`${typeof image === 'string' ? image : image.name}-${index}`} 
                      className="rounded-sm aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(imageSrc)}
                    >
                      <img 
                        src={imageSrc} 
                        alt="prompt-image" 
                        crossOrigin="anonymous" 
                        className="object-cover aspect-square rounded-md" 
                      />
                    </div>
                  )
                })}
              </div>
              <div className="bg-neutral-700 rounded-lg rounded-tr-none p-3 max-w-[80%] ml-auto">
                <p className="text-sm text-white break-words">
                  {prompt}
                </p>
              </div>
              {description && (
                <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}
              <button
                onClick={() => handleCopy(prompt, promptIndex)}
                className="p-1 hover:text-white text-gray-400 transition-colors"
                title={copiedPromptIndex === promptIndex ? "Copied" : "Copy prompt"}
                aria-label="Copy prompt"
              >
                {copiedPromptIndex === promptIndex ? (
                  <Check className="size-4 text-neutral-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>

            {steps.length > 0 && (
              <div className="space-y-2 ml-2 bg-neutral-900 px-3 p-2 rounded-lg">
                {steps.filter(step => step.shouldExecute !== false).map((step) => (
                  <div key={step.id} className="flex items-start gap-3 py-0.5 group">
                    {getStatusIcon(step.status)}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {step.type === BuildStepType.RunScript ? 
                        <div className="space-y-2">
                            <p className="text-[0.8rem] text-blue-500">Execute Command</p>
                          <p className="text-[0.8rem] text-orange-300 py-2 pl-2 rounded-md text-wrap bg-neutral-800 transition-colors">
                            {step.description}
                          </p> 
                        </div> :
                        <div className="text-[0.8rem] text-gray-300 text-wrap group-hover:text-white transition-colors">
                          {step.title.startsWith("Create") ? (
                            <div className="space-x-1 flex flex-wrap items-center">
                              <span className="font-semibold text-white">Create</span>
                              <span className="bg-neutral-800 p-2 py-1 rounded-md">
                                {step.title
                                  .replace(/^Create\s*/, "")                  
                                  .replace(/^React Component\s*/, "")}        
                              </span>
                            </div>
                          ) : (
                            <div className="text-white">{step.title}</div>
                          )}
                        </div>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          <div ref={bottomRef} ></div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-blue-400 mt-4 p-3 bg-blue-900/20 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {imagePreviews.length > 0 && (
        <div className="border-t border-neutral-800 p-3 bg-neutral-950">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">
                Selected Images ({imagePreviews.length})
                {isProcessingImages && (
                  <span className="ml-2 text-xs text-blue-400">
                    Processing...
                  </span>
                )}
              </h4>
              <button
                type="button"
                onClick={removeAllImages}
                className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
              >
                Remove All
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div 
                    className="aspect-square rounded-md overflow-hidden bg-neutral-800 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImageModal(preview)}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous" 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-neutral-800 p-2 bg-neutral-950">
        <form onSubmit={handleFormSubmit} className="flex gap-2 relative">
          <TextArea
            id="description"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onEnterSubmit={handleSubmit}
            placeholder="Ask a follow up..."
            height="4rem"
            className="text-[1rem] pl-4 pt-2 pr-20" 
            maxHeight="16rem"
            required
          />

          <div className="absolute bottom-3 right-14 flex items-center justify-center">
            <label htmlFor="followupFileInput" className="cursor-pointer relative">
              <ImageIcon className={`w-5 h-5 transition-colors ${
                isProcessingImages 
                  ? 'text-blue-400 animate-pulse' 
                  : 'text-neutral-400 hover:text-neutral-300'
              }`} />
              {imagePreviews.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {imagePreviews.length}
                </span>
              )}
            </label>
            <input
              id="followupFileInput"
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
            disabled={!prompt.trim() || isProcessingFollowups || isProcessingImages}
            className={`px-2 py-2 rounded-lg absolute bottom-2 right-2 font-medium transition-all duration-200 flex items-center gap-2 ${
              prompt.trim() && !isProcessingFollowups && !isProcessingImages
                ? "bg-neutral-300 hover:bg-neutral-400 text-black"
                : "bg-neutral-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isProcessingFollowups ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ArrowUp className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        imageSrc={modalImageSrc}
        onClose={closeImageModal}
      />
    </div>
  )
}