'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Chat {
  id: string;
  message: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RightSidebarProps {
  isOpen: boolean;
  setIsOpenAction: (value: boolean) => void;
  onMouseLeaveAction: () => void;
}

export default function RightSidebar({
  isOpen,
  setIsOpenAction,
  onMouseLeaveAction,
}: RightSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchChats = async () => {
      try {
        const res = await fetch('/api/previous-projects');
        if (!res.ok) throw new Error('Failed to fetch chats');
        const data = await res.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpenAction(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpenAction]);

  return (
    <aside
      ref={sidebarRef}
      onMouseLeave={onMouseLeaveAction}
      className={clsx(
        'fixed top-0 right-0 h-full w-64 bg-black border-l border-neutral-800 text-white shadow-lg transform transition-transform duration-300 z-50',
        {
          'translate-x-0': isOpen,
          'translate-x-full': !isOpen,
        }
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-neutral-800">
        <h2 className="text-lg font-semibold">Recent Chats</h2>
        <button
          onClick={() => setIsOpenAction(false)}
          className="text-sm text-neutral-400 hover:text-white -translate-x-1"
        >
          <X />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto overflow-x-hidden h-[calc(100%-56px)]">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-6 bg-neutral-800 rounded animate-pulse"
            />
          ))
        ) : chats.length === 0 ? (
          <p className="text-neutral-500">No recent chats.</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              className="w-full truncate bg-neutral-900 rounded px-3 py-2 text-sm hover:bg-neutral-800 text-neutral-200 cursor-pointer text-left"
              title={chat.name}
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              {chat.name}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}