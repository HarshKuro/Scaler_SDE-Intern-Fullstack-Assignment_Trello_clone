'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import toast from 'react-hot-toast';

interface AddListButtonProps {
  boardId: string;
  listsCount: number;
}

export default function AddListButton({ boardId, listsCount }: AddListButtonProps) {
  const { createList } = useListStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [adding]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    try {
      await createList({
        board_id: boardId,
        title: title.trim(),
        position: (listsCount + 1) * 65536,
      });
      setTitle('');
      inputRef.current?.focus();
    } catch {
      toast.error('Failed to create list');
    }
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="w-[272px] shrink-0 h-11 flex items-center gap-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white/80 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add another list
      </button>
    );
  }

  return (
    <div className="w-[272px] shrink-0 bg-trello-list rounded-xl p-2">
      <textarea
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === 'Escape') {
            setTitle('');
            setAdding(false);
          }
        }}
        placeholder="Enter list title..."
        rows={1}
        className="w-full text-sm bg-trello-card border-2 border-trello-blue rounded-lg px-3 py-2 text-trello-text placeholder-trello-muted outline-none resize-none"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 bg-trello-blue hover:bg-blue-600 text-sm text-white font-semibold rounded transition-colors"
        >
          Add list
        </button>
        <button
          onClick={() => {
            setTitle('');
            setAdding(false);
          }}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-trello-muted" />
        </button>
      </div>
    </div>
  );
}
