'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useCardStore } from '@/stores/cardStore';
import toast from 'react-hot-toast';

interface AddCardButtonProps {
  listId: string;
  cardCount: number;
}

export default function AddCardButton({ listId, cardCount }: AddCardButtonProps) {
  const { createCard } = useCardStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (adding && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [adding]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    try {
      await createCard({
        list_id: listId,
        title: title.trim(),
        position: (cardCount + 1) * 65536,
      });
      setTitle('');
      textareaRef.current?.focus();
    } catch {
      toast.error('Failed to create card');
    }
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        data-tour="add-card"
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-trello-muted hover:bg-white/10 hover:text-trello-text transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add a card
      </button>
    );
  }

  return (
    <div className="px-1">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === 'Escape') {
            setTitle('');
            setAdding(false);
          }
        }}
        placeholder="Enter a title for this card..."
        rows={3}
        className="w-full text-sm bg-trello-card rounded-lg px-3 py-2 text-trello-text placeholder-trello-muted outline-none resize-none shadow-md border border-trello-border"
      />
      <div className="flex items-center gap-2 mt-1.5">
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 bg-trello-blue hover:bg-blue-600 text-sm text-white font-semibold rounded transition-colors"
        >
          Add card
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
