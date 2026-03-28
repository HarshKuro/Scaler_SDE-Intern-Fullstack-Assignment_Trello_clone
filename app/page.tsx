'use client';

import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import BoardList from '@/components/board/BoardList';
import CreateBoardModal from '@/components/board/CreateBoardModal';
import { useBoardStore } from '@/stores/boardStore';

export default function Home() {
  const { boards, loading, fetchBoards } = useBoardStore();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const starredBoards = boards.filter((b) => b.is_starred);

  return (
    <div className="flex flex-col h-screen bg-trello-bg">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="hidden lg:flex" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {loading ? (
            <div className="space-y-8">
              <div>
                <div className="h-4 w-32 bg-white/5 rounded mb-3 animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8">
              {starredBoards.length > 0 && (
                <BoardList boards={starredBoards} title="⭐ Starred boards" />
              )}
              <BoardList boards={boards} title="YOUR WORKSPACES" />
            </div>
          )}
        </main>
      </div>
      <CreateBoardModal />
    </div>
  );
}
