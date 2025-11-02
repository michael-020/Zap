/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useRef, forwardRef } from 'react'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  height?: string | number
  maxHeight?: string | number
  onEnterSubmit?: () => void
  className?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ height = '2.5rem', maxHeight = '12rem', onEnterSubmit, className = '', ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const combinedRef = (ref as React.MutableRefObject<HTMLTextAreaElement>) || textareaRef

    const getPixelValue = (value: string | number): number => {
      if (typeof value === 'number') return value
      if (value.includes('rem')) return parseFloat(value) * 16
      if (value.includes('px')) return parseFloat(value)
      return parseFloat(value) * 16
    }

    const minHeight = getPixelValue(height)
    const maxHeightPx = getPixelValue(maxHeight)

    const adjustHeight = () => {
      const textarea = combinedRef.current
      if (!textarea) return

      textarea.style.height = `${minHeight}px`

      const scrollHeight = textarea.scrollHeight
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeightPx)

      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = scrollHeight > maxHeightPx ? 'auto' : 'hidden'
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onEnterSubmit?.()
      }

      props.onKeyDown?.(e)
    }

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight()
      props.onInput?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight()
      props.onChange?.(e)
    }

    useEffect(() => {
      adjustHeight()
    }, [props.value])

    useEffect(() => {
      if (combinedRef.current) {
        combinedRef.current.style.height = `${minHeight}px`
        combinedRef.current.style.minHeight = `${minHeight}px`
        combinedRef.current.style.maxHeight = `${maxHeightPx}px`
      }
    }, [minHeight, maxHeightPx])

    const defaultClassName = "w-full px-6 py-4 bg-neutral-100 backdrop-blur-sm border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500/60 focus:border-neutral-500/60 resize-none transition-all duration-200 text-lg leading-relaxed custom-scrollbar"

    return (
      <textarea
        {...props}
        ref={combinedRef}
        className={`${defaultClassName} ${className}`}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onChange={handleChange}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeightPx}px`,
          overflowY: 'hidden',
          ...props.style
        }}
      />
    )
  }
)

TextArea.displayName = 'TextArea'
