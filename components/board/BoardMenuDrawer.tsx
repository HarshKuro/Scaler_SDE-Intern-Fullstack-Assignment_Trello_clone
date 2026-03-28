'use client';

import { useState } from 'react';
import { X, Info, ImageIcon, Archive, ChevronLeft } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useBoardStore } from '@/stores/boardStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Board } from '@/types';

const BACKGROUND_OPTIONS = [
  { label: 'Ocean', value: 'linear-gradient(135deg, #0079bf 0%, #00c2e0 100%)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #519839 0%, #61bd4f 100%)' },
  { label: 'Berry', value: 'linear-gradient(135deg, #89609e 0%, #cd5a91 100%)' },
  { label: 'Sunset', value: 'linear-gradient(135deg, #d29034 0%, #e6c60d 100%)' },
  { label: 'Fire', value: 'linear-gradient(135deg, #b04632 0%, #eb5a46 100%)' },
  { label: 'Sky', value: 'linear-gradient(135deg, #0098b7 0%, #00aecc 100%)' },
  { label: 'Steel', value: 'linear-gradient(135deg, #838c91 0%, #a1bdd3 100%)' },
  { label: 'Plum', value: 'linear-gradient(135deg, #4c3b60 0%, #89609e 100%)' },
  { label: 'Blue', value: '#0079bf' },
  { label: 'Green', value: '#519839' },
  { label: 'Purple', value: '#89609e' },
  { label: 'Red', value: '#b04632' },
  { label: 'Orange', value: '#d29034' },
  { label: 'Teal', value: '#00aecc' },
];

interface BoardMenuDrawerProps {
  board: Board;
}

type MenuView = 'main' | 'background';

export default function BoardMenuDrawer({ board }: BoardMenuDrawerProps) {
  const { isMenuOpen, toggleMenu } = useUiStore();
  const { updateBoard } = useBoardStore();
  const [view, setView] = useState<MenuView>('main');

  if (!isMenuOpen) return null;

  const handleChangeBackground = async (bg: string) => {
    try {
      await updateBoard(board.id, { background: bg });
      toast.success('Background updated');
    } catch {
      toast.error('Failed to update background');
    }
  };

  const handleCloseBoard = async () => {
    if (!confirm('Are you sure you want to close this board?')) return;
    try {
      await updateBoard(board.id, { is_closed: true });
      toast.success('Board closed');
      window.location.href = '/';
    } catch {
      toast.error('Failed to close board');
    }
  };

  return (
    <div className="fixed right-0 top-[52px] bottom-0 w-[340px] bg-trello-surface border-l border-trello-border z-40 flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-trello-border">
        {view !== 'main' && (
          <button
            onClick={() => setView('main')}
            className="p-1 rounded hover:bg-trello-hover text-trello-text-subtle transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <h2 className="text-sm font-semibold text-trello-text flex-1 text-center">
          {view === 'main' ? 'Menu' : 'Change background'}
        </h2>
        <button
          onClick={toggleMenu}
          className="p-1 rounded hover:bg-trello-hover text-trello-text-subtle transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {view === 'main' ? (
          <div className="p-3 space-y-1">
            {/* About */}
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-trello-hover text-sm text-trello-text transition-colors text-left">
              <Info className="w-4 h-4 text-trello-text-subtle shrink-0" />
              <div>
                <p className="font-medium">About this board</p>
                <p className="text-xs text-trello-text-subtle mt-0.5">
                  Created {new Date(board.created_at).toLocaleDateString()}
                </p>
              </div>
            </button>

            {/* Change background */}
            <button
              onClick={() => setView('background')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-trello-hover text-sm text-trello-text transition-colors text-left"
            >
              <ImageIcon className="w-4 h-4 text-trello-text-subtle shrink-0" />
              <div className="flex items-center gap-2">
                <span className="font-medium">Change background</span>
                <div
                  className="w-5 h-5 rounded"
                  style={{
                    background: board.background.startsWith('linear-gradient')
                      ? board.background
                      : board.background,
                    backgroundColor: !board.background.startsWith('linear-gradient')
                      ? board.background
                      : undefined,
                  }}
                />
              </div>
            </button>

            <div className="border-t border-trello-border my-2" />

            {/* Close board */}
            <button
              onClick={handleCloseBoard}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-trello-text transition-colors text-left"
            >
              <Archive className="w-4 h-4 text-trello-text-subtle shrink-0" />
              <span className="font-medium">Close board</span>
            </button>
          </div>
        ) : (
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_OPTIONS.map((opt) => {
                const isGradient = opt.value.startsWith('linear-gradient');
                const style: React.CSSProperties = isGradient
                  ? { background: opt.value }
                  : { backgroundColor: opt.value };
                const isSelected = board.background === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() => handleChangeBackground(opt.value)}
                    className={cn(
                      'h-20 rounded-lg transition-all relative',
                      isSelected
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-trello-surface'
                        : 'hover:opacity-80'
                    )}
                    style={style}
                  >
                    <span className="absolute bottom-1 left-2 text-xs text-white font-medium drop-shadow">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
