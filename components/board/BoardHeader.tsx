'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, Filter, MoreHorizontal, Share2, ChevronDown, Compass } from 'lucide-react';
import { useBoardStore } from '@/stores/boardStore';
import { useUiStore } from '@/stores/uiStore';
import { useFilterStore } from '@/stores/filterStore';
import { useGuidedTour } from '@/components/tour/GuidedTour';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Board, Member } from '@/types';

interface BoardHeaderProps {
  board: Board;
  members: Member[];
}

export default function BoardHeader({ board, members }: BoardHeaderProps) {
  const { updateBoard } = useBoardStore();
  const { toggleFilter, toggleMenu } = useUiStore();
  const { isActive: filterActive } = useFilterStore();
  const { startBoardTour } = useGuidedTour();
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [prevBoardTitle, setPrevBoardTitle] = useState(board.title);
  const inputRef = useRef<HTMLInputElement>(null);
  if (board.title !== prevBoardTitle) {
    setPrevBoardTitle(board.title);
    if (!editingTitle) {
      setTitle(board.title);
    }
  }

  useEffect(() => {
    if (editingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTitle]);

  const handleSaveTitle = async () => {
    setEditingTitle(false);
    if (title.trim() && title.trim() !== board.title) {
      try {
        await updateBoard(board.id, { title: title.trim() });
      } catch {
        setTitle(board.title);
        toast.error('Failed to update title');
      }
    } else {
      setTitle(board.title);
    }
  };

  const handleStar = async () => {
    try {
      await updateBoard(board.id, { is_starred: !board.is_starred });
    } catch {
      toast.error('Failed to update board');
    }
  };

  return (
    <div data-tour="board-header" className="h-[52px] bg-black/30 backdrop-blur-sm flex items-center px-4 gap-2 shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {editingTitle ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setTitle(board.title);
                setEditingTitle(false);
              }
            }}
            className="text-lg font-bold bg-white/20 rounded px-2 py-0.5 text-white outline-none w-auto min-w-[120px]"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-lg font-bold text-white hover:bg-white/20 rounded px-2 py-0.5 transition-colors truncate"
          >
            {board.title}
          </button>
        )}

        <button
          onClick={handleStar}
          data-tour="board-star"
          className="p-1.5 rounded hover:bg-white/20 transition-colors shrink-0"
        >
          <Star
            className={cn(
              'w-4 h-4',
              board.is_starred
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-white/70'
            )}
          />
        </button>

        <div className="hidden md:flex items-center">
          <button className="flex items-center gap-1 h-8 px-3 rounded bg-white/10 hover:bg-white/20 text-sm text-white transition-colors">
            <span>Board</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Member avatars */}
        <div className="hidden sm:flex items-center -space-x-1">
          {members.slice(0, 5).map((member) => (
            <Avatar
              key={member.id}
              initials={member.initials}
              color={member.avatar_color}
              size="sm"
              className="border-2 border-transparent"
            />
          ))}
          {members.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white font-bold">
              +{members.length - 5}
            </div>
          )}
        </div>

        <button
          onClick={toggleFilter}
          data-tour="board-filter"
          className={cn(
            'flex items-center gap-1.5 h-8 px-3 rounded text-sm text-white transition-colors',
            filterActive
              ? 'bg-trello-blue hover:bg-blue-600'
              : 'bg-white/10 hover:bg-white/20'
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>

        <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded bg-white/10 hover:bg-white/20 text-sm text-white transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>

        <button
          onClick={toggleMenu}
          data-tour="board-menu"
          className="p-1.5 rounded hover:bg-white/20 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={startBoardTour}
          className="p-1.5 rounded hover:bg-white/20 transition-colors"
          title="Start guided tour"
          data-tour="tour-btn"
        >
          <Compass className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
