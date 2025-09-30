/* eslint-disable @next/next/no-img-element */
import { X } from "lucide-react"
import { createPortal } from "react-dom"

interface ImageModalProps {
  isOpen: boolean
  imageSrc: string
  onClose: () => void
}

export function ImageModal({ isOpen, imageSrc, onClose }: ImageModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-neutral-800/95 backdrop-blur-[1.5px] md:p-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative overflow-y-auto custom-scrollbar w-[90vw] h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <img
          src={imageSrc}
          alt="Full size image"
          className="object-contain"
          onClick={(e) => e.stopPropagation()}
          crossOrigin="anonymous"
        />
      </div>
    </div>,
    document.body 
  );
}