'use client';

import { LayoutGrid, X } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useCardStore } from '@/stores/cardStore';
import toast from 'react-hot-toast';

const COVER_COLORS = [
  '#4bce97', '#f5cd47', '#fea362', '#f87168', '#9f8fef',
  '#579dff', '#6cc3e0', '#94c748', '#e774bb', '#8590a2',
];

interface CardCoverProps {
  cardId: string;
  currentColor?: string | null;
  onUpdate: () => void;
}

export default function CardCover({ cardId, currentColor, onUpdate }: CardCoverProps) {
  const { updateCard } = useCardStore();

  const handleSelect = async (color: string | null) => {
    try {
      await updateCard(cardId, { cover_color: color });
      onUpdate();
    } catch {
      toast.error('Failed to update cover');
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 w-full px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm text-trello-muted transition-colors">
          <LayoutGrid className="w-4 h-4" />
          Cover
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-[304px] bg-trello-surface rounded-lg shadow-xl border border-trello-border z-[60] p-4"
          sideOffset={4}
          align="start"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-trello-text">Cover</span>
            <Popover.Close asChild>
              <button className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-trello-muted" />
              </button>
            </Popover.Close>
          </div>

          <p className="text-xs text-trello-muted mb-2">Colors</p>
          <div className="grid grid-cols-5 gap-2">
            {COVER_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleSelect(color)}
                className="h-8 rounded transition-all hover:ring-2 hover:ring-white/50"
                style={{
                  backgroundColor: color,
                  outline: currentColor === color ? '2px solid white' : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>

          {currentColor && (
            <button
              onClick={() => handleSelect(null)}
              className="w-full mt-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-sm text-trello-muted rounded transition-colors"
            >
              Remove cover
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
