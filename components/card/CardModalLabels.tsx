'use client';

import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Tag, X, Check, Plus } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Label } from '@/types';

interface CardModalLabelsProps {
  cardId: string;
  boardId: string;
  currentLabels: Label[];
  onUpdate: () => void;
}

const LABEL_COLORS = [
  '#4bce97', '#f5cd47', '#fea362', '#f87168', '#9f8fef',
  '#579dff', '#6cc3e0', '#94c748', '#e774bb', '#8590a2',
];

export default function CardModalLabels({ cardId, boardId, currentLabels, onUpdate }: CardModalLabelsProps) {
  const [boardLabels, setBoardLabels] = useState<Label[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(LABEL_COLORS[0]);

  useEffect(() => {
    if (!boardId) return;
    api.get(`/boards/${boardId}/labels`).then((res) => {
      setBoardLabels(res.data.data ?? res.data);
    }).catch(() => { /* silent */ });
  }, [boardId]);

  const isActive = (id: string) => currentLabels.some((l) => l.id === id);

  const toggleLabel = async (labelId: string) => {
    try {
      if (isActive(labelId)) {
        await api.delete(`/cards/${cardId}/labels/${labelId}`);
      } else {
        await api.post(`/cards/${cardId}/labels/${labelId}`);
      }
      onUpdate();
    } catch {
      toast.error('Failed to update labels');
    }
  };

  const createLabel = async () => {
    if (!newName.trim()) return;
    try {
      const res = await api.post(`/boards/${boardId}/labels`, {
        name: newName.trim(),
        color: newColor,
      });
      const label = res.data.data ?? res.data;
      setBoardLabels((prev) => [...prev, label]);
      setNewName('');
      setCreating(false);
    } catch {
      toast.error('Failed to create label');
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm text-trello-muted transition-colors">
          <Tag className="w-4 h-4" />
          Labels
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-[304px] bg-trello-surface rounded-lg shadow-xl border border-trello-border z-[60]"
          sideOffset={4}
          align="start"
        >
          <div className="flex items-center justify-between p-3 border-b border-trello-border">
            <span className="text-sm font-semibold text-trello-text">Labels</span>
            <Popover.Close asChild>
              <button className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-trello-muted" />
              </button>
            </Popover.Close>
          </div>

          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
            {boardLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => toggleLabel(label.id)}
                className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-white/10 transition-colors"
              >
                <div
                  className="flex-1 h-8 rounded flex items-center px-3"
                  style={{ backgroundColor: label.color }}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-sm">
                    {label.name}
                  </span>
                </div>
                {isActive(label.id) && (
                  <Check className="w-4 h-4 text-trello-blue shrink-0" />
                )}
              </button>
            ))}

            {creating ? (
              <div className="pt-2 space-y-2 border-t border-trello-border mt-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Label name"
                  autoFocus
                  className="w-full text-sm bg-trello-card border border-trello-border rounded px-3 py-1.5 text-trello-text placeholder-trello-muted outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createLabel();
                    if (e.key === 'Escape') setCreating(false);
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className="w-8 h-8 rounded"
                      style={{
                        backgroundColor: color,
                        outline: newColor === color ? '2px solid white' : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={createLabel}
                  className="px-3 py-1 bg-trello-blue hover:bg-blue-600 text-sm text-white font-semibold rounded transition-colors"
                >
                  Create
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-trello-muted hover:bg-white/10 rounded transition-colors mt-1"
              >
                <Plus className="w-4 h-4" />
                Create a new label
              </button>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
