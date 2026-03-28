'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Plus, Star, Clock, Bell, Compass, ChevronDown, X } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import SearchBar from '@/components/ui/SearchBar';
import { useBoardStore } from '@/stores/boardStore';
import { useMemberStore } from '@/stores/memberStore';
import { useUiStore } from '@/stores/uiStore';
import { useGuidedTour } from '@/components/tour/GuidedTour';

/* ─── Dropdown wrapper ─── */
function NavDropdown({
  trigger,
  children,
  isOpen,
  onToggle,
  onClose,
  width = 304,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button onClick={onToggle}>{trigger}</button>
      {isOpen && (
        <div
          className="absolute top-full mt-2 left-0 bg-trello-surface border border-trello-border rounded-lg shadow-xl z-[100] overflow-hidden"
          style={{ width }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Board row used inside dropdowns ─── */
function BoardRow({ board, onClick }: { board: { id: string; title: string; background: string; is_starred: boolean }; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 transition-colors text-left"
    >
      <div className="w-10 h-8 rounded-sm shrink-0" style={{ background: board.background }} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-trello-text-bright truncate">{board.title}</p>
        <p className="text-xs text-trello-text-subtle">KanFlow Workspace</p>
      </div>
      {board.is_starred && (
        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
      )}
    </button>
  );
}

export default function Navbar() {
  const { currentMember, fetchMembers } = useMemberStore();
  const { boards, fetchBoards } = useBoardStore();
  const { toggleCreateBoard } = useUiStore();
  const { startHomeTour, startBoardTour } = useGuidedTour({ autoStart: true });
  const pathname = usePathname();
  const router = useRouter();
  const isOnBoard = pathname.startsWith('/board/');

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchBoards();
  }, [fetchMembers, fetchBoards]);

  // Close dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const starredBoards = boards.filter((b) => b.is_starred);
  // "Recent" = last 5 boards sorted by updated_at
  const recentBoards = [...boards]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const navigateToBoard = (id: string) => {
    setOpenDropdown(null);
    router.push(`/board/${id}`);
  };

  const triggerClasses = (active?: boolean) =>
    `px-3 h-8 rounded text-sm transition-colors flex items-center gap-1 ${
      active ? 'bg-white/20 text-trello-text-bright' : 'hover:bg-white/20 text-trello-text'
    }`;

  return (
    <nav data-tour="navbar" className="h-12 bg-trello-navbar border-b border-trello-border flex items-center px-2 gap-1 shrink-0 z-50">
      {/* Left section */}
      <div className="flex items-center gap-1">
        {/* App switcher / Home */}
        <Link href="/" className="p-1.5 rounded hover:bg-white/20 transition-colors" title="Home">
          <LayoutGrid className="w-4 h-4 text-trello-text" />
        </Link>

        <Link href="/" data-tour="logo" className="flex items-center gap-1 px-2 py-1 hover:bg-white/20 rounded transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="20" rx="2" fill="white" opacity="0.9"/>
            <rect x="13" y="2" width="9" height="12" rx="2" fill="white" opacity="0.9"/>
          </svg>
          <span className="text-trello-text-bright font-bold text-base tracking-tight hidden sm:inline">KanFlow</span>
        </Link>

        {/* Navbar items – hide individual labels on board page (show compact) */}
        <div className="hidden md:flex items-center gap-1 ml-1">
          {/* Boards dropdown */}
          <NavDropdown
            isOpen={openDropdown === 'boards'}
            onToggle={() => setOpenDropdown(openDropdown === 'boards' ? null : 'boards')}
            onClose={() => setOpenDropdown(null)}
            trigger={
              <span className={triggerClasses(openDropdown === 'boards')}>
                {isOnBoard ? <LayoutGrid className="w-3.5 h-3.5" /> : 'Boards'}
                <ChevronDown className="w-3 h-3" />
              </span>
            }
          >
            <div className="flex items-center justify-between p-3 border-b border-trello-border">
              <span className="text-sm font-semibold text-trello-text-secondary">Boards</span>
              <button onClick={() => setOpenDropdown(null)} className="p-0.5 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-trello-text-subtle" />
              </button>
            </div>
            {boards.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-trello-text-subtle">No boards yet</div>
            ) : (
              <div className="py-1 max-h-[320px] overflow-y-auto">
                {boards.map((b) => (
                  <BoardRow key={b.id} board={b} onClick={() => navigateToBoard(b.id)} />
                ))}
              </div>
            )}
          </NavDropdown>

          {/* Recent dropdown */}
          <NavDropdown
            isOpen={openDropdown === 'recent'}
            onToggle={() => setOpenDropdown(openDropdown === 'recent' ? null : 'recent')}
            onClose={() => setOpenDropdown(null)}
            trigger={
              <span className={triggerClasses(openDropdown === 'recent')}>
                {isOnBoard ? <Clock className="w-3.5 h-3.5" /> : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    Recent
                  </>
                )}
                <ChevronDown className="w-3 h-3" />
              </span>
            }
          >
            <div className="flex items-center justify-between p-3 border-b border-trello-border">
              <span className="text-sm font-semibold text-trello-text-secondary">Recent boards</span>
              <button onClick={() => setOpenDropdown(null)} className="p-0.5 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-trello-text-subtle" />
              </button>
            </div>
            {recentBoards.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-trello-text-subtle">No recent boards</div>
            ) : (
              <div className="py-1">
                {recentBoards.map((b) => (
                  <BoardRow key={b.id} board={b} onClick={() => navigateToBoard(b.id)} />
                ))}
              </div>
            )}
          </NavDropdown>

          {/* Starred dropdown */}
          <NavDropdown
            isOpen={openDropdown === 'starred'}
            onToggle={() => setOpenDropdown(openDropdown === 'starred' ? null : 'starred')}
            onClose={() => setOpenDropdown(null)}
            trigger={
              <span className={triggerClasses(openDropdown === 'starred')}>
                {isOnBoard ? <Star className="w-3.5 h-3.5" /> : (
                  <>
                    <Star className="w-3.5 h-3.5" />
                    Starred
                  </>
                )}
                <ChevronDown className="w-3 h-3" />
              </span>
            }
          >
            <div className="flex items-center justify-between p-3 border-b border-trello-border">
              <span className="text-sm font-semibold text-trello-text-secondary">Starred boards</span>
              <button onClick={() => setOpenDropdown(null)} className="p-0.5 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-trello-text-subtle" />
              </button>
            </div>
            {starredBoards.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-trello-text-subtle">
                <Star className="w-8 h-8 text-trello-text-subtle mx-auto mb-2 opacity-40" />
                <p>Star important boards to access them quickly.</p>
              </div>
            ) : (
              <div className="py-1">
                {starredBoards.map((b) => (
                  <BoardRow key={b.id} board={b} onClick={() => navigateToBoard(b.id)} />
                ))}
              </div>
            )}
          </NavDropdown>

          {/* Create */}
          <button
            onClick={toggleCreateBoard}
            data-tour="create-btn"
            className="px-3 h-8 rounded bg-trello-blue hover:bg-blue-600 text-sm text-white font-medium transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {!isOnBoard && 'Create'}
          </button>
        </div>

        {/* Mobile create button */}
        <button
          onClick={toggleCreateBoard}
          className="md:hidden p-1.5 rounded hover:bg-white/20 transition-colors"
        >
          <Plus className="w-4 h-4 text-trello-text" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-1">
        <div data-tour="search">
          <SearchBar />
        </div>
        <button className="p-1.5 rounded hover:bg-white/20 transition-colors hidden sm:block" title="Notifications">
          <Bell className="w-4 h-4 text-trello-text" />
        </button>
        <button
          onClick={() => isOnBoard ? startBoardTour() : startHomeTour()}
          className="p-1.5 rounded hover:bg-white/20 transition-colors hidden sm:block"
          title="Start guided tour"
          data-tour="tour-btn"
        >
          <Compass className="w-4 h-4 text-trello-text" />
        </button>
        {currentMember && (
          <Avatar
            initials={currentMember.initials}
            color={currentMember.avatar_color}
            size="sm"
            className="ml-1 cursor-pointer"
          />
        )}
      </div>
    </nav>
  );
}
