'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useListStore } from '@/stores/listStore';
import { useCardStore } from '@/stores/cardStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
  const { lists } = useListStore();
  const { cardsByList } = useCardStore();
  const { setActiveCard } = useUiStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const cardsWithDue = useMemo(() => {
    const cards: (Card & { listTitle: string })[] = [];
    lists.forEach((list) => {
      (cardsByList[list.id] ?? []).forEach((card) => {
        if (card.due_date) {
          cards.push({ ...card, listTitle: list.title });
        }
      });
    });
    return cards;
  }, [lists, cardsByList]);

  const cardsByDate = useMemo(() => {
    const map = new Map<string, (Card & { listTitle: string })[]>();
    cardsWithDue.forEach((card) => {
      const dateKey = new Date(card.due_date!).toISOString().split('T')[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(card);
    });
    return map;
  }, [cardsWithDue]);

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, month, year, isCurrentMonth: true });
  }

  // Next month days to fill 6 rows
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      day: d,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-semibold text-white min-w-[200px] text-center">{monthName}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
        <button onClick={goToday} className="px-3 h-8 rounded bg-white/10 hover:bg-white/20 text-sm text-white transition-colors">
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-trello-surface rounded-xl border border-trello-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-trello-border">
          {DAYS.map((day) => (
            <div key={day} className="px-2 py-2 text-xs font-semibold text-trello-text-secondary uppercase text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, i) => {
            const dateKey = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
            const dayCards = cardsByDate.get(dateKey) ?? [];
            const isToday = dateKey === todayKey;

            return (
              <div
                key={i}
                className={cn(
                  'min-h-[100px] border-b border-r border-trello-border p-1',
                  !cell.isCurrentMonth && 'opacity-40',
                  '[&:nth-child(7n)]:border-r-0',
                )}
              >
                <div className="flex justify-end mb-1">
                  <span
                    className={cn(
                      'w-6 h-6 flex items-center justify-center rounded-full text-xs',
                      isToday
                        ? 'bg-trello-blue text-white font-bold'
                        : 'text-trello-text-secondary'
                    )}
                  >
                    {cell.day}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {dayCards.slice(0, 3).map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setActiveCard(card.id)}
                      className={cn(
                        'w-full text-left text-[11px] px-1.5 py-0.5 rounded truncate transition-colors',
                        card.is_complete
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : new Date(card.due_date!) < today
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-trello-blue/20 text-blue-300 hover:bg-trello-blue/30'
                      )}
                    >
                      {card.title}
                    </button>
                  ))}
                  {dayCards.length > 3 && (
                    <div className="text-[10px] text-trello-text-subtle px-1.5">
                      +{dayCards.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-xs text-trello-text-subtle text-center">
        {cardsWithDue.length} card{cardsWithDue.length !== 1 ? 's' : ''} with due dates
      </div>
    </div>
  );
}
