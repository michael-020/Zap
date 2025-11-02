import React, { useEffect, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';

interface AutoResizingTextareaProps {
    description: string,
    setDescription: (description: string) => void,
    placeholder: string,
    onEnterSubmit: () => void,
    height: string,
    maxHeight: string,
    className?: string
    onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
}

const AutoResizingTextarea = ({
  description, 
  placeholder, 
  setDescription, 
  onEnterSubmit, 
  height, 
  maxHeight, 
  className,
  onPaste
}: AutoResizingTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [description]); 

  useEffect(() => {
    if(textareaRef.current){
        textareaRef.current.focus()
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
      onEnterSubmit(); 
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={description}
      onChange={handleChange}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onPaste={onPaste}
      className={`${className} w-full px-6 py-4 bg-neutral-50 dark:bg-[#101010] backdrop-blur-sm border-0 border-b-0 border-neutral-400 dark:border-neutral-800 rounded-t-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-b-1 focus:ring-neutral-500/60 focus:border-neutral-500/60 resize-none transition-all duration-200 text-lg leading-relaxed scrollbar-hidden`}
      style={{
        minHeight: height ?? "150px",
        maxHeight: maxHeight ?? "200px",
        width: '100%',
        boxSizing: 'border-box', 
      }}
    />
  );
};

export default AutoResizingTextarea;