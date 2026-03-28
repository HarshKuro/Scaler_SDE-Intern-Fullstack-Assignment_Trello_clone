'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import * as Popover from '@radix-ui/react-popover';
import toast from 'react-hot-toast';

interface ListHeaderProps {
  listId: string;
  title: string;
  cardCount: number;
}

export default function ListHeader({ listId, title, cardCount }: ListHeaderProps) {
  const { updateList, deleteList } = useListStore();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = async () => {
    setEditing(false);
    if (value.trim() && value.trim() !== title) {
      try {
        await updateList(listId, { title: value.trim() });
      } catch {
        setValue(title);
        toast.error('Failed to update list');
      }
    } else {
      setValue(title);
    }
  };

  const handleDelete = async () => {
    if (cardCount > 0) {
      const ok = confirm(`Delete "${title}" and its ${cardCount} card(s)?`);
      if (!ok) return;
    }
    try {
      await deleteList(listId);
      toast.success('List deleted');
    } catch {
      toast.error('Failed to delete list');
    }
  };

  return (
    <div className="flex items-start justify-between gap-1 px-2 pt-2 pb-1">
      {editing ? (
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
            if (e.key === 'Escape') {
              setValue(title);
              setEditing(false);
            }
          }}
          rows={1}
          className="flex-1 text-sm font-semibold text-trello-text bg-trello-card border-2 border-trello-blue rounded px-1.5 py-1 resize-none outline-none overflow-hidden"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex-1 text-left text-sm font-semibold text-trello-text px-1.5 py-1 rounded cursor-pointer hover:bg-white/10 transition-colors"
        >
          {title}
        </button>
      )}

      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0">
            <MoreHorizontal className="w-4 h-4 text-trello-muted" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="w-[304px] bg-trello-surface rounded-lg shadow-xl border border-trello-border z-50"
            sideOffset={4}
            align="start"
          >
            <div className="flex items-center justify-between p-3 border-b border-trello-border">
              <span className="text-sm font-semibold text-trello-text">List actions</span>
              <Popover.Close asChild>
                <button className="p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4 text-trello-muted" />
                </button>
              </Popover.Close>
            </div>
            <div className="p-2">
              <button
                onClick={handleDelete}
                className="w-full text-left text-sm text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors"
              >
                Delete this list
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
