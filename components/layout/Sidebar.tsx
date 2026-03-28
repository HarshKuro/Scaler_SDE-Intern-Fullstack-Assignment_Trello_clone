'use client';

import Link from 'next/link';
import { LayoutDashboard, Columns3, Heart } from 'lucide-react';
import { useBoardStore } from '@/stores/boardStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { boards } = useBoardStore();
  const starredBoards = boards.filter((b) => b.is_starred);

  return (
    <aside
      className={cn(
        'w-64 bg-trello-sidebar border-r border-trello-border flex flex-col py-3 shrink-0 overflow-y-auto',
        className
      )}
    >
      <nav className="px-3 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-white/10 text-sm text-trello-text-bright transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Boards
        </Link>
        <button className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-white/10 text-sm text-trello-text w-full text-left transition-colors">
          <Columns3 className="w-4 h-4" />
          Templates
        </button>
        <button className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-white/10 text-sm text-trello-text w-full text-left transition-colors">
          <Heart className="w-4 h-4" />
          Home
        </button>
      </nav>

      <div className="mt-6 px-3">
        <div className="flex items-center justify-between px-3 mb-1">
          <span className="text-xs font-semibold text-trello-text-secondary uppercase tracking-wider">
            Your Workspaces
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded bg-white/5 text-sm text-trello-text-bright font-medium">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
              K
            </div>
            KanFlow Workspace
          </div>

          <div className="ml-6 space-y-0.5 mt-1">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white/10 text-sm text-trello-text transition-colors group"
              >
                <div
                  className="w-5 h-4 rounded-sm shrink-0"
                  style={{ background: board.background }}
                />
                <span className="truncate">{board.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {starredBoards.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 px-3 mb-1">
              <Star className="w-3 h-3 text-trello-text-secondary" />
              <span className="text-xs font-semibold text-trello-text-secondary uppercase tracking-wider">
                Starred
              </span>
            </div>
            <div className="space-y-0.5">
              {starredBoards.map((board) => (
                <Link
                  key={board.id}
                  href={`/board/${board.id}`}
                  className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white/10 text-sm text-trello-text transition-colors"
                >
                  <div
                    className="w-5 h-4 rounded-sm shrink-0"
                    style={{ background: board.background }}
                  />
                  <span className="truncate">{board.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
