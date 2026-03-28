'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useBoardStore } from '@/stores/boardStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const BOARD_BACKGROUNDS = [
  { type: 'gradient' as const, value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)', label: 'Sunset' },
  { type: 'gradient' as const, value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple Haze' },
  { type: 'gradient' as const, value: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)', label: 'Ocean' },
  { type: 'gradient' as const, value: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)', label: 'Fire' },
  { type: 'color' as const, value: '#0079bf', label: 'Blue' },
  { type: 'color' as const, value: '#00aecc', label: 'Sky' },
  { type: 'color' as const, value: '#519839', label: 'Green' },
  { type: 'color' as const, value: '#d9b51c', label: 'Orange' },
  { type: 'color' as const, value: '#b04632', label: 'Red' },
  { type: 'color' as const, value: '#89609e', label: 'Purple' },
  { type: 'color' as const, value: '#cd5a91', label: 'Pink' },
  { type: 'color' as const, value: '#4d4d4d', label: 'Dark' },
];

export default function CreateBoardModal() {
  const router = useRouter();
  const { createBoard } = useBoardStore();
  const { isCreateBoardOpen, toggleCreateBoard } = useUiStore();
  const [title, setTitle] = useState('');
  const [selectedBg, setSelectedBg] = useState(BOARD_BACKGROUNDS[0]);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || creating) return;
    setCreating(true);
    try {
      const board = await createBoard({
        title: title.trim(),
        background: selectedBg.value,
      });
      toast.success('Board created!');
      setTitle('');
      toggleCreateBoard();
      router.push(`/board/${board.id}`);
    } catch {
      toast.error('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog.Root open={isCreateBoardOpen} onOpenChange={toggleCreateBoard}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[304px] bg-trello-bg-light rounded-lg shadow-xl z-50 p-0">
          <Dialog.Title className="sr-only">Create board</Dialog.Title>
          {/* Board preview */}
          <div
            className="h-28 rounded-t-lg p-3 flex items-start"
            style={{ background: selectedBg.value }}
          >
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 bg-white/20 rounded h-16" />
              ))}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Background selector */}
            <div>
              <label className="text-xs font-semibold text-trello-text-secondary mb-2 block">
                Background
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {BOARD_BACKGROUNDS.slice(0, 4).map((bg, i) => (
                  <button
                    key={i}
                    className={cn(
                      'h-10 rounded cursor-pointer transition-transform hover:scale-105',
                      selectedBg === bg && 'ring-2 ring-trello-blue ring-offset-1 ring-offset-trello-bg-light'
                    )}
                    style={{ background: bg.value }}
                    onClick={() => setSelectedBg(bg)}
                    type="button"
                  />
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                {BOARD_BACKGROUNDS.slice(4, 9).map((bg, i) => (
                  <button
                    key={i}
                    className={cn(
                      'h-8 rounded cursor-pointer transition-transform hover:scale-105',
                      selectedBg === bg && 'ring-2 ring-trello-blue ring-offset-1 ring-offset-trello-bg-light'
                    )}
                    style={{ background: bg.value }}
                    onClick={() => setSelectedBg(bg)}
                    type="button"
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-trello-text-secondary mb-1 block">
                Board title <span className="text-trello-red">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
                className="w-full h-9 px-3 rounded bg-trello-card border border-trello-border text-sm text-trello-text-bright outline-none focus:border-trello-blue transition-colors"
                autoFocus
              />
              {title.length === 0 && (
                <p className="text-xs text-trello-text-secondary mt-1">
                  👋 Board title is required
                </p>
              )}
            </div>

            {/* Create button */}
            <button
              onClick={handleCreate}
              disabled={!title.trim() || creating}
              className="w-full h-8 rounded bg-trello-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white font-medium transition-colors"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>

          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 p-1 rounded hover:bg-black/30 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { BOARD_BACKGROUNDS };
