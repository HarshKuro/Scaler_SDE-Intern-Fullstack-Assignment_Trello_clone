'use client';

import BoardCard from './BoardCard';
import { useUiStore } from '@/stores/uiStore';
import { Plus } from 'lucide-react';
import type { Board } from '@/types';

interface BoardListProps {
  boards: Board[];
  title: string;
}

export default function BoardList({ boards, title }: BoardListProps) {
  const { toggleCreateBoard } = useUiStore();

  return (
    <div>
      <h3 className="text-sm font-semibold text-trello-text-bright mb-3">{title}</h3>
      <div data-tour="board-list" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
        <button
          onClick={toggleCreateBoard}
          className="flex items-center justify-center gap-1 h-24 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-trello-border text-sm text-trello-text-secondary transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create new board
        </button>
      </div>
    </div>
  );
}
