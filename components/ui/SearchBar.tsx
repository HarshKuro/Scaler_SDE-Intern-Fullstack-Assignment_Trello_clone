'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useUiStore } from '@/stores/uiStore';
import type { Card } from '@/types';

type SearchCard = Card & { board_id?: string; lists?: { title: string } };

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();
  const { setActiveCard } = useUiStore();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q });
      const { data: res } = await api.get(`/cards/search?${params}`);
      setResults(res.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleResultClick = (card: SearchCard) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    // Navigate to board and open card
    if (card.board_id) {
      router.push(`/board/${card.board_id}`);
      // Slight delay to let the board page mount before opening card modal
      setTimeout(() => setActiveCard(card.id), 500);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => !isOpen && setIsOpen(true)}
        className={cn(
          'flex items-center gap-1 px-3 h-8 rounded text-sm transition-all cursor-text',
          isOpen
            ? 'bg-white/20 w-64'
            : 'bg-white/10 hover:bg-white/20 w-40'
        )}
      >
        <Search className="w-4 h-4 shrink-0 text-trello-text" />
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards..."
            className="bg-transparent outline-none w-full text-trello-text placeholder:text-trello-text-secondary text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
                setResults([]);
              }
            }}
          />
        ) : (
          <span className="text-trello-text-secondary select-none">Search</span>
        )}
        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setQuery('');
              setResults([]);
            }}
            className="shrink-0 hover:text-white text-trello-text"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full mt-1 right-0 w-80 bg-trello-surface border border-trello-border rounded-lg shadow-xl z-[100] max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-trello-text-secondary text-sm">Searching...</div>
          ) : results.length === 0 && query ? (
            <div className="p-4 text-center text-trello-text-secondary text-sm">No cards found</div>
          ) : (
            results.map((card) => (
              <button
                key={card.id}
                onClick={() => handleResultClick(card)}
                className="block w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-trello-border last:border-b-0"
              >
                <div className="text-sm text-trello-text-bright font-medium">{card.title}</div>
                {card.lists && (
                  <div className="text-xs text-trello-text-secondary mt-1">
                    in {card.lists.title}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
