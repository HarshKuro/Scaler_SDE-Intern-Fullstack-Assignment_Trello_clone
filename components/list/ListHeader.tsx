'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, X, Archive, Trash2, ChevronsLeft, ChevronsRight, Palette } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const LIST_COLORS = [
  null, // no color / default
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#78716c',
];

interface ListHeaderProps {
  listId: string;
  title: string;
  cardCount: number;
  collapsed?: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
}

export default function ListHeader({ listId, title, cardCount, collapsed, onCollapse, onExpand }: ListHeaderProps) {
  const { updateList, deleteList } = useListStore();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [menuView, setMenuView] = useState<'main' | 'color'>('main');
  const [listColor, setListColor] = useState<string | null>(null);
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

  const handleArchive = async () => {
    try {
      await updateList(listId, { is_archived: true });
      toast.success(`"${title}" archived`);
    } catch {
      toast.error('Failed to archive list');
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

  const handleColorChange = (color: string | null) => {
    setListColor(color);
    setMenuView('main');
  };

  // Collapsed state: show title, expand button, and menu
  if (collapsed) {
    return (
      <div className="px-2 pt-2 pb-1">
        {/* Color bar */}
        {listColor && (
          <div className="h-1.5 -mx-2 -mt-2 rounded-t-xl mb-1.5" style={{ backgroundColor: listColor }} />
        )}
        <div className="flex items-center justify-between gap-1">
          <span className="flex-1 text-sm font-semibold text-trello-text px-1.5 py-1 truncate">
            {title}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onExpand?.(); }}
            className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
            title="Expand list"
          >
            <ChevronsRight className="w-4 h-4 text-trello-muted" />
          </button>
          <Popover.Root onOpenChange={() => setMenuView('main')}>
            <Popover.Trigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
              >
                <MoreHorizontal className="w-4 h-4 text-trello-muted" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="w-[304px] bg-trello-surface rounded-lg shadow-xl border border-trello-border z-50"
                sideOffset={4}
                align="start"
              >
                {renderMenuContent()}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    );
  }

  function renderMenuContent() {
    if (menuView === 'color') {
      return (
        <>
          <div className="flex items-center justify-between p-3 border-b border-trello-border">
            <button
              onClick={() => setMenuView('main')}
              className="p-1 rounded hover:bg-white/10 text-trello-muted text-xs"
            >
              ← Back
            </button>
            <span className="text-sm font-semibold text-trello-text">List color</span>
            <Popover.Close asChild>
              <button className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-trello-muted" />
              </button>
            </Popover.Close>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-5 gap-2">
              {LIST_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => handleColorChange(color)}
                  className={cn(
                    'w-full aspect-square rounded-md border-2 transition-all hover:scale-110',
                    color === listColor
                      ? 'border-white ring-2 ring-trello-blue'
                      : 'border-transparent',
                    !color && 'bg-trello-list'
                  )}
                  style={color ? { backgroundColor: color } : undefined}
                  title={color ?? 'No color'}
                >
                  {!color && (
                    <span className="text-xs text-trello-text-subtle">∅</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-trello-text-subtle mt-2 text-center">
              Color appears as a bar at the top of the list
            </p>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between p-3 border-b border-trello-border">
          <span className="text-sm font-semibold text-trello-text">List actions</span>
          <Popover.Close asChild>
            <button className="p-1 rounded hover:bg-white/10">
              <X className="w-4 h-4 text-trello-muted" />
            </button>
          </Popover.Close>
        </div>
        <div className="p-2 space-y-0.5">
          {onCollapse && (
            <Popover.Close asChild>
              <button
                onClick={onCollapse}
                className="w-full text-left text-sm text-trello-text hover:bg-white/10 px-3 py-1.5 rounded transition-colors flex items-center gap-2"
              >
                <ChevronsLeft className="w-4 h-4" />
                Collapse list
              </button>
            </Popover.Close>
          )}
          <button
            onClick={() => setMenuView('color')}
            className="w-full text-left text-sm text-trello-text hover:bg-white/10 px-3 py-1.5 rounded transition-colors flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Change color
          </button>
          <Popover.Close asChild>
            <button
              onClick={handleArchive}
              className="w-full text-left text-sm text-trello-text hover:bg-white/10 px-3 py-1.5 rounded transition-colors flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archive this list
            </button>
          </Popover.Close>
          <hr className="border-trello-border my-1" />
          <Popover.Close asChild>
            <button
              onClick={handleDelete}
              className="w-full text-left text-sm text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete this list
            </button>
          </Popover.Close>
        </div>
      </>
    );
  }

  return (
    <div>
      {/* Color bar */}
      {listColor && (
        <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: listColor }} />
      )}
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

        {/* Collapse button inline */}
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
            title="Collapse list"
          >
            <ChevronsLeft className="w-4 h-4 text-trello-muted" />
          </button>
        )}

        <Popover.Root onOpenChange={() => setMenuView('main')}>
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
              {renderMenuContent()}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}
