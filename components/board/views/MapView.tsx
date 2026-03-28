'use client';

import { useMemo } from 'react';
import { useListStore } from '@/stores/listStore';
import { useCardStore } from '@/stores/cardStore';
import { useUiStore } from '@/stores/uiStore';
import { MapPin, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';

const STAGE_COLORS = [
  { bg: 'bg-blue-500/20', bar: 'bg-blue-500', text: 'text-blue-300', ring: 'ring-blue-500/40' },
  { bg: 'bg-purple-500/20', bar: 'bg-purple-500', text: 'text-purple-300', ring: 'ring-purple-500/40' },
  { bg: 'bg-green-500/20', bar: 'bg-green-500', text: 'text-green-300', ring: 'ring-green-500/40' },
  { bg: 'bg-orange-500/20', bar: 'bg-orange-500', text: 'text-orange-300', ring: 'ring-orange-500/40' },
  { bg: 'bg-pink-500/20', bar: 'bg-pink-500', text: 'text-pink-300', ring: 'ring-pink-500/40' },
  { bg: 'bg-cyan-500/20', bar: 'bg-cyan-500', text: 'text-cyan-300', ring: 'ring-cyan-500/40' },
  { bg: 'bg-yellow-500/20', bar: 'bg-yellow-500', text: 'text-yellow-300', ring: 'ring-yellow-500/40' },
  { bg: 'bg-red-500/20', bar: 'bg-red-500', text: 'text-red-300', ring: 'ring-red-500/40' },
];

export default function MapView() {
  const { lists } = useListStore();
  const { cardsByList } = useCardStore();
  const { setActiveCard } = useUiStore();

  const stages = useMemo(() => {
    return lists.map((list, i) => {
      const cards = cardsByList[list.id] ?? [];
      const complete = cards.filter((c) => c.is_complete).length;
      const overdue = cards.filter((c) => c.due_date && !c.is_complete && new Date(c.due_date) < new Date()).length;
      const colors = STAGE_COLORS[i % STAGE_COLORS.length];
      return { list, cards, complete, overdue, colors };
    });
  }, [lists, cardsByList]);

  const totalCards = useMemo(() => {
    return stages.reduce((acc, s) => acc + s.cards.length, 0);
  }, [stages]);

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-trello-text-secondary" />
        <h2 className="text-lg font-semibold text-white">Workflow Map</h2>
        <span className="text-sm text-trello-text-subtle">— {totalCards} cards across {lists.length} stages</span>
      </div>

      {/* Flow map */}
      <div className="relative">
        {/* Connection lines between stages */}
        <div className="hidden lg:block absolute top-[60px] left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-green-500/30 mx-[80px]" />

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(lists.length, 5)}, 1fr)` }}>
          {stages.map((stage, i) => (
            <div key={stage.list.id} className="flex flex-col items-center">
              {/* Stage node */}
              <div className={cn(
                'w-full rounded-xl border border-trello-border overflow-hidden relative',
                stage.colors.bg
              )}>
                {/* Stage header */}
                <div className="p-3 border-b border-trello-border/50">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full ring-2', stage.colors.bar, stage.colors.ring)} />
                    <h3 className={cn('text-sm font-semibold', stage.colors.text)}>{stage.list.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-trello-text-secondary">
                    <span>{stage.cards.length} cards</span>
                    {stage.complete > 0 && (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckSquare className="w-3 h-3" />
                        {stage.complete}
                      </span>
                    )}
                    {stage.overdue > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        {stage.overdue}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {stage.cards.length === 0 ? (
                    <div className="text-xs text-trello-text-subtle text-center py-4">Empty stage</div>
                  ) : (
                    stage.cards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => setActiveCard(card.id)}
                        className="w-full text-left bg-trello-surface/80 hover:bg-trello-surface rounded-lg p-2 transition-colors border border-trello-border/50"
                      >
                        {card.cover_color && (
                          <div className="h-1.5 rounded-full mb-1.5 -mx-0.5" style={{ backgroundColor: card.cover_color }} />
                        )}
                        <p className="text-xs text-trello-text-bright leading-snug">{card.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {/* Labels */}
                          {(card.labels ?? []).slice(0, 3).map((l) => (
                            <div key={l.id} className="w-4 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                          ))}
                          {/* Due */}
                          {card.due_date && (
                            <span className={cn(
                              'text-[10px] flex items-center gap-0.5 ml-auto',
                              card.is_complete ? 'text-green-400' : 
                              new Date(card.due_date) < new Date() ? 'text-red-400' : 'text-trello-text-subtle'
                            )}>
                              <Clock className="w-2.5 h-2.5" />
                              {formatDate(card.due_date)}
                            </span>
                          )}
                          {/* Members */}
                          {(card.members ?? []).length > 0 && (
                            <div className="flex -space-x-1 ml-auto">
                              {(card.members ?? []).slice(0, 2).map((m) => (
                                <div
                                  key={m.id}
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] text-white font-bold"
                                  style={{ backgroundColor: m.avatar_color }}
                                >
                                  {m.initials}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Arrow to next stage */}
              {i < stages.length - 1 && (
                <div className="lg:hidden w-0.5 h-6 bg-white/10 my-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
