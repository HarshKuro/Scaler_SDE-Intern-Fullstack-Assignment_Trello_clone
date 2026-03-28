'use client';

import { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import * as Checkbox from '@radix-ui/react-checkbox';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { Checklist, ChecklistItem } from '@/types';

interface CardChecklistProps {
  cardId: string;
  checklists: Checklist[];
  onUpdate: () => void;
  addOnly?: boolean;
}

export default function CardChecklist({ cardId, checklists, onUpdate, addOnly }: CardChecklistProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('Checklist');
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState('');

  const handleCreateChecklist = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post(`/checklists/cards/${cardId}/checklists`, {
        title: newTitle.trim(),
      });
      setNewTitle('Checklist');
      setAdding(false);
      onUpdate();
    } catch {
      toast.error('Failed to create checklist');
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      await api.delete(`/checklists/checklists/${checklistId}`);
      onUpdate();
    } catch {
      toast.error('Failed to delete checklist');
    }
  };

  const handleAddItem = async (checklistId: string) => {
    if (!itemTitle.trim()) return;
    try {
      await api.post(`/checklists/checklists/${checklistId}/items`, {
        title: itemTitle.trim(),
      });
      setItemTitle('');
      onUpdate();
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    try {
      await api.patch(`/checklists/checklist-items/${item.id}`, {
        is_checked: !item.is_checked,
      });
      onUpdate();
    } catch {
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.delete(`/checklists/checklist-items/${itemId}`);
      onUpdate();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  // Sidebar add-only button
  if (addOnly) {
    return (
      <>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm text-trello-muted transition-colors"
        >
          <CheckSquare className="w-4 h-4" />
          Checklist
        </button>
        {adding && (
          <div className="space-y-2 mt-1">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full text-sm bg-trello-card border border-trello-border rounded px-3 py-1.5 text-trello-text outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateChecklist();
                if (e.key === 'Escape') setAdding(false);
              }}
            />
            <div className="flex gap-1">
              <button
                onClick={handleCreateChecklist}
                className="px-3 py-1 bg-trello-blue hover:bg-blue-600 text-sm text-white font-semibold rounded transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setAdding(false)}
                className="px-2 py-1 hover:bg-white/10 text-sm text-trello-muted rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {checklists.map((checklist) => {
        const items = checklist.items ?? [];
        const done = items.filter((i) => i.is_checked).length;
        const total = items.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <div key={checklist.id}>
            <div className="flex items-center gap-3 mb-2">
              <CheckSquare className="w-5 h-5 text-trello-muted shrink-0" />
              <h3 className="text-base font-semibold text-trello-text flex-1">
                {checklist.title}
              </h3>
              <button
                onClick={() => handleDeleteChecklist(checklist.id)}
                className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-trello-muted rounded transition-colors"
              >
                Delete
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 pl-8 mb-2">
              <span className="text-[11px] text-trello-muted w-7 text-right">{pct}%</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    pct === 100 ? 'bg-green-500' : 'bg-trello-blue'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="pl-8 space-y-0.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 group py-1 px-2 rounded hover:bg-white/5"
                >
                  <Checkbox.Root
                    checked={item.is_checked}
                    onCheckedChange={() => handleToggleItem(item)}
                    className="w-4 h-4 rounded border border-trello-muted flex items-center justify-center data-[state=checked]:bg-trello-blue data-[state=checked]:border-trello-blue shrink-0"
                  >
                    <Checkbox.Indicator>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span
                    className={cn(
                      'text-sm flex-1',
                      item.is_checked
                        ? 'text-trello-muted line-through'
                        : 'text-trello-text'
                    )}
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-trello-muted" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add item */}
            {addingItem === checklist.id ? (
              <div className="pl-8 mt-2">
                <textarea
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  autoFocus
                  rows={2}
                  placeholder="Add an item"
                  className="w-full text-sm bg-trello-card border border-trello-border rounded px-3 py-1.5 text-trello-text placeholder-trello-muted outline-none resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddItem(checklist.id);
                    }
                    if (e.key === 'Escape') {
                      setItemTitle('');
                      setAddingItem(null);
                    }
                  }}
                />
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleAddItem(checklist.id)}
                    className="px-3 py-1 bg-trello-blue hover:bg-blue-600 text-sm text-white font-semibold rounded transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setItemTitle('');
                      setAddingItem(null);
                    }}
                    className="px-2 py-1 hover:bg-white/10 text-sm text-trello-muted rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingItem(checklist.id)}
                className="ml-8 mt-1 flex items-center gap-1 px-3 py-1 text-sm text-trello-muted hover:bg-white/10 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add an item
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
