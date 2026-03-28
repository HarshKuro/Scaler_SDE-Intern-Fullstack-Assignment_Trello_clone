'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import { useCardStore } from '@/stores/cardStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';

const LIST_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-red-500',
];

export default function TimelineView() {
  const { lists } = useListStore();
  const { cardsByList } = useCardStore();
  const { setActiveCard } = useUiStore();
  const [weekOffset, setWeekOffset] = useState(0);

  // Compute current week range
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const cardsWithDue = useMemo(() => {
    const cards: (Card & { listTitle: string; listIndex: number })[] = [];
    lists.forEach((list, li) => {
      (cardsByList[list.id] ?? []).forEach((card) => {
        if (card.due_date) {
          cards.push({ ...card, listTitle: list.title, listIndex: li });
        }
      });
    });
    return cards;
  }, [lists, cardsByList]);

  // Determine which cards fall within the visible range
  const rangeStart = days[0].getTime();
  const rangeEnd = days[days.length - 1].getTime() + 86400000;

  const visibleCards = useMemo(() => {
    return cardsWithDue.filter((c) => {
      const due = new Date(c.due_date!).getTime();
      // Show cards that created_at → due_date overlaps with our range
      const start = new Date(c.created_at).getTime();
      return due >= rangeStart && start < rangeEnd;
    });
  }, [cardsWithDue, rangeStart, rangeEnd]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const formatDay = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  const formatMonth = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const headerRange = `${formatMonth(days[0])} — ${formatMonth(days[days.length - 1])}`;

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((o) => o - 2)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-semibold text-white min-w-[260px] text-center">{headerRange}</h2>
          <button onClick={() => setWeekOffset((o) => o + 2)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
        <button onClick={() => setWeekOffset(0)} className="px-3 h-8 rounded bg-white/10 hover:bg-white/20 text-sm text-white transition-colors">
          Today
        </button>
      </div>

      <div className="bg-trello-surface rounded-xl border border-trello-border overflow-hidden">
        {/* Day headers */}
        <div className="grid" style={{ gridTemplateColumns: `160px repeat(${days.length}, 1fr)` }}>
          <div className="px-3 py-2 border-b border-r border-trello-border text-xs font-semibold text-trello-text-secondary">
            Card
          </div>
          {days.map((d, i) => {
            const isToday = d.getTime() === todayTime;
            return (
              <div
                key={i}
                className={cn(
                  'px-1 py-2 border-b border-r border-trello-border text-center text-[11px] last:border-r-0',
                  isToday ? 'bg-trello-blue/20 text-blue-300 font-bold' : 'text-trello-text-secondary',
                  d.getDay() === 0 || d.getDay() === 6 ? 'bg-white/[0.02]' : ''
                )}
              >
                {formatDay(d)}
              </div>
            );
          })}
        </div>

        {/* Timeline rows */}
        {visibleCards.length === 0 ? (
          <div className="px-4 py-12 text-center text-trello-text-subtle text-sm">
            No cards with due dates in this time range.
          </div>
        ) : (
          visibleCards.map((card) => {
            const created = new Date(card.created_at);
            created.setHours(0, 0, 0, 0);
            const due = new Date(card.due_date!);
            due.setHours(0, 0, 0, 0);

            return (
              <div
                key={card.id}
                className="grid border-b border-trello-border last:border-b-0"
                style={{ gridTemplateColumns: `160px repeat(${days.length}, 1fr)` }}
              >
                {/* Card label */}
                <button
                  onClick={() => setActiveCard(card.id)}
                  className="px-3 py-2 border-r border-trello-border text-left hover:bg-white/5 transition-colors"
                >
                  <div className="text-xs text-trello-text-bright truncate">{card.title}</div>
                  <div className="text-[10px] text-trello-text-subtle truncate">{card.listTitle}</div>
                </button>

                {/* Day cells with bar */}
                {days.map((d, i) => {
                  const dayTime = d.getTime();
                  const isInRange = dayTime >= created.getTime() && dayTime <= due.getTime();
                  const isStart = dayTime === created.getTime();
                  const isEnd = dayTime === due.getTime();
                  const isToday = dayTime === todayTime;
                  const colorClass = LIST_COLORS[card.listIndex % LIST_COLORS.length];

                  return (
                    <div
                      key={i}
                      className={cn(
                        'border-r border-trello-border last:border-r-0 relative flex items-center',
                        isToday && 'bg-trello-blue/5'
                      )}
                      style={{ minHeight: 36 }}
                    >
                      {isInRange && (
                        <div
                          className={cn(
                            'h-5 w-full',
                            colorClass,
                            'opacity-60',
                            isStart && 'rounded-l-full ml-1',
                            isEnd && 'rounded-r-full mr-1'
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 text-xs text-trello-text-subtle text-center">
        Showing {visibleCards.length} of {cardsWithDue.length} card{cardsWithDue.length !== 1 ? 's' : ''} with due dates
      </div>
    </div>
  );
}
