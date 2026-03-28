'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Card } from '@/types';

interface SearchBarProps {
  boardId?: string;
}

export default function SearchBar({ boardId }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q });
      if (boardId) params.set('board_id', boardId);
      const { data: res } = await api.get(`/cards/search?${params}`);
      setResults(res.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-1 px-3 h-8 rounded text-sm transition-all',
          isOpen
            ? 'bg-white/20 w-64'
            : 'bg-white/10 hover:bg-white/20 w-40'
        )}
      >
        <Search className="w-4 h-4 shrink-0" />
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards..."
            className="bg-transparent outline-none w-full text-trello-text placeholder:text-trello-text-secondary"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
                setResults([]);
              }
            }}
          />
        ) : (
          <span className="text-trello-text-secondary">Search</span>
        )}
        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setQuery('');
              setResults([]);
            }}
            className="shrink-0 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </button>

      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full mt-1 right-0 w-80 bg-trello-bg-light border border-trello-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-trello-text-secondary text-sm">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-trello-text-secondary text-sm">No cards found</div>
          ) : (
            results.map((card) => (
              <a
                key={card.id}
                href={`#`}
                className="block px-4 py-3 hover:bg-trello-card transition-colors border-b border-trello-border last:border-b-0"
              >
                <div className="text-sm text-trello-text-bright font-medium">{card.title}</div>
                {(card as Card & { lists?: { title: string } }).lists && (
                  <div className="text-xs text-trello-text-secondary mt-1">
                    in {(card as Card & { lists?: { title: string } }).lists?.title}
                  </div>
                )}
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
