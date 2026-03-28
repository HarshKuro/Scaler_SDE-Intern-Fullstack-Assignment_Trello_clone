'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import ListHeader from './ListHeader';
import AddCardButton from './AddCardButton';
import CardItem from '@/components/card/CardItem';
import type { List, Card } from '@/types';
import { cn } from '@/lib/utils';

interface ListColumnProps {
  list: List;
  cards: Card[];
  boardId?: string;
}

export default function ListColumn({ list, cards }: ListColumnProps) {
  const [collapsed, setCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: 'list', list },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
    data: { type: 'list' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
  };

  if (collapsed) {
    return (
      <div
        ref={setSortableRef}
        style={style}
        className={cn(
          'w-10 shrink-0 flex flex-col bg-trello-list rounded-xl cursor-pointer group',
          'hover:bg-white/10 transition-colors max-h-[calc(100vh-120px)]',
          isDragging && 'list-dragging'
        )}
        onClick={() => setCollapsed(false)}
        title={`${list.title} (${cards.length})`}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 flex-1 flex flex-col items-center gap-2">
          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] text-trello-text-secondary font-bold">
            {cards.length}
          </div>
          <div className="flex-1 flex items-start">
            <span
              className="text-sm font-semibold text-trello-text whitespace-nowrap origin-top-left"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              {list.title}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setSortableRef}
      style={style}
      data-tour="list-column"
      className={cn(
        'w-[272px] shrink-0 flex flex-col bg-trello-list rounded-xl max-h-[calc(100vh-120px)]',
        isDragging && 'list-dragging'
      )}
    >
      <div {...attributes} {...listeners} data-tour="list-header" className="cursor-grab active:cursor-grabbing">
        <ListHeader
          listId={list.id}
          title={list.title}
          cardCount={cards.length}
          onCollapse={() => setCollapsed(true)}
        />
      </div>

      <div
        ref={setDroppableRef}
        className="flex-1 overflow-y-auto px-1 pb-1 min-h-[4px] custom-scrollbar"
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <CardItem key={card.id} card={card} listId={list.id} />
          ))}
        </SortableContext>
      </div>

      <div className="px-1 pb-2">
        <AddCardButton listId={list.id} cardCount={cards.length} />
      </div>
    </div>
  );
}
