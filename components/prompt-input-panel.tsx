/* eslint-disable @next/next/no-img-element */
"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"
import { ArrowUp, CircleQuestionMark, LoaderPinwheel, Plus, X } from 'lucide-react'
import toast from "react-hot-toast"
import { ImageModal } from "./image-modal"
import AutoResizingTextarea from "./textarea"
import { UsageLimitModal } from "./usage-limit-modal"

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

interface PromptInputPanelProps {
  description: string;
  setDescription: (value: string) => void;
  onSubmit: (description: string, files: File[]) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  placeholder?: string;
  usageInfo?: {
    remaining: number;
    limitReached: boolean;
  };
  textareaHeight?: string;
  textareaMaxHeight?: string;
  textareaClassName?: string
  maxImages?: number;
  submitButtonSize?: string,
  imageSelectorSize?: string,
  isPremium: boolean
}

export function PromptInputPanel({
  description,
  setDescription,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  placeholder = "Describe the website you want to build...",
  usageInfo,
  textareaHeight = "6rem",
  textareaMaxHeight = "16rem",
  maxImages = 10,
  textareaClassName,
  submitButtonSize,
  imageSelectorSize,
  isPremium
}: PromptInputPanelProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [webpFiles, setWebpFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState("")
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const [isDragging, setIsDragging] = useState(false) 
  const [showLimitModal, setShowLimitModal] = useState(false)

  const openImageModal = (imageSrc: string) => {
    setModalImageSrc(imageSrc)
    setIsModalOpen(true)
  }

  const closeImageModal = () => {
    setIsModalOpen(false)
    setModalImageSrc("")
  }

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;

    const invalidFiles = fileArray.filter(file => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    if (imagePreviews.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsProcessingImages(true);

    try {
      const newPreviews: string[] = [];
      const newWebpFiles: File[] = [];

      for (const file of fileArray) {
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
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = event.clipboardData.files;
    
    if (files.length > 0) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length > 0) {
        event.preventDefault(); 
        await processFiles(imageFiles);
      }
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (!isPremium && usageInfo?.limitReached) {
      setShowLimitModal(true)
      return
    }
    if (!description.trim() && imagePreviews.length === 0) return;
    onSubmit(description, webpFiles);
  };

  const isDisabled = disabled || 
    isSubmitting || 
    isProcessingImages || 
    (!description.trim() && imagePreviews.length === 0) ||
    (usageInfo?.limitReached ?? false);

  return (
    <>
    <div className="space-y-4">
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
                <button 
                  type="button"
                  onClick={() => openImageModal(preview)} 
                  className="aspect-square size-20 rounded-sm overflow-hidden bg-neutral-800"
                >
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
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 rounded-2xl blur group-hover:opacity-100 transition-opacity duration-300 p-1.5"></div>
        
        <div 
          className="relative flex-col bg-neutral-900 backdrop-blur-sm border border-neutral-700 rounded-xl"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/80 rounded-xl border-2 border-dashed border-blue-500">
              <p className="text-white text-lg font-semibold">Drop images here</p>
            </div>
          )}
          
          <div>
            <AutoResizingTextarea 
              description={description} 
              setDescription={setDescription} 
              onEnterSubmit={handleSubmit}
              onPaste={handlePaste}
              height={textareaHeight}
              maxHeight={textareaMaxHeight}
              placeholder={placeholder} 
              className={textareaClassName}
            />
          </div>

          <div className=" flex items-center justify-between px-4">
            
            <div className="relative">
              <button
                type="button"
                onClick={handleFileUploadClick}
                className="cursor-pointer relative"
                aria-label="Add attachment"
                title="Upload Images"
                disabled={isProcessingImages || disabled}
              >
                <Plus className={`${imageSelectorSize ? `size-${imageSelectorSize}` : "size-6"} transition-colors ${
                  isProcessingImages 
                  ? 'text-blue-400 animate-pulse' 
                  : 'text-neutral-500 hover:text-neutral-300'
                }`} />
              </button>
            </div>
            
            <input
              id="fileInput"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={isProcessingImages || disabled}
            />
            
            <div className={` ${submitButtonSize ? "bottom-2 right-0.5": "bottom-4 right-4" } pt-0 p-3 pr-0 flex items-center justify-center gap-2`}>
            {!isPremium && usageInfo && (
              <div className="flex gap-1 items-center justify-center">
                <button 
                  title={usageInfo.limitReached
                    ? 'You have reached your daily limit.'
                    : `Chats left today: ${usageInfo.remaining}`}
                    className="text-sm text-neutral-400"
                    >
                  {usageInfo.limitReached
                    ? 'You have reached your daily limit.'
                    : `${usageInfo.remaining}/5`}
                </button>
                <button
                  title={usageInfo.limitReached
                    ? 'You have reached your daily limit.'
                    : `Chats left today: ${usageInfo.remaining}`}
                >
                  <CircleQuestionMark className={`text-neutral-500 size-3.5`} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isDisabled}
              className={`${ submitButtonSize ? "p-1 rounded-lg" : "p-2 rounded-xl" }  font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                isDisabled
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-300 hover:bg-neutral-400 text-black shadow-lg'
              }`}
            >
              {!isSubmitting ? (
                <ArrowUp className={`${submitButtonSize ? `size-${submitButtonSize}` : "size-4"}`} />
              ) : (
                <LoaderPinwheel className="animate-spin w-5 h-5" />
              )}
            </button>
          </div>
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        imageSrc={modalImageSrc}
        onClose={closeImageModal}
      />
    </div>

    <UsageLimitModal 
      isOpen={showLimitModal}
      onClose={() => setShowLimitModal(false)}
    />
    </>
  )
}