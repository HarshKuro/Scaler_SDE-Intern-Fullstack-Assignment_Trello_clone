'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutGrid, Plus, Star, Clock, Bell, HelpCircle } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import SearchBar from '@/components/ui/SearchBar';
import { useMemberStore } from '@/stores/memberStore';
import { useUiStore } from '@/stores/uiStore';

export default function Navbar() {
  const { currentMember, fetchMembers } = useMemberStore();
  const { toggleCreateBoard } = useUiStore();

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <nav className="h-11 bg-trello-navbar border-b border-trello-border flex items-center px-2 gap-1 shrink-0 z-50">
      {/* Left section */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded hover:bg-white/20 transition-colors">
          <LayoutGrid className="w-4 h-4 text-trello-text" />
        </button>

        <Link href="/" className="flex items-center gap-1 px-2 py-1 hover:bg-white/20 rounded transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="20" rx="2" fill="white" opacity="0.9"/>
            <rect x="13" y="2" width="9" height="12" rx="2" fill="white" opacity="0.9"/>
          </svg>
          <span className="text-trello-text-bright font-bold text-base tracking-tight hidden sm:inline">KanFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-1">
          <button className="px-3 h-8 rounded bg-white/10 hover:bg-white/20 text-sm text-trello-text transition-colors">
            Boards
          </button>
          <button className="px-3 h-8 rounded hover:bg-white/20 text-sm text-trello-text transition-colors flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Recent
          </button>
          <button className="px-3 h-8 rounded hover:bg-white/20 text-sm text-trello-text transition-colors flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            Starred
          </button>
          <button
            onClick={toggleCreateBoard}
            className="px-3 h-8 rounded bg-trello-blue hover:bg-blue-600 text-sm text-white font-medium transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-1">
        <SearchBar />
        <button className="p-1.5 rounded hover:bg-white/20 transition-colors hidden sm:block">
          <Bell className="w-4 h-4 text-trello-text" />
        </button>
        <button className="p-1.5 rounded hover:bg-white/20 transition-colors hidden sm:block">
          <HelpCircle className="w-4 h-4 text-trello-text" />
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
