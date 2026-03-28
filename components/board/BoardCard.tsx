'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Board } from '@/types';
import { useBoardStore } from '@/stores/boardStore';
import toast from 'react-hot-toast';

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  const { updateBoard } = useBoardStore();

  const handleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateBoard(board.id, { is_starred: !board.is_starred });
    } catch {
      toast.error('Failed to update board');
    }
  };

  return (
    <Link
      href={`/board/${board.id}`}
      className="group relative block rounded-lg overflow-hidden h-24 transition-opacity hover:opacity-90"
      style={{
        background:
          board.background,
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative h-full p-2 flex flex-col justify-between">
        <span className="text-white font-bold text-sm leading-tight">{board.title}</span>
        <button
          onClick={handleStar}
          className={cn(
            'absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5',
            board.is_starred && 'opacity-100'
          )}
        >
          <Star
            className={cn(
              'w-4 h-4 transition-colors',
              board.is_starred
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-white/70 hover:text-white'
            )}
          />
        </button>
      </div>
    </Link>
  );
}
