'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Calendar, Tag, User, CheckSquare } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import { useCardStore } from '@/stores/cardStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';

type SortField = 'title' | 'list' | 'due_date' | 'labels' | 'members';
type SortDir = 'asc' | 'desc';

export default function TableView() {
  const { lists } = useListStore();
  const { cardsByList } = useCardStore();
  const { setActiveCard } = useUiStore();
  const [sortField, setSortField] = useState<SortField>('list');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const allCards = useMemo(() => {
    const cards: (Card & { listTitle: string })[] = [];
    lists.forEach((list) => {
      (cardsByList[list.id] ?? []).forEach((card) => {
        cards.push({ ...card, listTitle: list.title });
      });
    });
    return cards;
  }, [lists, cardsByList]);

  const sortedCards = useMemo(() => {
    const sorted = [...allCards];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'list':
          cmp = a.listTitle.localeCompare(b.listTitle);
          break;
        case 'due_date':
          cmp = (a.due_date ?? '').localeCompare(b.due_date ?? '');
          break;
        case 'labels':
          cmp = (a.labels?.length ?? 0) - (b.labels?.length ?? 0);
          break;
        case 'members':
          cmp = (a.members?.length ?? 0) - (b.members?.length ?? 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [allCards, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="bg-trello-surface rounded-xl border border-trello-border overflow-hidden min-w-[700px]">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_140px_120px_140px_120px_80px] bg-trello-navbar border-b border-trello-border">
          {[
            { field: 'title' as SortField, label: 'Card', icon: null },
            { field: 'list' as SortField, label: 'List', icon: null },
            { field: 'labels' as SortField, label: 'Labels', icon: <Tag className="w-3.5 h-3.5" /> },
            { field: 'members' as SortField, label: 'Members', icon: <User className="w-3.5 h-3.5" /> },
            { field: 'due_date' as SortField, label: 'Due date', icon: <Calendar className="w-3.5 h-3.5" /> },
          ].map(({ field, label, icon }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold text-trello-text-secondary uppercase tracking-wider hover:text-trello-text-bright transition-colors text-left"
            >
              {icon}
              {label}
              <SortIcon field={field} />
            </button>
          ))}
          <div className="flex items-center px-4 py-3 text-xs font-semibold text-trello-text-secondary uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Table body */}
        {sortedCards.length === 0 ? (
          <div className="px-4 py-12 text-center text-trello-text-subtle text-sm">
            No cards on this board yet.
          </div>
        ) : (
          sortedCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setActiveCard(card.id)}
              className="grid grid-cols-[1fr_140px_120px_140px_120px_80px] w-full border-b border-trello-border last:border-b-0 hover:bg-white/5 transition-colors text-left"
            >
              {/* Title */}
              <div className="flex items-center gap-2 px-4 py-3 min-w-0">
                {card.cover_color && (
                  <div className="w-2 h-6 rounded-full shrink-0" style={{ backgroundColor: card.cover_color }} />
                )}
                <span className="text-sm text-trello-text-bright truncate">{card.title}</span>
              </div>

              {/* List */}
              <div className="flex items-center px-4 py-3">
                <span className="text-xs bg-white/10 text-trello-text rounded px-2 py-0.5 truncate">
                  {card.listTitle}
                </span>
              </div>

              {/* Labels */}
              <div className="flex items-center gap-1 px-4 py-3 flex-wrap">
                {(card.labels ?? []).slice(0, 3).map((label) => (
                  <span
                    key={label.id}
                    className="w-6 h-2 rounded-full"
                    style={{ backgroundColor: label.color }}
                    title={label.name}
                  />
                ))}
                {(card.labels?.length ?? 0) > 3 && (
                  <span className="text-[10px] text-trello-text-subtle">+{(card.labels?.length ?? 0) - 3}</span>
                )}
              </div>

              {/* Members */}
              <div className="flex items-center gap-1 px-4 py-3">
                {(card.members ?? []).slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0"
                    style={{ backgroundColor: m.avatar_color }}
                    title={m.full_name}
                  >
                    {m.initials}
                  </div>
                ))}
                {(card.members?.length ?? 0) > 3 && (
                  <span className="text-[10px] text-trello-text-subtle">+{(card.members?.length ?? 0) - 3}</span>
                )}
              </div>

              {/* Due date */}
              <div className="flex items-center px-4 py-3">
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    card.is_complete
                      ? 'bg-green-500/20 text-green-400'
                      : isOverdue(card.due_date)
                        ? 'bg-red-500/20 text-red-400'
                        : 'text-trello-text-secondary'
                  )}
                >
                  {formatDate(card.due_date)}
                </span>
              </div>

              {/* Complete */}
              <div className="flex items-center justify-center px-4 py-3">
                {card.is_complete && (
                  <CheckSquare className="w-4 h-4 text-green-400" />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="mt-3 text-xs text-trello-text-subtle text-center">
        {allCards.length} card{allCards.length !== 1 ? 's' : ''} across {lists.length} list{lists.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
